/**
 * QA -- BYOK (bring-your-own-key) isolation proof.
 *
 * The backend became 100% BYOK: every AI edge function reads the caller's own
 * key from the per-request `x-user-api-key` header (see
 * supabase/functions/_shared/cors.ts, getUserApiKey) and forwards it to the
 * provider. Nothing reads OPENAI_API_KEY / MUAPI_API_KEY / GEMINI_API_KEY any
 * more, there are no credit checks and no Gemini fallbacks.
 *
 * This suite proves the Phase-7 isolation properties both at runtime (real
 * handlers, stubbed Deno global + fetch router, decoy env credentials that
 * must never appear) and statically (source scan of supabase/functions and
 * the frontend wiring):
 *
 *   a. User A's key is never sent for User B (OpenAI)
 *   b. Same for MuAPI polling
 *   c. Missing keys produce clear setup instructions (exact text, HTTP 400)
 *   d. Invalid-format keys never trigger a platform-funded fallback
 *   e. OpenAI operations use only the user's key (Authorization: Bearer)
 *   f. Video submit + polling use only the user's MuAPI key (x-api-key)
 *   g. No application credit checks or deductions
 *   h. No Stripe/subscription gate in any generation flow
 *   i. Keys never appear in logs / URLs / DB rows
 *   j. Existing provider contracts preserved (GPT Image 2.5 + Responses API)
 *   k. Frontend wiring attaches x-user-api-key, no browser env-key fallback
 *
 *   node --experimental-strip-types qa/byok-isolation.test.mjs
 *
 * When collected by vitest, the whole suite delegates to the node runner
 * above (vitest's module runner cannot resolve the Deno-only `jsr:` type
 * imports inside these functions).
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

function resolveSelfPath() {
  const fromImportMeta = new URL('./byok-isolation.test.mjs', import.meta.url);
  if (fromImportMeta.protocol === 'file:') return fileURLToPath(fromImportMeta);
  const fromCwd = join(process.cwd(), 'qa', 'byok-isolation.test.mjs');
  if (existsSync(fromCwd)) return fromCwd;
  throw new Error('Cannot locate qa/byok-isolation.test.mjs');
}

const SCRIPT_PATH = resolveSelfPath();
const REPO_ROOT = join(SCRIPT_PATH, '..', '..');
const UNDER_VITEST = Boolean(process.env.VITEST || process.env.VITEST_WORKER_ID);

if (UNDER_VITEST) {
  const { test } = await import('vitest');
  const { spawnSync } = await import('node:child_process');
  test('BYOK isolation suite (qa/byok-isolation.test.mjs) passes under node', () => {
    const childEnv = { ...process.env };
    delete childEnv.VITEST;
    delete childEnv.VITEST_WORKER_ID;
    delete childEnv.VITEST_POOL_ID;
    const res = spawnSync(process.execPath, ['--experimental-strip-types', SCRIPT_PATH], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      env: childEnv,
    });
    if (res.error) throw res.error;
    assert.equal(res.status, 0, `node contract runner failed:\n${res.stdout}\n${res.stderr}`);
  });
} else {
  const { test, beforeEach } = await import('node:test');
  const { register } = await import('node:module');

  // ------------------------------------------------------------------ //
  // Constants                                                           //
  // ------------------------------------------------------------------ //

  const OPENAI_KEY_MISSING_ERROR = 'OpenAI API key not configured. Add your key in Settings → API Keys.';
  const MUAPI_KEY_MISSING_ERROR = 'MuAPI API key not configured. Add your key in Settings → API Keys.';
  const MUAPI_POLL_MISSING_MESSAGE = 'Live status polling requires your MuAPI API key. Add it in Settings → API Keys.';

  // Two distinct user keys (User A / User B) plus decoy platform credentials.
  const KEY_A = 'sk-user-a-openai-key-1111111111';
  const KEY_B = 'sk-user-b-openai-key-2222222222';
  const MUAPI_KEY_A = 'muapi-user-a-key-1111111111';
  const MUAPI_KEY_B = 'muapi-user-b-key-2222222222';

  const DECOY_OPENAI_KEY = 'sk-DECOY-ENV-OPENAI-KEY-0000000000';
  const DECOY_MUAPI_KEY = 'muapi-DECOY-ENV-KEY-0000000000';
  const DECOY_GEMINI_KEY = 'AIzaDECOY-ENV-GEMINI-KEY-0000000000';
  const ALL_DECOYS = [DECOY_OPENAI_KEY, DECOY_MUAPI_KEY, DECOY_GEMINI_KEY];

  // ------------------------------------------------------------------ //
  // Deno global stub + module loader                                    //
  // ------------------------------------------------------------------ //

  const denoEnv = new Map();
  const servedHandlers = [];

  globalThis.Deno = {
    env: {
      get: (key) => (denoEnv.has(key) ? denoEnv.get(key) : undefined),
      has: (key) => denoEnv.has(key),
      toObject: () => Object.fromEntries(denoEnv),
    },
    serve(handler) {
      servedHandlers.push(handler);
    },
  };

  register(new URL('./loader.mjs', import.meta.url));

  const importEdge = (name) =>
    import(new URL(`../supabase/functions/${name}/index.ts`, import.meta.url).href);

  // 9 OpenAI-backed functions + 3 MuAPI video functions.
  await importEdge('image-generation');
  await importEdge('image-editing');
  await importEdge('assistant-stream');
  await importEdge('freepik-ai-image');
  await importEdge('freepik-remove-bg');
  await importEdge('freepik-upscale');
  await importEdge('freepik-relight');
  await importEdge('freepik-style-transfer');
  await importEdge('freepik-improve-prompt');
  await importEdge('image-to-video');
  await importEdge('video-status');
  await importEdge('video-result');

  assert.equal(servedHandlers.length, 12, 'all twelve handlers registered');
  const [
    imageGenerationHandler,
    imageEditingHandler,
    assistantStreamHandler,
    aiImageHandler,
    removeBgHandler,
    upscaleHandler,
    relightHandler,
    styleTransferHandler,
    improvePromptHandler,
    imageToVideoHandler,
    videoStatusHandler,
    videoResultHandler,
  ] = servedHandlers;

  const OPENAI_FUNCTIONS = [
    [imageGenerationHandler, { prompt: 'a cat' }],
    [imageEditingHandler, { imageUrl: 'https://cdn.example.com/a.png', editOptions: { prompt: 'make it red' } }],
    [assistantStreamHandler, { messages: [{ role: 'user', content: 'hi' }], provider: 'openai' }],
    [aiImageHandler, { action: 'generate', prompt: 'a futuristic city' }],
    [removeBgHandler, { action: 'remove', imageUrl: 'https://cdn.example.com/a.png' }],
    [upscaleHandler, { action: 'upscale', imageUrl: 'https://cdn.example.com/a.png', scaleFactor: 2 }],
    [relightHandler, { action: 'relight', imageUrl: 'https://cdn.example.com/a.png', lightDirection: 'left' }],
    [styleTransferHandler, { action: 'transfer', imageUrl: 'https://cdn.example.com/a.png', styleImageUrl: 'https://cdn.example.com/style.png', styleName: 'watercolor' }],
    [improvePromptHandler, { prompt: 'a cat' }],
  ];

  // ------------------------------------------------------------------ //
  // Mocked fetch router                                                 //
  // ------------------------------------------------------------------ //

  const AUTH_HEADER = 'Bearer qa-test-token';
  const SUPABASE = 'https://qa-test-project.supabase.co';
  const MUAPI_RESULT = 'https://api.muapi.ai/api/v1/predictions/muapi-task-1/result';

  const PNG_1X1_B64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  let fetchCalls = [];
  let mock;

  function resetMocks() {
    fetchCalls = [];
    mock = {
      images: { status: 200, body: { data: [{ b64_json: 'R0VOQVJBRFM=' }] } },
      responses: {
        status: 200,
        body: {
          model: 'gpt-5-mini',
          output: [{ type: 'message', content: [{ type: 'output_text', text: 'Hello from OpenAI' }] }],
        },
      },
      muapiSubmit: { status: 200, body: { request_id: 'muapi-task-1' } },
      muapiResult: { status: 200, body: { status: 'completed', outputs: ['https://cdn.muapi.ai/out.mp4'] } },
      dbRow: {
        id: 'video-1',
        status: 'processing',
        progress: 0,
        error_message: null,
        video_url: '',
        thumbnail_url: null,
        duration: 5,
        format: 'mp4',
        created_at: '2026-10-11T00:00:00Z',
        updated_at: '2026-10-11T00:00:00Z',
        metadata: { providerTaskId: 'muapi-task-1', sourceImageUrl: 'https://cdn.example.com/a.png' },
      },
      insert: null,
      patches: [],
    };
  }

  const jsonResponse = (data, status = 200) =>
    new Response(typeof data === 'string' ? data : JSON.stringify(data), {
      status,
      headers: { 'content-type': 'application/json' },
    });

  function routeFetch(url, method, init) {
    if (url.includes('/auth/v1/user')) {
      const auth = init?.headers?.Authorization ?? init?.headers?.authorization;
      if (auth !== AUTH_HEADER) return jsonResponse({ message: 'Invalid token' }, 401);
      return jsonResponse({ id: 'qa-user-1', email: 'qa@example.com' });
    }
    if (url.includes('/rest/v1/rate_limits')) {
      if (method === 'GET') return jsonResponse([]);
      return jsonResponse({}, 201);
    }
    if (url === `${SUPABASE}/rest/v1/pi_generated_videos` && method === 'POST') {
      mock.insert = JSON.parse(init.body);
      return jsonResponse([{ id: 'video-1' }], 201);
    }
    if (url.startsWith(`${SUPABASE}/rest/v1/pi_generated_videos?id=eq.`)) {
      if (method === 'PATCH') {
        mock.patches.push(JSON.parse(init.body));
        return jsonResponse({}, 200);
      }
      return jsonResponse([mock.dbRow]);
    }
    if (url === MUAPI_RESULT) {
      return jsonResponse(mock.muapiResult.body, mock.muapiResult.status);
    }
    if (url.startsWith('https://api.muapi.ai/api/v1/') && method === 'POST') {
      return jsonResponse(mock.muapiSubmit.body, mock.muapiSubmit.status);
    }
    if (url.startsWith('https://api.openai.com/')) {
      if (url.includes('/v1/responses')) return jsonResponse(mock.responses.body, mock.responses.status);
      return jsonResponse(mock.images.body, mock.images.status);
    }
    if (url.startsWith('data:') || url.endsWith('.png') || url.includes('example.com')) {
      const bytes = Uint8Array.from(atob(PNG_1X1_B64), (c) => c.charCodeAt(0));
      return new Response(bytes, { status: 200, headers: { 'content-type': 'image/png' } });
    }
    throw new Error(`Unmocked fetch: ${method} ${url}`);
  }

  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = String(init.method ?? 'GET').toUpperCase();
    fetchCalls.push({ url, method, init });
    return routeFetch(url, method, init);
  };

  function resetEnv() {
    denoEnv.clear();
    for (const [key, value] of Object.entries({
      SUPABASE_URL: SUPABASE,
      SUPABASE_ANON_KEY: 'qa-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'qa-service-role-key',
      // Decoys: the platform-funded env keys must never be read again.
      OPENAI_API_KEY: DECOY_OPENAI_KEY,
      MUAPI_API_KEY: DECOY_MUAPI_KEY,
      GEMINI_API_KEY: DECOY_GEMINI_KEY,
    })) denoEnv.set(key, value);
  }

  // `apiKey` is the per-request `x-user-api-key` header value. Pass null to
  // omit the header entirely, '' / '   ' for blank values.
  function invoke(handler, body, { method = 'POST', auth = true, apiKey = KEY_A } = {}) {
    const headers = { 'content-type': 'application/json', origin: 'http://localhost:3000' };
    if (auth) headers.Authorization = AUTH_HEADER;
    if (apiKey !== null) headers['x-user-api-key'] = apiKey;
    return handler(
      new Request('https://qa-edge.test/functions/v1/test', {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    );
  }

  const readJson = async (res) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  const openaiCalls = () => fetchCalls.filter((c) => c.url.startsWith('https://api.openai.com/'));
  const muapiCalls = () => fetchCalls.filter((c) => c.url.startsWith('https://api.muapi.ai/'));
  const geminiCalls = () => fetchCalls.filter((c) => c.url.includes('generativelanguage.googleapis.com'));

  // No recorded request -- URL, header or body -- may contain a decoy.
  function assertNoDecoyCredentialsAnywhere() {
    assert.ok(geminiCalls().length === 0, 'no Gemini upstream may be contacted (fallbacks were deleted)');
    for (const call of fetchCalls) {
      const serialized = JSON.stringify({ url: call.url, init: call.init });
      for (const decoy of ALL_DECOYS) {
        assert.ok(!serialized.includes(decoy), `a request leaked the decoy env value ${decoy}: ${call.method} ${call.url}`);
      }
    }
  }

  // Snapshot of the Authorization / x-api-key values seen so far, in order.
  function providerKeyTrace() {
    const trace = [];
    for (const call of fetchCalls) {
      if (call.url.startsWith('https://api.openai.com/')) {
        trace.push({ kind: 'openai', auth: call.init.headers.Authorization });
      } else if (call.url.startsWith('https://api.muapi.ai/')) {
        trace.push({ kind: 'muapi', apiKey: call.init.headers['x-api-key'] });
      }
    }
    return trace;
  }

  beforeEach(() => {
    resetMocks();
    resetEnv();
  });

  // ------------------------------------------------------------------ //
  // Static scanning helpers                                             //
  // ------------------------------------------------------------------ //

  const read = (relPath) => readFileSync(join(REPO_ROOT, relPath), 'utf8');

  function listFunctionIndexFiles() {
    const dir = join(REPO_ROOT, 'supabase', 'functions');
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => existsSync(join(dir, name, 'index.ts')))
      .sort()
      .map((name) => ({ name, path: `supabase/functions/${name}/index.ts`, source: read(`supabase/functions/${name}/index.ts`) }));
  }

  function walkSourceFiles(dir) {
    const files = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) files.push(...walkSourceFiles(full));
      else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) files.push(full);
    }
    return files;
  }

  const KEY_VARIABLE = /\b(?:userApiKey|muapiKey|apiKey|openaiKey|geminiKey|providerKey)\b/i;

  // Index of the closing quote of the string/template literal at `index`.
  function skipQuoted(source, index) {
    const quote = source[index];
    let i = index + 1;
    while (i < source.length) {
      if (source[i] === '\\') { i += 2; continue; }
      if (source[i] === quote) return i;
      i += 1;
    }
    return source.length - 1;
  }

  // Slice a balanced { ... } (or [ ... ]) region starting at `openIndex`.
  function sliceBalanced(source, openIndex, open = '{', close = '}') {
    let depth = 0;
    let i = openIndex;
    while (i < source.length) {
      const ch = source[i];
      if (ch === '"' || ch === "'" || ch === '`') { i = skipQuoted(source, i) + 1; continue; }
      if (ch === '/' && source[i + 1] === '/') {
        while (i < source.length && source[i] !== '\n') i += 1;
        continue;
      }
      if (ch === '/' && source[i + 1] === '*') {
        i += 2;
        while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 2;
        continue;
      }
      if (ch === open) depth += 1;
      else if (ch === close) {
        depth -= 1;
        if (depth === 0) return source.slice(openIndex, i + 1);
      }
      i += 1;
    }
    return null;
  }

  // The first argument of a call whose '(' sits at `parenIndex`.
  function firstArgument(source, parenIndex) {
    let depth = 0;
    let i = parenIndex;
    for (; i < source.length; i += 1) {
      const ch = source[i];
      if (ch === '"' || ch === "'" || ch === '`') { i = skipQuoted(source, i); continue; }
      if (ch === '/' && source[i + 1] === '/') {
        while (i < source.length && source[i] !== '\n') i += 1;
        continue;
      }
      if (ch === '(' || ch === '[' || ch === '{') depth += 1;
      else if (ch === ')' || ch === ']' || ch === '}') {
        depth -= 1;
        if (depth === 0) return source.slice(parenIndex + 1, i);
      } else if (ch === ',' && depth === 1) {
        return source.slice(parenIndex + 1, i);
      }
    }
    return null;
  }

  // Every interpolated `${ ... }` expression inside a template literal.
  function templateInterpolations(templateLiteral) {
    const expressions = [];
    const re = /\$\{/g;
    let match;
    while ((match = re.exec(templateLiteral)) !== null) {
      const start = match.index + 2;
      let depth = 1;
      let i = start;
      for (; i < templateLiteral.length; i += 1) {
        if (templateLiteral[i] === '{') depth += 1;
        else if (templateLiteral[i] === '}') {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      expressions.push(templateLiteral.slice(start, i));
      re.lastIndex = i;
    }
    return expressions;
  }

  // The first argument of every `fetch(...)` call in a source file.
  function fetchUrlArguments(source) {
    const urls = [];
    const re = /fetch\s*\(/g;
    let match;
    while ((match = re.exec(source)) !== null) {
      const arg = firstArgument(source, match.index + match[0].length - 1);
      if (arg !== null) urls.push(arg.trim());
    }
    return urls;
  }

  // The argument text of every `console.*(...)` call in a source file.
  function consoleCallArguments(source) {
    const calls = [];
    const re = /console\s*\.\s*(?:log|error|warn|info|debug|trace)\s*\(/g;
    let match;
    while ((match = re.exec(source)) !== null) {
      const arg = firstArgument(source, match.index + match[0].length - 1);
      if (arg !== null) calls.push(arg);
    }
    return calls;
  }

  // ------------------------------------------------------------------ //
  // a. User A's key is never sent for User B (OpenAI)                   //
  // ------------------------------------------------------------------ //

  test('isolation (OpenAI): image-generation forwards only the current request key', async () => {
    fetchCalls = [];
    await invoke(imageGenerationHandler, { prompt: 'a cat' }, { apiKey: KEY_A });
    await invoke(imageGenerationHandler, { prompt: 'a cat' }, { apiKey: KEY_B });
    await invoke(imageGenerationHandler, { prompt: 'a cat' }, { apiKey: KEY_A });

    const trace = providerKeyTrace();
    assert.equal(trace.length, 3, 'expected exactly one provider call per request');
    assert.deepEqual(
      trace.map((entry) => entry.auth),
      [`Bearer ${KEY_A}`, `Bearer ${KEY_B}`, `Bearer ${KEY_A}`]
    );
    // The key may only travel in the Authorization header -- never in a body.
    for (const call of fetchCalls) {
      if (!call.init?.body) continue;
      assert.ok(!call.init.body.includes(KEY_A), 'the user key must not appear in a request body');
      assert.ok(!call.init.body.includes(KEY_B), 'the user key must not appear in a request body');
    }
    assertNoDecoyCredentialsAnywhere();
  });

  test('isolation (OpenAI): image-editing forwards only the current request key', async () => {
    fetchCalls = [];
    await invoke(imageEditingHandler, { imageUrl: 'https://cdn.example.com/a.png', editOptions: { prompt: 'red' } }, { apiKey: KEY_B });
    await invoke(imageEditingHandler, { imageUrl: 'https://cdn.example.com/a.png', editOptions: { prompt: 'red' } }, { apiKey: KEY_A });

    const trace = providerKeyTrace();
    assert.equal(trace.length, 2);
    assert.deepEqual(trace.map((entry) => entry.auth), [`Bearer ${KEY_B}`, `Bearer ${KEY_A}`]);
    assertNoDecoyCredentialsAnywhere();
  });

  test('isolation (OpenAI): assistant-stream forwards only the current request key', async () => {
    fetchCalls = [];
    await invoke(assistantStreamHandler, { messages: [{ role: 'user', content: 'hi' }], provider: 'openai' }, { apiKey: KEY_A });
    await invoke(assistantStreamHandler, { messages: [{ role: 'user', content: 'hi' }], provider: 'openai' }, { apiKey: KEY_B });

    const trace = providerKeyTrace();
    assert.equal(trace.length, 2);
    assert.deepEqual(trace.map((entry) => entry.auth), [`Bearer ${KEY_A}`, `Bearer ${KEY_B}`]);
    assertNoDecoyCredentialsAnywhere();
  });

  // ------------------------------------------------------------------ //
  // b. User A's key is never sent for User B (MuAPI)                    //
  // ------------------------------------------------------------------ //

  test('isolation (MuAPI): image-to-video submit forwards only the current request key', async () => {
    fetchCalls = [];
    await invoke(imageToVideoHandler, { imageUrl: 'https://cdn.example.com/a.png' }, { apiKey: MUAPI_KEY_A });
    await invoke(imageToVideoHandler, { imageUrl: 'https://cdn.example.com/a.png' }, { apiKey: MUAPI_KEY_B });

    const trace = providerKeyTrace();
    assert.equal(trace.length, 2, 'expected exactly one MuAPI submit per request');
    assert.deepEqual(trace.map((entry) => entry.apiKey), [MUAPI_KEY_A, MUAPI_KEY_B]);
    assertNoDecoyCredentialsAnywhere();
  });

  test('isolation (MuAPI): video-status and video-result polling forward only the current request key', async () => {
    fetchCalls = [];
    await invoke(videoStatusHandler, { videoId: 'video-1' }, { apiKey: MUAPI_KEY_B });
    await invoke(videoResultHandler, { videoId: 'video-1' }, { apiKey: MUAPI_KEY_A });
    await invoke(videoStatusHandler, { videoId: 'video-1' }, { apiKey: MUAPI_KEY_A });

    const trace = providerKeyTrace();
    assert.equal(trace.length, 3, 'expected one poll per request');
    assert.deepEqual(trace.map((entry) => entry.apiKey), [MUAPI_KEY_B, MUAPI_KEY_A, MUAPI_KEY_A]);
    assertNoDecoyCredentialsAnywhere();
  });

  // ------------------------------------------------------------------ //
  // c. Missing keys produce clear setup instructions                    //
  // ------------------------------------------------------------------ //

  test('missing keys: every OpenAI function returns 400 with the exact setup message', async () => {
    for (const apiKey of [null, '', '   ']) {
      fetchCalls = [];
      for (const [handler, body] of OPENAI_FUNCTIONS) {
        const res = await invoke(handler, body, { apiKey });
        assert.equal(res.status, 400, `apiKey ${JSON.stringify(apiKey)} must return 400`);
        assert.deepEqual(await readJson(res), { error: OPENAI_KEY_MISSING_ERROR });
      }
      assert.equal(openaiCalls().length, 0, 'no OpenAI call may happen without the user key');
      assert.equal(muapiCalls().length, 0);
      assert.equal(geminiCalls().length, 0, 'no fallback provider may be contacted');
      assertNoDecoyCredentialsAnywhere();
    }
  });

  test('missing keys: MuAPI submit returns 400 with the exact setup message; polling explains the requirement', async () => {
    for (const apiKey of [null, '', '   ']) {
      fetchCalls = [];
      const res = await invoke(imageToVideoHandler, { imageUrl: 'https://cdn.example.com/a.png' }, { apiKey });
      assert.equal(res.status, 400, `apiKey ${JSON.stringify(apiKey)} must return 400`);
      assert.deepEqual(await readJson(res), { error: MUAPI_KEY_MISSING_ERROR });
      assert.equal(mock.insert, null, 'no video row may be created without the user key');
      assert.equal(muapiCalls().length, 0, 'MuAPI must not be called without the user key');

      // Polling stays soft: HTTP 200 plus an actionable message, no provider call.
      fetchCalls = [];
      const status = await invoke(videoStatusHandler, { videoId: 'video-1' }, { apiKey });
      assert.equal(status.status, 200);
      const statusBody = await readJson(status);
      assert.equal(statusBody.message, MUAPI_POLL_MISSING_MESSAGE);
      assert.equal(muapiCalls().length, 0);

      fetchCalls = [];
      const result = await invoke(videoResultHandler, { videoId: 'video-1' }, { apiKey });
      assert.equal(result.status, 200);
      const resultBody = await readJson(result);
      assert.equal(resultBody.message, MUAPI_POLL_MISSING_MESSAGE);
      assert.equal(muapiCalls().length, 0);
    }
    assertNoDecoyCredentialsAnywhere();
  });

  // ------------------------------------------------------------------ //
  // d. Invalid-format keys never trigger a platform-funded fallback     //
  // ------------------------------------------------------------------ //

  test('invalid-format keys: no provider call, no env fallback, decoys never used', async () => {
    // The decoys are armed: if any function read an env key, it would have to
    // show up in a provider request for the request to succeed.
    assert.equal(denoEnv.get('OPENAI_API_KEY'), DECOY_OPENAI_KEY);
    assert.equal(denoEnv.get('MUAPI_API_KEY'), DECOY_MUAPI_KEY);
    assert.equal(denoEnv.get('GEMINI_API_KEY'), DECOY_GEMINI_KEY);

    const invalidKeys = ['not-a-valid-openai-key', 'sk-short', 'AIza-looks-like-gemini', 'muapi-key-without-format'];
    for (const apiKey of invalidKeys) {
      fetchCalls = [];
      for (const [handler, body] of OPENAI_FUNCTIONS) {
        const res = await invoke(handler, body, { apiKey });
        assert.equal(res.status, 400, `apiKey ${JSON.stringify(apiKey)} must return 400`);
        assert.deepEqual(await readJson(res), { error: OPENAI_KEY_MISSING_ERROR });
      }
      const video = await invoke(imageToVideoHandler, { imageUrl: 'https://cdn.example.com/a.png' }, { apiKey });
      assert.ok([200, 400].includes(video.status), 'MuAPI has no key-format rule; only emptiness is rejected');

      assert.equal(openaiCalls().length, 0, 'no OpenAI call may happen with an invalid-format key');
      assert.equal(geminiCalls().length, 0, 'an invalid key must never fall back to another provider');
      assertNoDecoyCredentialsAnywhere();
    }
  });

  // ------------------------------------------------------------------ //
  // e. OpenAI operations use only the user's key                        //
  // ------------------------------------------------------------------ //

  test('OpenAI operations use only the user key: Authorization: Bearer <user key> on every call', async () => {
    fetchCalls = [];
    for (const [handler, body] of OPENAI_FUNCTIONS) {
      const res = await invoke(handler, body, { apiKey: KEY_A });
      assert.equal(res.status, 200, `handler rejected a valid user key with ${res.status}`);
    }
    const calls = openaiCalls();
    assert.ok(calls.length >= 9, `expected at least one OpenAI call per function, saw ${calls.length}`);
    for (const call of calls) {
      assert.equal(call.init.headers.Authorization, `Bearer ${KEY_A}`, `bad Authorization on ${call.url}`);
      assert.notEqual(call.init.headers.Authorization, `Bearer ${DECOY_OPENAI_KEY}`);
    }
    assertNoDecoyCredentialsAnywhere();
  });

  // ------------------------------------------------------------------ //
  // f. Video submit and polling use only the user's MuAPI key           //
  // ------------------------------------------------------------------ //

  test('MuAPI operations use only the user key: x-api-key on submit and polling', async () => {
    fetchCalls = [];
    const submit = await invoke(imageToVideoHandler, { imageUrl: 'https://cdn.example.com/a.png' }, { apiKey: MUAPI_KEY_A });
    assert.equal(submit.status, 200);
    const status = await invoke(videoStatusHandler, { videoId: 'video-1' }, { apiKey: MUAPI_KEY_A });
    assert.equal(status.status, 200);
    const result = await invoke(videoResultHandler, { videoId: 'video-1' }, { apiKey: MUAPI_KEY_A });
    assert.equal(result.status, 200);

    const calls = muapiCalls();
    assert.equal(calls.length, 3, 'expected submit + status poll + result poll');
    for (const call of calls) {
      assert.equal(call.init.headers['x-api-key'], MUAPI_KEY_A, `bad x-api-key on ${call.url}`);
      assert.notEqual(call.init.headers['x-api-key'], DECOY_MUAPI_KEY);
    }
    assertNoDecoyCredentialsAnywhere();
  });

  // ------------------------------------------------------------------ //
  // g. No application credit checks or deductions                       //
  // ------------------------------------------------------------------ //

  test('no credit checks or deductions: static grep of every function + runtime request scan', async () => {
    const offenders = [];
    for (const fn of listFunctionIndexFiles()) {
      // 'check_and_deduct' and 'checkCredits' (import, call or mention) must be
      // gone from every function entrypoint.
      for (const needle of ['check_and_deduct', 'checkCredits']) {
        if (fn.source.includes(needle)) offenders.push(`${fn.path}: still contains '${needle}'`);
      }
    }
    assert.deepEqual(offenders, [], `credits must be fully removed:\n${offenders.join('\n')}`);

    // Runtime: drive a full generation + polling cycle and assert no credit
    // RPC, credit endpoint or credit field ever crosses the wire.
    fetchCalls = [];
    await invoke(imageGenerationHandler, { prompt: 'a cat' }, { apiKey: KEY_A });
    await invoke(imageToVideoHandler, { imageUrl: 'https://cdn.example.com/a.png' }, { apiKey: MUAPI_KEY_A });
    await invoke(videoStatusHandler, { videoId: 'video-1' }, { apiKey: MUAPI_KEY_A });

    for (const call of fetchCalls) {
      assert.ok(!call.url.includes('/rest/v1/rpc/'), `no RPC may be called: ${call.method} ${call.url}`);
      assert.ok(!/credit/i.test(call.url), `no credit endpoint may be contacted: ${call.url}`);
      if (call.init?.body) {
        assert.ok(!/credit/i.test(call.init.body), `no request body may carry a credit field: ${call.url}`);
      }
    }
    for (const row of [mock.insert, ...mock.patches]) {
      if (!row) continue;
      assert.ok(!/credit/i.test(JSON.stringify(row)), 'no DB row may carry a credit field');
    }
  });

  // ------------------------------------------------------------------ //
  // h. No Stripe/subscription gate                                      //
  // ------------------------------------------------------------------ //

  test('no Stripe/subscription gate in any AI generation flow (static)', async () => {
    const functions = listFunctionIndexFiles();
    const aiFunctions = functions.filter((fn) => fn.source.includes('getUserApiKey'));
    assert.ok(aiFunctions.length >= 20, `expected the BYOK AI functions to be found, saw ${aiFunctions.length}`);

    const offenders = [];
    for (const fn of aiFunctions) {
      if (/stripe/i.test(fn.source)) offenders.push(`${fn.path}: references Stripe`);
      if (fn.source.includes('create-payment-intent')) offenders.push(`${fn.path}: calls create-payment-intent`);
      if (fn.source.includes('paymentRequired: true')) offenders.push(`${fn.path}: still gates on paymentRequired`);
    }
    assert.deepEqual(offenders, [], `AI functions must not reference Stripe:\n${offenders.join('\n')}`);

    // Report-only: which files still mention Stripe / the payment intent
    // function at all (the payment function itself is expected to).
    const stripeFiles = functions
      .filter((fn) => /stripe/i.test(fn.source))
      .map((fn) => fn.path);
    assert.deepEqual(
      stripeFiles,
      ['supabase/functions/create-payment-intent/index.ts'],
      'only the dedicated payment function may reference Stripe'
    );
  });

  // ------------------------------------------------------------------ //
  // i. Keys never appear in logs, URLs or DB rows                       //
  // ------------------------------------------------------------------ //

  test('keys never appear in logs, URLs or DB rows (static + runtime)', async () => {
    // -- static: no key variable may be interpolated into a fetch URL, and
    //    no console call may reference a key variable.
    const offenders = [];
    for (const fn of listFunctionIndexFiles()) {
      for (const urlArg of fetchUrlArguments(fn.source)) {
        if (!urlArg.startsWith('`')) continue; // only template literals can interpolate
        for (const expression of templateInterpolations(urlArg)) {
          if (KEY_VARIABLE.test(expression)) {
            offenders.push(`${fn.path}: key variable interpolated into a fetch URL: \${${expression}}`);
          }
        }
      }
      for (const args of consoleCallArguments(fn.source)) {
        if (KEY_VARIABLE.test(args)) {
          offenders.push(`${fn.path}: console call references a key variable: console.(${args.trim().slice(0, 80)}...)`);
        }
      }
    }
    assert.deepEqual(offenders, [], `key material must never reach a URL or a log:\n${offenders.join('\n')}`);

    // -- static: no AI function reads a provider key from the environment.
    const envReaders = [];
    for (const fn of listFunctionIndexFiles()) {
      if (!fn.source.includes('getUserApiKey')) continue; // AI functions only
      for (const envKey of ['OPENAI_API_KEY', 'MUAPI_API_KEY', 'GEMINI_API_KEY']) {
        if (fn.source.includes(envKey)) envReaders.push(`${fn.path}: reads ${envKey}`);
      }
    }
    assert.deepEqual(envReaders, [], `no AI function may read a provider env key:\n${envReaders.join('\n')}`);

    // -- runtime: capture console output while a full cycle runs, then assert
    //    neither the user keys nor the decoys appear in logs, URLs or rows.
    const captured = [];
    const realConsole = { ...console };
    const capture = (level) => (...args) => {
      captured.push(args.map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' '));
      realConsole[level](...args);
    };
    const original = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    };
    console.log = capture('log');
    console.error = capture('error');
    console.warn = capture('warn');
    console.info = capture('info');
    console.debug = capture('debug');

    try {
      fetchCalls = [];
      await invoke(imageGenerationHandler, { prompt: 'a cat' }, { apiKey: KEY_A });
      await invoke(imageEditingHandler, { imageUrl: 'https://cdn.example.com/a.png', editOptions: { prompt: 'red' } }, { apiKey: KEY_B });
      await invoke(assistantStreamHandler, { messages: [{ role: 'user', content: 'hi' }] }, { apiKey: KEY_A });
      await invoke(aiImageHandler, { action: 'generate', prompt: 'x' }, { apiKey: KEY_A });
      await invoke(improvePromptHandler, { prompt: 'x' }, { apiKey: KEY_B });
      await invoke(imageToVideoHandler, { imageUrl: 'https://cdn.example.com/a.png' }, { apiKey: MUAPI_KEY_A });
      await invoke(videoStatusHandler, { videoId: 'video-1' }, { apiKey: MUAPI_KEY_B });
      await invoke(videoResultHandler, { videoId: 'video-1' }, { apiKey: MUAPI_KEY_A });
      // Force error paths too (provider failures log status/code, never keys).
      mock.images = { status: 401, body: { error: { code: 'invalid_api_key' } } };
      mock.responses = { status: 500, body: { error: { code: 'boom' } } };
      mock.muapiSubmit = { status: 401, body: { message: 'unauthorized' } };
      await invoke(imageGenerationHandler, { prompt: 'a cat' }, { apiKey: KEY_A });
      await invoke(assistantStreamHandler, { messages: [{ role: 'user', content: 'hi' }] }, { apiKey: KEY_B });
      await invoke(imageToVideoHandler, { imageUrl: 'https://cdn.example.com/a.png' }, { apiKey: MUAPI_KEY_B });
    } finally {
      console.log = original.log;
      console.error = original.error;
      console.warn = original.warn;
      console.info = original.info;
      console.debug = original.debug;
    }

    const allSecrets = [KEY_A, KEY_B, MUAPI_KEY_A, MUAPI_KEY_B, ...ALL_DECOYS];
    for (const line of captured) {
      for (const secret of allSecrets) {
        assert.ok(!line.includes(secret), `a log line leaked key material: ${line.slice(0, 120)}`);
      }
    }
    for (const call of fetchCalls) {
      for (const secret of allSecrets) {
        assert.ok(!call.url.includes(secret), `a URL leaked key material: ${call.url}`);
        if (call.init?.headers) {
          for (const [header, value] of Object.entries(call.init.headers)) {
            const isKeyHeader =
              /authorization/i.test(header) || /api-key/i.test(header);
            if (isKeyHeader) continue; // the provider key header is the only allowed carrier
            assert.ok(!String(value).includes(secret), `header ${header} leaked key material`);
          }
        }
        if (call.init?.body) {
          assert.ok(!call.init.body.includes(secret), `a request body leaked key material: ${call.url}`);
        }
      }
    }
    for (const row of [mock.insert, ...mock.patches]) {
      if (!row) continue;
      for (const secret of allSecrets) {
        assert.ok(!JSON.stringify(row).includes(secret), 'a DB row leaked key material');
      }
    }
    // The Authorization header is allowed to carry a user key -- but only the
    // one from the request that produced the call (proved in sections a/e/f).
  });

  // ------------------------------------------------------------------ //
  // j. Existing contracts preserved                                     //
  // ------------------------------------------------------------------ //

  test('existing contracts preserved: GPT Image 2.5 b64_json → data URL and Responses API output_text parsing', async () => {
    fetchCalls = [];
    const generated = await invoke(imageGenerationHandler, { prompt: 'a cat' }, { apiKey: KEY_A });
    assert.equal(generated.status, 200);
    const generatedBody = await readJson(generated);
    assert.equal(generatedBody.imageUrl, 'data:image/png;base64,R0VOQVJBRFM=');
    assert.deepEqual(generatedBody.imageUrls, [generatedBody.imageUrl]);

    const generations = openaiCalls().find((c) => c.url.endsWith('/v1/images/generations'));
    assert.ok(generations, 'expected a GPT Image 2.5 generations call');
    const payload = JSON.parse(generations.init.body);
    assert.equal(payload.model, 'gpt-image-2.5-sunburst');
    assert.equal(payload.n, 1);
    assert.equal(payload.output_format, 'png');

    fetchCalls = [];
    const edited = await invoke(removeBgHandler, { action: 'remove', imageUrl: 'https://cdn.example.com/a.png' }, { apiKey: KEY_A });
    assert.equal(edited.status, 200);
    assert.equal((await readJson(edited)).resultUrl, 'data:image/png;base64,R0VOQVJBRFM=');

    fetchCalls = [];
    const assisted = await invoke(assistantStreamHandler, { messages: [{ role: 'user', content: 'hi' }] }, { apiKey: KEY_A });
    assert.equal(assisted.status, 200);
    const assistedBody = await readJson(assisted);
    assert.equal(assistedBody.text, 'Hello from OpenAI');
    assert.equal(assistedBody.model, 'gpt-5-mini');
    assert.equal(assistedBody.message, 'Hello from OpenAI');

    fetchCalls = [];
    const improved = await invoke(improvePromptHandler, { prompt: 'a cat' }, { apiKey: KEY_A });
    assert.equal(improved.status, 200);
    const improvedBody = await readJson(improved);
    assert.equal(improvedBody.improvedPrompt, 'Hello from OpenAI');
    assert.equal(improvedBody.originalPrompt, 'a cat');

    const responsesCalls = fetchCalls.filter((c) => c.url.endsWith('/v1/responses'));
    assert.equal(responsesCalls.length, 1, 'expected exactly one Responses API call');
    assert.equal(responsesCalls[0].init.headers.Authorization, `Bearer ${KEY_A}`);
  });

  // ------------------------------------------------------------------ //
  // k. Frontend wiring                                                  //
  // ------------------------------------------------------------------ //

  test('frontend wiring: callEdgeFunction attaches x-user-api-key for every mapped provider function', () => {
    const client = read('src/utils/supabaseClient.ts');
    assert.ok(
      client.includes("from './userApiKeyStorage'"),
      'supabaseClient.ts must read the user key from userApiKeyStorage'
    );

    // Extract the callEdgeFunction body (skip the parameter list first: the
    // `payload: any = {}` default contains its own braces).
    const signature = client.indexOf('function callEdgeFunction');
    assert.ok(signature !== -1, 'callEdgeFunction must exist in src/utils/supabaseClient.ts');
    const parenIndex = client.indexOf('(', signature);
    assert.ok(parenIndex !== -1, 'callEdgeFunction must have a parameter list');
    let depth = 0;
    let i = parenIndex;
    for (; i < client.length; i += 1) {
      if (client[i] === '(') depth += 1;
      else if (client[i] === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    const bodyOpen = client.indexOf('{', i);
    assert.ok(bodyOpen !== -1, 'callEdgeFunction must have a body');
    const body = sliceBalanced(client, bodyOpen);
    assert.ok(body, 'could not extract the callEdgeFunction body');

    // The header must be attached to the fetch call with the user's key.
    assert.ok(
      /['"]x-user-api-key['"]/i.test(body),
      'callEdgeFunction must attach the x-user-api-key header (the backend requires it):\n' + body
    );
    assert.ok(
      /getUserApiKey\s*\(/.test(body),
      'the x-user-api-key value must come from the user key store (getUserApiKey)'
    );
    assert.ok(
      !/VITE_[A-Z_]*API_KEY/.test(body),
      'the key must never come from a shared VITE_* credential'
    );

    // Every BYOK (provider-backed) function the frontend calls must be mapped
    // to a key provider in EDGE_FUNCTION_KEY_PROVIDERS.
    const srcFiles = walkSourceFiles(join(REPO_ROOT, 'src'));
    const byokFunctions = listFunctionIndexFiles()
      .filter((fn) => fn.source.includes('getUserApiKey'))
      .map((fn) => fn.name);

    const called = new Set();
    for (const file of srcFiles) {
      const source = readFileSync(file, 'utf8');
      const re = /callEdgeFunction\(\s*['"]([a-z0-9-]+)['"]/g;
      let match;
      while ((match = re.exec(source)) !== null) called.add(match[1]);
    }

    const unmapped = [...called].filter(
      (name) => byokFunctions.includes(name) && !new RegExp(`['"]${name}['"]\\s*:`).test(client)
    );
    assert.deepEqual(
      unmapped,
      [],
      `these provider-backed functions are called by the frontend but not mapped to a key provider: ${unmapped.join(', ')}`
    );

    // No shared provider credential may be referenced anywhere under src/.
    const forbidden = ['VITE_OPENAI_API_KEY', 'VITE_MUAPI_API_KEY', 'VITE_GEMINI_API_KEY', 'VITE_FREEPIK_API_KEY'];
    const offenders = [];
    for (const file of srcFiles) {
      const source = readFileSync(file, 'utf8');
      for (const needle of forbidden) {
        if (source.includes(needle)) offenders.push(`${relative(REPO_ROOT, file)}: '${needle}'`);
      }
    }
    assert.deepEqual(offenders, [], `no browser env-key fallback may exist:\n${offenders.join('\n')}`);
  });
}
