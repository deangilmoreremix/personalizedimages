/**
 * QA -- CORS restrictiveness regression suite (acceptance audit, criterion 1).
 *
 * The Supabase edge functions under supabase/functions/* are Deno modules, so
 * this suite imports them directly with Node's TypeScript type stripping and
 * stubs the `Deno` global (env + serve) plus global fetch, exactly like
 * qa/edge-functions.test.mjs. On top of the runtime probes it performs a
 * static sweep of every edge-function source file and of the frontend callers
 * so a hard-coded wildcard or a missing request header cannot be reintroduced
 * silently.
 *
 *   node --experimental-strip-types qa/cors-restrictiveness.test.mjs
 *
 * Pinned contract:
 *   - NO edge-function source may hard-code `Access-Control-Allow-Origin: *`;
 *     every ACAO value must derive from the ALLOWED_ORIGINS allow-list.
 *   - `createSecureResponse()` / `createErrorResponse()` (_shared/security.ts)
 *     must not emit a wildcard ACAO.
 *   - the 500 catch-all of image-description and image-variations must reuse
 *     `getCorsHeaders(origin)` and NOT the local wildcard `corsHeaders` const.
 *   - every custom header the frontend sends (src/utils/supabaseClient.ts,
 *     src/utils/streamingApi.ts, src/utils/edgeFunctionDebug.ts) must appear
 *     in EVERY `Access-Control-Allow-Headers` list, `x-user-api-key` included.
 *   - every function dir must answer OPTIONS (directly or via
 *     _shared/middleware.ts createEdgeFunction) and echo the CORS headers.
 *
 * When this file is collected by vitest instead, it delegates the whole suite
 * to the node runner above, because vitest's module runner cannot resolve the
 * Deno-only `jsr:` type import inside assistant-stream/index.ts.
 */

import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

function resolveSelfPath() {
  const fromImportMeta = new URL('./cors-restrictiveness.test.mjs', import.meta.url);
  if (fromImportMeta.protocol === 'file:') return fileURLToPath(fromImportMeta);
  const fromCwd = join(process.cwd(), 'qa', 'cors-restrictiveness.test.mjs');
  if (existsSync(fromCwd)) return fromCwd;
  throw new Error('Cannot locate qa/cors-restrictiveness.test.mjs');
}

const SCRIPT_PATH = resolveSelfPath();
const REPO_ROOT = join(SCRIPT_PATH, '..', '..');
const FUNCTIONS_DIR = join(REPO_ROOT, 'supabase', 'functions');
const UNDER_VITEST = Boolean(process.env.VITEST || process.env.VITEST_WORKER_ID);

