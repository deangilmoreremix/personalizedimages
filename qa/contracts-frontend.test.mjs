/**
 * QA -- frontend <-> edge-function contract guardrails (static analysis).
 *
 * The edge functions under supabase/functions/* are Deno modules and the
 * frontend under src/** is TypeScript whose imports (import.meta.env, CSS,
 * JSX) the node contract runner cannot load. Instead of executing both
 * sides, this suite reads the real source files off disk and pins the
 * request contract on each side of every frontend -> edge call:
 *
 *   src/utils/videoApi.ts, src/utils/api.ts   what the frontend sends
 *   supabase/functions/<name>/index.ts        what the function reads
 *
 * plus repo-wide credential-hygiene guards. The goal is to catch contract
 * drift -- a key renamed, a payload nested one level too deep, a retired
 * provider endpoint resurrected, a shared VITE_* credential reintroduced --
 * without a live deployment.
 *
 *   node qa/contracts-frontend.test.mjs
 *
 * When this file is collected by vitest instead, it delegates the whole
 * suite to the node runner above.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

function resolveSelfPath() {
  const fromImportMeta = new URL('./contracts-frontend.test.mjs', import.meta.url);
  if (fromImportMeta.protocol === 'file:') return fileURLToPath(fromImportMeta);
  const fromCwd = join(process.cwd(), 'qa', 'contracts-frontend.test.mjs');
  if (existsSync(fromCwd)) return fromCwd;
  throw new Error('Cannot locate qa/contracts-frontend.test.mjs');
}

const SCRIPT_PATH = resolveSelfPath();
const REPO_ROOT = join(SCRIPT_PATH, '..', '..');
const UNDER_VITEST = Boolean(process.env.VITEST || process.env.VITEST_WORKER_ID);

if (UNDER_VITEST) {
  const { test } = await import('vitest');
  const { spawnSync } = await import('node:child_process');
  test('frontend/edge contract suite (qa/contracts-frontend.test.mjs) passes under node', () => {
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

  // ------------------------------------------------------------------ //
  // Source loading                                                      //
  // ------------------------------------------------------------------ //

  const read = (relPath) => readFileSync(join(REPO_ROOT, relPath), 'utf8');
  const edgeSource = (name) => read(`supabase/functions/${name}/index.ts`);

  const VIDEO_API = read('src/utils/videoApi.ts');
  const API = read('src/utils/api.ts');

  function walkSourceFiles(dir) {
    const files = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) files.push(...walkSourceFiles(full));
      else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) files.push(full);
    }
    return files;
  }

  const SRC_FILES = walkSourceFiles(join(REPO_ROOT, 'src'));
  assert.ok(SRC_FILES.length > 0, 'expected to find source files under src/');

  // Test files may legitimately name retired endpoints/key names in negative
  // assertions; only shipped code must be free of them.
  const isTestFile = (file) => /\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file) || file.includes('__tests__');
  const SHIPPED_SRC_FILES = SRC_FILES.filter((file) => !isTestFile(file));

  // ------------------------------------------------------------------ //
  // Minimal TypeScript-aware scanning helpers                            //
  // ------------------------------------------------------------------ //

  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Index of the closing quote of the string/template literal at `index`.
  function skipQuoted(source, index) {
    const quote = source[index];
    let i = index + 1;
    while (i < source.length) {
      if (source[i] === '\\') { i += 2; continue; }
      if (source[i] === quote) return i;
      i += 1;
    }
    return source.length - 1;
  }

  // Slice a balanced { ... } (or [ ... ]) region starting at `openIndex`,
  // ignoring braces that appear inside strings, template literals or
  // comments.
  function sliceBalanced(source, openIndex, open = '{', close = '}') {
    let depth = 0;
    let i = openIndex;
    while (i < source.length) {
      const ch = source[i];
      if (ch === '"' || ch === "'" || ch === '`') { i = skipQuoted(source, i) + 1; continue; }
      if (ch === '/' && source[i + 1] === '/') {
        while (i < source.length && source[i] !== '\n') i += 1;
        continue;
      }
      if (ch === '/' && source[i + 1] === '*') {
        i += 2;
        while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 1;
        i += 2;
        continue;
      }
      if (ch === open) depth += 1;
      else if (ch === close) {
        depth -= 1;
        if (depth === 0) return source.slice(openIndex, i + 1);
      }
      i += 1;
    }
    return null;
  }

  // The object literal passed as the 2nd argument of callEdgeFunction('<fn>', { ... })
  function extractEdgeCall(source, fnName) {
    const marker = new RegExp(`callEdgeFunction\\(\\s*['"\`]${escapeRegExp(fnName)}['"\`]\\s*,`);
    const match = marker.exec(source);
    assert.ok(match, `no callEdgeFunction('${fnName}', ...) call site found`);
    const open = source.indexOf('{', match.index + match[0].length);
    assert.ok(open !== -1, `no object literal passed to '${fnName}'`);
    const literal = sliceBalanced(source, open);
    assert.ok(literal, `unbalanced object literal in the '${fnName}' call`);
    return literal;
  }

  function extractFunctionBody(source, name) {
    const marker = new RegExp(`function\\s+${escapeRegExp(name)}\\s*\\(`);
    const match = marker.exec(source);
    assert.ok(match, `function ${name}() not found in the source`);
    const open = source.indexOf('{', match.index + match[0].length - 1);
    assert.ok(open !== -1, `could not locate the body of ${name}()`);
    const body = sliceBalanced(source, open);
    assert.ok(body, `unbalanced body for ${name}()`);
    return body;
  }

  // Keys declared at depth 1 of an object literal (nested literals blanked
  // out, so `options: { duration }` yields only `options`). Handles both
  // `key: value` entries and ES6 shorthand `{ prompt, provider }` entries.
  // The stripped inner text is re-wrapped in braces so the final entry is
  // still followed by a closing brace.
  function topLevelKeys(objectLiteral) {
    const inner = objectLiteral.slice(
      objectLiteral.indexOf('{') + 1,
      objectLiteral.lastIndexOf('}')
    );
    const scanned = `{${inner
      .replace(/\/\/[^\n]*/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\{[^{}]*\}/g, ' ')
      .replace(/\[[^[\]]*\]/g, ' ')}}`;
    const keys = [];
    const push = (key) => { if (!keys.includes(key)) keys.push(key); };
    // key: value
    let colonEntry = /(?:^|[,{])\s*([A-Za-z_$][\w$]*)\s*:/g;
    let match;
    while ((match = colonEntry.exec(scanned)) !== null) push(match[1]);
    // shorthand { key, ... }
    let shorthand = /(?:^|[,{])\s*([A-Za-z_$][\w$]*)\s*(?=[,}])/g;
    while ((match = shorthand.exec(scanned)) !== null) push(match[1]);
    return keys;
  }

  // Keys the edge function destructures out of `await req.json()`.
  function requestKeys(fnSource) {
    const match = /const\s*\{([^}]*)\}\s*(?::[^=]*)?=\s*await\s+req\.json\(\)/.exec(fnSource);
    assert.ok(match, 'no `const { ... } = await req.json()` destructuring found');
    return match[1]
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => part.replace(/\?\s*:.*$/, '').replace(/\s*=.*$/, '').trim())
      .filter((part) => /^[A-Za-z_$][\w$]*$/.test(part));
  }

  const show = (keys) => (keys.length ? keys.join(', ') : '(none)');

  // ------------------------------------------------------------------ //
  // videoApi.ts <-> image-to-video                                      //
  // ------------------------------------------------------------------ //

  test('videoApi.convertImageToVideo sends duration and prompt at the TOP LEVEL to image-to-video', () => {
    const call = extractEdgeCall(VIDEO_API, 'image-to-video');
    const keys = topLevelKeys(call);

    assert.ok(
      keys.includes('duration'),
      `image-to-video call must send a top-level duration key (the function reads it from the\n` +
        `top level of req.json(), so a nested duration is silently ignored).\n` +
        `call site: src/utils/videoApi.ts\n${call}`
    );
    assert.ok(
      keys.includes('prompt'),
      `image-to-video call must send a top-level prompt key (the function reads it from the\n` +
        `top level of req.json(), so a nested prompt is dropped).\n` +
        `call site: src/utils/videoApi.ts\n${call}`
    );
    assert.ok(
      /\bimageUrl\b/.test(call),
      `image-to-video call must send imageUrl.\ncall site: src/utils/videoApi.ts\n${call}`
    );
  });

  test('videoApi.convertImageToVideo does not nest the payload under options', () => {
    const call = extractEdgeCall(VIDEO_API, 'image-to-video');
    const keys = topLevelKeys(call);

    assert.ok(
      !keys.includes('options'),
      `image-to-video must not receive the video options nested under an 'options' key:\n` +
        `the function destructures { imageUrl, duration, prompt } from the request body, so\n` +
        `anything nested under 'options' is dropped (user duration ignored, prompt lost).\n` +
        `call site: src/utils/videoApi.ts\n${call}`
    );
    assert.ok(
      !/options\s*:\s*\{/.test(call),
      `no \`options: { ... }\` wrapper may wrap duration/prompt in the image-to-video call.\n` +
        `call site: src/utils/videoApi.ts\n${call}`
    );
  });

  test('videoApi has no Stripe payment-intent call (100% BYOK: no subscription/credit gate)', () => {
    // Billing was removed: every AI call is BYOK, so the video flow must not
    // route through create-payment-intent or any Stripe dependency.
    assert.ok(
      !VIDEO_API.includes("create-payment-intent"),
      `the video flow must not call create-payment-intent (the app is 100% BYOK):\n` +
        `src/utils/videoApi.ts`
    );
    assert.ok(
      !/stripe/i.test(VIDEO_API),
      `the video flow must not reference Stripe: src/utils/videoApi.ts`
    );
  });

  // ------------------------------------------------------------------ //
  // api.ts <-> cartoon-style / ghibli-image / meme-generator            //
  // ------------------------------------------------------------------ //

  test('api.generateCartoonImage calls cartoon-style with the payload it reads', () => {
    const fn = extractFunctionBody(API, 'generateCartoonImage');
    const call = extractEdgeCall(fn, 'cartoon-style');
    const keys = topLevelKeys(call);

    for (const required of ['prompt', 'provider', 'style', 'referenceImageUrl']) {
      assert.ok(
        keys.includes(required),
        `generateCartoonImage must call 'cartoon-style' with a top-level '${required}' key\n` +
          `(the function reads { prompt, provider, style, referenceImageUrl }).\n` +
          `call site: src/utils/api.ts (generateCartoonImage)\n${call}`
      );
    }
    assert.ok(
      !fn.includes("callEdgeFunction('reference-image'"),
      `generateCartoonImage must target 'cartoon-style', not 'reference-image' (which reads\n` +
        `{ provider, prompt, referenceImageUrl } and ignores the cartoon style).\n` +
        `call site: src/utils/api.ts (generateCartoonImage)`
    );
  });

  test('api.generateGhibliStyleImage routes http(s) references through ghibli-image', () => {
    const fn = extractFunctionBody(API, 'generateGhibliStyleImage');
    const call = extractEdgeCall(fn, 'ghibli-image');

    assert.ok(
      /isHttpUrl\s*\(/.test(call),
      `the ghibli-image call must guard referenceImageUrl with isHttpUrl(...) before sending it:\n` +
        `ghibli-image rejects data: URLs with 400, so data: references must not reach it.\n` +
        `call site: src/utils/api.ts (generateGhibliStyleImage)\n${call}`
    );
    assert.ok(
      !fn.includes("callEdgeFunction('reference-image'"),
      `generateGhibliStyleImage must route references through 'ghibli-image', not\n` +
        `'reference-image'. call site: src/utils/api.ts (generateGhibliStyleImage)`
    );
  });

  test('api.generateMemeWithReference has no fake-success referenceImageUrl fallback', () => {
    const fn = extractFunctionBody(API, 'generateMemeWithReference');

    assert.ok(
      !/\breturn\s+referenceImageUrl\s*;/.test(fn),
      `regression: generateMemeWithReference must not \`return referenceImageUrl\` as a\n` +
        `fallback -- that reports the unmodified input image as a generated meme (fake\n` +
        `success). call site: src/utils/api.ts (generateMemeWithReference)\n${fn}`
    );
    assert.ok(
      /\breturn\s+result\??\.\s*imageUrl\b/.test(fn),
      `generateMemeWithReference must return the imageUrl produced by the meme-generator\n` +
        `function. call site: src/utils/api.ts (generateMemeWithReference)`
    );
    assert.ok(
      /throw new Error\(/.test(fn),
      `generateMemeWithReference must throw on failure instead of silently returning an\n` +
        `image. call site: src/utils/api.ts (generateMemeWithReference)`
    );

    const call = extractEdgeCall(fn, 'meme-generator');
    for (const required of ['topText', 'bottomText', 'referenceImageUrl', 'provider']) {
      assert.ok(
        topLevelKeys(call).includes(required),
        `generateMemeWithReference must send '${required}' to meme-generator.\n${call}`
      );
    }
  });

  // ------------------------------------------------------------------ //
  // Bilateral key check: what the frontend sends vs what the fn reads   //
  // ------------------------------------------------------------------ //

  test('frontend payload keys line up with what each edge function destructures from req.json()', () => {
    const cartoonFn = extractFunctionBody(API, 'generateCartoonImage');
    const ghibliFn = extractFunctionBody(API, 'generateGhibliStyleImage');
    const memeFn = extractFunctionBody(API, 'generateMemeWithReference');

    // Optional extras an edge function may read that the frontend need not send.
    const optional = new Set(['idempotencyKey']);

    const pairs = [
      {
        fn: 'image-to-video',
        sent: () => topLevelKeys(extractEdgeCall(VIDEO_API, 'image-to-video')),
        where: 'src/utils/videoApi.ts (convertImageToVideo)',
      },
      {
        fn: 'cartoon-style',
        sent: () => topLevelKeys(extractEdgeCall(cartoonFn, 'cartoon-style')),
        where: 'src/utils/api.ts (generateCartoonImage)',
      },
      {
        fn: 'ghibli-image',
        sent: () => topLevelKeys(extractEdgeCall(ghibliFn, 'ghibli-image')),
        where: 'src/utils/api.ts (generateGhibliStyleImage)',
      },
      {
        fn: 'meme-generator',
        sent: () => topLevelKeys(extractEdgeCall(memeFn, 'meme-generator')),
        where: 'src/utils/api.ts (generateMemeWithReference)',
      },
    ];

    for (const { fn, sent, where } of pairs) {
      const readKeys = requestKeys(edgeSource(fn));
      const sentKeys = sent();

      const missing = readKeys.filter((key) => !optional.has(key) && !sentKeys.includes(key));
      assert.deepEqual(
        missing,
        [],
        `${fn}: the function reads { ${show(readKeys)} } but ${where} does not send ` +
          `{ ${show(missing)} }. The value is silently ignored / defaults apply.`
      );

      // Keys the frontend may keep sending that the function no longer reads
      // (BYOK removed provider selection from these OpenAI-only functions).
      const deadKeys = new Map([
        ['cartoon-style', ['provider']],
        ['ghibli-image', ['provider']],
      ]);
      const ignorable = deadKeys.get(fn) ?? [];

      const extra = sentKeys.filter((key) => !readKeys.includes(key) && !ignorable.includes(key));
      assert.deepEqual(
        extra,
        [],
        `${fn}: ${where} sends { ${show(extra)} } but the function never reads those keys ` +
          `from the request body ({ ${show(readKeys)} }).`
      );
    }
  });

  // ------------------------------------------------------------------ //
  // Credential / provider hygiene                                       //
  // ------------------------------------------------------------------ //

  const FORBIDDEN_PROVIDER_STRINGS = [
    ['api.freepik.com', 'the retired Freepik provider endpoint'],
    ['api.magnific.com', 'the retired Magnific provider endpoint'],
    ['x-freepik-api-key', 'the Freepik API key header'],
    ['x-magnific-api-key', 'the Magnific API key header'],
  ];

  const FORBIDDEN_CREDENTIAL_STRINGS = [
    ['VITE_OPENAI_API_KEY', 'a shared OpenAI credential exposed to the browser bundle'],
    ['VITE_GEMINI_API_KEY', 'a shared Gemini credential exposed to the browser bundle'],
    ['VITE_FREEPIK_API_KEY', 'a shared Freepik credential exposed to the browser bundle'],
  ];

  test('no shipped file under src/ references a retired Freepik/Magnific provider endpoint or key header', () => {
    const offenders = [];
    for (const file of SHIPPED_SRC_FILES) {
      const source = readFileSync(file, 'utf8');
      for (const [needle, why] of FORBIDDEN_PROVIDER_STRINGS) {
        if (source.includes(needle)) offenders.push(`${relative(REPO_ROOT, file)}: '${needle}' (${why})`);
      }
    }
    assert.deepEqual(offenders, [], `retired provider references must not ship in the frontend:\n${offenders.join('\n')}`);
  });

  test('no shipped file under src/ embeds a shared VITE_* AI provider credential', () => {
    const offenders = [];
    for (const file of SHIPPED_SRC_FILES) {
      const source = readFileSync(file, 'utf8');
      for (const [needle, why] of FORBIDDEN_CREDENTIAL_STRINGS) {
        if (source.includes(needle)) offenders.push(`${relative(REPO_ROOT, file)}: '${needle}' (${why})`);
      }
    }
    assert.deepEqual(offenders, [], `shared AI credentials must live only in the edge functions:\n${offenders.join('\n')}`);
  });

  // ------------------------------------------------------------------ //
  // BYOK-first credit gating                                            //
  // ------------------------------------------------------------------ //

  // Extract the body of a function declaration from a source file. Skips the
  // parameter list (which may contain its own braces via object type
  // annotations) and returns the balanced function body.
  function extractFunction(source, signature) {
    const start = source.indexOf(signature);
    assert.ok(start !== -1, `signature not found: ${signature}`);
    const parenIndex = source.indexOf('(', start + signature.length - 1);
    assert.ok(parenIndex !== -1, `no parameter list for: ${signature}`);
    // Skip the balanced parameter list.
    let depth = 0;
    let i = parenIndex;
    for (; i < source.length; i += 1) {
      if (source[i] === '(') depth += 1;
      else if (source[i] === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    const openIndex = source.indexOf('{', i);
    assert.ok(openIndex !== -1, `no body for: ${signature}`);
    return sliceBalanced(source, openIndex);
  }

  const BYOK_GUARD = "getUserProvidedApiKey(";

  // A function is BYOK-first when the user-key guard appears before the first
  // metered edge-function call and before any credit check.
  function assertByokFirst(body, meteredCall, label) {
    const guardAt = body.indexOf(BYOK_GUARD);
    const edgeAt = body.indexOf(meteredCall);
    assert.ok(guardAt !== -1, `${label}: must gate on the user's own key (${BYOK_GUARD})`);
    assert.ok(edgeAt !== -1, `${label}: must still contain ${meteredCall}`);
    assert.ok(
      guardAt < edgeAt,
      `${label}: the user-key guard must come BEFORE the metered edge call (guard@${guardAt}, edge@${edgeAt})`
    );
    return body;
  }

  test('generateImageWithDalle routes BYOK users before the metered edge call', () => {
    const body = extractFunction(API, 'export async function generateImageWithDalle');
    assertByokFirst(body, "callEdgeFunction('image-generation'", 'generateImageWithDalle');
    assert.ok(
      body.includes('generateImageWithUserKey'),
      'generateImageWithDalle: the BYOK branch must call the direct user-key path'
    );
  });

  test('generateImageWithGptImage routes BYOK users before the metered edge call', () => {
    const body = extractFunction(API, 'export async function generateImageWithGptImage');
    assertByokFirst(body, "callEdgeFunction('image-generation'", 'generateImageWithGptImage');
  });

  test('generateActionFigure routes BYOK users before the metered edge call', () => {
    const body = extractFunction(API, 'export async function generateActionFigure');
    assertByokFirst(body, "callEdgeFunction('action-figure'", 'generateActionFigure');
  });

  test('generateCartoonImage routes BYOK users before the metered edge call', () => {
    const body = extractFunction(API, 'export async function generateCartoonImage');
    assertByokFirst(body, "callEdgeFunction('cartoon-style'", 'generateCartoonImage');
  });

  test('imageGenerationService.generateImage performs no credit checks or deductions', () => {
    // 100% BYOK: there is no platform-funded path left, so the service must
    // not reference credits at all -- the provider bills the user directly.
    const service = read('src/services/imageGenerationService.ts');
    const body = extractFunction(service, 'export async function generateImage');
    assert.ok(!body.includes('checkCredits'), 'generateImage must not check credits (credits were removed)');
    assert.ok(!body.includes('check_and_deduct'), 'generateImage must not deduct credits');
    assert.ok(!/InsufficientCredits/.test(body), 'generateImage must not gate on InsufficientCredits');
    assert.ok(
      body.indexOf(BYOK_GUARD) !== -1,
      'generateImage must still gate on the user\'s own key'
    );
    assert.ok(
      body.indexOf(BYOK_GUARD) < body.indexOf("callEdgeFunction('image-generation'"),
      'generateImage: the user-key guard must precede the metered edge call'
    );
  });

  test('the BYOK path never calls a metered edge function or a credit RPC', () => {
    const helper = extractFunction(API, 'async function generateImageWithUserKey');
    assert.ok(!helper.includes('callEdgeFunction'), 'generateImageWithUserKey must not call any edge function');
    assert.ok(!helper.includes('check_and_deduct'), 'generateImageWithUserKey must not deduct credits');
    assert.ok(!helper.includes('checkCredits'), 'generateImageWithUserKey must not check credits');
    assert.ok(
      helper.includes('https://api.openai.com/v1/images/generations'),
      'generateImageWithUserKey must call the OpenAI Images API directly with the user key'
    );
  });
}
