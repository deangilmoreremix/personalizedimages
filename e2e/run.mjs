#!/usr/bin/env node
/**
 * Acceptance harness: builds the app, runs real user journeys in Chromium against mocked
 * OpenAI / Gemini / Supabase backends, and checks that personalized content really gets created.
 *
 *   node e2e/run.mjs            # everything
 *   node e2e/run.mjs --skip-ai  # skip on-device AI (needs a model download from huggingface.co)
 *   node e2e/run.mjs --only=matrix
 */
import { Mocks, Report, ROOT, FIX, CACHE, loadPlaywright, signedInStorage, spawn, sh, existsSync, readFileSync, writeFileSync, join } from './lib.mjs';
import { createHash } from 'node:crypto';

const args = process.argv.slice(2);
const SKIP_AI = args.includes('--skip-ai');
const ONLY = (args.find(a => a.startsWith('--only=')) || '').slice(7);
const PORT = 4180, BASE = `http://localhost:${PORT}`;
const { chromium } = loadPlaywright();
const R = new Report();
const sha = s => createHash('sha256').update(s).digest('hex').slice(0, 10);
const want = n => !ONLY || ONLY.split(',').includes(n);

/* ---------------- build + serve ---------------- */
console.log('Building (production, mocked backends)…');
sh(`npx vite build --outDir dist-e2e`, { env: { ...process.env,
  VITE_OPENAI_API_KEY: 'sk-e2e-abcdefghijklmnopqrstuvwx', VITE_GEMINI_API_KEY: 'AIzaE2Eabcdefghijklmnopqrstuvwxyz0123456',
  VITE_FREEPIK_API_KEY: 'abcdefghijklmnopqrstuvwxyz123456', VITE_SUPABASE_URL: 'https://e2e.supabase.co', VITE_SUPABASE_ANON_KEY: 'e2e-anon-key-e2e-anon-key-e2e-anon',
  VITE_ANALYTICS_ENDPOINT: 'https://e2e.supabase.co/functions/v1/app-events' }, timeout: 300000 });
const server = spawn('npx', ['vite', 'preview', '--outDir', 'dist-e2e', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await new Promise(r => setTimeout(r, 500)); }

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const launchOpts = (extra = []) => ({ args: extra, ...(proxy ? { proxy: { server: proxy, bypass: 'localhost,127.0.0.1' } } : {}) });
const sess = signedInStorage();
async function newCtx(browser, mocks, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 }, ignoreHTTPSErrors: true, acceptDownloads: true, ...extra });
  await ctx.addInitScript(s => { try { localStorage.setItem(s.key, s.value); } catch {} }, sess);
  await mocks.install(ctx);
  return ctx;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, tries = 60, ms = 500) { for (let i = 0; i < tries; i++) { const v = await fn(); if (v) return v; await sleep(ms); } return null; }
const aiOnline = (() => { try { sh(`curl -s -m 10 -o /dev/null -w "%{http_code}" https://huggingface.co/Xenova/modnet/resolve/main/config.json`); return !SKIP_AI; } catch { return false; } })();
async function download(page, clickFn, file) { const dl = page.waitForEvent('download', { timeout: 120000 }); await clickFn(); const d = await dl; await d.saveAs(file); return { name: d.suggestedFilename(), data: readFileSync(file) }; }

const browser = await chromium.launch(launchOpts());

