// Shared helpers for the acceptance harness: mock backends, fixtures, pass/fail reporting.
import { createRequire } from 'node:module';
import { execSync, spawn } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const FIX = join(ROOT, 'e2e', 'fixtures');
export const CACHE = join(ROOT, 'e2e', '.cache');
mkdirSync(CACHE, { recursive: true });

export function loadPlaywright() {
  const req = createRequire(import.meta.url);
  try { return req('playwright'); } catch {}
  const g = execSync('npm root -g').toString().trim();
  return createRequire(join(g, 'x.js'))('playwright');
}

/* ---------- tiny PNG encoder: solid/gradient images whose colour depends on a seed ---------- */
function crc32(buf) {
  let c, crc = ~0;
  for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; }
  return ~crc >>> 0;
}
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); };
export function makePng(seed = 0, size = 256) {
  const hue = (seed * 67) % 360;
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const o = y * (size * 3 + 1) + 1 + x * 3;
      raw[o] = (hue + x) % 256; raw[o + 1] = (hue * 2 + y) % 256; raw[o + 2] = (255 - ((x + y) >> 1)) % 256;
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const hash = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/* ---------- mock backends (recorded) ---------- */
export class Mocks {
  calls = [];           // {backend, kind, prompt, ...}
  seed = 1;
  textOf(j) { const last = Array.isArray(j.input) ? j.input.at(-1) : null; const c = last?.content; return typeof j.input === 'string' ? j.input : Array.isArray(c) ? (c.find(p => p.type === 'input_text')?.text || '') : (c || ''); }

  async install(ctx) {
    const PNG = () => makePng(this.seed++).toString('base64');
    const ev = o => `event: ${o.type}\ndata: ${JSON.stringify(o)}\n\n`;

    await ctx.route('https://api.openai.com/v1/responses', async r => {
      const j = JSON.parse(r.request().postData() || '{}'); const tool = j.tools?.find(t => t.type === 'image_generation');
      const prompt = this.textOf(j);
      if (tool) {
        const b64 = makePng(hash(prompt) % 360).toString('base64'); const item = { type: 'image_generation_call', id: 'ig_' + this.calls.length, result: b64, revised_prompt: prompt };
        this.calls.push({ backend: 'openai', kind: 'image', prompt, model: tool.model, action: tool.action, stream: !!j.stream, hasInput: JSON.stringify(j.input).includes('input_image') });
        if (j.stream) return r.fulfill({ status: 200, contentType: 'text/event-stream', body: ev({ type: 'response.image_generation_call.partial_image', partial_image_index: 0, partial_image_b64: b64 }) + ev({ type: 'response.output_item.done', item }) + ev({ type: 'response.completed', response: { id: 'r', output: [item] } }) });
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'r', output: [item] }) });
      }
      const name = j.text?.format?.name; this.calls.push({ backend: 'openai', kind: 'text', prompt, schema: name });
      const text = name === 'prompt_enhancement' ? JSON.stringify({ enhanced: prompt, improvements: ['ok'] }) : name === 'prompt_analysis' ? JSON.stringify({ quality_score: 80, clarity: 80, specificity: 80, completeness: 80, issues: [], suggestions: [], missing_elements: [], strengths: [] }) : name === 'prompt_suggestions' ? '{"suggestions":["soft light"]}' : 'A vivid personalized description.';
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'r', model: j.model, output: [{ type: 'message', content: [{ type: 'output_text', text }] }] }) });
    });

    await ctx.route(/https:\/\/generativelanguage\.googleapis\.com\/.*/, async r => {
      const j = JSON.parse(r.request().postData() || '{}'); const prompt = (j.contents?.[0]?.parts || []).map(p => p.text).filter(Boolean).join(' ');
      this.calls.push({ backend: 'gemini', kind: 'image', prompt, hasInput: JSON.stringify(j).includes('inline_data') || JSON.stringify(j).includes('inlineData') });
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/png', data: makePng(hash(prompt) % 360).toString('base64') } }, { text: 'ok' }] } }] }) });
    });

    await ctx.route(/https:\/\/e2e\.supabase\.co\/functions\/v1\/([^/?]+).*/, async r => {
      const fn = new URL(r.request().url()).pathname.split('/').pop(); let body = {}; try { body = JSON.parse(r.request().postData() || '{}'); } catch {}
      const prompt = body.prompt || body.basePrompt || body.topText && `${body.topText} ${body.bottomText}` || '';
      if (fn === 'app-events') return r.fulfill({ status: 204 });
      this.calls.push({ backend: 'supabase', kind: 'edge', fn, prompt, userKeyHeader: !!r.request().headers()['x-user-api-key'] });
      const img = 'data:image/png;base64,' + makePng(hash(prompt) % 360).toString('base64');
      r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ imageUrl: img, imageUrls: [img], description: 'A vivid personalized description.', creditsRemaining: 99, variations: [img], recommendations: ['a', 'b'] }) });
    });
    await ctx.route(/https:\/\/e2e\.supabase\.co\/rest\/v1\/.*/, r => {
      const m = r.request().method(); const u = r.request().url();
      this.calls.push({ backend: 'supabase', kind: 'rest', method: m, table: new URL(u).pathname.split('/').pop() });
      if (/rpc/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ allowed: true, balance: 99 }) });
      r.fulfill({ status: m === 'POST' ? 201 : 200, contentType: 'application/json', body: m === 'POST' ? '[]' : '[]' });
    });
    await ctx.route(/https:\/\/e2e\.supabase\.co\/auth\/v1\/.*/, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'u1', email: 'e2e@test.dev', aud: 'authenticated', role: 'authenticated' }) }));
  }
  since(n) { return this.calls.slice(n); }
}

export function signedInStorage() {
  const session = { access_token: 'e2e.jwt.token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'x', user: { id: 'u1', email: 'e2e@test.dev', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} } };
  return { key: 'sb-e2e-auth-token', value: JSON.stringify(session) };
}

/* ---------- reporting ---------- */
export class Report {
  rows = [];
  section(name) { console.log(`\n=== ${name} ===`); this.cur = name; }
  check(name, pass, detail = '') { this.rows.push({ section: this.cur, name, pass: !!pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); return !!pass; }
  skip(name, why) { this.rows.push({ section: this.cur, name, pass: null, detail: why }); console.log(`SKIP  ${name}  — ${why}`); }
  summary() {
    const p = this.rows.filter(r => r.pass === true).length, f = this.rows.filter(r => r.pass === false).length, s = this.rows.filter(r => r.pass === null).length;
    console.log(`\n==== ${p} passed, ${f} failed, ${s} skipped ====`);
    this.rows.filter(r => r.pass === false).forEach(r => console.log(`  FAILED [${r.section}] ${r.name} ${r.detail}`));
    return f;
  }
}

export function sh(cmd, opts = {}) { return execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], ...opts }).toString(); }
export { spawn, existsSync, writeFileSync, readFileSync, join };
