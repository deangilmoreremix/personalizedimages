/// <reference lib="webworker" />
/**
 * On-device background removal (Transformers.js + MODNet, Apache-2.0).
 * Runs in a worker so inference never blocks the UI.
 */
import { env, pipeline, RawImage } from '@huggingface/transformers';

env.allowLocalModels = false;
// Serve the ONNX runtime from our own origin (see scripts/copy-ort.mjs); CSP blocks CDNs.
if (env.backends.onnx.wasm) {
  env.backends.onnx.wasm.wasmPaths = '/ort/';
}

const MODEL = 'Xenova/modnet';

type Segmenter = (input: unknown) => Promise<RawImage>;
let segmenter: Promise<Segmenter> | null = null;

const post = (msg: Record<string, unknown>) => (self as unknown as Worker).postMessage(msg);

async function hasUsableWebGPU(): Promise<boolean> {
  try {
    const gpu = (navigator as any).gpu;
    return !!gpu && !!(await gpu.requestAdapter());
  } catch {
    return false;
  }
}

function load(id: number): Promise<Segmenter> {
  if (!segmenter) {
    const create = (device: 'webgpu' | 'wasm') =>
      (pipeline as any)('background-removal', MODEL, {
        device,
        progress_callback: (p: any) => {
          if (p?.status === 'progress' && typeof p.progress === 'number') {
            post({ id, type: 'download', progress: p.progress });
          }
        }
      }) as Promise<Segmenter>;

    segmenter = (async () => {
      // Prefer the GPU when a real adapter exists; otherwise (or if it fails) use WASM on the CPU.
      if (await hasUsableWebGPU()) {
        try {
          return await create('webgpu');
        } catch (err) {
          console.warn('WebGPU unavailable, falling back to WASM:', err);
        }
      }
      return create('wasm');
    })().catch(err => {
      segmenter = null;
      throw err;
    });
  }
  return segmenter;
}

self.onmessage = async (e: MessageEvent<{ id: number; dataUrl: string; mime: string }>) => {
  const { id, dataUrl, mime } = e.data;
  try {
    const seg = await load(id);
    post({ id, type: 'inference' });
    const out = await seg(dataUrl);
    const blob: Blob = await out.toBlob(mime, 0.95);
    post({ id, type: 'done', blob });
  } catch (err) {
    segmenter = null;
    post({ id, type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
};
