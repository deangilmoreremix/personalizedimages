/** Shared Transformers.js setup for on-device AI workers. */
import { env } from '@huggingface/transformers';

export function configureOnnx() {
  env.allowLocalModels = false;
  // Serve the ONNX runtime from our own origin (see scripts/copy-ort.mjs); the CSP blocks CDNs.
  if (env.backends.onnx.wasm) env.backends.onnx.wasm.wasmPaths = '/ort/';
}

export async function hasUsableWebGPU(): Promise<boolean> {
  try {
    const gpu = (navigator as any).gpu;
    return !!gpu && !!(await gpu.requestAdapter());
  } catch {
    return false;
  }
}

/** Create a pipeline on WebGPU when a real adapter exists, otherwise (or on failure) WASM. */
export async function createPipeline<T>(
  task: string,
  model: string,
  onDownload: (percent: number) => void,
  extra: Record<string, unknown> = {}
): Promise<T> {
  const { pipeline } = await import('@huggingface/transformers');
  const make = (device: 'webgpu' | 'wasm') =>
    (pipeline as any)(task, model, {
      device,
      ...extra,
      progress_callback: (p: any) => {
        if (p?.status === 'progress' && typeof p.progress === 'number') onDownload(p.progress);
      }
    }) as Promise<T>;

  if (await hasUsableWebGPU()) {
    try {
      return await make('webgpu');
    } catch (err) {
      console.warn('WebGPU unavailable, falling back to WASM:', err);
    }
  }
  return make('wasm');
}
