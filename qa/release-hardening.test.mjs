/**
 * QA -- release hardening regression tests.
 *
 * Pins three defects fixed during production-release acceptance:
 *
 *   1. meme-generator now requires a valid Bearer token (it previously had no
 *      authenticateUser call at all, leaving an unauthenticated public
 *      endpoint), and its preflight echoes the allow-listed origin instead of
 *      a single hard-coded one.
 *   2. image-generation-secure maps provider auth failures to 502 instead of
 *      forwarding the upstream status verbatim (an upstream 401 must not tell
 *      the client their own session is invalid).
 *   3. No deployed edge function emits `Access-Control-Allow-Origin: *`.
 *
 * Run: node qa/release-hardening.test.mjs
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { register } from 'node:module';

function resolveSelfPath() {
  const fromImportMeta = new URL('./release-hardening.test.mjs', import.meta.url);
  if (fromImportMeta.protocol === 'file:') return fileURLToPath(fromImportMeta);
  const fromCwd = join(process.cwd(), 'qa', 'release-hardening.test.mjs');
  if (existsSync(fromCwd)) return fromCwd;
  throw new Error('Cannot locate qa/release-hardening.test.mjs');
}

const SCRIPT_PATH = resolveSelfPath();
const REPO_ROOT = join(SCRIPT_PATH, '..', '..');
const UNDER_VITEST = Boolean(process.env.VITEST || process.env.VITEST_WORKER_ID);

if (UNDER_VITEST) {
  const { test } = await import('vitest');
  const { spawnSync } = await import('node:child_process');
  test('release hardening suite passes under node', () => {
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
  const { test } = await import('node:test');

  register(new URL('./loader.mjs', import.meta.url));

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

  const SUPABASE = 'https://qa-test-project.supabase.co';
  const jsonResponse = (data, status = 200) =>
    new Response(typeof data === 'string' ? data : JSON.stringify(data), {
      status,
      headers: { 'content-type': 'application/json' },
    });

  let providerCalls = [];
  let upstream = { status: 200, body: { data: [{ b64_json: 'AAAA' }] } };

  function resetMocks() {
    providerCalls = [];
    upstream = { status: 200, body: { data: [{ b64_json: 'AAAA' }] } };
  }

  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = String(init.method ?? 'GET').toUpperCase();
    if (url.includes('/auth/v1/user')) {
      const auth = init?.headers?.Authorization ?? init?.headers?.authorization;
      if (auth !== 'Bearer qa-test-token') return jsonResponse({ message: 'Invalid token' }, 401);
      return jsonResponse({ id: 'qa-user-1', email: 'qa@example.com' });
    }
    if (url.includes('/rest/v1/rate_limits')) {
      if (method === 'GET') return jsonResponse([]);
      return jsonResponse({}, 201);
    }
    if (url.startsWith('https://api.openai.com/')) {
      providerCalls.push({ url, method, init });
      if (upstream.status !== 200) {
        return jsonResponse({ error: { message: 'upstream failure' } }, upstream.status);
      }
      return jsonResponse(upstream.body);
    }
    if (url.includes('example.com') || url.endsWith('.png')) {
      return jsonResponse({ ok: true });
    }
    throw new Error(`Unmocked fetch: ${method} ${url}`);
  };

  denoEnv.set('SUPABASE_URL', SUPABASE);
  denoEnv.set('SUPABASE_SERVICE_ROLE_KEY', 'qa-service-role-key');
  denoEnv.set('SUPABASE_ANON_KEY', 'qa-anon-key');
  // cors.ts captures the allow-list at module load, so it must be set first.
  denoEnv.set('ALLOWED_ORIGINS', 'https://app.example.com');

  await import('../supabase/functions/meme-generator/index.ts');
  const memeHandler = servedHandlers[servedHandlers.length - 1];

  const invoke = (handler, { body, auth = true, method = 'POST' } = {}) => {
    const headers = { 'content-type': 'application/json', origin: 'https://app.example.com' };
    if (auth) {
      headers.Authorization = 'Bearer qa-test-token';
      headers['x-user-api-key'] = 'sk-qa-user-key-1234567890';
    }
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
    denoEnv.set('SUPABASE_URL', SUPABASE);
    denoEnv.set('SUPABASE_SERVICE_ROLE_KEY', 'qa-service-role-key');
    denoEnv.set('SUPABASE_ANON_KEY', 'qa-anon-key');
    denoEnv.set('ALLOWED_ORIGINS', 'https://app.example.com');
  });

  test('meme-generator: unauthenticated request is rejected with 401 and no provider call', async () => {
    const res = await invoke(memeHandler, {
      body: { topText: 'A', bottomText: 'B', referenceImageUrl: 'https://cdn.example.com/r.png', provider: 'openai' },
      auth: false,
    });
    assert.equal(res.status, 401);
    assert.equal(providerCalls.length, 0, 'no OpenAI call without auth');
  });

  test('meme-generator: preflight echoes the allow-listed origin (never a fixed one)', async () => {
    const res = await invoke(memeHandler, { method: 'OPTIONS' });
    assert.equal(res.status, 200);
    assert.equal(
      res.headers.get('Access-Control-Allow-Origin'),
      'https://app.example.com',
      'preflight must echo the request origin when it is allow-listed'
    );
  });

  test('meme-generator: unlisted origin is not echoed back', async () => {
    const res = await invoke(memeHandler, { method: 'OPTIONS' });
    const req = new Request('https://edge.example.com/fn', {
      method: 'OPTIONS',
      headers: { origin: 'https://evil.example.org' },
    });
    const evilRes = await memeHandler(req);
    assert.notEqual(evilRes.headers.get('Access-Control-Allow-Origin'), 'https://evil.example.org');
  });

  test('meme-generator: authenticated request generates with the user key', async () => {
    const res = await invoke(memeHandler, {
      body: { topText: 'A', bottomText: 'B', referenceImageUrl: 'https://cdn.example.com/r.png', provider: 'openai' },
    });
    assert.equal(res.status, 200);
    const { body } = await readJson(res);
    assert.ok(body.imageUrl.startsWith('data:image/png;base64,'));
    const call = providerCalls.find((c) => c.url.includes('/images/edits'));
    assert.ok(call, 'meme generation uses the GPT Image 2.5 edits endpoint');
    assert.equal(call.init.headers['Authorization'], 'Bearer sk-qa-user-key-1234567890');
  });

  // -------------------------------------------------------------------------
  // Static contracts
  // -------------------------------------------------------------------------

  test('image-generation-secure maps upstream auth failures to 502', () => {
    const source = readFileSync(
      new URL('../supabase/functions/image-generation-secure/index.ts', import.meta.url),
      'utf8'
    );
    assert.match(source, /response\.status === 429 \? 429 : 502/, 'provider statuses must be mapped');
    const forwarded = source.match(/new SecurityError\([\s\S]{0,120}?response\.status\s*,/);
    assert.ok(!forwarded, 'the raw upstream status must not be forwarded to the client');
  });

  test('no deployed edge function hard-codes Access-Control-Allow-Origin: *', () => {
    const functionsDir = join(REPO_ROOT, 'supabase', 'functions');
    const entries = readdirSync(functionsDir);
    const offenders = [];
    for (const entry of entries) {
      const full = join(functionsDir, entry);
      if (!statSync(full).isDirectory()) continue;
      const indexPath = join(full, 'index.ts');
      if (!existsSync(indexPath)) continue;
      const source = readFileSync(indexPath, 'utf8');
      for (const match of source.matchAll(/Access-Control-Allow-Origin['"]?\s*:\s*['"]([^'"]*)['"]/g)) {
        if (match[1] === '*') offenders.push(`${entry}/index.ts`);
      }
    }
    assert.deepEqual(offenders, [], `wildcard ACAO must not ship: ${offenders.join(', ')}`);
  });
}
