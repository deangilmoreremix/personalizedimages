import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { register } from 'node:module';

function resolveSelfPath() {
  const fromImportMeta = new URL('./rate-limit.test.mjs', import.meta.url);
  if (fromImportMeta.protocol === 'file:') return fileURLToPath(fromImportMeta);
  const fromCwd = join(process.cwd(), 'qa', 'rate-limit.test.mjs');
  if (existsSync(fromCwd)) return fromCwd;
  throw new Error('Cannot locate qa/rate-limit.test.mjs');
}

const SCRIPT_PATH = resolveSelfPath();
const REPO_ROOT = join(SCRIPT_PATH, '..', '..');
const UNDER_VITEST = Boolean(process.env.VITEST || process.env.VITEST_WORKER_ID);

if (UNDER_VITEST) {
  const { test } = await import('vitest');
  const { spawnSync } = await import('node:child_process');
  test('rate-limit shared-table safety suite (qa/rate-limit.test.mjs) passes under node', () => {
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

globalThis.Deno = {
  env: {
    get: (key) => (denoEnv.has(key) ? denoEnv.get(key) : undefined),
    has: (key) => denoEnv.has(key) ? denoEnv.get(key) : undefined,
    toObject: () => Object.fromEntries(denoEnv),
  },
};

register(new URL('./loader.mjs', import.meta.url));

const { checkRateLimit } = await import('../supabase/functions/_shared/cors.ts');

const SUPABASE = 'https://qa-test-project.supabase.co';
const jsonResponse = (data, status = 200) =>
  new Response(typeof data === 'string' ? data : JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

let calls = [];
let state;

function resetState() {
  calls = [];
  state = {
    row: null, // existing rate_limits row as returned by the SELECT
    postStatus: 200,
    patchStatus: 200,
  };
}

function setEnv(withConfig = true) {
  denoEnv.clear();
  if (withConfig) {
    denoEnv.set('SUPABASE_URL', SUPABASE);
    denoEnv.set('SUPABASE_SERVICE_ROLE_KEY', 'qa-service-role-key');
  }
}

globalThis.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input.url;
  const method = String(init.method ?? 'GET').toUpperCase();
  calls.push({ url, method, init });
  if (url.includes('/rest/v1/rate_limits') && method === 'GET') {
    return jsonResponse(state.row ? [state.row] : []);
  }
  // The deployed table raises 42703 for unknown columns, like PostgREST does.
  if (url.includes('/rest/v1/rate_limits') && /identifier=eq|is_authenticated=eq/.test(url)) {
    return jsonResponse({ code: '42703', message: 'column rate_limits.request_count does not exist' }, 400);
  }
  if (url === `${SUPABASE}/rest/v1/rate_limits` && method === 'POST') {
    return jsonResponse({}, state.postStatus);
  }
  if (url.startsWith(`${SUPABASE}/rest/v1/rate_limits?id=eq.`) && method === 'PATCH') {
    return jsonResponse({}, state.patchStatus);
  }
  throw new Error(`Unmocked fetch: ${method} ${url}`);
};

test.beforeEach(() => {
  resetState();
  setEnv(true);
});

test('edge rate-limit rows are namespaced with the edge: prefix', async () => {
  const result = await checkRateLimit('qa-user-1', true);
  assert.equal(result.allowed, true);
  const select = calls.find((c) => c.method === 'GET');
  assert.ok(select.url.includes('scope=eq.edge'), `SELECT must use the deployed scope column: ${select.url}`);
  assert.ok(select.url.includes('key=eq.auth%3Aqa-user-1'), `SELECT must namespace the key: ${select.url}`);
  const post = calls.find((c) => c.method === 'POST');
  const body = JSON.parse(post.init.body);
  assert.equal(body.scope, 'edge');
  assert.equal(body.key, 'auth:qa-user-1');
  assert.equal(body.count, 1);
});

test('insert uses resolution=ignore-duplicates (no unique index required)', async () => {
  await checkRateLimit('qa-user-1', true);
  const post = calls.find((c) => c.method === 'POST');
  assert.equal(post.init.headers['Prefer'], 'resolution=ignore-duplicates');
  assert.notEqual(post.init.headers['Prefer'], 'resolution=merge-duplicates');
});

test('SELECT orders by window_start desc to pick the freshest window', async () => {
  await checkRateLimit('qa-user-1', true);
  const select = calls.find((c) => c.method === 'GET');
  assert.ok(select.url.includes('order=window_start.desc'), `SELECT must order by window_start desc: ${select.url}`);
});

test('existing fresh row is incremented via PATCH, not re-inserted', async () => {
  // Authenticated limit is 100 requests/hour (RATE_LIMITS in cors.ts).
  state.row = {
    id: 'row-1',
    count: 96,
    window_start: new Date().toISOString(),
  };
  const result = await checkRateLimit('qa-user-1', true);
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 3);
  const patch = calls.find((c) => c.method === 'PATCH');
  assert.ok(patch, 'PATCH issued for existing row');
  assert.equal(JSON.parse(patch.init.body).count, 97);
  assert.ok(patch.url.includes('id=eq.row-1'));
  assert.ok(!calls.some((c) => c.method === 'POST'), 'no INSERT when a fresh row exists');
});

test('stale window row triggers a fresh INSERT', async () => {
  state.row = {
    id: 'row-old',
    count: 99,
    window_start: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  };
  const result = await checkRateLimit('qa-user-1', true);
  assert.equal(result.allowed, true);
  assert.ok(calls.some((c) => c.method === 'POST'), 'INSERT issued for stale window');
});

test('request_count at the limit is denied', async () => {
  state.row = {
    id: 'row-1',
    count: 100,
    window_start: new Date().toISOString(),
  };
  const result = await checkRateLimit('qa-user-1', true);
  assert.equal(result.allowed, false);
  assert.equal(result.remaining, 0);
  assert.ok(!calls.some((c) => c.method === 'PATCH'), 'no PATCH when over the limit');
});

test('anonymous identifiers are namespaced the same way', async () => {
  await checkRateLimit('1.2.3.4', false);
  const post = calls.find((c) => c.method === 'POST');
  assert.equal(JSON.parse(post.init.body).key, 'anon:1.2.3.4');
  assert.equal(JSON.parse(post.init.body).scope, 'edge');
});

test('fails closed when service configuration is missing', async () => {
  setEnv(false);
  const result = await checkRateLimit('qa-user-1', true);
  assert.equal(result.allowed, false);
  assert.equal(calls.length, 0, 'no REST calls without configuration');
});

test('fails closed when the insert fails', async () => {
  state.postStatus = 500;
  const result = await checkRateLimit('qa-user-1', true);
  assert.equal(result.allowed, false);
});

// ---------------------------------------------------------------------------
// Migration safety assertions (the migration must never mutate or uniquely
// constrain the shared rate_limits table used by other VideoRemix apps)
// ---------------------------------------------------------------------------

const migration = readFileSync(
  new URL('../supabase/migrations/20261012120000_personalizedimages_minimal_tables.sql', import.meta.url),
  'utf8'
);
const stripSqlComments = (sql) => sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\n]*/g, '');

