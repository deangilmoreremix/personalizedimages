/**
 * QA -- OpenAI-backed feature function contract tests (no live API keys).
 *
 * Covers the six former-Freepik AI functions that were reimplemented on
 * OpenAI GPT Image 2.5 / the Responses API, keeping their existing frontend
 * contract:
 *
 *   node qa/openai-functions.test.mjs
 *
 * The Deno global is stubbed, global fetch is routed to fake Supabase auth /
 * rate-limit endpoints and fake OpenAI upstreams, and the real edge function
 * files on disk are imported unchanged.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { register } from 'node:module';

const denoEnv = new Map();
const servedHandlers = [];

globalThis.Deno = {
  env: {
    get: (key) => (denoEnv.has(key) ? denoEnv.get(key) : undefined),
    has: (key) => (denoEnv.has(key) ? denoEnv.get(key) : undefined),
    toObject: () => Object.fromEntries(denoEnv),
  },
  serve(handler) {
    servedHandlers.push(handler);
  },
};

register(new URL('./loader.mjs', import.meta.url));

await import('../supabase/functions/freepik-ai-image/index.ts');
await import('../supabase/functions/freepik-remove-bg/index.ts');
await import('../supabase/functions/freepik-upscale/index.ts');
await import('../supabase/functions/freepik-relight/index.ts');
await import('../supabase/functions/freepik-style-transfer/index.ts');
await import('../supabase/functions/freepik-improve-prompt/index.ts');

assert.equal(servedHandlers.length, 6, 'all six handlers registered');
const [
  aiImageHandler,
  removeBgHandler,
  upscaleHandler,
  relightHandler,
  styleTransferHandler,
  improvePromptHandler,
] = servedHandlers;

const AUTH_HEADER = 'Bearer qa-test-token';
const SUPABASE = 'https://qa-test-project.supabase.co';

let openaiCalls = [];
let upstream = {
  status: 200,
  body: { data: [{ b64_json: 'AAAA' }] },
};

function resetMocks() {
  openaiCalls = [];
  upstream = { status: 200, body: { data: [{ b64_json: 'AAAA' }] } };
}

const jsonResponse = (data, status = 200) =>
  new Response(typeof data === 'string' ? data : JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

// A 1x1 PNG is enough for dimension sniffing in freepik-upscale.
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
  if (url.startsWith('https://api.openai.com/')) {
    openaiCalls.push({ url, method, init });
    const body =
      upstream.body && Array.isArray(upstream.body.output)
        ? upstream.body
        : upstream.body;
    if (upstream.status !== 200) {
      return jsonResponse({ error: { message: 'upstream failure' } }, upstream.status);
    }
    return jsonResponse(body);
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
  const env = {
    SUPABASE_URL: SUPABASE,
    SUPABASE_ANON_KEY: 'qa-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'qa-service-role-key',
    OPENAI_API_KEY: 'sk-qa-test-key',
    OPENAI_RESPONSES_MODEL: 'gpt-5-mini',
  };
  for (const [key, value] of Object.entries(env)) denoEnv.set(key, value);
}

const invoke = (handler, { body, auth = true, method = 'POST' } = {}) => {
  const headers = { 'content-type': 'application/json', origin: 'https://app.example.com' };
  if (auth) headers.Authorization = AUTH_HEADER;
  return handler(
    new Request('https://edge.example.com/fn', {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );
};

const readJson = async (res) => ({ status: res.status, body: await res.json() });

test.beforeEach(() => {
  resetMocks();
  resetEnv();
});

test('freepik-ai-image: text-to-image returns synchronous resultUrls', async () => {
  const res = await invoke(aiImageHandler, {
    body: { action: 'generate', prompt: 'a futuristic city' },
  });
  const { status, body } = await readJson(res);
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.resultUrls) && body.resultUrls.length === 1);
  assert.equal(body.resultUrl, body.resultUrls[0]);
  assert.ok(body.resultUrl.startsWith('data:image/png;base64,'));
  const calls = openaiCalls.filter((c) => c.url.includes('/images/generations'));
  assert.equal(calls.length, 1);
  const payload = JSON.parse(calls[0].init.body);
  assert.equal(payload.model, 'gpt-image-2.5-sunburst');
  assert.equal(payload.prompt, 'a futuristic city');
});

test('freepik-remove-bg: returns edited resultUrl', async () => {
  const res = await invoke(removeBgHandler, {
    body: { action: 'remove', imageUrl: 'https://cdn.example.com/photo.png' },
  });
  const { status, body } = await readJson(res);
  assert.equal(status, 200);
  assert.equal(body.resultUrl, 'data:image/png;base64,AAAA');
  const call = openaiCalls.find((c) => c.url.includes('/images/edits'));
  assert.ok(call, 'edits endpoint used');
  const payload = JSON.parse(call.init.body);
  assert.deepEqual(payload.images, [{ image_url: 'https://cdn.example.com/photo.png' }]);
});

test('freepik-upscale: returns higher-resolution resultUrl', async () => {
  const res = await invoke(upscaleHandler, {
    body: { action: 'upscale', imageUrl: 'https://cdn.example.com/photo.png', scaleFactor: 2 },
  });
  const { status, body } = await readJson(res);
  assert.equal(status, 200);
  assert.ok(body.resultUrl.startsWith('data:image/png;base64,'));
  assert.ok(openaiCalls.some((c) => c.url.includes('/images/edits')));
});

test('freepik-relight: returns relit resultUrl', async () => {
  const res = await invoke(relightHandler, {
    body: { action: 'relight', imageUrl: 'https://cdn.example.com/photo.png', lightDirection: 'left' },
  });
  const { status, body } = await readJson(res);
  assert.equal(status, 200);
  assert.ok(body.resultUrl.startsWith('data:image/png;base64,'));
  const call = openaiCalls.find((c) => c.url.includes('/images/edits'));
  const payload = JSON.parse(call.init.body);
  assert.match(payload.prompt, /left/i);
});

test('freepik-style-transfer: sends both source and style images', async () => {
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
  const call = openaiCalls.find((c) => c.url.includes('/images/edits'));
  const payload = JSON.parse(call.init.body);
  assert.equal(payload.images.length, 2);
});

test('freepik-improve-prompt: returns improvedPrompt via Responses API', async () => {
  upstream.body = {
    output: [{ type: 'message', content: [{ type: 'output_text', text: 'improved prompt text' }] }],
  };
  const res = await invoke(improvePromptHandler, { body: { prompt: 'a cat' } });
  const { status, body } = await readJson(res);
  assert.equal(status, 200);
  assert.equal(body.improvedPrompt, 'improved prompt text');
  assert.equal(body.originalPrompt, 'a cat');
  const call = openaiCalls.find((c) => c.url.includes('/v1/responses'));
  assert.ok(call, 'Responses API used for text');
  const payload = JSON.parse(call.init.body);
  assert.equal(payload.model, 'gpt-5-mini');
});

test('all functions: missing auth returns 401', async () => {
  for (const [handler, body] of [
    [removeBgHandler, { action: 'remove', imageUrl: 'https://cdn.example.com/a.png' }],
    [relightHandler, { action: 'relight', imageUrl: 'https://cdn.example.com/a.png' }],
    [styleTransferHandler, { action: 'transfer', imageUrl: 'https://cdn.example.com/a.png' }],
    [upscaleHandler, { action: 'upscale', imageUrl: 'https://cdn.example.com/a.png' }],
    [aiImageHandler, { action: 'generate', prompt: 'x' }],
    [improvePromptHandler, { prompt: 'x' }],
  ]) {
    const res = await invoke(handler, { body, auth: false });
    assert.equal(res.status, 401, `handler returned ${res.status}`);
  }
});

test('upstream failures map to safe statuses without leaking credentials', async () => {
  upstream.status = 429;
  upstream.body = { error: { message: 'rate limited' } };
  const res = await invoke(removeBgHandler, {
    body: { action: 'remove', imageUrl: 'https://cdn.example.com/photo.png' },
  });
  const { status, body } = await readJson(res);
  assert.equal(status, 429);
  assert.equal(body.providerStatus, 429);
  assert.ok(!JSON.stringify(body).includes('sk-qa-test-key'));
});

test('upstream auth failures map to 502 for the client', async () => {
  upstream.status = 401;
  upstream.body = { error: { message: 'invalid api key' } };
  const res = await invoke(removeBgHandler, {
    body: { action: 'remove', imageUrl: 'https://cdn.example.com/photo.png' },
  });
  const { status, body } = await readJson(res);
  assert.equal(status, 502);
  assert.ok(!JSON.stringify(body).includes('sk-qa-test-key'));
});

test('missing imageUrl returns 400', async () => {
  const res = await invoke(removeBgHandler, { body: { action: 'remove' } });
  assert.equal(res.status, 400);
});
