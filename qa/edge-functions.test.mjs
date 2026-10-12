/**
 * QA -- Supabase edge function API contract tests (no live API keys required).
 *
 * The edge functions under supabase/functions/* are Deno modules. This suite
 * imports them directly with Node's TypeScript type stripping, stubbing the
 * `Deno` global (env + serve) and replacing global fetch with a router that
 * emulates Supabase auth / rate limits plus the OpenAI upstream. Each
 * registered handler is then driven with crafted Request objects to assert
 * the documented BYOK contract:
 *
 *   node --experimental-strip-types qa/edge-functions.test.mjs
 *
 * BYOK contract pinned here:
 *   - every request must carry the caller's own key in `x-user-api-key`
 *   - a missing/blank or non-`sk-` key returns HTTP 400 with
 *     OPENAI_KEY_MISSING_ERROR and never reaches the provider
 *   - the provider always receives THIS request's user key in the
 *     Authorization header -- env values are decoys that must never be read
 *   - no credit checks / no Gemini fallback paths exist any more
 *
 * When this file is collected by vitest instead, it delegates the whole suite
 * to the node runner above, because vitest's module runner cannot resolve the
 * Deno-only `jsr:` type import inside assistant-stream/index.ts.
 */

import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Under vitest, import.meta.url is not a file: URL, so resolve the script path
// from the repo root (vitest runs from the project root).
function resolveSelfPath() {
  const fromImportMeta = new URL('./edge-functions.test.mjs', import.meta.url);
  if (fromImportMeta.protocol === 'file:') return fileURLToPath(fromImportMeta);
  const fromCwd = join(process.cwd(), 'qa', 'edge-functions.test.mjs');
  if (existsSync(fromCwd)) return fromCwd;
  throw new Error('Cannot locate qa/edge-functions.test.mjs');
}

const SCRIPT_PATH = resolveSelfPath();
const REPO_ROOT = join(SCRIPT_PATH, '..', '..');
const UNDER_VITEST = Boolean(process.env.VITEST || process.env.VITEST_WORKER_ID);

