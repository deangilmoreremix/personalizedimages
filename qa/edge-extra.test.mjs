/**
 * QA -- runtime contract tests for edge functions not covered by the other
 * suites (qa/edge-functions.test.mjs, qa/openai-functions.test.mjs,
 * qa/rate-limit.test.mjs, qa/video-functions.test.mjs).
 *
 * The functions under supabase/functions/* are Deno modules, so this suite
 * imports them directly with Node's TypeScript type stripping, stubbing the
 * `Deno` global (env + serve) and replacing global fetch with a router that
 * emulates Supabase auth / rate limits / the generated_videos table plus the
 * OpenAI and MuAPI upstreams. Each registered handler is then driven with
 * crafted Request objects to pin the contract the frontend depends on:
 *
 *   node --experimental-strip-types qa/edge-extra.test.mjs
 *
 * Every OpenAI call must carry the per-request user key from
 * `x-user-api-key` as `Authorization: Bearer <user key>`, every MuAPI call
 * must carry it as `x-api-key`, and the decoy env credentials set in the
 * Deno environment must never appear in any provider request.
 *
 * When this file is collected by vitest instead, it delegates the whole
 * suite to the node runner above, because vitest's module runner cannot
 * resolve the Deno-only `jsr:` type imports inside these functions.
 */

import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

function resolveSelfPath() {
  const fromImportMeta = new URL('./edge-extra.test.mjs', import.meta.url);
  if (fromImportMeta.protocol === 'file:') return fileURLToPath(fromImportMeta);
  const fromCwd = join(process.cwd(), 'qa', 'edge-extra.test.mjs');
  if (existsSync(fromCwd)) return fromCwd;
  throw new Error('Cannot locate qa/edge-extra.test.mjs');
}

const SCRIPT_PATH = resolveSelfPath();
const REPO_ROOT = join(SCRIPT_PATH, '..', '..');
const UNDER_VITEST = Boolean(process.env.VITEST || process.env.VITEST_WORKER_ID);

