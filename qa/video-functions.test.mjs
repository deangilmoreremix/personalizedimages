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

const BASE_ENV = {
  SUPABASE_URL: SUPABASE,
  SUPABASE_ANON_KEY: 'qa-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'qa-service-role-key',
  MUAPI_API_KEY: 'muapi-test-key',
};

function resetEnv() {
  denoEnv.clear();
  for (const [k, v] of Object.entries(BASE_ENV)) denoEnv.set(k, v);
}

resetEnv();

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
  try { return JSON.parse(text); } catch { return text; }
};

const muapiSubmitCall = () => fetchCalls.find((c) => c.method === 'POST' && c.url.startsWith('https://api.muapi.ai/api/v1/'));
const muapiResultCall = () => fetchCalls.find((c) => c.url === MUAPI_RESULT);
const patchesTo = (suffix) => mock.patches.filter((p) => p && Object.keys(p).length > 0);
const lastPatch = () => mock.patches[mock.patches.length - 1];


test.beforeEach(() => { resetMocks(); resetEnv(); });

test('image-to-video: submits to MuAPI kling-master with x-api-key and tracks the task', async () => {
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
  assert.equal(submit.init.headers['x-api-key'], 'muapi-test-key');
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
});

test('image-to-video: duration clamped to 5 or 10', async () => {
  for (const [requested, expected] of [[3, 5], [5, 5], [7, 10], [10, 10]]) {
    resetMocks();
    const res = await invoke(imageToVideoHandler, { body: { imageUrl: 'https://cdn.example.com/a.png', duration: requested } });
    assert.equal(res.status, 200);
    assert.equal((await readJson(res)).duration, expected);
    assert.equal(JSON.parse(muapiSubmitCall().init.body).duration, expected);
  }
});

test('image-to-video: MUAPI_VIDEO_MODEL overrides the model slug and provider label', async () => {
  resetMocks();
  denoEnv.set('MUAPI_VIDEO_MODEL', 'veo3');
  const res = await invoke(imageToVideoHandler, { body: { imageUrl: 'https://cdn.example.com/a.png' } });
  assert.equal(res.status, 200);
  assert.equal(muapiSubmitCall().url, 'https://api.muapi.ai/api/v1/veo3');
  assert.equal(mock.insert.provider, 'veo3');
  denoEnv.delete('MUAPI_VIDEO_MODEL');
});

test('image-to-video: missing MUAPI_API_KEY marks the row failed and returns 503', async () => {
  resetMocks();
  denoEnv.delete('MUAPI_API_KEY');
  const res = await invoke(imageToVideoHandler, { body: { imageUrl: 'https://cdn.example.com/a.png' } });
  assert.equal(res.status, 503);
  const body = await readJson(res);
  assert.match(body.error, /MuAPI/);
  assert.equal(muapiSubmitCall(), undefined);
  assert.equal(lastPatch().status, 'failed');
  assert.match(lastPatch().error_message, /MuAPI/);
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
  assert.equal(poll.init.headers['x-api-key'], 'muapi-test-key');

  const patch = lastPatch();
  assert.equal(patch.status, 'completed');
  assert.equal(patch.progress, 100);
  assert.equal(patch.video_url, 'https://cdn.muapi.ai/out.mp4');
  assert.ok(patch.updated_at);
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

test('video-status: DB pending maps to queued when MUAPI_API_KEY is missing', async () => {
  resetMocks();
  mock.dbRow = { ...mock.dbRow, status: 'pending' };
  denoEnv.delete('MUAPI_API_KEY');
  const res = await invoke(videoStatusHandler, { body: { videoId: 'video-1' } });
  assert.equal(res.status, 200);
  assert.equal((await readJson(res)).status, 'queued');
  assert.equal(muapiResultCall(), undefined);
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
  assert.equal(lastPatch().status, 'completed');
  assert.equal(lastPatch().video_url, 'https://cdn.muapi.ai/out.mp4');
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
}