if (UNDER_VITEST) {
  const { test } = await import('vitest');
  const { spawnSync } = await import('node:child_process');
  test('CORS restrictiveness suite (qa/cors-restrictiveness.test.mjs) passes under node', () => {
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

  // Redirect Deno-only "jsr:" / "npm:" specifiers to local stubs.
  register(new URL('./loader.mjs', import.meta.url));

  const SUPABASE = 'https://qa-test-project.supabase.co';
  const AUTH_HEADER = 'Bearer qa-test-token';
  const ALLOWED_ORIGIN = 'ALLOWED_ORIGIN';

  // _shared/cors.ts resolves ALLOWED_ORIGINS once at module load, so the
  // environment must be seeded BEFORE the modules under test are imported.
  denoEnv.set('SUPABASE_URL', SUPABASE);
  denoEnv.set('SUPABASE_ANON_KEY', 'qa-anon-key');
  denoEnv.set('SUPABASE_SERVICE_ROLE_KEY', 'qa-service-role-key');
  denoEnv.set('ALLOWED_ORIGINS', ALLOWED_ORIGIN);

  // ------------------------------------------------------------------ //
  // Mocked fetch router (Supabase auth + rate limits only)              //
  // ------------------------------------------------------------------ //

  const jsonResponse = (data, status = 200) =>
    new Response(typeof data === 'string' ? data : JSON.stringify(data), {
      status,
      headers: { 'content-type': 'application/json' },
    });

  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = String(init.method ?? 'GET').toUpperCase();
    if (url.includes('/auth/v1/user')) {
      const auth = init?.headers?.Authorization ?? init?.headers?.authorization;
      if (auth !== AUTH_HEADER) return jsonResponse({ message: 'Invalid token' }, 401);
      return jsonResponse({ id: 'qa-user-1', email: 'qa@example.com' });
    }
    if (url.includes('/rest/v1/rate_limits')) {
      return method === 'GET' ? jsonResponse([]) : jsonResponse({}, 201);
    }
    throw new Error(`Unmocked fetch: ${method} ${url}`);
  };

  const importEdge = (name) =>
    import(new URL(`../supabase/functions/${name}/index.ts`, import.meta.url).href);

  const importShared = (name) =>
    import(new URL(`../supabase/functions/_shared/${name}`, import.meta.url).href);
  // ------------------------------------------------------------------ //
  // Static sweep helpers                                                //
  // ------------------------------------------------------------------ //

  function listFunctionDirs() {
    return readdirSync(FUNCTIONS_DIR)
      .map((entry) => join(FUNCTIONS_DIR, entry))
      .filter((full) => statSync(full).isDirectory())
      .map((full) => ({
        name: full.slice(FUNCTIONS_DIR.length + 1),
        indexPath: join(full, 'index.ts'),
      }))
      .filter((entry) => existsSync(entry.indexPath));
  }

  const FUNCTION_DIRS = listFunctionDirs();
  assert.ok(FUNCTION_DIRS.length >= 20, `expected the production function dirs, got ${FUNCTION_DIRS.length}`);

  const SHARED_SOURCES = ['cors.ts', 'security.ts', 'middleware.ts', 'imageProviders.ts'].map((file) => ({
    file,
    path: join(FUNCTIONS_DIR, '_shared', file),
  }));

  const ALL_SOURCES = [...FUNCTION_DIRS.map((d) => ({ file: `${d.name}/index.ts`, path: d.indexPath })), ...SHARED_SOURCES];

  /**
   * Every Access-Control-Allow-Origin literal in the codebase, with the file
   * and line it appears on. Only quoted literals are captured so that the
   * allow-list derived values in getCorsHeaders() are ignored.
   */
  function collectAllowOriginLiterals() {
    const found = [];
    for (const source of ALL_SOURCES) {
      if (!existsSync(source.path)) continue;
      const text = readFileSync(source.path, 'utf8');
      const lines = text.split('\n');
      lines.forEach((line, index) => {
        const re = /Access-Control-Allow-Origin['"]?\s*:\s*(['"`])([^'"`]*)\1/g;
        let match;
        while ((match = re.exec(line)) !== null) {
          found.push({ file: source.file, line: index + 1, value: match[2] });
        }
      });
    }
    return found;
  }

  /** Every Access-Control-Allow-Headers literal in the codebase. */
  function collectAllowHeadersLists() {
    const found = [];
    for (const source of ALL_SOURCES) {
      if (!existsSync(source.path)) continue;
      const text = readFileSync(source.path, 'utf8');
      const lines = text.split('\n');
      lines.forEach((line, index) => {
        const re = /Access-Control-Allow-Headers['"]?\s*:\s*(['"`])([^'"`]*)\1/g;
        let match;
        while ((match = re.exec(line)) !== null) {
          found.push({ file: source.file, line: index + 1, value: match[2] });
        }
      });
    }
    return found;
  }

  /**
   * Extract every `headers: { ... }` object literal from a source file with
   * real brace matching (a naive non-greedy regex stops at the first nested
   * `}` inside a spread such as `...(userApiKey ? { 'x-user-api-key': k } : {})`).
   */
  function extractHeadersBlocks(text) {
    const blocks = [];
    const re = /headers\s*:\s*\{/g;
    let anchor;
    while ((anchor = re.exec(text)) !== null) {
      let index = anchor.index + anchor[0].length;
      let depth = 1;
      let quote = null;
      while (index < text.length && depth > 0) {
        const char = text[index];
        if (quote) {
          if (char === '\\') index += 1;
          else if (char === quote) quote = null;
        } else if (char === "'" || char === '"' || char === '`') {
          quote = char;
        } else if (char === '{') {
          depth += 1;
        } else if (char === '}') {
          depth -= 1;
        }
        index += 1;
      }
      blocks.push(text.slice(anchor.index + anchor[0].length, index - 1));
    }
    return blocks;
  }

  /**
   * Every header name the frontend actually attaches to an edge-function
   * fetch(), mapped to the caller that sends it.
   */
  function collectFrontendHeaders(relativePaths) {
    const headers = new Map();
    for (const relativePath of relativePaths) {
      const text = readFileSync(join(REPO_ROOT, relativePath), 'utf8');
      for (const block of extractHeadersBlocks(text)) {
        const keyRe = /['"]([A-Za-z][A-Za-z0-9-]*)['"]\s*:/g;
        let key;
        while ((key = keyRe.exec(block)) !== null) {
          if (!headers.has(key[1])) headers.set(key[1], relativePath);
        }
      }
    }
    return headers;
  }

  const FRONTEND_CALLERS = [
    'src/utils/supabaseClient.ts',
    'src/utils/streamingApi.ts',
    'src/utils/edgeFunctionDebug.ts',
  ];

  // ------------------------------------------------------------------ //
  // Import the modules under test (current state on disk)               //
  // ------------------------------------------------------------------ //

  const { getCorsHeaders, corsHeaders: sharedStaticCorsHeaders } = await importShared('cors.ts');
  await importEdge('image-description');
  await importEdge('image-variations');

  assert.ok(servedHandlers.length >= 2, 'both handlers registered');

  beforeEach(() => {
    // _shared/cors.ts caches the allow-list at module load; re-seeding keeps
    // the environment deterministic for anything that reads it per call.
    denoEnv.set('SUPABASE_URL', SUPABASE);
    denoEnv.set('SUPABASE_ANON_KEY', 'qa-anon-key');
    denoEnv.set('SUPABASE_SERVICE_ROLE_KEY', 'qa-service-role-key');
    denoEnv.set('ALLOWED_ORIGINS', ALLOWED_ORIGIN);
  });

  const invoke = (handler, { body, auth = true, method = 'POST', origin = 'ALLOWED_ORIGIN', apiKey = 'sk-test-user-openai-key-1234567890', rawBody } = {}) => {
    const headers = { 'content-type': 'application/json', origin };
    if (auth) headers.Authorization = AUTH_HEADER;
    if (apiKey !== null) headers['x-user-api-key'] = apiKey;
    return handler(
      new Request('https://edge.example.com/fn', {
        method,
        headers,
        body: rawBody !== undefined ? rawBody : body === undefined ? undefined : JSON.stringify(body),
      })
    );
  };

  // ================================================================== //
  // 1. No hard-coded wildcard Access-Control-Allow-Origin               //
  // ================================================================== //

  test('no edge-function source hard-codes Access-Control-Allow-Origin: *', () => {
    const literals = collectAllowOriginLiterals();
    const wildcards = literals.filter((entry) => entry.value.trim() === '*');
    assert.deepEqual(
      wildcards.map((w) => `${w.file}:${w.line}`),
      [],
      'every ACAO must derive from the ALLOWED_ORIGINS allow-list; a hard-coded "*" '
        + 'lets any origin read authenticated responses. Files/lines above must be fixed.'
    );
  });

  test('createSecureResponse (security.ts) derives ACAO from the allow-list, never "*"', () => {
    // NOTE: _shared/security.ts cannot be imported at runtime -- it uses a
    // TypeScript parameter property, which Node's strip-only mode rejects.
    // The check is therefore performed directly on the source, which is what
    // the runtime call would evaluate anyway.
    const text = readFileSync(join(FUNCTIONS_DIR, '_shared', 'security.ts'), 'utf8');
    const lines = text.split('\n');
    const start = lines.findIndex((line) => /export function createSecureResponse\(/.test(line));
    assert.ok(start !== -1, 'createSecureResponse not found in _shared/security.ts');
    const body = lines.slice(start, start + 30);
    const acaoLine = body.find((line) => /Access-Control-Allow-Origin/.test(line));
    assert.ok(acaoLine, 'createSecureResponse must set Access-Control-Allow-Origin');
    // A quoted '*' is a hard-coded wildcard; any other value (a lookup into the
    // allow-list, a getCorsHeaders() spread, ...) is acceptable.
    const literal = acaoLine.match(/Access-Control-Allow-Origin['"]?\s*:\s*(['"`])([^'"`]*)\1/);
    assert.ok(
      !literal || literal[2].trim() !== '*',
      `_shared/security.ts:${start + 1} createSecureResponse hard-codes ` +
        `'Access-Control-Allow-Origin: *', so every response (including the 400 ` +
        `missing-key and 500 error paths of image-generation-secure) is readable ` +
        `by any origin. It must derive from the ALLOWED_ORIGINS allow-list.`
    );
  });

  test('getCorsHeaders: unlisted origin gets a non-wildcard ACAO', () => {
    const res = getCorsHeaders('https://evil.example.com');
    const acao = res['Access-Control-Allow-Origin'];
    assert.notEqual(acao, '*', 'an unlisted origin must never receive Access-Control-Allow-Origin: *');
    assert.ok(['null', 'ALLOWED_ORIGIN'].includes(acao), `unexpected ACAO ${JSON.stringify(acao)}`);
  });

  test('getCorsHeaders: listed origin is echoed', () => {
    const res = getCorsHeaders('ALLOWED_ORIGIN');
    assert.equal(res['Access-Control-Allow-Origin'], 'ALLOWED_ORIGIN');
  });

  test('the shared static corsHeaders constant is allow-list derived, not "*"', () => {
    assert.notEqual(
      sharedStaticCorsHeaders['Access-Control-Allow-Origin'],
      '*',
      '_shared/cors.ts corsHeaders must stay allow-list derived'
    );
    assert.equal(sharedStaticCorsHeaders['Access-Control-Allow-Origin'], 'ALLOWED_ORIGIN');
  });

  // ================================================================== //
  // 2. Exception paths must reuse getCorsHeaders(origin)                //
  // ================================================================== //

  test('image-description: 500 catch-all must not emit Access-Control-Allow-Origin: *', async () => {
    const handler = servedHandlers[0];
    assert.ok(handler, 'image-description handler registered');
    // A malformed JSON body makes `await req.json()` throw, which lands in the
    // function's catch-all (previously the only path that used the local
    // wildcard `corsHeaders` constant instead of getCorsHeaders(origin)).
    const res = await invoke(handler, {
      rawBody: '{ this is not json',
      origin: 'ALLOWED_ORIGIN',
    });
    assert.equal(res.status, 500);
    const acao = res.headers.get('Access-Control-Allow-Origin');
    assert.notEqual(acao, '*', 'the 500 catch-all must not return a wildcard ACAO');
    assert.equal(acao, 'ALLOWED_ORIGIN', `unexpected ACAO ${JSON.stringify(acao)}`);
  });

  test('image-variations: 500 catch-all must not emit Access-Control-Allow-Origin: *', async () => {
    const handler = servedHandlers[servedHandlers.length - 1];
    assert.ok(handler, 'image-variations handler registered');
    const res = await invoke(handler, {
      rawBody: '{ this is not json',
      origin: 'ALLOWED_ORIGIN',
    });
    assert.equal(res.status, 500);
    const acao = res.headers.get('Access-Control-Allow-Origin');
    assert.notEqual(acao, '*', 'the 500 catch-all must not return a wildcard ACAO');
    assert.equal(acao, 'ALLOWED_ORIGIN', `unexpected ACAO ${JSON.stringify(acao)}`);
  });

  test('OPTIONS preflight on image-description returns the CORS headers', async () => {
    const handler = servedHandlers[0];
    const res = await invoke(handler, { method: 'OPTIONS', origin: 'ALLOWED_ORIGIN' });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), 'ALLOWED_ORIGIN');
    assert.ok(
      res.headers.get('Access-Control-Allow-Headers').includes('x-user-api-key'),
      'preflight must allow the x-user-api-key header'
    );
  });

  // ================================================================== //
  // 3. Allow-Headers completeness (frontend senders vs backend lists)   //
  // ================================================================== //

  test('every frontend-sent header is in EVERY Access-Control-Allow-Headers list', () => {
    const lists = collectAllowHeadersLists();
    // At minimum _shared/cors.ts and _shared/security.ts define a list; the
    // two generator functions define their own. The exact count intentionally
    // is not pinned so a legitimate fix may remove or add lists.
    assert.ok(lists.length >= 2, `expected at least 2 Allow-Headers lists, found ${lists.length}`);

    const frontendHeaders = collectFrontendHeaders(FRONTEND_CALLERS);
    assert.ok(frontendHeaders.size > 0, 'expected to parse headers from the frontend callers');

    const problems = [];
    for (const [header, caller] of frontendHeaders) {
      for (const list of lists) {
        const allowed = list.value
          .split(',')
          .map((entry) => entry.trim().toLowerCase())
          .filter(Boolean);
        if (!allowed.includes(header.toLowerCase())) {
          problems.push(
            `${header} (sent by ${caller}) is missing from ${list.file}:${list.line}`
          );
        }
      }
    }
    assert.deepEqual(
      problems,
      [],
      'every custom header the browser sends must be preflighted by every function, '
        + 'otherwise the request is blocked before it is ever sent'
    );
  });

  test('x-user-api-key is allow-listed in every Access-Control-Allow-Headers list', () => {
    const lists = collectAllowHeadersLists();
    const missing = lists
      .filter((list) => !list.value.split(',').map((e) => e.trim().toLowerCase()).includes('x-user-api-key'))
      .map((list) => `${list.file}:${list.line}`);
    assert.deepEqual(missing, [], 'x-user-api-key must be in every Allow-Headers list');
  });

  // ================================================================== //
  // 4. Preflight coverage across all deployed functions                 //
  // ================================================================== //

  test('every deployed function answers OPTIONS (directly or via createEdgeFunction)', () => {
    const unhandled = [];
    for (const entry of FUNCTION_DIRS) {
      const text = readFileSync(entry.indexPath, 'utf8');
      const handlesDirectly = /req\.method\s*===?\s*['"`]OPTIONS['"`]|method\s*===?\s*['"`]OPTIONS['"`]|\.method\s*===?\s*['"`]OPTIONS['"`]/.test(text);
      const usesMiddleware = /createEdgeFunction/.test(text);
      if (!handlesDirectly && !usesMiddleware) unhandled.push(entry.name);
    }
    assert.deepEqual(unhandled, [], 'every function must answer the CORS preflight');
  });

  test('every deployed function is covered by the preflight sweep', () => {
    // Guards against the sweep above silently skipping a new function dir.
    const names = FUNCTION_DIRS.map((d) => d.name);
    for (const expected of ['image-generation', 'image-editing', 'assistant-stream', 'image-to-video', 'video-status', 'video-result']) {
      assert.ok(names.includes(expected), `expected ${expected} to be in the sweep`);
    }
  });
}