if (UNDER_VITEST) {
  const { test } = await import('vitest');
  const { spawnSync } = await import('node:child_process');
  test('extra edge function contract suite (qa/edge-extra.test.mjs) passes under node', () => {
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
  // Deno global stub                                                    //
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

  // Redirect Deno-only "jsr:" / "npm:" specifiers to local stubs.
  register(new URL('./loader.mjs', import.meta.url));

  // ------------------------------------------------------------------ //
  // Import the edge functions under test (current state on disk)        //
  // ------------------------------------------------------------------ //

  const importEdge = (name) =>
    import(new URL(`../supabase/functions/${name}/index.ts`, import.meta.url).href);

  await importEdge('freepik-ai-image');
  await importEdge('freepik-remove-bg');
  await importEdge('freepik-upscale');
  await importEdge('freepik-relight');
  await importEdge('freepik-style-transfer');
  await importEdge('freepik-improve-prompt');
  await importEdge('image-to-video');

  assert.equal(servedHandlers.length, 7, 'all seven handlers registered');
  const [
    aiImageHandler,
    removeBgHandler,
    upscaleHandler,
    relightHandler,
    styleTransferHandler,
    improvePromptHandler,
    imageToVideoHandler,
  ] = servedHandlers;

  // ------------------------------------------------------------------ //
  // Mocked fetch router                                                 //
  // ------------------------------------------------------------------ //

  const AUTH_HEADER = 'Bearer qa-test-token';
  const SUPABASE = 'https://qa-test-project.supabase.co';
  const OPENAI = 'https://api.openai.com';
  const MUAPI_SUBMIT = 'https://api.muapi.ai/api/v1/kling-master';

  // The caller's own keys, sent per request in `x-user-api-key` (100% BYOK).
  // Both providers read the same header; OpenAI validates the `sk-` format.
  const USER_API_KEY = 'sk-test-user-openai-key-1234567890';

  // Decoy platform credentials: no function may read them, so they must never
  // appear in any provider request (OpenAI Authorization / MuAPI x-api-key).
  const DECOY_OPENAI_KEY = 'sk-DECOY-ENV-OPENAI-KEY-0000000000';
  const DECOY_MUAPI_KEY = 'muapi-DECOY-ENV-KEY-0000000000';

  let openaiCalls = [];
  let muapiCalls = [];
  let mock;

  function resetMocks() {
    openaiCalls = [];
    muapiCalls = [];
    mock = {
      images: { status: 200, body: { data: [{ b64_json: 'R0VOQVJBRFM=' }] } },
      responses: {
        status: 200,
        body: {
          output: [{ type: 'message', content: [{ type: 'output_text', text: 'improved prompt text' }] }],
        },
      },
      muapiSubmit: { status: 200, body: { request_id: 'muapi-task-1' } },
      insert: null,
      patches: [],
    };
  }

  const jsonResponse = (data, status = 200) =>
    new Response(typeof data === 'string' ? data : JSON.stringify(data), {
      status,
      headers: { 'content-type': 'application/json' },
    });

  // A 1x1 PNG is enough for the dimension sniffing in freepik-upscale.
  const PNG_1X1_B64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

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
    if (url === `${SUPABASE}/rest/v1/generated_videos` && method === 'POST') {
      mock.insert = JSON.parse(init.body);
      return jsonResponse([{ id: 'video-1' }], 201);
    }
    if (url.startsWith(`${SUPABASE}/rest/v1/generated_videos?id=eq.`) && method === 'PATCH') {
      mock.patches.push(JSON.parse(init.body));
      return jsonResponse({}, 200);
    }
    if (url.startsWith(`${OPENAI}/`)) {
      openaiCalls.push({ url, method, init });
      if (url.includes('/v1/responses')) {
        return jsonResponse(mock.responses.body, mock.responses.status);
      }
      return jsonResponse(mock.images.body, mock.images.status);
    }
    if (url === MUAPI_SUBMIT && method === 'POST') {
      muapiCalls.push({ url, method, init });
      return jsonResponse(mock.muapiSubmit.body, mock.muapiSubmit.status);
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
    return routeFetch(url, method, init);
  };

  function resetEnv() {
    denoEnv.clear();
    for (const [key, value] of Object.entries({
      SUPABASE_URL: SUPABASE,
      SUPABASE_ANON_KEY: 'qa-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'qa-service-role-key',
      OPENAI_API_KEY: DECOY_OPENAI_KEY,
      MUAPI_API_KEY: DECOY_MUAPI_KEY,
      // OPENAI_IMAGE_MODEL / OPENAI_RESPONSES_MODEL are deliberately left unset
      // so these tests pin the built-in defaults of each function.
    })) denoEnv.set(key, value);
  }

  // `apiKey` is the per-request `x-user-api-key` header value. Pass null to
  // omit the header entirely, '' for a blank value.
  const invoke = (handler, { body, auth = true, method = 'POST', origin = 'http://localhost:3000', apiKey = USER_API_KEY } = {}) => {
    const headers = { 'content-type': 'application/json', origin };
    if (auth) headers.Authorization = AUTH_HEADER;
    if (apiKey !== null) headers['x-user-api-key'] = apiKey;
    return handler(
      new Request('https://edge.example.com/fn', {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    );
  };

  const readJson = async (res) => ({ status: res.status, body: await res.json() });

  const openaiCall = (needle) => openaiCalls.find((c) => c.url.includes(needle));
  const openaiBody = (needle) => {
    const call = openaiCall(needle);
    assert.ok(call, `expected an OpenAI call to ${needle}`);
    return JSON.parse(call.init.body);
  };
  const lastPatch = () => mock.patches[mock.patches.length - 1];

  // Every provider request must carry the user key and no decoy env value.
  function assertNoDecoyCredentialsLeak() {
    for (const call of [...openaiCalls, ...muapiCalls]) {
      const serialized = JSON.stringify({ url: call.url, init: call.init });
      assert.ok(!serialized.includes(DECOY_OPENAI_KEY), `a request leaked the decoy OPENAI_API_KEY: ${call.url}`);
      assert.ok(!serialized.includes(DECOY_MUAPI_KEY), `a request leaked the decoy MUAPI_API_KEY: ${call.url}`);
    }
    for (const call of openaiCalls) {
      assert.equal(
        call.init.headers.Authorization,
        `Bearer ${USER_API_KEY}`,
        `every OpenAI call must carry the requesting user's key: ${call.url}`
      );
    }
    for (const call of muapiCalls) {
      assert.equal(
        call.init.headers['x-api-key'],
        USER_API_KEY,
        `every MuAPI call must carry the requesting user's key: ${call.url}`
      );
    }
  }

  beforeEach(() => {
    resetMocks();
    resetEnv();
  });

  // ------------------------------------------------------------------ //
  // freepik-ai-image                                                    //
  // ------------------------------------------------------------------ //

  test('freepik-ai-image: generate returns resultUrls + resultUrl via /v1/images/generations', async () => {
    const res = await invoke(aiImageHandler, { body: { action: 'generate', prompt: 'a futuristic city' } });
    const { status, body } = await readJson(res);
    assert.equal(status, 200);
    assert.deepEqual(body.resultUrls, ['data:image/png;base64,R0VOQVJBRFM=']);
    assert.equal(body.resultUrl, body.resultUrls[0]);

    const call = openaiCall('/v1/images/generations');
    assert.ok(call, 'expected exactly one /v1/images/generations call');
    const payload = JSON.parse(call.init.body);
    assert.equal(payload.model, 'gpt-image-2.5-sunburst');
    assert.equal(payload.prompt, 'a futuristic city');
    assert.equal(call.init.headers.Authorization, `Bearer ${USER_API_KEY}`);
    assert.equal(openaiCall('/v1/images/edits'), undefined, 'text-to-image must not call the edits endpoint');
    assertNoDecoyCredentialsLeak();
  });

  test('freepik-ai-image: missing auth returns 401 without calling the provider', async () => {
    const res = await invoke(aiImageHandler, { body: { action: 'generate', prompt: 'x' }, auth: false });
    assert.equal(res.status, 401);
    assert.equal(openaiCalls.length, 0);
  });

  test('freepik-ai-image: empty prompt returns 400', async () => {
    const res = await invoke(aiImageHandler, { body: { action: 'generate', prompt: '   ' } });
    const { status, body } = await readJson(res);
    assert.equal(status, 400);
    assert.match(body.error, /prompt is required/i);
    assert.equal(openaiCalls.length, 0);
  });

  // ------------------------------------------------------------------ //
  // freepik-remove-bg                                                   //
  // ------------------------------------------------------------------ //

  test('freepik-remove-bg: remove returns resultUrl and posts images:[{image_url}] to /v1/images/edits', async () => {
    const res = await invoke(removeBgHandler, {
      body: { action: 'remove', imageUrl: 'https://cdn.example.com/photo.png' },
    });
    const { status, body } = await readJson(res);
    assert.equal(status, 200);
    assert.equal(body.resultUrl, 'data:image/png;base64,R0VOQVJBRFM=');

    const payload = openaiBody('/v1/images/edits');
    assert.deepEqual(payload.images, [{ image_url: 'https://cdn.example.com/photo.png' }]);
    assert.equal(payload.model, 'gpt-image-2.5-sunburst');
    assert.equal(payload.background, 'transparent');
    assert.equal(openaiCall('/v1/images/edits').init.headers.Authorization, `Bearer ${USER_API_KEY}`);
    assertNoDecoyCredentialsLeak();
  });

  test('freepik-remove-bg: missing imageUrl returns 400', async () => {
    const res = await invoke(removeBgHandler, { body: { action: 'remove' } });
    assert.equal(res.status, 400);
    assert.equal(openaiCalls.length, 0);
  });

  // ------------------------------------------------------------------ //
  // freepik-upscale                                                     //
  // ------------------------------------------------------------------ //

  test('freepik-upscale: upscale returns resultUrl from the edits endpoint', async () => {
    const res = await invoke(upscaleHandler, {
      body: { action: 'upscale', imageUrl: 'https://cdn.example.com/photo.png', scaleFactor: 2 },
    });
    const { status, body } = await readJson(res);
    assert.equal(status, 200);
    assert.ok(body.resultUrl.startsWith('data:image/png;base64,'));

    const payload = openaiBody('/v1/images/edits');
    assert.deepEqual(payload.images, [{ image_url: 'https://cdn.example.com/photo.png' }]);
    assert.match(payload.prompt, /upscale/i);
    assert.equal(payload.size, '2048x2048');
    assert.equal(openaiCall('/v1/images/edits').init.headers.Authorization, `Bearer ${USER_API_KEY}`);
    assertNoDecoyCredentialsLeak();
  });

  // ------------------------------------------------------------------ //
  // freepik-relight                                                     //
  // ------------------------------------------------------------------ //

  test('freepik-relight: relight returns resultUrl and encodes lightDirection in the prompt', async () => {
    const res = await invoke(relightHandler, {
      body: { action: 'relight', imageUrl: 'https://cdn.example.com/photo.png', lightDirection: 'left' },
    });
    const { status, body } = await readJson(res);
    assert.equal(status, 200);
    assert.ok(body.resultUrl.startsWith('data:image/png;base64,'));

    const payload = openaiBody('/v1/images/edits');
    assert.match(payload.prompt, /main light coming from the left/i);
    assert.deepEqual(payload.images, [{ image_url: 'https://cdn.example.com/photo.png' }]);
    assert.equal(openaiCall('/v1/images/edits').init.headers.Authorization, `Bearer ${USER_API_KEY}`);
    assertNoDecoyCredentialsLeak();
  });

  // ------------------------------------------------------------------ //
  // freepik-style-transfer                                              //
  // ------------------------------------------------------------------ //

  test('freepik-style-transfer: transfer sends source then style image to /v1/images/edits', async () => {
    const res = await invoke(styleTransferHandler, {
      body: {
        action: 'transfer',
        imageUrl: 'https://cdn.example.com/photo.png',
        styleImageUrl: 'https://cdn.example.com/style.png',
        styleName: 'watercolor',
      },
    });
    const { status, body } = await readJson(res);
    assert.equal(status, 200);
    assert.ok(body.resultUrl.startsWith('data:image/png;base64,'));

    const payload = openaiBody('/v1/images/edits');
    assert.deepEqual(payload.images, [
      { image_url: 'https://cdn.example.com/photo.png' },
      { image_url: 'https://cdn.example.com/style.png' },
    ]);
    assert.match(payload.prompt, /watercolor/i);
    assert.equal(openaiCall('/v1/images/edits').init.headers.Authorization, `Bearer ${USER_API_KEY}`);
    assertNoDecoyCredentialsLeak();
  });

  // ------------------------------------------------------------------ //
  // freepik-improve-prompt                                              //
  // ------------------------------------------------------------------ //

  test('freepik-improve-prompt: returns improvedPrompt + originalPrompt via /v1/responses', async () => {
    const res = await invoke(improvePromptHandler, { body: { prompt: 'a cat' } });
    const { status, body } = await readJson(res);
    assert.equal(status, 200);
    assert.equal(body.improvedPrompt, 'improved prompt text');
    assert.equal(body.originalPrompt, 'a cat');
    assert.deepEqual(Object.keys(body).sort(), ['improvedPrompt', 'originalPrompt']);

    const call = openaiCall('/v1/responses');
    assert.ok(call, 'expected a /v1/responses call');
    const payload = JSON.parse(call.init.body);
    assert.equal(payload.model, 'gpt-5-mini');
    assert.equal(payload.input[0].content[0].text, 'a cat');
    assert.equal(call.init.headers.Authorization, `Bearer ${USER_API_KEY}`);
    assertNoDecoyCredentialsLeak();
  });

  test('freepik-improve-prompt: empty prompt returns 400', async () => {
    const res = await invoke(improvePromptHandler, { body: { prompt: '' } });
    assert.equal(res.status, 400);
    assert.equal(openaiCalls.length, 0);
  });

  // ------------------------------------------------------------------ //
  // image-to-video                                                      //
  // ------------------------------------------------------------------ //

  test('image-to-video: valid body creates the row and submits to MuAPI kling-master', async () => {
    // NOTE: the handler returns 200 (the Response is built without a status),
    // not 201 -- pinned here so a status change is a deliberate, visible edit.
    const res = await invoke(imageToVideoHandler, {
      body: { imageUrl: 'https://cdn.example.com/a.png', duration: 5, prompt: 'animate this' },
    });
    const { status, body } = await readJson(res);
    assert.equal(status, 200);
    assert.equal(body.id, 'video-1');
    assert.equal(body.status, 'processing');
    assert.equal(body.duration, 5);
    assert.equal(body.sourceImageUrl, 'https://cdn.example.com/a.png');

    assert.equal(muapiCalls.length, 1, 'expected exactly one MuAPI submit');
    const submit = muapiCalls[0];
    assert.equal(submit.url, MUAPI_SUBMIT);
    assert.equal(submit.init.headers['x-api-key'], USER_API_KEY);
    assert.deepEqual(JSON.parse(submit.init.body), {
      prompt: 'animate this',
      image_url: 'https://cdn.example.com/a.png',
      duration: 5,
    });

    assert.equal(mock.insert.status, 'processing');
    assert.equal(mock.insert.provider, 'kling-master');
    assert.equal(mock.insert.duration, 5);
    assert.equal(mock.insert.prompt, 'animate this');
    assert.equal(mock.insert.metadata.sourceImageUrl, 'https://cdn.example.com/a.png');
    assert.equal(lastPatch().metadata.providerTaskId, 'muapi-task-1');
    assert.ok(
      !JSON.stringify(mock.insert).includes(USER_API_KEY),
      'the user key must never be written to the generated_videos row'
    );
    assertNoDecoyCredentialsLeak();
  });

  test('image-to-video: missing x-user-api-key returns 400 with the setup message and no submit', async () => {
    for (const apiKey of [null, '', '   ']) {
      const res = await invoke(imageToVideoHandler, {
        body: { imageUrl: 'https://cdn.example.com/a.png' },
        apiKey,
      });
      assert.equal(res.status, 400, `apiKey ${JSON.stringify(apiKey)} must be rejected with 400`);
      const { body } = await readJson(res);
      assert.equal(body.error, 'MuAPI API key not configured. Add your key in Settings → API Keys.');
    }
    assert.equal(muapiCalls.length, 0, 'the provider must never be called without the user key');
    assert.equal(mock.insert, null, 'no generated_videos row may be created without the user key');
  });

  test('image-to-video: invalid imageUrl returns 400 without submitting', async () => {
    for (const imageUrl of [undefined, '', '/relative/a.png', 'ftp://host/a.png']) {
      const res = await invoke(imageToVideoHandler, { body: { imageUrl } });
      assert.equal(res.status, 400, `imageUrl ${JSON.stringify(imageUrl)} should be rejected`);
    }
    assert.equal(muapiCalls.length, 0);
    assert.equal(mock.insert, null);
  });

  test('image-to-video: missing auth returns 401', async () => {
    const res = await invoke(imageToVideoHandler, { body: { imageUrl: 'https://cdn.example.com/a.png' }, auth: false });
    assert.equal(res.status, 401);
    assert.equal(muapiCalls.length, 0);
  });

  test('all seven functions: OPTIONS preflight returns 200 with CORS headers', async () => {
    for (const handler of servedHandlers) {
      const res = await invoke(handler, { method: 'OPTIONS' });
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
    }
  });

  test('decoy env credentials are never used: providers receive only the user key', async () => {
    // OpenAI side
    await invoke(aiImageHandler, { body: { action: 'generate', prompt: 'x' } });
    await invoke(removeBgHandler, { body: { action: 'remove', imageUrl: 'https://cdn.example.com/photo.png' } });
    await invoke(improvePromptHandler, { body: { prompt: 'x' } });
    // MuAPI side
    await invoke(imageToVideoHandler, { body: { imageUrl: 'https://cdn.example.com/a.png' } });

    assert.ok(openaiCalls.length >= 3, 'expected the OpenAI calls to have happened');
    assert.equal(muapiCalls.length, 1, 'expected exactly one MuAPI call');
    assertNoDecoyCredentialsLeak();
  });
}
