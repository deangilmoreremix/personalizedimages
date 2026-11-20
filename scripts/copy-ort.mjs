// Copies the ONNX Runtime WASM files used by Transformers.js into public/ort so they are
// served same-origin (the app's CSP blocks CDN scripts). Runs before dev/build.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';

const out = 'public/ort';
// jsep = WebGPU build, asyncify = plain WASM (CPU) build. Both are loaded on demand only.
const dir = 'node_modules/onnxruntime-web/dist';
const files = ['jsep', 'asyncify'].flatMap(v => [
  [`${dir}/ort-wasm-simd-threaded.${v}.mjs`, `ort-wasm-simd-threaded.${v}.mjs`],
  [`${dir}/ort-wasm-simd-threaded.${v}.wasm`, `ort-wasm-simd-threaded.${v}.wasm`]
]);
mkdirSync(out, { recursive: true });
for (const [src, name] of files) {
  if (!existsSync(src)) {
    console.warn(`[copy-ort] missing ${src} - on-device AI will fall back to the CDN`);
    continue;
  }
  copyFileSync(src, `${out}/${name}`);
}
console.log('[copy-ort] done');
