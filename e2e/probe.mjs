// Debug helper: node e2e/probe.mjs <path> [--click="Button text"] -> screenshot + visible text + console errors
import { Mocks, loadPlaywright, signedInStorage, FIX, CACHE, join } from './lib.mjs';
const { chromium } = loadPlaywright();
const path = process.argv[2]; const clickText = (process.argv.find(a => a.startsWith('--click=')) || '').slice(8);
const b = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } } : {});
const ctx = await b.newContext({ viewport: { width: 1400, height: 900 }, ignoreHTTPSErrors: true });
const s = signedInStorage(); await ctx.addInitScript(x => localStorage.setItem(x.key, x.value), s);
const M = new Mocks(); await M.install(ctx); const p = await ctx.newPage();
p.on('console', m => { if (['error', 'warning'].includes(m.type()) && !/font|Freepik|Stock|GoTrue|asset/i.test(m.text())) console.log(' [' + m.type() + ']', m.text().slice(0, 220)); });
p.on('pageerror', e => console.log(' [pageerror]', e.message.slice(0, 200)));
await p.goto('http://localhost:4180' + path, { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 1500));
if (clickText) { await p.getByRole('button', { name: clickText }).first().click(); await new Promise(r => setTimeout(r, 1500)); }
console.log('BUTTONS:', (await p.locator('button:visible').allInnerTexts()).map(t => t.trim()).filter(Boolean).slice(0, 25).join(' | '));
console.log('CALLS:', M.calls.filter(c => !['freepik-resources'].includes(c.fn)).map(c => c.backend + ':' + (c.fn || c.model || c.kind)).join(', '));
await p.screenshot({ path: join(CACHE, 'probe.png') }); await b.close();
