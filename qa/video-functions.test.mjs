import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { register } from 'node:module';

function resolveSelfPath() {
  const fromImportMeta = new URL('./video-functions.test.mjs', import.meta.url);
  if (fromImportMeta.protocol === 'file:') return fileURLToPath(fromImportMeta);
  const fromCwd = join(process.cwd(), 'qa', 'video-functions.test.mjs');
  if (existsSync(fromCwd)) return fromCwd;
  throw new Error('Cannot locate qa/video-functions.test.mjs');
}

const SCRIPT_PATH = resolveSelfPath();
const REPO_ROOT = join(SCRIPT_PATH, '..', '..');
const UNDER_VITEST = Boolean(process.env.VITEST || process.env.VITEST_WORKER_ID);

if (UNDER_VITEST) {
  const { test } = await import('vitest');
  const { spawnSync } = await import('node:child_process');
  test('MuAPI video function contract suite (qa/video-functions.test.mjs) passes under node', () => {
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
    has: (key) => denoEnv.has(key),
    toObject: () => Object.fromEntries(denoEnv),
  },
  serve(handler) { servedHandlers.push(handler); },
};

register(new URL('./loader.mjs', import.meta.url));

const importEdge = (name) =>
  import(new URL(`../supabase/functions/${name}/index.ts`, import.meta.url).href);

await importEdge('image-to-video');
await importEdge('video-status');
await importEdge('video-result');

assert.equal(servedHandlers.length, 3);
const [imageToVideoHandler, videoStatusHandler, videoResultHandler] = servedHandlers;

const AUTH_HEADER = 'Bearer qa-test-token';
const SUPABASE = 'https://qa-test-project.supabase.co';
const MUAPI_SUBMIT = 'https://api.muapi.ai/api/v1/kling-master';
const MUAPI_RESULT = 'https://api.muapi.ai/api/v1/predictions/muapi-task-1/result';

// The caller's own MuAPI key (100% BYOK) -- sent per request and forwarded
// to the provider as `x-api-key`.
const USER_MUAPI_KEY = 'muapi-user-key-alpha-1234567890';
// Decoy platform credential: the removed MUAPI_API_KEY env path must never
// be used, so this value must never appear in any provider request.
const DECOY_MUAPI_ENV_KEY = 'muapi-DECOY-ENV-KEY-0000000000';

const MUAPI_KEY_MISSING_ERROR = 'MuAPI API key not configured. Add your key in Settings → API Keys.';

let fetchCalls = [];
let mock;

function resetMocks() {
  fetchCalls = [];
  mock = {
    rateLimitRow: null,
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
    patches: [],
    insert: null,
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
    if (method === 'GET') return jsonResponse(mock.rateLimitRow ? [mock.rateLimitRow] : []);
    return jsonResponse({}, 201);
  }
  if (url === `${SUPABASE}/rest/v1/generated_videos` && method === 'POST') {
    mock.insert = JSON.parse(init.body);
    return jsonResponse([{ id: 'video-1' }], 201);
  }
  if (url.startsWith(`${SUPABASE}/rest/v1/generated_videos?id=eq.`)) {
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
  for (const [k, v] of Object.entries({
    SUPABASE_URL: SUPABASE,
    SUPABASE_ANON_KEY: 'qa-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'qa-service-role-key',
    // Decoy only: the MUAPI_API_KEY env path was deleted, nothing may read it.
    MUAPI_API_KEY: DECOY_MUAPI_ENV_KEY,
  })) denoEnv.set(k, v);
}

resetEnv();

// `apiKey` is the per-request `x-user-api-key` header value. Pass null to
// omit the header entirely, '' / '   ' for blank values.
function invoke(handler, { method = 'POST', body, rawBody, auth = true, origin = 'http://localhost:3000', apiKey = USER_MUAPI_KEY } = {}) {
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
  try { return JSON.parse(text); } catch { return text; }
};

const muapiSubmitCall = () => fetchCalls.find((c) => c.method === 'POST' && c.url.startsWith('https://api.muapi.ai/api/v1/'));
const muapiResultCall = () => fetchCalls.find((c) => c.url === MUAPI_RESULT);
const patchesTo = (suffix) => mock.patches.filter((p) => p && Object.keys(p).length > 0);
const lastPatch = () => mock.patches[mock.patches.length - 1];

// Every MuAPI request must carry the user's key as x-api-key and must never
// carry the decoy env value anywhere (headers, URL or body).
function assertMuapiCallsUseUserKeyOnly() {
  for (const call of fetchCalls) {
    if (!call.url.startsWith('https://api.muapi.ai/')) continue;
    assert.equal(
      call.init.headers['x-api-key'],
      USER_MUAPI_KEY,
      `MuAPI call must forward the requesting user's key: ${call.url}`
    );
    assert.ok(
      !JSON.stringify(call.init).includes(DECOY_MUAPI_ENV_KEY) && !call.url.includes(DECOY_MUAPI_ENV_KEY),
      `a MuAPI request leaked the decoy env key: ${call.url}`
    );
  }
}


test.beforeEach(() => { resetMocks(); resetEnv(); });

test('image-to-video: submits to MuAPI kling-master with the user x-api-key and tracks the task', async () => {
  resetMocks();
  const res = await invoke(imageToVideoHandler, {
    body: { imageUrl: 'https://cdn.example.com/a.png', duration: 5, prompt: 'animate this' },
  });
  assert.equal(res.status, 200);
  const body = await readJson(res);
  assert.equal(body.id, 'video-1');
  assert.equal(body.status, 'processing');
  assert.equal(body.sourceImageUrl, 'https://cdn.example.com/a.png');
  assert.equal(body.duration, 5);
  assert.equal(body.paymentRequired, false);
  assert.equal(typeof body.createdAt, 'number');
  assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');

  const submit = muapiSubmitCall();
  assert.ok(submit, 'expected a MuAPI submit call');
  assert.equal(submit.url, MUAPI_SUBMIT);
  assert.equal(submit.init.headers['x-api-key'], USER_MUAPI_KEY);
  assert.deepEqual(JSON.parse(submit.init.body), {
    prompt: 'animate this',
    image_url: 'https://cdn.example.com/a.png',
    duration: 5,
  });

  assert.equal(mock.insert.provider, 'kling-master');
  assert.equal(mock.insert.video_url, '');
  assert.equal(mock.insert.status, 'processing');
  assert.equal(mock.insert.format, 'mp4');
  assert.equal(mock.insert.duration, 5);
  assert.equal(mock.insert.metadata.sourceImageUrl, 'https://cdn.example.com/a.png');
  assert.equal(lastPatch().metadata.providerTaskId, 'muapi-task-1');
  assert.ok(
    !JSON.stringify(mock.insert).includes(USER_MUAPI_KEY),
    'the user key must never be written to the generated_videos row'
  );
  assertMuapiCallsUseUserKeyOnly();
});

test('image-to-video: data URL is resolved to a public URL before submitting', async () => {
  resetMocks();
  const res = await invoke(imageToVideoHandler, { body: { imageUrl: 'data:image/png;base64,QUJD' } });
  assert.equal(res.status, 200);
  const submit = muapiSubmitCall();
  const uploaded = JSON.parse(submit.init.body).image_url;
  assert.match(uploaded, /^https:\/\/qa-test-project\.supabase\.co\/storage\/v1\/object\/public\/temp-uploads\/video-tmp\/.+\.png$/);
  assert.equal(mock.insert.duration, 5);
  assert.equal(JSON.parse(submit.init.body).duration, 5);
  assertMuapiCallsUseUserKeyOnly();
});

test('image-to-video: duration clamped to 5 or 10', async () => {
  for (const [requested, expected] of [[3, 5], [5, 5], [7, 10], [10, 10]]) {
    resetMocks();
    const res = await invoke(imageToVideoHandler, { body: { imageUrl: 'https://cdn.example.com/a.png', duration: requested } });
    assert.equal(res.status, 200);
    assert.equal((await readJson(res)).duration, expected);
    assert.equal(JSON.parse(muapiSubmitCall().init.body).duration, expected);
    assertMuapiCallsUseUserKeyOnly();
  }
});

test('image-to-video: MUAPI_VIDEO_MODEL overrides the model slug and provider label', async () => {
  resetMocks();
  denoEnv.set('MUAPI_VIDEO_MODEL', 'veo3');
  const res = await invoke(imageToVideoHandler, { body: { imageUrl: 'https://cdn.example.com/a.png' } });
  assert.equal(res.status, 200);
  assert.equal(muapiSubmitCall().url, 'https://api.muapi.ai/api/v1/veo3');
  assert.equal(mock.insert.provider, 'veo3');
  assertMuapiCallsUseUserKeyOnly();
  denoEnv.delete('MUAPI_VIDEO_MODEL');
});

test('image-to-video: missing x-user-api-key returns 400 with the setup message, no provider call and no DB insert', async () => {
  for (const apiKey of [null, '', '   ']) {
    resetMocks();
    const res = await invoke(imageToVideoHandler, { body: { imageUrl: 'https://cdn.example.com/a.png' }, apiKey });
    assert.equal(res.status, 400, `apiKey ${JSON.stringify(apiKey)} must be rejected with 400`);
    assert.deepEqual(await readJson(res), { error: MUAPI_KEY_MISSING_ERROR });
  }
  assert.equal(muapiSubmitCall(), undefined, 'the provider must never be called without the user key');
  assert.equal(mock.insert, null, 'no generated_videos row may be created without the user key');
  assert.equal(mock.patches.length, 0, 'no row may be patched without the user key');
});

test('image-to-video: provider error maps to 502 with providerStatus and failed row', async () => {
  for (const [status, message] of [[400, 'bad prompt'], [401, 'unauthorized'], [500, 'server boom']]) {
    resetMocks();
    mock.muapiSubmit = { status, body: { message } };
    const res = await invoke(imageToVideoHandler, { body: { imageUrl: 'https://cdn.example.com/a.png' } });
    assert.equal(res.status, 502, `upstream ${status} should map to 502`);
    const body = await readJson(res);
    assert.equal(body.error, 'Video provider rejected the request');
    assert.equal(body.providerStatus, status);
    assert.equal(body.id, 'video-1');
    assert.equal(lastPatch().status, 'failed');
    assert.equal(lastPatch().error_message, message);
  }
  assertMuapiCallsUseUserKeyOnly();
});

test('image-to-video: provider 200 without request_id maps to 502', async () => {
  resetMocks();
  mock.muapiSubmit = { status: 200, body: {} };
  const res = await invoke(imageToVideoHandler, { body: { imageUrl: 'https://cdn.example.com/a.png' } });
  assert.equal(res.status, 502);
  assert.equal((await readJson(res)).providerStatus, 200);
  assert.equal(lastPatch().status, 'failed');
});

test('image-to-video: validation, auth and rate limit guards are preserved', async () => {
  resetMocks();
  for (const bad of ['', '/relative/a.png', 'ftp://host/a.png', 123]) {
    const res = await invoke(imageToVideoHandler, { body: { imageUrl: bad } });
    assert.equal(res.status, 400, `imageUrl ${JSON.stringify(bad)} should be rejected`);
    assert.equal(muapiSubmitCall(), undefined);
  }

  let res = await invoke(imageToVideoHandler, { body: { imageUrl: 'https://cdn.example.com/a.png' }, auth: false });
  assert.equal(res.status, 401);

  resetMocks();
  mock.rateLimitRow = { id: 'rl-1', request_count: 100, window_start: new Date().toISOString() };
  res = await invoke(imageToVideoHandler, { body: { imageUrl: 'https://cdn.example.com/a.png' } });
  assert.equal(res.status, 429);
  assert.equal(muapiSubmitCall(), undefined);

  res = await invoke(imageToVideoHandler, { method: 'OPTIONS' });
  assert.equal(res.status, 200);
});

test('video-status: polls MuAPI on a processing row and returns the updated state', async () => {
  resetMocks();
  const res = await invoke(videoStatusHandler, { body: { videoId: 'video-1' } });
  assert.equal(res.status, 200);
  const body = await readJson(res);
  assert.equal(body.id, 'video-1');
  assert.equal(body.status, 'completed');
  assert.equal(body.progress, 100);
  assert.equal(body.videoUrl, 'https://cdn.muapi.ai/out.mp4');
  assert.equal(body.error, null);

  const poll = muapiResultCall();
  assert.ok(poll, 'expected a MuAPI result poll');
  assert.equal(poll.init.headers['x-api-key'], USER_MUAPI_KEY);

  const patch = lastPatch();
  assert.equal(patch.status, 'completed');
  assert.equal(patch.progress, 100);
  assert.equal(patch.video_url, 'https://cdn.muapi.ai/out.mp4');
  assert.ok(patch.updated_at);
  assertMuapiCallsUseUserKeyOnly();
});

test('video-status: DB pending without a provider task maps to queued', async () => {
  resetMocks();
  mock.dbRow = { ...mock.dbRow, status: 'pending', metadata: { sourceImageUrl: 'https://cdn.example.com/a.png' } };
  const res = await invoke(videoStatusHandler, { body: { videoId: 'video-1' } });
  assert.equal(res.status, 200);
  const body = await readJson(res);
  assert.equal(body.status, 'queued');
  assert.equal(muapiResultCall(), undefined);
});

test('video-status: polling without x-user-api-key returns the stored state plus the setup message', async () => {
  for (const apiKey of [null, '', '   ']) {
    resetMocks();
    mock.dbRow = { ...mock.dbRow, status: 'pending' };
    const res = await invoke(videoStatusHandler, { body: { videoId: 'video-1' }, apiKey });
    assert.equal(res.status, 200, `apiKey ${JSON.stringify(apiKey)} must not hard-fail polling`);
    const body = await readJson(res);
    assert.equal(body.status, 'queued');
    assert.equal(
      body.message,
      'Live status polling requires your MuAPI API key. Add it in Settings → API Keys.'
    );
    assert.equal(muapiResultCall(), undefined, 'the provider must never be polled without the user key');
  }
});

test('video-status: provider failed/cancelled marks the row failed', async () => {
  for (const [providerStatus, expectedMessage] of [
    ['failed', 'provider boom'],
    ['cancelled', null],
  ]) {
    resetMocks();
    mock.muapiResult = { status: 200, body: { status: providerStatus, ...(expectedMessage ? { error: expectedMessage } : {}) } };
    const res = await invoke(videoStatusHandler, { body: { videoId: 'video-1' } });
    assert.equal(res.status, 200);
    const body = await readJson(res);
    assert.equal(body.status, 'failed');
    assert.equal(body.error, expectedMessage || 'Video generation failed');
    const patch = lastPatch();
    assert.equal(patch.status, 'failed');
    assert.equal(patch.error_message, body.error);
  }
  assertMuapiCallsUseUserKeyOnly();
});

test('video-status: queued/pending/processing provider states become processing/50', async () => {
  for (const providerStatus of ['queued', 'pending', 'processing']) {
    resetMocks();
    mock.muapiResult = { status: 200, body: { status: providerStatus, outputs: [] } };
    const res = await invoke(videoStatusHandler, { body: { videoId: 'video-1' } });
    assert.equal(res.status, 200);
    const body = await readJson(res);
    assert.equal(body.status, 'processing');
    assert.equal(body.progress, 50);
    const patch = lastPatch();
    assert.equal(patch.status, 'processing');
    assert.equal(patch.progress, 50);
  }
  assertMuapiCallsUseUserKeyOnly();
});

test('video-status: completed without outputs marks the row failed', async () => {
  resetMocks();
  mock.muapiResult = { status: 200, body: { status: 'completed', outputs: [] } };
  const res = await invoke(videoStatusHandler, { body: { videoId: 'video-1' } });
  const body = await readJson(res);
  assert.equal(body.status, 'failed');
  assert.equal(lastPatch().status, 'failed');
});

test('video-status: transient provider poll errors return the DB status without failing', async () => {
  resetMocks();
  mock.muapiResult = { status: 500, body: { error: 'upstream blip' } };
  const res = await invoke(videoStatusHandler, { body: { videoId: 'video-1' } });
  assert.equal(res.status, 200);
  const body = await readJson(res);
  assert.equal(body.status, 'processing');
  assert.equal(body.progress, 0);
  assert.equal(body.videoUrl, null);
  assert.equal(mock.patches.length, 0);
});

test('video-status: unknown video id returns 404 and guards still apply', async () => {
  resetMocks();
  mock.dbRow = null;
  let res = await invoke(videoStatusHandler, { body: { videoId: 'missing' } });
  assert.equal(res.status, 404);

  res = await invoke(videoStatusHandler, { body: {}, auth: false });
  assert.equal(res.status, 401);

  res = await invoke(videoStatusHandler, { body: { videoId: 1 } });
  assert.equal(res.status, 400);

  res = await invoke(videoStatusHandler, { method: 'OPTIONS', origin: 'http://evil.example' });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), 'null');
});