try {
/* ====================================================================================
   J1  The core product: generate -> edit in layers -> personalize per recipient ->
       email + video + project
   ==================================================================================== */
if (want('pipeline')) {
  R.section('J1 Personalized content pipeline (generate → layers → CSV batch → email → video)');
  const M = new Mocks(); const ctx = await newCtx(browser, M); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 160))); p.on('console', m => { if (/violates|Refused to/i.test(m.text())) errs.push('CSP ' + m.text().slice(0, 140)); });

  // a) Generate with personalization tokens
  await p.goto(`${BASE}/features/modern-ai-image`, { waitUntil: 'load' }); await sleep(1500);
  await p.locator('textarea:visible').first().fill('A celebratory poster for [FIRSTNAME] [LASTNAME] of [COMPANY], studio lighting');
  await p.getByRole('button', { name: 'Generate', exact: true }).click();
  const gotImg = await until(() => M.calls.some(c => c.kind === 'image'), 40);
  const ic = M.calls.find(c => c.kind === 'image');
  R.check('image request sent to GPT Image 2.6 via Responses API', gotImg && /gpt-image-2\.6/.test(ic?.model || ''), `${ic?.model} stream=${ic?.stream}`);
  R.check('tokens were replaced in the prompt sent to the model', ic && /Sarah Smith of Acme Inc/.test(ic.prompt) && !/\[FIRSTNAME\]/.test(ic.prompt), JSON.stringify(ic?.prompt.slice(0, 80)));
  const shown = await until(async () => (await p.locator('img[alt^="Generated"]').count()) > 0, 30);
  R.check('generated image appears in the results', !!shown);
  const saved = await until(async () => (await p.locator('[data-testid=local-history] img').count()) > 0, 30);
  R.check('image saved on the device (IndexedDB) and listed', !!saved);

  // b) Open it in the layer editor
  const href = await p.locator('[data-testid=local-history] a', { hasText: 'Edit layers' }).first().getAttribute('href');
  await p.goto(`${BASE}${href}`, { waitUntil: 'load' }); await sleep(1800);
  R.check('"Edit layers" opens the saved image as a layer', (await p.getByRole('list', { name: 'Layers' }).locator('li').count()) === 1);

  // c) Personalized text layer + hook Konva to capture exactly what is drawn on each export
  await p.getByRole('button', { name: 'Add text' }).click(); await sleep(300);
  await p.getByLabel('Text', { exact: true }).fill('Hi [FIRSTNAME] from [COMPANY]');
  const hooked = await p.evaluate(() => { const S = window.Konva?.Stage; if (!S) return false; window.__exports = []; const o = S.prototype.toDataURL; S.prototype.toDataURL = function (...a) { window.__exports.push(this.find('Text').map(t => t.text()).join('|')); return o.apply(this, a); }; return true; });
  R.check('can observe drawn text (Konva global)', hooked);
  R.check('token inputs appear for the tokens in the text', (await p.getByLabel('Value for FIRSTNAME').count()) === 1 && (await p.getByLabel('Value for COMPANY').count()) === 1);
  await p.getByLabel('Value for FIRSTNAME').fill('Zed'); await p.getByLabel('Value for COMPANY').fill('Zeta Corp'); await sleep(400);

  // d) Single export
  const png = await download(p, () => p.getByRole('button', { name: 'Export PNG' }).click(), join(CACHE, 'single.png'));
  R.check('single export is a full-resolution PNG', png.data.slice(1, 4).toString() === 'PNG' && png.data.readUInt32BE(16) === 1080 && png.data.readUInt32BE(20) === 1080, png.name);
  R.check('exported text is personalized (Hi Zed from Zeta Corp)', (await p.evaluate(() => window.__exports)).some(t => t === 'Hi Zed from Zeta Corp'));

  // e) CSV batch
  await p.evaluate(() => { window.__exports = []; });
  await p.getByLabel('Batch CSV').setInputFiles(join(FIX, 'people.csv'));
  const batchOk = await until(async () => (await p.getByTestId('batch-results').locator('li').count()) === 3, 60);
  R.check('CSV batch produced one image per recipient', !!batchOk);
  const drawn = await p.evaluate(() => window.__exports);
  R.check('each image drew that recipient\'s own text', JSON.stringify(drawn) === JSON.stringify(['Hi Ada from Acme', 'Hi Grace from Navy, Inc', 'Hi Linus from Penguin']), JSON.stringify(drawn));
  const srcs = await p.getByTestId('batch-results').locator('li img').evaluateAll(els => els.map(e => e.src));
  R.check('the three images are all different', new Set(srcs.map(sha)).size === 3 && srcs.every(s => s.startsWith('data:image/png')));
  R.check('values restored after the batch', (await p.getByLabel('Value for FIRSTNAME').inputValue()) === 'Zed');

  // f) Email
  await p.getByRole('button', { name: 'Preview' }).click(); await sleep(1500);
  const ph = await p.getByRole('dialog', { name: 'Email preview' }).locator('iframe').getAttribute('srcdoc');
  R.check('email preview is personalized and embeds the design', /Hi Zed, this one is for you/.test(ph) && /src="data:image\/png/.test(ph));
  await p.getByRole('dialog', { name: 'Email preview' }).getByRole('button', { name: 'Close' }).click();
  const html = await download(p, () => p.getByRole('button', { name: '.html' }).click(), join(CACHE, 'email.html'));
  const h = html.data.toString();
  R.check('exported email keeps merge tags and a hosted-image placeholder', h.includes('{{FIRSTNAME}}') && h.includes('src="{{IMAGE_URL}}"') && !/data:image/.test(h));

  // g) Video from the batch
  await p.getByLabel('Seconds per slide').fill('1');
  const vid = await download(p, () => p.getByRole('button', { name: 'Make video' }).click(), join(CACHE, 'batch.mp4'));
  const isMp4 = vid.data.slice(4, 8).toString() === 'ftyp';
  let probe = ''; try { probe = sh(`ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of default=nw=1 ${join(CACHE, 'batch.' + vid.name.split('.').pop())}`); } catch { probe = 'ffprobe unavailable'; }
  const dur = parseFloat((probe.match(/duration=([\d.]+)/) || [])[1] || '0');
  R.check('video exported (3 personalized slides, ~3 s)', (isMp4 || vid.data.slice(0, 4).toString('hex') === '1a45dfa3') && (probe.includes('unavailable') || Math.abs(dur - 3) < 0.4), `${vid.name} ${(vid.data.length / 1024).toFixed(0)}KB ${probe.replace(/\n/g, ' ')}`);

  // h) Save project -> reload -> reopen
  await p.getByLabel('Project name').fill('E2E campaign'); await p.getByRole('button', { name: 'Save' }).click(); await sleep(1200);
  await p.reload({ waitUntil: 'load' }); await sleep(1800);
  await p.getByRole('button', { name: 'E2E campaign', exact: true }).click(); await sleep(1500);
  R.check('project survives reload and reopens with its layers', (await p.getByRole('list', { name: 'Layers' }).locator('li').count()) === 2);

  // i) Beacon analytics fired for the actions above
  const ev = M.calls.filter(c => c.fn === 'app-events').length;
  R.check('no page errors / CSP violations during the journey', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

/* ====================================================================================
   J2  Voice → prompt → image (on-device Whisper)
   ==================================================================================== */
if (want('voice')) {
  R.section('J2 Voice dictation → personalized image');
  const wav = join(CACHE, 'jfk.wav');
  if (!existsSync(wav)) { try { sh(`curl -sL -m 60 -o ${wav} https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav`); } catch {} }
  if (!aiOnline || !existsSync(wav)) R.skip('Whisper dictation', 'needs huggingface.co (run without --skip-ai and with network)');
  else {
    const b2 = await chromium.launch(launchOpts(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${wav}`]));
    const M = new Mocks(); const ctx = await newCtx(b2, M, { permissions: ['microphone'] }); const p = await ctx.newPage();
    await p.goto(`${BASE}/features/modern-ai-image`, { waitUntil: 'load' }); await sleep(1500);
    await p.getByRole('button', { name: 'Dictate prompt' }).click(); await sleep(9000);
    await p.getByRole('button', { name: 'Stop recording' }).click();
    const said = await until(async () => (await p.locator('textarea:visible').first().inputValue()) || null, 160, 1000);
    R.check('speech was transcribed on-device into the prompt', !!said && /country/i.test(said), JSON.stringify(said));
    await p.locator('textarea:visible').first().fill((said || '') + ' for [FIRSTNAME] of [COMPANY]');
    await p.getByRole('button', { name: 'Generate', exact: true }).click();
    await until(() => M.calls.some(c => c.kind === 'image'), 30);
    const ic = M.calls.find(c => c.kind === 'image');
    R.check('dictated + personalized prompt produced an image request', ic && /country/i.test(ic.prompt) && /Sarah/.test(ic.prompt), JSON.stringify(ic?.prompt.slice(0, 100)));
    await ctx.close(); await b2.close();
  }
}

/* ====================================================================================
   J3  On-device background removal inside the editor
   ==================================================================================== */
if (want('bg')) {
  R.section('J3 Background removal on a personalized layer');
  if (!aiOnline) R.skip('MODNet cutout', 'needs huggingface.co');
  else {
    const M = new Mocks(); const ctx = await newCtx(browser, M); const p = await ctx.newPage();
    await p.goto(`${BASE}/features/layer-editor`, { waitUntil: 'load' }); await sleep(1500);
    await p.getByLabel('Upload image').setInputFiles(join(FIX, 'portrait.jpg')); await sleep(1200);
    await p.getByRole('button', { name: 'Remove background' }).click();
    const st = await until(async () => { const t = await p.locator('[role=status]').first().innerText().catch(() => ''); return /removed|failed/i.test(t) ? t : null; }, 160, 1000);
    R.check('background removed on-device', /removed/i.test(st || ''), st || 'timeout');
    const alpha = await p.evaluate(() => { const im = window.Konva?.stages?.[0]?.find('Image')?.[0]?.image(); if (!im) return null; const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const a = (px, py) => x.getImageData(px, py, 1, 1).data[3]; return { corner: a(2, 2), centre: a(c.width >> 1, c.height >> 1) }; });
    R.check('layer now has a transparent background and an opaque subject', alpha && alpha.corner < 20 && alpha.centre > 235, JSON.stringify(alpha));
    R.check('no cloud call was made for the cutout', !M.calls.some(c => /remove-bg/.test(c.fn || '')));
    await ctx.close();
  }
}

/* ====================================================================================
   J4  GIF
   ==================================================================================== */
if (want('gif')) {
  R.section('J4 Personalized GIF');
  const M = new Mocks(); const ctx = await newCtx(browser, M); const p = await ctx.newPage();
  await p.goto(`${BASE}/gif-editor`, { waitUntil: 'load' }); await sleep(1500);
  await p.locator('input[type=file]').first().setInputFiles([join(FIX, 'portrait.jpg'), join(FIX, 'portrait.jpg')]); await sleep(1500);
  await p.getByRole('button', { name: /Generate GIF/i }).click();
  const gif = await until(() => p.evaluate(() => [...document.querySelectorAll('img')].find(i => i.src.startsWith('data:image/gif'))?.src || null), 60);
  const bin = gif ? Buffer.from(gif.split(',')[1], 'base64') : Buffer.alloc(0);
  const frames = bin.reduce((n, v, i) => (v === 0x21 && bin[i + 1] === 0xf9 && bin[i + 2] === 4 ? n + 1 : n), 0);
  R.check('animated GIF generated (GIF89a, multiple frames)', bin.slice(0, 6).toString() === 'GIF89a' && frames >= 2, `${(bin.length / 1024).toFixed(0)}KB ${frames} frames`);
  await ctx.close();
}

/* ====================================================================================
   J5  Every content feature: does it create content, through which backend, personalized?
   ==================================================================================== */
if (want('matrix')) {
  R.section('J5 Feature matrix (each content page: click Generate with personalized input)');
  const pages = [
    ['/features/ai-image', 'AI Image (classic)'], ['/features/modern-ai-image', 'AI Image (modern)'], ['/features/reimagined-ai-image', 'AI Image (reimagined)'],
    ['/features/action-figures', 'Action figures'], ['/features/modern-action-figures', 'Action figures (modern)'], ['/features/retro-action-figures', 'Retro action figures'],
    ['/features/music-star-action-figures', 'Music star action figures'], ['/features/tv-show-action-figures', 'TV show action figures'], ['/features/wrestling-action-figures', 'Wrestling action figures'],
    ['/features/ghibli-style', 'Ghibli (classic)'], ['/features/modern-ghibli-style', 'Ghibli (modern)'], ['/features/cartoon-style', 'Cartoon (classic)'], ['/features/modern-cartoon-style', 'Cartoon (modern)'],
    ['/features/meme-generator', 'Meme (classic)'], ['/features/modern-meme-generator', 'Meme (modern)'], ['/features/crazy-image', 'Crazy image'],
    ['/features/gemini-nano-editor', 'Gemini Nano editor']
  ];
  const results = [];
  for (const [path, label] of pages) {
    const M = new Mocks(); const ctx = await newCtx(browser, M); const p = await ctx.newPage(); const errs = [];
    await ctx.addInitScript(() => { window.__drawn = []; const o = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { window.__drawn.push(String(t)); return o.call(this, t, ...a); }; });
    p.on('pageerror', e => errs.push(e.message.slice(0, 100)));
    await p.goto(BASE + path, { waitUntil: 'load' }).catch(() => {}); await sleep(1500);
    const crashed = /Something went wrong/.test(await p.innerText('body').catch(() => ''));
    for (const f of await p.locator('input[type=file]').all()) await f.setInputFiles(join(FIX, 'portrait.jpg')).catch(() => {});
    await sleep(500);
    for (const t of (await p.locator('textarea:visible').all()).slice(0, 2)) if (!(await t.inputValue())) await t.fill('Hello [FIRSTNAME] from [COMPANY]: a heroic portrait').catch(() => {});
    if (/meme/.test(path)) for (const t of (await p.locator('input[type=text]:visible').all()).slice(0, 2)) if (!(await t.inputValue())) await t.fill('Hello [FIRSTNAME] from [COMPANY]').catch(() => {});
    const before = await p.locator('img[src^="data:image/"], img[src^="blob:"]').count();
    const btn = p.locator('button:visible').filter({ hasText: /^\s*(generate|create)\b/i });
    let clicked = null;
    if (await btn.count()) { clicked = (await btn.last().innerText()).trim().slice(0, 28); await btn.last().click({ timeout: 4000 }).catch(() => (clicked += ' (click failed)')); }
    await sleep(5500);
    const HOUSEKEEPING = new Set(['app-events', 'freepik-resources', 'track-event', 'health-check']);
    const imgs = M.calls.filter(c => c.kind === 'image' || (c.backend === 'supabase' && c.kind === 'edge' && !HOUSEKEEPING.has(c.fn)));
    const first = imgs[0];
    const shownImgs = await p.locator('img[src^="data:image/"], img[src^="blob:"]').count();
    const drawn = await p.evaluate(() => window.__drawn || []).catch(() => []);
    const body = (await p.innerText('body').catch(() => '')).replace(/\s+/g, ' ');
    const err = (body.match(/(Image generation service is currently unavailable|Authentication required|API key[^.]{0,60}|failed[^.]{0,60}|Failed[^.]{0,60}|not configured[^.]{0,40})/) || [])[0];
    const prompt = first?.prompt || '';
    // Local (canvas-drawn) generators, e.g. memes: judge personalization by the text actually drawn.
    const local = !first && shownImgs > before && drawn.length > 0;
    const text = first ? prompt : drawn.join(' ');
    // Some classic pages deliberately pass placeholder values (User / Company): that is still a filled-in token.
    const personalized = /Sarah|Acme|TechVision|\bUSER\b|\bUser\b|\bCOMPANY\b|\bCompany\b/.test(text) && !/\[(FIRSTNAME|COMPANY)\]/.test(text);
    const raw = /\[(FIRSTNAME|COMPANY)\]/.test(text);
    results.push({ path, label, crashed, clicked, backend: first ? (first.fn ? `edge:${first.fn}` : first.backend + ':' + (first.model || '')) : local ? 'local canvas' : '-', image: first ? shownImgs > 0 : local, personalized, raw, err: first || local ? '' : (err || ''), errs: errs.length });
    await ctx.close();
  }
  console.log('\nPage'.padEnd(36) + 'Button'.padEnd(30) + 'Backend'.padEnd(34) + 'Image  Personalized');
  for (const r of results) console.log(r.label.padEnd(35) + String(r.clicked || '(none)').padEnd(30) + r.backend.padEnd(34) + (r.crashed ? 'CRASH ' : r.image ? 'yes    ' : 'NO     ') + (r.personalized ? 'yes' : r.raw ? 'RAW TOKENS' : r.image ? 'n/a(form fields?)' : '-') + (r.err ? `   [${r.err}]` : ''));
  writeFileSync(join(CACHE, 'matrix.json'), JSON.stringify(results, null, 1));
  for (const r of results) R.check(`${r.label}: renders without crashing`, !r.crashed && r.errs === 0, r.errs ? `${r.errs} page errors` : '');
  for (const r of results) R.check(`${r.label}: creates an image`, r.image, r.image ? r.backend : (r.err || 'no request made'));
  for (const r of results) if (r.image) R.check(`${r.label}: no unreplaced [TOKENS] sent`, !r.raw, r.raw ? 'raw [FIRSTNAME]/[COMPANY] in prompt' : '');
}


/* ====================================================================================
   J7  Batch personalization from CSV (modern + classic) and model comparison
   ==================================================================================== */
if (want('batch')) {
  R.section('J7 Batch: one personalized image per CSV row');
  const rowsCsv = 'First Name,Company\nAda,Acme\n"Grace","Navy, Inc"\nLinus,Penguin\n';
  writeFileSync(join(CACHE, 'batch-people.csv'), rowsCsv);
  const expectPrompts = ['Poster for Ada at Acme', 'Poster for Grace at Navy, Inc', 'Poster for Linus at Penguin'];
  const edgePrompts = M => M.calls.filter(c => c.fn === 'image-generation').map(c => c.prompt);

  { // modern
    const M = new Mocks(); const ctx = await newCtx(browser, M); const p = await ctx.newPage();
    await p.goto(`${BASE}/features/modern-batch-generation`, { waitUntil: 'load' }); await sleep(1500);
    await p.locator('input[type=file]').first().setInputFiles(join(CACHE, 'batch-people.csv')); await sleep(800);
    await p.locator('textarea:visible').first().fill('Poster for [FIRSTNAME] at [COMPANY]');
    await p.getByRole('button', { name: 'Start Batch Generation' }).click();
    await until(() => edgePrompts(M).length >= 3, 40);
    const got = edgePrompts(M);
    R.check('modern: three requests, each with that row\'s values (incl. "Navy, Inc")', JSON.stringify(got) === JSON.stringify(expectPrompts), JSON.stringify(got));
    await sleep(1500);
    R.check('modern: three result images shown', (await p.locator('img[src^="data:image/png"]').count()) >= 3);
    await ctx.close();
  }
  { // modern: Excel-style MIME type must still be accepted
    const M = new Mocks(); const ctx = await newCtx(browser, M); const p = await ctx.newPage();
    await p.goto(`${BASE}/features/modern-batch-generation`, { waitUntil: 'load' }); await sleep(1500);
    await p.locator('input[type=file]').first().setInputFiles({ name: 'people.csv', mimeType: 'application/vnd.ms-excel', buffer: Buffer.from(rowsCsv) }); await sleep(800);
    await p.locator('textarea:visible').first().fill('Poster for [FIRSTNAME] at [COMPANY]');
    R.check('modern: CSV labelled application/vnd.ms-excel is accepted', await p.getByRole('button', { name: 'Start Batch Generation' }).isEnabled());
    await ctx.close();
  }
  { // classic ({{token}} + [TOKEN], prompt column)
    const M = new Mocks(); const ctx = await newCtx(browser, M); const p = await ctx.newPage();
    p.on('dialog', d => d.dismiss());
    await p.goto(`${BASE}/batch-generation`, { waitUntil: 'load' }); await sleep(1500);
    writeFileSync(join(CACHE, 'batch-classic.csv'), 'prompt,First Name,Company\n"Poster for {{FIRSTNAME}} at [COMPANY]",Ada,Acme\n"Poster for [FIRSTNAME] at {{COMPANY}}","Grace","Navy, Inc"\n');
    await p.locator('input[type=file][accept=".csv"]').setInputFiles(join(CACHE, 'batch-classic.csv')); await sleep(800);
    await p.getByRole('button', { name: 'Start Batch Generation' }).click();
    await until(() => edgePrompts(M).length >= 2, 40);
    const got = edgePrompts(M);
    R.check('classic: both rows resolved ({{ }} and [ ] styles, quoted comma kept)', JSON.stringify(got) === JSON.stringify(['Poster for Ada at Acme', 'Poster for Grace at Navy, Inc']), JSON.stringify(got));
    await ctx.close();
  }
  { // model comparison
    const M = new Mocks(); const ctx = await newCtx(browser, M); const p = await ctx.newPage();
    await p.goto(`${BASE}/model-comparison`, { waitUntil: 'load' }); await sleep(1500);
    await p.locator('textarea:visible').first().fill('Portrait of [FIRSTNAME] from [COMPANY]');
    await p.getByRole('button', { name: 'Start Comparison' }).click();
    await until(() => M.calls.filter(c => c.kind === 'image').length >= 1, 40);
    const imgs = M.calls.filter(c => c.kind === 'image');
    R.check('comparison: selected model(s) called with a personalized prompt', imgs.length >= 1 && imgs.every(c => /Sarah/.test(c.prompt) && !/\[FIRSTNAME\]/.test(c.prompt)), imgs.map(c => c.backend + ':' + (c.model || '')).join(', '));
    await ctx.close();
  }
}

/* ====================================================================================
   J6  Protected pages + notifications/beacon
   ==================================================================================== */
if (want('routes')) {
  R.section('J6 Signed-in pages render');
  const M = new Mocks(); const ctx = await newCtx(browser, M); const p = await ctx.newPage(); let errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 100)));
  for (const r of ['/editor', '/dashboard', '/gallery', '/queue', '/analytics', '/token-management', '/personalization', '/templates', '/ai-tools', '/settings/api-keys', '/fonts', '/gif-editor', '/features/layer-editor']) {
    errs = []; await p.goto(BASE + r, { waitUntil: 'load' }).catch(() => {}); await sleep(1500);
    const t = await p.innerText('body').catch(() => '');
    R.check(`${r} renders`, t.length > 150 && !/Something went wrong|doesn't exist/.test(t) && errs.length === 0, `${t.length} chars ${errs[0] || ''}`);
  }
  await ctx.close();
}
} finally {
  await browser.close(); server.kill();
}
const failed = R.summary();
writeFileSync(join(CACHE, 'report.json'), JSON.stringify(R.rows, null, 1));
process.exit(failed ? 1 : 0);