test('migration never deletes or de-duplicates shared rate_limits rows', () => {
  const sql = stripSqlComments(migration);
  assert.ok(!/DELETE\s+FROM\s+rate_limits/i.test(sql), 'migration must not DELETE from the shared rate_limits table');
  assert.ok(!/TRUNCATE/i.test(sql), 'migration must not TRUNCATE any table');
});

test('migration creates no unique index on the shared rate_limits table', () => {
  const sql = stripSqlComments(migration);
  assert.ok(
    !/CREATE\s+UNIQUE\s+INDEX[^;]*ON\s+rate_limits/i.test(sql),
    'a unique index on rate_limits would break the shared check_rate_limit RPC'
  );
});

test('the new migration does not touch any shared table', () => {
  const sql = stripSqlComments(migration);
  for (const shared of ['user_credits', 'credit_transactions', 'rate_limits', 'subscriptions', 'billing_cycles', 'stripe_entitlements']) {
    assert.ok(
      !new RegExp(`(ALTER|DROP|DELETE\\s+FROM|TRUNCATE)\\s+(TABLE\\s+)?(public\\.)?${shared}`, 'i').test(sql),
      `the migration must not modify the shared ${shared} table`
    );
  }
});

test('the new migration enables RLS with owner-scoped policies on both tables', () => {
  const sql = stripSqlComments(migration);
  assert.equal((sql.match(/ENABLE ROW LEVEL SECURITY/g) || []).length, 2, 'both tables must enable RLS');
  for (const table of ['pi_generated_videos', 'pi_user_images']) {
    assert.match(sql, new RegExp(`auth\\.uid\\(\\) = user_id`), `${table} policies must be owner-scoped`);
  }
});
}