test('video-result: polls MuAPI and returns the full completed shape', async () => {
  resetMocks();
  mock.dbRow = { ...mock.dbRow, thumbnail_url: 'https://cdn.muapi.ai/thumb.jpg' };
  const res = await invoke(videoResultHandler, { body: { videoId: 'video-1' } });
  assert.equal(res.status, 200);
  const body = await readJson(res);
  assert.equal(body.id, 'video-1');
  assert.equal(body.status, 'completed');
  assert.equal(body.videoUrl, 'https://cdn.muapi.ai/out.mp4');
  assert.equal(body.thumbnailUrl, 'https://cdn.muapi.ai/thumb.jpg');
  assert.equal(body.duration, 5);
  assert.equal(body.format, 'mp4');
  assert.equal(body.createdAt, '2026-10-11T00:00:00Z');
  assert.equal(body.paymentRequired, false);
  assert.equal(body.sourceImageUrl, 'https://cdn.example.com/a.png');
  assert.deepEqual(body.metadata, { providerTaskId: 'muapi-task-1', sourceImageUrl: 'https://cdn.example.com/a.png' });

  assert.ok(muapiResultCall(), 'expected a MuAPI result poll');
  assert.equal(muapiResultCall().init.headers['x-api-key'], USER_MUAPI_KEY);
  assert.equal(lastPatch().status, 'completed');
  assert.equal(lastPatch().video_url, 'https://cdn.muapi.ai/out.mp4');
  assertMuapiCallsUseUserKeyOnly();
});

