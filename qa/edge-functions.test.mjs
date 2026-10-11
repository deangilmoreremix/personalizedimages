/**
 * QA -- Supabase edge function API contract tests (no live API keys required).
 *
 * The edge functions under supabase/functions/* are Deno modules. This suite
 * imports them directly with Node's TypeScript type stripping, stubbing the
 * `Deno` global (env + serve) and replacing global fetch with a router that
 * emulates Supabase auth / rate limits / credits plus the OpenAI and Gemini
 * upstreams. Each registered handler is then driven with crafted Request
 * objects to assert the documented contract:
 *
 *   node --experimental-strip-types qa/edge-functions.test.mjs
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

  let fetchCalls = [];
  let mock;

  function resetMocks() {
    fetchCalls = [];
    mock = {
      authOk: true,
      rateLimitRow: null, // null => no rate_limits row yet (fresh window)
      credits: { allowed: true, balance: 42 },
      generations: { status: 200, body: { data: [{ b64_json: 'R0VOQVJBRFM=' }] } },
      edits: { status: 200, body: { data: [{ b64_json: 'RURJVEJBU0U2NA==' }] } },
      responses: {
        status: 200,
        body: {
          model: 'gpt-5-mini',
          output: [{ type: 'message', content: [{ type: 'output_text', text: 'Hello from OpenAI' }] }],
        },
      },
      gemini: { status: 200, body: { candidates: [{ content: { parts: [{ text: 'Hello from Gemini' }] } }] } },
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
    if (url.includes('/rest/v1/rpc/check_and_deduct_credit')) return jsonResponse(mock.credits);
    if (url.startsWith(OPENAI_GENERATIONS)) return jsonResponse(mock.generations.body, mock.generations.status);
    if (url.startsWith(OPENAI_EDITS)) return jsonResponse(mock.edits.body, mock.edits.status);
    if (url.startsWith(OPENAI_RESPONSES)) return jsonResponse(mock.responses.body, mock.responses.status);
    if (url.startsWith(GEMINI)) return jsonResponse(mock.gemini.body, mock.gemini.status);
    throw new Error(`Unmocked fetch: ${method} ${url}`);
  }

  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const rawMethod = init.method ?? (typeof input === 'object' && input !== null ? input.method : undefined);
    const method = String(rawMethod ?? 'GET').toUpperCase();
    fetchCalls.push({ url, method, init });
    return routeFetch(url, method, init);
  };

  const BASE_ENV = {
    SUPABASE_URL: 'https://qa-test-project.supabase.co',
    SUPABASE_ANON_KEY: 'qa-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'qa-service-role-key',
    OPENAI_API_KEY: 'sk-qa-test-openai-key-1234567890',
    GEMINI_API_KEY: 'AIzaQA-test-gemini-key-1234567890',
  };

  function resetEnv() {
    denoEnv.clear();
    for (const [key, value] of Object.entries(BASE_ENV)) denoEnv.set(key, value);
  }

  // ------------------------------------------------------------------ //
  // Request + assertion helpers                                         //
  // ------------------------------------------------------------------ //

  function invoke(handler, { method = 'POST', body, rawBody, auth = true, origin = 'http://localhost:3000' } = {}) {
    const headers = { 'content-type': 'application/json' };
    if (origin) headers.origin = origin;
    if (auth) headers.Authorization = AUTH_HEADER;
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

  test('image-generation: every provider the frontend sends returns 200 with the documented shape', async () => {
    // Providers sent by src/utils/api.ts and src/services/imageGenerationService.ts
    // plus the remaining values in SUPPORTED_PROVIDERS.
    const providers = ['openai', 'gpt-image-1', 'gemini-nano', 'imagen-4', 'imagen', 'gpt-5', 'gemini'];
    for (const provider of providers) {
      fetchCalls = [];
      const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat', provider } });
      assert.equal(res.status, 200, `provider ${provider} should be accepted`);
      const body = await readJson(res);
      assert.equal(body.provider, provider);
      assert.match(body.imageUrl, /^data:image\/png;base64,/);
      assert.deepEqual(body.imageUrls, [body.imageUrl]);
      assert.equal(body.prompt, 'a cat');
      assert.equal(body.size, '1024x1024');
      assert.equal(body.style, '');
      assert.equal(body.quality, 'standard');
      assert.equal(body.creditsRemaining, 42);
      const upstream = lastUpstreamBody(OPENAI_GENERATIONS);
      assert.equal(upstream.model, 'gpt-image-2.5-sunburst', `model for provider ${provider}`);
      assert.equal(upstream.n, 1);
      assert.equal(upstream.size, '1024x1024');
      assert.equal(upstream.quality, 'medium');
      assert.equal(upstream.output_format, 'png');
      assert.equal(upstream.prompt, 'a cat');
    }
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

  test('image-generation: success exposes X-Credits-Remaining header', async () => {
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' } });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('x-credits-remaining'), '42');
    assert.equal(res.headers.get('content-type'), 'application/json');
  });

  test('image-generation: exhausted credits return 429 and never call the provider', async () => {
    mock.credits = { allowed: false, balance: 0 };
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' } });
    assert.equal(res.status, 429);
    const body = await readJson(res);
    assert.equal(body.error, 'Daily credit limit exceeded');
    assert.equal(body.remainingCredits, 0);
    assert.ok(body.resetTime, 'resetTime should be present');
    assert.equal(upstreamCalls(OPENAI_GENERATIONS).length, 0);
  });

  test('image-generation: rate limit is enforced before credits and the provider', async () => {
    mock.rateLimitRow = { id: 'rl-1', request_count: 100, window_start: new Date().toISOString() };
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' } });
    assert.equal(res.status, 429);
    assert.equal((await readJson(res)).error, 'Rate limit exceeded');
    assert.equal(upstreamCalls('/rest/v1/rpc/check_and_deduct_credit').length, 0);
    assert.equal(upstreamCalls(OPENAI_GENERATIONS).length, 0);
  });

  test('image-generation: missing OpenAI key returns 503 without calling the provider', async () => {
    denoEnv.delete('OPENAI_API_KEY');
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' } });
    assert.equal(res.status, 503);
    assert.equal((await readJson(res)).error, 'OpenAI API key not configured');
    assert.equal(upstreamCalls(OPENAI_GENERATIONS).length, 0);
  });

  test('image-generation: malformed OpenAI key (no sk- prefix) returns 503', async () => {
    denoEnv.set('OPENAI_API_KEY', 'not-a-valid-openai-key');
    const res = await invoke(imageGenerationHandler, { body: { prompt: 'a cat' } });
    assert.equal(res.status, 503);
    assert.equal((await readJson(res)).error, 'OpenAI API key not configured');
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

  test('image-editing: missing OpenAI key returns 503', async () => {
    denoEnv.delete('OPENAI_API_KEY');
    const res = await invoke(imageEditingHandler, {
      body: { imageUrl: 'https://cdn.example.com/a.png', editOptions: { prompt: 'make it red' } },
    });
    assert.equal(res.status, 503);
    assert.equal((await readJson(res)).error, 'OpenAI is not configured on the server');
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

  test('image-editing: data URL input succeeds and is forwarded upstream', async () => {
    const dataUrl = 'data:image/png;base64,QUJDREVG';
    const res = await invoke(imageEditingHandler, {
      body: { imageUrl: dataUrl, editOptions: { prompt: 'make it red' } },
    });
    assert.equal(res.status, 200);
    const body = await readJson(res);
    assert.equal(body.imageUrl, 'data:image/png;base64,RURJVEJBU0U2NA==');
    assert.equal(body.model, 'gpt-image-2.5-sunburst');
    const upstream = lastUpstreamBody(OPENAI_EDITS);
    assert.equal(upstream.model, 'gpt-image-2.5-sunburst');
    assert.deepEqual(upstream.images, [{ image_url: dataUrl }]);
    assert.equal(upstream.prompt, 'make it red');
    assert.equal(upstream.n, 1);
    assert.equal(upstream.output_format, 'png');
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

  test('assistant-stream: empty messages array returns 400', async () => {
    const res = await invoke(assistantStreamHandler, { body: { messages: [] } });
    assert.equal(res.status, 400);
    assert.equal((await readJson(res)).error, 'Messages array is required');
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
    const upstream = lastUpstreamBody(OPENAI_RESPONSES);
    assert.equal(upstream.model, 'gpt-5-mini');
    assert.equal(upstream.max_output_tokens, 1000);
    assert.deepEqual(upstream.input, [
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hello' },
    ]);
    assert.match(upstream.instructions, /Ada/);
    assert.equal(upstreamCalls(GEMINI).length, 0);
  });

  test('assistant-stream: OPENAI_RESPONSES_MODEL override is used', async () => {
    denoEnv.set('OPENAI_RESPONSES_MODEL', 'qa-override-model');
    const res = await invoke(assistantStreamHandler, {
      body: { messages: [{ role: 'user', content: 'hi' }], provider: 'openai' },
    });
    assert.equal(res.status, 200);
    assert.equal(lastUpstreamBody(OPENAI_RESPONSES).model, 'qa-override-model');
  });

  test('assistant-stream: gemini provider returns {text, model, message}', async () => {
    const res = await invoke(assistantStreamHandler, {
      body: { messages: [{ role: 'user', content: 'hi' }], provider: 'gemini' },
    });
    assert.equal(res.status, 200);
    const body = await readJson(res);
    assert.equal(body.text, 'Hello from Gemini');
    assert.equal(body.model, 'gemini-2.5-flash');
    assert.equal(body.message, 'Hello from Gemini');
    const calls = upstreamCalls(GEMINI);
    assert.ok(calls.length > 0, 'gemini upstream should be called');
    assert.match(calls[calls.length - 1].url, /gemini-2\.5-flash:generateContent/);
    assert.match(calls[calls.length - 1].url, /key=AIza/);
    assert.equal(upstreamCalls(OPENAI_RESPONSES).length, 0);
  });

  test('assistant-stream: falls back to gemini when the openai key is absent', async () => {
    denoEnv.delete('OPENAI_API_KEY');
    const res = await invoke(assistantStreamHandler, {
      body: { messages: [{ role: 'user', content: 'hi' }], provider: 'openai' },
    });
    assert.equal(res.status, 200);
    assert.equal((await readJson(res)).model, 'gemini-2.5-flash');
    assert.ok(upstreamCalls(GEMINI).length > 0);
    assert.equal(upstreamCalls(OPENAI_RESPONSES).length, 0);
  });

  test('assistant-stream: falls back to openai when the gemini key is absent', async () => {
    denoEnv.delete('GEMINI_API_KEY');
    const res = await invoke(assistantStreamHandler, {
      body: { messages: [{ role: 'user', content: 'hi' }], provider: 'gemini' },
    });
    assert.equal(res.status, 200);
    assert.equal((await readJson(res)).model, 'gpt-5-mini');
    assert.ok(upstreamCalls(OPENAI_RESPONSES).length > 0);
  });

  test('assistant-stream: no API keys configured returns 500', async () => {
    denoEnv.delete('OPENAI_API_KEY');
    denoEnv.delete('GEMINI_API_KEY');
    const res = await invoke(assistantStreamHandler, {
      body: { messages: [{ role: 'user', content: 'hi' }] },
    });
    assert.equal(res.status, 500);
    assert.equal((await readJson(res)).error, 'No API keys configured');
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

  test('assistant-stream: gemini upstream failure surfaces as 500 with the upstream status', async () => {
    mock.gemini = { status: 500, body: { error: 'boom' } };
    const res = await invoke(assistantStreamHandler, {
      body: { messages: [{ role: 'user', content: 'hi' }], provider: 'gemini' },
    });
    assert.equal(res.status, 500);
    assert.match((await readJson(res)).error, /Gemini API error: 500/);
  });

  test('assistant-stream: rate limit exceeded returns 429', async () => {
    mock.rateLimitRow = { id: 'rl-2', request_count: 100, window_start: new Date().toISOString() };
    const res = await invoke(assistantStreamHandler, {
      body: { messages: [{ role: 'user', content: 'hi' }] },
    });
    assert.equal(res.status, 429);
    assert.equal((await readJson(res)).error, 'Rate limit exceeded');
  });

  test('assistant-stream: invalid JSON body returns 500 via the catch-all', async () => {
    const res = await invoke(assistantStreamHandler, { rawBody: 'not json at all' });
    assert.equal(res.status, 500);
  });
}
