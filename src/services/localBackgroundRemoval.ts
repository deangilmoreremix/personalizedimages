/**
 * Free, private background removal that runs entirely in the browser.
 * The first call downloads the model (~25 MB, cached by the browser afterwards).
 */
export interface LocalRemovalOptions {
  format?: 'png' | 'webp';
  /** 0-100. 0-80 = model download (first run only), 80-100 = inference. */
  onProgress?: (percent: number, stage: 'download' | 'inference') => void;
  signal?: AbortSignal;
}

let worker: Worker | null = null;
let nextId = 1;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/backgroundRemoval.worker.ts', import.meta.url), { type: 'module' });
  }
  return worker;
}

export function isLocalRemovalSupported(): boolean {
  return typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined';
}

/** Resolves to an object URL of a transparent image. Caller should URL.revokeObjectURL when done. */
export function removeBackgroundLocal(dataUrl: string, opts: LocalRemovalOptions = {}): Promise<string> {
  const { format = 'png', onProgress, signal } = opts;
  if (!isLocalRemovalSupported()) {
    return Promise.reject(new Error('On-device processing is not supported in this browser'));
  }

  return new Promise((resolve, reject) => {
    const w = getWorker();
    const id = nextId++;

    const cleanup = () => {
      w.removeEventListener('message', onMessage);
      w.removeEventListener('error', onError);
      signal?.removeEventListener('abort', onAbort);
    };
    const onMessage = (e: MessageEvent) => {
      if (e.data?.id !== id) return;
      switch (e.data.type) {
        case 'download':
          onProgress?.(Math.min(80, e.data.progress * 0.8), 'download');
          break;
        case 'inference':
          onProgress?.(85, 'inference');
          break;
        case 'done':
          cleanup();
          onProgress?.(100, 'inference');
          resolve(URL.createObjectURL(e.data.blob as Blob));
          break;
        case 'error':
          cleanup();
          reject(new Error(e.data.message || 'Background removal failed'));
          break;
      }
    };
    const onError = (e: ErrorEvent) => {
      cleanup();
      worker = null;
      reject(new Error(e.message || 'Background removal worker crashed'));
    };
    const onAbort = () => {
      cleanup();
      // The model call can't be cancelled mid-flight; drop the worker so the next call starts clean.
      worker?.terminate();
      worker = null;
      reject(new DOMException('Aborted', 'AbortError'));
    };

    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);
    signal?.addEventListener('abort', onAbort);
    w.postMessage({ id, dataUrl, mime: format === 'webp' ? 'image/webp' : 'image/png' });
  });
}