test('video-result: still-processing row returns the partial shape after polling', async () => {
  resetMocks();
  mock.muapiResult = { status: 200, body: { status: 'processing' } };
  const res = await invoke(videoResultHandler, { body: { videoId: 'video-1' } });
  assert.equal(res.status, 200);
  const body = await readJson(res);
  assert.equal(body.status, 'processing');
  assert.equal(body.progress, 50);
  assert.equal(body.error, null);
  assert.equal(lastPatch().progress, 50);
  assertMuapiCallsUseUserKeyOnly();
});

test('video-result: pending row without a provider task returns processing (frontend union)', async () => {
  resetMocks();
  mock.dbRow = { ...mock.dbRow, status: 'pending', metadata: {} };
  const res = await invoke(videoResultHandler, { body: { videoId: 'video-1' } });
  assert.equal(res.status, 200);
  const body = await readJson(res);
  assert.equal(body.status, 'processing');
  assert.equal(muapiResultCall(), undefined);
});

test('video-result: completed row skips the provider and returns the stored result', async () => {
  resetMocks();
  mock.dbRow = { ...mock.dbRow, status: 'completed', video_url: 'https://cdn.muapi.ai/stored.mp4', progress: 100 };
  const res = await invoke(videoResultHandler, { body: { videoId: 'video-1' } });
  assert.equal(res.status, 200);
  const body = await readJson(res);
  assert.equal(body.status, 'completed');
  assert.equal(body.videoUrl, 'https://cdn.muapi.ai/stored.mp4');
  assert.equal(muapiResultCall(), undefined);
});

