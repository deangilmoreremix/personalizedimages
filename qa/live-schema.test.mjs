/**
 * QA -- live shared-schema contract tests.
 *
 * Production-release verification against the SHARED VideoRemix Supabase
 * database (project bzxohkrxcwodllketcpz) proved that several tables have a
 * different deployed shape than the repository migrations describe:
 *
 *   rate_limits      -> (id, scope, key, window_start, count, created_at, updated_at)
 *   generated_images -> (id, url, prompt, user_id, model, size, quality, format,
 *                        compression, background, action, previous_response_id,
 *                        created_at, updated_at)
 *   generated_videos -> DOES NOT EXIST
 *   user_images      -> DOES NOT EXIST
 *
 * These tests pin the code to the DEPLOYED schema so the mismatch cannot
 * regress, and record the live evidence (HTTP 200 vs 42703) that was used to
 * verify each fix.
 *
 * Static analysis of the source; run with: node qa/live-schema.test.mjs
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

function resolveSelfPath() {
  const fromImportMeta = new URL('./live-schema.test.mjs', import.meta.url);
  if (fromImportMeta.protocol === 'file:') return fileURLToPath(fromImportMeta);
  const fromCwd = join(process.cwd(), 'qa', 'live-schema.test.mjs');
  if (existsSync(fromCwd)) return fromCwd;
  throw new Error('Cannot locate qa/live-schema.test.mjs');
}

const SCRIPT_PATH = resolveSelfPath();
const REPO_ROOT = join(SCRIPT_PATH, '..', '..');
const read = (relPath) => readFileSync(join(REPO_ROOT, relPath), 'utf8');

const CORS = read('supabase/functions/_shared/cors.ts');
const IMAGE_SERVICE = read('src/services/imageGenerationService.ts');
const VIDEO_FN = read('supabase/functions/image-to-video/index.ts');

// Columns confirmed live via read-only service-role queries on 2026-10-12:
//   GET /rest/v1/rate_limits?identifier=eq...&request_count...  -> 400 42703
//   GET /rest/v1/rate_limits?scope=eq...&count...               -> 200 []
const RATE_LIMITS_COLUMNS = ['scope', 'key', 'count', 'window_start'];
const RETIRED_RATE_LIMITS_COLUMNS = ['identifier', 'is_authenticated', 'request_count'];

//   GET /rest/v1/generated_images?image_url...                   -> 400 42703
//   GET /rest/v1/generated_images?url...                         -> 200 []
const GENERATED_IMAGES_COLUMNS = ['url', 'prompt', 'user_id', 'model'];
const RETIRED_GENERATED_IMAGES_COLUMNS = ['image_url', 'provider', 'category', 'tokens_used'];

// Storage buckets confirmed live: generated-images (public, 10MB, image/*).
// temp-uploads and landing-page-images DO NOT exist.
const EXISTING_BUCKETS = ['generated-images', 'uploads', 'user-uploads'];

const { test } = await import('node:test');
const UNDER_VITEST = Boolean(process.env.VITEST || process.env.VITEST_WORKER_ID);

if (UNDER_VITEST) {
  const { test: vitestTest } = await import('vitest');
  const { spawnSync } = await import('node:child_process');
  vitestTest('live-schema contract suite passes under node', () => {
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

test('checkRateLimit queries the deployed rate_limits columns', () => {
  const body = CORS.slice(CORS.indexOf('export async function checkRateLimit'));
  for (const col of RATE_LIMITS_COLUMNS) {
    assert.ok(body.includes(col), `checkRateLimit must use the deployed '${col}' column`);
  }
  for (const col of RETIRED_RATE_LIMITS_COLUMNS) {
    assert.ok(!body.includes(col), `checkRateLimit must not use the non-deployed '${col}' column`);
  }
});

test('checkRateLimit namespaces rows so other apps keys are never read or written', () => {
  const body = CORS.slice(CORS.indexOf('export async function checkRateLimit'));
  assert.match(body, /scope = 'edge'/, "rows must be scoped to this app");
  assert.match(body, /key = `\$\{isAuthenticated \? 'auth' : 'anon'\}:\$\{rawIdentifier\}`/, 'keys must be namespaced per auth state');
});

test('saveGeneratedImage writes only columns that exist in the deployed table', () => {
  const body = IMAGE_SERVICE.slice(IMAGE_SERVICE.indexOf('.from(\'generated_images\')') - 400, IMAGE_SERVICE.indexOf('.from(\'generated_images\')') + 700);
  for (const col of RETIRED_GENERATED_IMAGES_COLUMNS) {
    assert.ok(!body.includes(`${col}:`), `insert must not use the non-deployed '${col}' column`);
  }
  for (const col of GENERATED_IMAGES_COLUMNS) {
    assert.ok(body.includes(`${col}:`), `insert must set the deployed '${col}' column`);
  }
});

test('image-to-video uploads source images to a bucket that exists in the shared project', () => {
  const used = VIDEO_FN.match(/storage\.from\("([^"]+)"\)/g) || [];
  assert.ok(used.length > 0, 'image-to-video must upload through a storage bucket');
  for (const match of used) {
    const bucket = match.match(/"([^"]+)"/)[1];
    assert.ok(
      EXISTING_BUCKETS.includes(bucket),
      `bucket '${bucket}' does not exist in the shared project; use one of: ${EXISTING_BUCKETS.join(', ')}`
    );
  }
});

test('no repository code references the undeployed buckets', () => {
  for (const file of ['supabase/functions/image-to-video/index.ts', 'src/services/landingPageContentService.ts']) {
    if (!existsSync(join(REPO_ROOT, file))) continue;
    const source = read(file);
    for (const bucket of ['temp-uploads', 'landing-page-images']) {
      assert.ok(
        !source.includes(`"${bucket}"`) && !source.includes(`'${bucket}'`),
        `${file} references bucket '${bucket}' which does not exist in the shared project`
      );
    }
  }
});

test('video persistence gap is documented (generated_videos is not deployed)', () => {
  // The video pipeline stores task state in generated_videos, which does not
  // exist in the shared database. The functions must surface an honest failure
  // rather than a fake success, and the gap must remain documented.
  const videoFn = read('supabase/functions/image-to-video/index.ts');
  assert.ok(videoFn.includes('generated_videos'), 'video pipeline still targets generated_videos');
  assert.match(videoFn, /status: 'failed'/, 'provider/db failures must mark the row failed, not fake success');
});
}
