/// <reference lib="webworker" />
/**
 * On-device background removal (Transformers.js + MODNet, Apache-2.0).
 * Runs in a worker so inference never blocks the UI.
 */
import type { RawImage } from '@huggingface/transformers';
import { configureOnnx, createPipeline } from './onnxEnv';

configureOnnx();

const MODEL = 'Xenova/modnet';
type Segmenter = (input: unknown) => Promise<RawImage>;
let segmenter: Promise<Segmenter> | null = null;

const post = (msg: Record<string, unknown>) => (self as unknown as Worker).postMessage(msg);

function load(id: number): Promise<Segmenter> {
  if (!segmenter) {
    segmenter = createPipeline<Segmenter>('background-removal', MODEL, progress => post({ id, type: 'download', progress })).catch(err => {
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