test('video-result: transient provider poll errors do not fail the request', async () => {
  resetMocks();
  mock.muapiResult = { status: 503, body: {} };
  const res = await invoke(videoResultHandler, { body: { videoId: 'video-1' } });
  assert.equal(res.status, 200);
  const body = await readJson(res);
  assert.equal(body.status, 'processing');
  assert.equal(body.progress, 0);
});

test('video-result: guards still apply', async () => {
  resetMocks();
  mock.dbRow = null;
  let res = await invoke(videoResultHandler, { body: { videoId: 'missing' } });
  assert.equal(res.status, 404);
  res = await invoke(videoResultHandler, { body: { videoId: 'video-1' }, auth: false });
  assert.equal(res.status, 401);
  res = await invoke(videoResultHandler, { body: {} });
  assert.equal(res.status, 400);
  res = await invoke(videoResultHandler, { method: 'OPTIONS' });
  assert.equal(res.status, 200);
});

test('decoy MUAPI_API_KEY env value is never used: every MuAPI call carries only the user key', async () => {
  // The env var is present (see resetEnv) and is a plausible-looking key, so
  // any reintroduced env fallback would show up as x-api-key here.
  assert.equal(denoEnv.get('MUAPI_API_KEY'), DECOY_MUAPI_ENV_KEY, 'decoy must be present for this test to mean anything');

  const seenMuapiCalls = [];
  const recordMuapiCalls = () => {
    for (const call of fetchCalls) {
      if (call.url.startsWith('https://api.muapi.ai/')) seenMuapiCalls.push(call);
    }
  };

  // submit
  resetMocks();
  await invoke(imageToVideoHandler, { body: { imageUrl: 'https://cdn.example.com/a.png' } });
  assertMuapiCallsUseUserKeyOnly();
  recordMuapiCalls();

  // poll via video-status
  resetMocks();
  await invoke(videoStatusHandler, { body: { videoId: 'video-1' } });
  assertMuapiCallsUseUserKeyOnly();
  recordMuapiCalls();

  // poll via video-result
  resetMocks();
  await invoke(videoResultHandler, { body: { videoId: 'video-1' } });
  assertMuapiCallsUseUserKeyOnly();
  recordMuapiCalls();

  assert.ok(seenMuapiCalls.length >= 3, 'expected submit + two polls in this run');
  assert.equal(
    seenMuapiCalls.every((c) => c.init.headers['x-api-key'] === USER_MUAPI_KEY),
    true,
    'all MuAPI calls must use the per-request user key'
  );
});
}