if (UNDER_VITEST) {
  const { test } = await import('vitest');
  const { spawnSync } = await import('node:child_process');
  test('edge function contract suite (qa/edge-functions.test.mjs) passes under node', () => {
    // Strip vitest's own env markers so the child runs the plain node:test path.
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

  // Redirect Deno-only "jsr:" specifiers (type-only imports) to a stub.
  register(new URL('./loader.mjs', import.meta.url));

  // ------------------------------------------------------------------ //
  // Import the edge functions under test (current state on disk)        //
  // ------------------------------------------------------------------ //

  const importEdge = (name) =>
    import(new URL(`../supabase/functions/${name}/index.ts`, import.meta.url).href);

  await importEdge('image-generation');
  await importEdge('image-editing');
  await importEdge('assistant-stream');

  assert.equal(servedHandlers.length, 3, 'expected exactly three Deno.serve registrations');
  const [imageGenerationHandler, imageEditingHandler, assistantStreamHandler] = servedHandlers;
  assert.equal(typeof imageGenerationHandler, 'function', 'image-generation handler registered');
  assert.equal(typeof imageEditingHandler, 'function', 'image-editing handler registered');
  assert.equal(typeof assistantStreamHandler, 'function', 'assistant-stream handler registered');

  // ------------------------------------------------------------------ //
  // Mocked fetch router                                                 //
  // ------------------------------------------------------------------ //

  const AUTH_HEADER = 'Bearer qa-test-token';
  const OPENAI_GENERATIONS = 'https://api.openai.com/v1/images/generations';
  const OPENAI_EDITS = 'https://api.openai.com/v1/images/edits';
  const OPENAI_RESPONSES = 'https://api.openai.com/v1/responses';
  const GEMINI = 'https://generativelanguage.googleapis.com';

  // The user's own key, sent per request in `x-user-api-key` (100% BYOK).
  const USER_API_KEY = 'sk-test-user-openai-key-1234567890';

  // Decoy platform credentials left in the environment. No function may read
  // them: if any code path fell back to an env key, the provider call below
  // would carry one of these values and the Authorization assertions fail.
  const DECOY_OPENAI_KEY = 'sk-DECOY-ENV-OPENAI-KEY-0000000000';
  const DECOY_GEMINI_KEY = 'AIzaDECOY-ENV-GEMINI-KEY-0000000000';

  const OPENAI_KEY_MISSING_ERROR = 'OpenAI API key not configured. Add your key in Settings → API Keys.';

  let fetchCalls = [];
  let mock;

  function resetMocks() {
    fetchCalls = [];
    mock = {
      authOk: true,
      rateLimitRow: null, // null => no rate_limits row yet (fresh window)
      generations: { status: 200, body: { data: [{ b64_json: 'R0VOQVJBRFM=' }] } },
      edits: { status: 200, body: { data: [{ b64_json: 'RURJVEJBU0U2NA==' }] } },
      responses: {
        status: 200,
        body: {
          model: 'gpt-5-mini',
          output: [{ type: 'message', content: [{ type: 'output_text', text: 'Hello from OpenAI' }] }],
        },
      },
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
      if (!mock.authOk || auth !== AUTH_HEADER) return jsonResponse({ message: 'Invalid token' }, 401);
      return jsonResponse({ id: 'qa-user-1', email: 'qa@example.com', aud: 'authenticated' });
    }
    if (url.includes('/rest/v1/rate_limits')) {
      if (method === 'GET') return jsonResponse(mock.rateLimitRow ? [mock.rateLimitRow] : []);
      return jsonResponse({}, 201); // upsert / patch
    }
    if (url.startsWith(OPENAI_GENERATIONS)) return jsonResponse(mock.generations.body, mock.generations.status);
    if (url.startsWith(OPENAI_EDITS)) return jsonResponse(mock.edits.body, mock.edits.status);
    if (url.startsWith(OPENAI_RESPONSES)) return jsonResponse(mock.responses.body, mock.responses.status);
    // Gemini upstreams are deliberately NOT mocked: the credit/Gemini fallback
    // paths were deleted, so any Gemini call is an unmocked (loud) failure.
    // Credit RPCs are not mocked either -- credits are gone entirely.
    throw new Error(`Unmocked fetch: ${method} ${url}`);
  }

  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const rawMethod = init.method ?? (typeof input === 'object' && input !== null ? input.method : undefined);
    const method = String(rawMethod ?? 'GET').toUpperCase();
    fetchCalls.push({ url, method, init });
    return routeFetch(url, method, init);
  };

  function resetEnv() {
    denoEnv.clear();
    // Only Supabase config is real configuration. The provider keys are
    // decoys: under 100% BYOK nothing reads them, and the tests below prove
    // no provider request ever carries their values.
    for (const [key, value] of Object.entries({
      SUPABASE_URL: 'https://qa-test-project.supabase.co',
      SUPABASE_ANON_KEY: 'qa-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'qa-service-role-key',
      OPENAI_API_KEY: DECOY_OPENAI_KEY,
      GEMINI_API_KEY: DECOY_GEMINI_KEY,
    })) denoEnv.set(key, value);
  }

  // ------------------------------------------------------------------ //
  // Request + assertion helpers                                         //
  // ------------------------------------------------------------------ //

  // `apiKey` is the value of the per-request `x-user-api-key` header.
  // Pass null to omit the header entirely, '' / '   ' to send a blank value.
  function invoke(handler, { method = 'POST', body, rawBody, auth = true, origin = 'http://localhost:3000', apiKey = USER_API_KEY } = {}) {
    const headers = { 'content-type': 'application/json' };
    if (origin) headers.origin = origin;
    if (auth) headers.Authorization = AUTH_HEADER;
    if (apiKey !== null) headers['x-user-api-key'] = apiKey;
    const hasBody = rawBody !== undefined || body !== undefined;
    return handler(
      new Request('https://qa-edge.test/functions/v1/test', {
        method,
        headers,
        ...(hasBody ? { body: rawBody !== undefined ? rawBody : JSON.stringify(body) } : {}),
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

  const upstreamCalls = (needle) => fetchCalls.filter((call) => call.url.includes(needle));

  function lastUpstreamBody(needle) {
    const call = [...fetchCalls].reverse().find((c) => c.url.includes(needle));
    assert.ok(call, `expected an upstream call to ${needle}`);
    return JSON.parse(call.init.body);
  }

  function lastUpstreamHeaders(needle) {
    const call = [...fetchCalls].reverse().find((c) => c.url.includes(needle));
    assert.ok(call, `expected an upstream call to ${needle}`);
    return call.init.headers;
  }

  // No recorded request (URL, header or body) may ever contain a decoy
  // platform credential.
  function assertNoDecoyCredentialsLeak() {
    for (const call of fetchCalls) {
      const serialized = JSON.stringify({ url: call.url, init: call.init });
      assert.ok(
        !serialized.includes(DECOY_OPENAI_KEY),
        `a request leaked the decoy OPENAI_API_KEY env value: ${call.method} ${call.url}`
      );
      assert.ok(
        !serialized.includes(DECOY_GEMINI_KEY),
        `a request leaked the decoy GEMINI_API_KEY env value: ${call.method} ${call.url}`
      );
    }
  }

  function assertNoCreditTraffic() {
    for (const call of fetchCalls) {
      assert.ok(
        !call.url.includes('/rest/v1/rpc/'),
        `no credit RPC may be called (credits were removed): ${call.method} ${call.url}`
      );
      assert.ok(
        !/credit/i.test(call.url),
        `no credit endpoint may be contacted: ${call.method} ${call.url}`
      );
      if (call.init?.body) {
        assert.ok(
          !/credit/i.test(call.init.body),
          `no request body may contain a credit field: ${call.method} ${call.url}`
        );
      }
    }
  }

  beforeEach(() => {
    resetMocks();
    resetEnv();
  });

  // ------------------------------------------------------------------ //
  // image-generation                                                    //
  // ------------------------------------------------------------------ //

  test('image-generation: OPTIONS preflight returns 200 with CORS headers', async () => {
    const res = await invoke(imageGenerationHandler, { method: 'OPTIONS' });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
    assert.match(res.headers.get('access-control-allow-methods') ?? '', /POST/);
  });

  test('image-generation: missing Authorization header returns 401', async () => {
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' }, auth: false });
    assert.equal(res.status, 401);
    assert.match((await readJson(res)).error, /authorization/i);
    assert.equal(upstreamCalls(OPENAI_GENERATIONS).length, 0);
  });

  test('image-generation: rejected token returns 401', async () => {
    mock.authOk = false;
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' } });
    assert.equal(res.status, 401);
    assert.equal((await readJson(res)).error, 'Invalid token');
    assert.equal(upstreamCalls(OPENAI_GENERATIONS).length, 0);
  });

  test('image-generation: invalid JSON body returns 400', async () => {
    const res = await invoke(imageGenerationHandler, { rawBody: '{"prompt": "a cat"' });
    assert.equal(res.status, 400);
    assert.deepEqual(await readJson(res), { error: 'Invalid JSON body' });
    assert.equal(upstreamCalls(OPENAI_GENERATIONS).length, 0);
  });

  test('image-generation: missing prompt returns 400', async () => {
    const res = await invoke(imageGenerationHandler, { body: { provider: 'openai' } });
    assert.equal(res.status, 400);
    assert.equal((await readJson(res)).error, 'Valid prompt is required');
  });

  test('image-generation: whitespace-only prompt (sanitized to empty) returns 400', async () => {
    const res = await invoke(imageGenerationHandler, { body: { prompt: '   ' } });
    assert.equal(res.status, 400);
    assert.equal((await readJson(res)).error, 'Valid prompt is required');
  });

  test('image-generation: unsupported provider returns 400', async () => {
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat', provider: 'dall-e-9' } });
    assert.equal(res.status, 400);
    assert.equal((await readJson(res)).error, 'Unsupported provider');
  });

  test('image-generation: missing x-user-api-key returns 400 with the exact setup message', async () => {
    for (const apiKey of [null, '', '   ']) {
      const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' }, apiKey });
      assert.equal(res.status, 400, `apiKey ${JSON.stringify(apiKey)} must be rejected with 400`);
      assert.deepEqual(await readJson(res), { error: OPENAI_KEY_MISSING_ERROR });
    }
    assert.equal(upstreamCalls(OPENAI_GENERATIONS).length, 0);
    assertNoDecoyCredentialsLeak();
  });

  test('image-generation: invalid-format user key returns 400 and never reaches the provider', async () => {
    for (const apiKey of ['not-a-valid-openai-key', 'sk-short', 'AIza-looking-like-gemini']) {
      const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' }, apiKey });
      assert.equal(res.status, 400, `apiKey ${JSON.stringify(apiKey)} must be rejected with 400`);
      assert.deepEqual(await readJson(res), { error: OPENAI_KEY_MISSING_ERROR });
    }
    assert.equal(upstreamCalls(OPENAI_GENERATIONS).length, 0);
    assertNoDecoyCredentialsLeak();
  });

  test('image-generation: every supported provider returns 200 with the documented shape and the user key', async () => {
    const providers = ['openai', 'gpt-5', 'gpt-image-1', 'imagen', 'imagen-4'];
    for (const provider of providers) {
      fetchCalls = [];
      const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat', provider } });
      assert.equal(res.status, 200, `provider ${provider} should be accepted`);
      const body = await readJson(res);
      assert.deepEqual(Object.keys(body).sort(), [
        'imageUrl', 'imageUrls', 'prompt', 'provider', 'quality', 'size', 'style',
      ]);
      assert.equal(body.provider, provider);
      assert.match(body.imageUrl, /^data:image\/png;base64,/);
      assert.deepEqual(body.imageUrls, [body.imageUrl]);
      assert.equal(body.prompt, 'a cat');
      assert.equal(body.size, '1024x1024');
      assert.equal(body.style, '');
      assert.equal(body.quality, 'standard');
      assert.equal(res.headers.get('x-credits-remaining'), null, 'no credit headers remain');
      assert.equal(lastUpstreamHeaders(OPENAI_GENERATIONS).Authorization, `Bearer ${USER_API_KEY}`);
      const upstream = lastUpstreamBody(OPENAI_GENERATIONS);
      assert.equal(upstream.model, 'gpt-image-2.5-sunburst', `model for provider ${provider}`);
      assert.equal(upstream.n, 1);
      assert.equal(upstream.size, '1024x1024');
      assert.equal(upstream.quality, 'medium');
      assert.equal(upstream.output_format, 'png');
      assert.equal(upstream.prompt, 'a cat');
    }
    assertNoDecoyCredentialsLeak();
    assertNoCreditTraffic();
  });

  test('image-generation: size aliases map to supported upstream sizes', async () => {
    const cases = [
      ['1024x1024', '1024x1024'],
      ['1536x1024', '1536x1024'],
      ['1024x1536', '1024x1536'],
      ['1792x1024', '1536x1024'],
      ['1024x1792', '1024x1536'],
    ];
    for (const [requested, expected] of cases) {
      const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat', size: requested } });
      assert.equal(res.status, 200, `size ${requested} should be accepted`);
      assert.equal((await readJson(res)).size, expected);
      assert.equal(lastUpstreamBody(OPENAI_GENERATIONS).size, expected);
    }
  });

  test('image-generation: unsupported size returns 400 listing valid sizes', async () => {
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat', size: '512x512' } });
    assert.equal(res.status, 400);
    const body = await readJson(res);
    assert.match(body.error, /Unsupported size/);
    for (const size of ['1024x1024', '1536x1024', '1024x1536', '1792x1024', '1024x1792']) {
      assert.ok(body.error.includes(size), `error message should list ${size}`);
    }
    assert.equal(upstreamCalls(OPENAI_GENERATIONS).length, 0);
  });

  test('image-generation: quality hd is translated to high for the provider', async () => {
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat', quality: 'hd' } });
    assert.equal(res.status, 200);
    assert.equal((await readJson(res)).quality, 'hd');
    assert.equal(lastUpstreamBody(OPENAI_GENERATIONS).quality, 'high');
  });

  test('image-generation: style is appended to the upstream prompt', async () => {
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat', style: 'vibrant anime' } });
    assert.equal(res.status, 200);
    assert.equal(lastUpstreamBody(OPENAI_GENERATIONS).prompt, 'a cat Style: vibrant anime');
    assert.equal((await readJson(res)).style, 'vibrant anime');
  });

  test('image-generation: applied tokens enhance the upstream prompt', async () => {
    const res = await invoke(imageGenerationHandler, {
      body: {
        prompt: 'a cat',
        appliedTokens: [
          {
            id: 'applied-1',
            token: { id: 'tok-1', type: 'text', key: 'TEXT', value: 'SALE', displayName: 'Big Sale' },
            position: { x: 10, y: 20 },
            appliedAt: new Date().toISOString(),
            effect: {
              type: 'text-overlay',
              parameters: {
                text: 'SALE',
                position: { x: 10, y: 20 },
                fontSize: 24,
                fontFamily: 'Arial',
                color: 'red',
                strokeWidth: 2,
                stroke: 'black',
              },
            },
          },
        ],
      },
    });
    assert.equal(res.status, 200);
    const upstream = lastUpstreamBody(OPENAI_GENERATIONS);
    assert.match(
      upstream.prompt,
      /Add the text "SALE" at position \(10%, 20%\) with 24px Arial font in red color with 2px black outline/
    );
    // The echoed prompt stays the sanitized base prompt, not the token-enhanced one.
    assert.equal((await readJson(res)).prompt, 'a cat');
  });

  test('image-generation: OPENAI_IMAGE_MODEL override reaches the provider', async () => {
    denoEnv.set('OPENAI_IMAGE_MODEL', 'qa-custom-image-model');
    let res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' } });
    assert.equal(res.status, 200);
    assert.equal(lastUpstreamBody(OPENAI_GENERATIONS).model, 'qa-custom-image-model');

    denoEnv.delete('OPENAI_IMAGE_MODEL');
    res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' } });
    assert.equal(res.status, 200);
    assert.equal(lastUpstreamBody(OPENAI_GENERATIONS).model, 'gpt-image-2.5-sunburst');
  });

  test('image-generation: rate limit is enforced before the provider (no credit RPC exists)', async () => {
    mock.rateLimitRow = { id: 'rl-1', count: 100, window_start: new Date().toISOString() };
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' } });
    assert.equal(res.status, 429);
    assert.equal((await readJson(res)).error, 'Rate limit exceeded');
    assert.equal(upstreamCalls(OPENAI_GENERATIONS).length, 0);
    assertNoCreditTraffic();
  });

  test('image-generation: the rate limit wins over the missing-key error (checked first)', async () => {
    mock.rateLimitRow = { id: 'rl-2', count: 100, window_start: new Date().toISOString() };
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' }, apiKey: null });
    assert.equal(res.status, 429);
    assert.equal((await readJson(res)).error, 'Rate limit exceeded');
    assert.equal(upstreamCalls(OPENAI_GENERATIONS).length, 0);
  });

  test('image-generation: provider errors map to 502 with providerStatus', async () => {
    for (const status of [401, 403, 429, 500]) {
      mock.generations = { status, body: { error: { code: 'boom', message: 'upstream failure' } } };
      const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' } });
      assert.equal(res.status, 502, `upstream ${status} should map to 502`);
      const body = await readJson(res);
      assert.equal(body.error, 'Image provider rejected the request');
      assert.equal(body.providerStatus, status);
    }
    assertNoDecoyCredentialsLeak();
  });

  test('image-generation: provider 200 without an image maps to 502', async () => {
    mock.generations = { status: 200, body: { data: [{}] } };
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' } });
    assert.equal(res.status, 502);
    assert.equal((await readJson(res)).error, 'Image provider returned no image');
  });

  test('image-generation: provider url response is returned as imageUrl', async () => {
    mock.generations = { status: 200, body: { data: [{ url: 'https://cdn.example.com/out.png' }] } };
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' } });
    assert.equal(res.status, 200);
    const body = await readJson(res);
    assert.equal(body.imageUrl, 'https://cdn.example.com/out.png');
    assert.deepEqual(body.imageUrls, ['https://cdn.example.com/out.png']);
  });

  // ------------------------------------------------------------------ //
  // image-editing                                                       //
  // ------------------------------------------------------------------ //

  test('image-editing: OPTIONS preflight returns 200 with CORS headers', async () => {
    const res = await invoke(imageEditingHandler, { method: 'OPTIONS' });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  });

  test('image-editing: GET returns 405 method not allowed', async () => {
    const res = await invoke(imageEditingHandler, { method: 'GET' });
    assert.equal(res.status, 405);
    assert.equal((await readJson(res)).error, 'Method not allowed');
  });

  test('image-editing: missing auth returns 401', async () => {
    const res = await invoke(imageEditingHandler, {
      body: { imageUrl: 'https://cdn.example.com/a.png', editOptions: { prompt: 'make it red' } },
      auth: false,
    });
    assert.equal(res.status, 401);
    assert.equal((await readJson(res)).error, 'Authentication required');
    assert.equal(upstreamCalls(OPENAI_EDITS).length, 0);
  });

  test('image-editing: missing x-user-api-key returns 400 with the exact setup message', async () => {
    for (const apiKey of [null, '', '   ']) {
      const res = await invoke(imageEditingHandler, {
        body: { imageUrl: 'https://cdn.example.com/a.png', editOptions: { prompt: 'make it red' } },
        apiKey,
      });
      assert.equal(res.status, 400, `apiKey ${JSON.stringify(apiKey)} must be rejected with 400`);
      assert.deepEqual(await readJson(res), { error: OPENAI_KEY_MISSING_ERROR });
    }
    assert.equal(upstreamCalls(OPENAI_EDITS).length, 0);
    assertNoDecoyCredentialsLeak();
  });

  test('image-editing: invalid-format user key returns 400 and never reaches the provider', async () => {
    for (const apiKey of ['not-a-valid-openai-key', 'sk-short']) {
      const res = await invoke(imageEditingHandler, {
        body: { imageUrl: 'https://cdn.example.com/a.png', editOptions: { prompt: 'make it red' } },
        apiKey,
      });
      assert.equal(res.status, 400, `apiKey ${JSON.stringify(apiKey)} must be rejected with 400`);
      assert.deepEqual(await readJson(res), { error: OPENAI_KEY_MISSING_ERROR });
    }
    assert.equal(upstreamCalls(OPENAI_EDITS).length, 0);
    assertNoDecoyCredentialsLeak();
  });

  test('image-editing: the key check precedes body parsing (missing key + invalid JSON is 400)', async () => {
    const res = await invoke(imageEditingHandler, { rawBody: '{"imageUrl": ', apiKey: null });
    assert.equal(res.status, 400);
    assert.deepEqual(await readJson(res), { error: OPENAI_KEY_MISSING_ERROR });
    assert.equal(upstreamCalls(OPENAI_EDITS).length, 0);
  });

  test('image-editing: invalid JSON body returns 500 via the catch-all (current behavior)', async () => {
    const res = await invoke(imageEditingHandler, { rawBody: '{"imageUrl": ' });
    assert.equal(res.status, 500);
    assert.equal((await readJson(res)).error, 'Image editing failed');
  });

  test('image-editing: non-https / non-data image URL returns 400', async () => {
    for (const imageUrl of ['', 'http://insecure.example.com/a.png', '/relative/a.png', 'ftp://host/a.png']) {
      const res = await invoke(imageEditingHandler, {
        body: { imageUrl, editOptions: { prompt: 'make it red' } },
      });
      assert.equal(res.status, 400, `imageUrl ${JSON.stringify(imageUrl)} should be rejected`);
      assert.equal((await readJson(res)).error, 'An HTTPS image URL or image data URL is required');
      assert.equal(upstreamCalls(OPENAI_EDITS).length, 0);
    }
  });

  test('image-editing: missing edit instruction returns 400', async () => {
    const res = await invoke(imageEditingHandler, {
      body: { imageUrl: 'https://cdn.example.com/a.png', editOptions: {} },
    });
    assert.equal(res.status, 400);
    assert.equal((await readJson(res)).error, 'An editing instruction is required');
  });

  test('image-editing: data URL input succeeds and is forwarded upstream with the user key', async () => {
    const dataUrl = 'data:image/png;base64,QUJDREVG';
    const res = await invoke(imageEditingHandler, {
      body: { imageUrl: dataUrl, editOptions: { prompt: 'make it red' } },
    });
    assert.equal(res.status, 200);
    const body = await readJson(res);
    assert.equal(body.imageUrl, 'data:image/png;base64,RURJVEJBU0U2NA==');
    assert.equal(body.model, 'gpt-image-2.5-sunburst');
    assert.equal(lastUpstreamHeaders(OPENAI_EDITS).Authorization, `Bearer ${USER_API_KEY}`);
    const upstream = lastUpstreamBody(OPENAI_EDITS);
    assert.equal(upstream.model, 'gpt-image-2.5-sunburst');
    assert.deepEqual(upstream.images, [{ image_url: dataUrl }]);
    assert.equal(upstream.prompt, 'make it red');
    assert.equal(upstream.n, 1);
    assert.equal(upstream.output_format, 'png');
    assertNoDecoyCredentialsLeak();
  });

  test('image-editing: https URL input succeeds and is forwarded upstream', async () => {
    const imageUrl = 'https://cdn.example.com/source.png';
    const res = await invoke(imageEditingHandler, {
      body: { imageUrl, editOptions: { prompt: 'remove the background' } },
    });
    assert.equal(res.status, 200);
    assert.equal((await readJson(res)).imageUrl, 'data:image/png;base64,RURJVEJBU0U2NA==');
    const upstream = lastUpstreamBody(OPENAI_EDITS);
    assert.deepEqual(upstream.images, [{ image_url: imageUrl }]);
    assert.equal(upstream.prompt, 'remove the background');
  });

  test('image-editing: prompt is sanitized and capped at 8000 chars before forwarding', async () => {
    const res = await invoke(imageEditingHandler, {
      body: {
        imageUrl: 'https://cdn.example.com/a.png',
        editOptions: { instruction: 'make it red <b>now</b>' },
      },
    });
    assert.equal(res.status, 200);
    assert.equal(lastUpstreamBody(OPENAI_EDITS).prompt, 'make it red now');

    const long = 'A'.repeat(9000);
    const res2 = await invoke(imageEditingHandler, {
      body: { imageUrl: 'https://cdn.example.com/a.png', editOptions: { prompt: long } },
    });
    assert.equal(res2.status, 200);
    assert.equal(lastUpstreamBody(OPENAI_EDITS).prompt.length, 8000);
  });

  test('image-editing: oversized image reference returns 413 without an upstream call', async () => {
    const huge = `data:image/png;base64,${'A'.repeat(20 * 1024 * 1024 + 1024)}`;
    const res = await invoke(imageEditingHandler, {
      body: { imageUrl: huge, editOptions: { prompt: 'make it red' } },
    });
    assert.equal(res.status, 413);
    assert.equal((await readJson(res)).error, 'Image reference too large');
    assert.equal(upstreamCalls(OPENAI_EDITS).length, 0);
  });

  test('image-editing: provider error statuses are mapped (429 stays, auth/404 become 502)', async () => {
    const cases = [
      [429, 429, 'Image editing provider rate limit reached'],
      [401, 502, 'Image editing provider rejected the server credentials'],
      [403, 502, 'Image editing provider rejected the server credentials'],
      [404, 502, 'Image editing provider endpoint not found'],
      [500, 502, 'Image editing provider rejected the request'],
    ];
    for (const [upstreamStatus, expectedStatus, expectedError] of cases) {
      mock.edits = { status: upstreamStatus, body: { error: { code: 'boom' } } };
      const res = await invoke(imageEditingHandler, {
        body: { imageUrl: 'https://cdn.example.com/a.png', editOptions: { prompt: 'make it red' } },
      });
      assert.equal(res.status, expectedStatus, `upstream ${upstreamStatus} should map to ${expectedStatus}`);
      const body = await readJson(res);
      assert.equal(body.error, expectedError);
      assert.equal(body.providerStatus, upstreamStatus);
    }
  });

  test('image-editing: provider 200 without an image returns 502', async () => {
    mock.edits = { status: 200, body: { data: [{}] } };
    const res = await invoke(imageEditingHandler, {
      body: { imageUrl: 'https://cdn.example.com/a.png', editOptions: { prompt: 'make it red' } },
    });
    assert.equal(res.status, 502);
    assert.equal((await readJson(res)).error, 'Image editing returned no image');
  });

  test('image-editing: provider url response is returned as imageUrl', async () => {
    mock.edits = { status: 200, body: { data: [{ url: 'https://cdn.example.com/edited.png' }] } };
    const res = await invoke(imageEditingHandler, {
      body: { imageUrl: 'https://cdn.example.com/a.png', editOptions: { prompt: 'make it red' } },
    });
    assert.equal(res.status, 200);
    const body = await readJson(res);
    assert.equal(body.imageUrl, 'https://cdn.example.com/edited.png');
    assert.equal(body.model, 'gpt-image-2.5-sunburst');
  });

  // ------------------------------------------------------------------ //
  // assistant-stream                                                    //
  // ------------------------------------------------------------------ //

  test('assistant-stream: OPTIONS preflight returns 200 with CORS headers', async () => {
    const res = await invoke(assistantStreamHandler, { method: 'OPTIONS' });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  });

  test('assistant-stream: missing auth returns 401', async () => {
    const res = await invoke(assistantStreamHandler, {
      body: { messages: [{ role: 'user', content: 'hi' }] },
      auth: false,
    });
    assert.equal(res.status, 401);
    assert.equal((await readJson(res)).error, 'Authentication required');
    assert.equal(upstreamCalls(OPENAI_RESPONSES).length, 0);
  });

  test('assistant-stream: empty messages array returns 400 (checked before the key)', async () => {
    const res = await invoke(assistantStreamHandler, { body: { messages: [] }, apiKey: null });
    assert.equal(res.status, 400);
    assert.equal((await readJson(res)).error, 'Messages array is required');
    assert.equal(upstreamCalls(OPENAI_RESPONSES).length, 0);
  });

  test('assistant-stream: missing x-user-api-key returns 400 with the exact setup message', async () => {
    for (const apiKey of [null, '', '   ']) {
      const res = await invoke(assistantStreamHandler, {
        body: { messages: [{ role: 'user', content: 'hi' }], provider: 'openai' },
        apiKey,
      });
      assert.equal(res.status, 400, `apiKey ${JSON.stringify(apiKey)} must be rejected with 400`);
      assert.deepEqual(await readJson(res), { error: OPENAI_KEY_MISSING_ERROR });
    }
    assert.equal(upstreamCalls(OPENAI_RESPONSES).length, 0);
    assert.equal(upstreamCalls(GEMINI).length, 0, 'no Gemini fallback may exist');
    assertNoDecoyCredentialsLeak();
  });

  test('assistant-stream: invalid-format user key returns 400 with no provider and no fallback', async () => {
    const res = await invoke(assistantStreamHandler, {
      body: { messages: [{ role: 'user', content: 'hi' }], provider: 'openai' },
      apiKey: 'not-a-valid-openai-key',
    });
    assert.equal(res.status, 400);
    assert.deepEqual(await readJson(res), { error: OPENAI_KEY_MISSING_ERROR });
    assert.equal(upstreamCalls(OPENAI_RESPONSES).length, 0);
    assert.equal(upstreamCalls(GEMINI).length, 0, 'an invalid key must not trigger a Gemini fallback');
    assertNoDecoyCredentialsLeak();
  });

  test('assistant-stream: openai provider returns {text, model, message} and forwards user/assistant turns only', async () => {
    const res = await invoke(assistantStreamHandler, {
      body: {
        messages: [
          { role: 'system', content: 'be terse' },
          { role: 'user', content: 'hi' },
          { role: 'assistant', content: 'hello' },
        ],
        provider: 'openai',
        userContext: { FIRSTNAME: 'Ada', LASTNAME: 'Lovelace' },
      },
    });
    assert.equal(res.status, 200);
    const body = await readJson(res);
    assert.equal(body.text, 'Hello from OpenAI');
    assert.equal(body.model, 'gpt-5-mini');
    assert.equal(body.message, 'Hello from OpenAI');
    assert.ok(!JSON.stringify(body).includes(USER_API_KEY), 'the response must not echo the API key');
    assert.equal(lastUpstreamHeaders(OPENAI_RESPONSES).Authorization, `Bearer ${USER_API_KEY}`);
    const upstream = lastUpstreamBody(OPENAI_RESPONSES);
    assert.equal(upstream.model, 'gpt-5-mini');
    assert.equal(upstream.max_output_tokens, 1000);
    assert.deepEqual(upstream.input, [
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hello' },
    ]);
    assert.match(upstream.instructions, /Ada/);
    assert.equal(upstreamCalls(GEMINI).length, 0);
    assertNoDecoyCredentialsLeak();
    assertNoCreditTraffic();
  });

  test('assistant-stream: OPENAI_RESPONSES_MODEL override is used', async () => {
    denoEnv.set('OPENAI_RESPONSES_MODEL', 'qa-override-model');
    const res = await invoke(assistantStreamHandler, {
      body: { messages: [{ role: 'user', content: 'hi' }], provider: 'openai' },
    });
    assert.equal(res.status, 200);
    assert.equal(lastUpstreamBody(OPENAI_RESPONSES).model, 'qa-override-model');
  });

  test('assistant-stream: openai upstream failure maps to 502 with providerStatus', async () => {
    mock.responses = { status: 429, body: { error: { code: 'rate_limit_exceeded' } } };
    const res = await invoke(assistantStreamHandler, {
      body: { messages: [{ role: 'user', content: 'hi' }], provider: 'openai' },
    });
    assert.equal(res.status, 502);
    const body = await readJson(res);
    assert.equal(body.error, 'OpenAI Responses request failed');
    assert.equal(body.providerStatus, 429);
    assert.ok(!JSON.stringify(body).includes(USER_API_KEY));
  });

  test('assistant-stream: incomplete model response maps to 502', async () => {
    mock.responses = {
      status: 200,
      body: { status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, model: 'gpt-5-mini' },
    };
    const res = await invoke(assistantStreamHandler, {
      body: { messages: [{ role: 'user', content: 'hi' }], provider: 'openai' },
    });
    assert.equal(res.status, 502);
    assert.equal((await readJson(res)).error, 'Model response was incomplete');
  });

  test('assistant-stream: rate limit exceeded returns 429', async () => {
    mock.rateLimitRow = { id: 'rl-2', count: 100, window_start: new Date().toISOString() };
    const res = await invoke(assistantStreamHandler, {
      body: { messages: [{ role: 'user', content: 'hi' }] },
    });
    assert.equal(res.status, 429);
    assert.equal((await readJson(res)).error, 'Rate limit exceeded');
    assert.equal(upstreamCalls(OPENAI_RESPONSES).length, 0);
  });

  test('assistant-stream: invalid JSON body returns 500 via the catch-all', async () => {
    const res = await invoke(assistantStreamHandler, { rawBody: 'not json at all' });
    assert.equal(res.status, 500);
  });
}
