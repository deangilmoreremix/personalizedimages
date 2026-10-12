import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { register } from 'node:module';

function resolveSelfPath() {
  const fromImportMeta = new URL('./openai-functions.test.mjs', import.meta.url);
  if (fromImportMeta.protocol === 'file:') return fileURLToPath(fromImportMeta);
  const fromCwd = join(process.cwd(), 'qa', 'openai-functions.test.mjs');
  if (existsSync(fromCwd)) return fromCwd;
  throw new Error('Cannot locate qa/openai-functions.test.mjs');
}

const SCRIPT_PATH = resolveSelfPath();
const REPO_ROOT = join(SCRIPT_PATH, '..', '..');
const UNDER_VITEST = Boolean(process.env.VITEST || process.env.VITEST_WORKER_ID);

if (UNDER_VITEST) {
  const { test } = await import('vitest');
  const { spawnSync } = await import('node:child_process');
  test('OpenAI-backed function contract suite (qa/openai-functions.test.mjs) passes under node', () => {
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




const denoEnv = new Map();
const servedHandlers = [];

globalThis.Deno = {
  env: {
    get: (key) => (denoEnv.has(key) ? denoEnv.get(key) : undefined),
    has: (key) => denoEnv.has(key) ? undefined : undefined,
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

// The caller's own OpenAI key (100% BYOK) -- sent per request.
const USER_API_KEY = 'sk-test-user-openai-key-1234567890';
// Decoy platform credential: no function may read it, so it must never
// appear in any provider request.
const DECOY_ENV_KEY = 'sk-DECOY-ENV-OPENAI-KEY-0000000000';

const OPENAI_KEY_MISSING_ERROR = 'OpenAI API key not configured. Add your key in Settings → API Keys.';

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
    // Decoy only: under BYOK nothing reads env provider keys.
    OPENAI_API_KEY: DECOY_ENV_KEY,
    OPENAI_RESPONSES_MODEL: 'gpt-5-mini',
  };
  for (const [key, value] of Object.entries(env)) denoEnv.set(key, value);
}

// `apiKey` is the per-request `x-user-api-key` header value. Pass null to
// omit the header entirely, '' for a blank value.
const invoke = (handler, { body, auth = true, method = 'POST', apiKey = USER_API_KEY } = {}) => {
  const headers = { 'content-type': 'application/json', origin: 'https://app.example.com' };
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

const assertNoDecoyLeak = () => {
  for (const call of openaiCalls) {
    const serialized = JSON.stringify({ url: call.url, init: call.init });
    assert.ok(
      !serialized.includes(DECOY_ENV_KEY),
      `a provider request leaked the decoy env key: ${call.method} ${call.url}`
    );
    assert.equal(
      call.init.headers.Authorization,
      `Bearer ${USER_API_KEY}`,
      `every OpenAI call must carry the requesting user's key, got: ${call.init.headers.Authorization}`
    );
  }
};

const HANDLERS_AND_BODIES = [
  [aiImageHandler, { action: 'generate', prompt: 'a futuristic city' }],
  [removeBgHandler, { action: 'remove', imageUrl: 'https://cdn.example.com/a.png' }],
  [upscaleHandler, { action: 'upscale', imageUrl: 'https://cdn.example.com/a.png', scaleFactor: 2 }],
  [relightHandler, { action: 'relight', imageUrl: 'https://cdn.example.com/a.png', lightDirection: 'left' }],
  [styleTransferHandler, { action: 'transfer', imageUrl: 'https://cdn.example.com/a.png', styleImageUrl: 'https://cdn.example.com/style.png', styleName: 'watercolor' }],
  [improvePromptHandler, { prompt: 'a cat' }],
];

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
  assert.equal(calls[0].init.headers.Authorization, `Bearer ${USER_API_KEY}`);
  const payload = JSON.parse(calls[0].init.body);
  assert.equal(payload.model, 'gpt-image-2.5-sunburst');
  assert.equal(payload.prompt, 'a futuristic city');
  assertNoDecoyLeak();
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
  assert.equal(call.init.headers.Authorization, `Bearer ${USER_API_KEY}`);
  const payload = JSON.parse(call.init.body);
  assert.deepEqual(payload.images, [{ image_url: 'https://cdn.example.com/photo.png' }]);
  assertNoDecoyLeak();
});

test('freepik-upscale: returns higher-resolution resultUrl', async () => {
  const res = await invoke(upscaleHandler, {
    body: { action: 'upscale', imageUrl: 'https://cdn.example.com/photo.png', scaleFactor: 2 },
  });
  const { status, body } = await readJson(res);
  assert.equal(status, 200);
  assert.ok(body.resultUrl.startsWith('data:image/png;base64,'));
  assert.ok(openaiCalls.some((c) => c.url.includes('/images/edits')));
  assertNoDecoyLeak();
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
  assertNoDecoyLeak();
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
  assertNoDecoyLeak();
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
  assert.equal(call.init.headers.Authorization, `Bearer ${USER_API_KEY}`);
  const payload = JSON.parse(call.init.body);
  assert.equal(payload.model, 'gpt-5-mini');
  assertNoDecoyLeak();
});

test('all functions: missing auth returns 401', async () => {
  for (const [handler, body] of HANDLERS_AND_BODIES) {
    const res = await invoke(handler, { body, auth: false });
    assert.equal(res.status, 401, `handler returned ${res.status}`);
  }
});

test('all six functions: missing x-user-api-key returns 400 with the exact setup message and no provider call', async () => {
  for (const apiKey of [null, '', '   ', 'not-a-valid-openai-key', 'sk-short']) {
    openaiCalls = [];
    for (const [handler, body] of HANDLERS_AND_BODIES) {
      const res = await invoke(handler, { body, apiKey });
      assert.equal(
        res.status,
        400,
        `apiKey ${JSON.stringify(apiKey)} must be rejected with 400 (got ${res.status})`
      );
      const payload = await res.json();
      assert.deepEqual(payload, { error: OPENAI_KEY_MISSING_ERROR });
    }
  }
  assert.equal(openaiCalls.length, 0, 'the provider must never be called without a valid user key');
  assertNoDecoyLeak();
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
  assert.ok(!JSON.stringify(body).includes(USER_API_KEY));
  assert.ok(!JSON.stringify(body).includes(DECOY_ENV_KEY));
});

test('upstream auth failures map to 502 for the client', async () => {
  upstream.status = 401;
  upstream.body = { error: { message: 'invalid api key' } };
  const res = await invoke(removeBgHandler, {
    body: { action: 'remove', imageUrl: 'https://cdn.example.com/photo.png' },
  });
  const { status, body } = await readJson(res);
  assert.equal(status, 502);
  assert.ok(!JSON.stringify(body).includes(USER_API_KEY));
  assert.ok(!JSON.stringify(body).includes(DECOY_ENV_KEY));
});

test('missing imageUrl returns 400', async () => {
  const res = await invoke(removeBgHandler, { body: { action: 'remove' } });
  assert.equal(res.status, 400);
});
}
