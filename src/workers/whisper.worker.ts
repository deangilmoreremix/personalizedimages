/// <reference lib="webworker" />
/**
 * On-device speech-to-text (Transformers.js + Whisper tiny.en). Audio never leaves the browser.
 * Input: mono Float32Array at 16 kHz. Output: text plus word-level timestamps.
 */
import { configureOnnx, createPipeline } from './onnxEnv';

configureOnnx();

const MODEL = 'Xenova/whisper-tiny.en';
type Asr = (audio: Float32Array, opts: Record<string, unknown>) => Promise<{ text: string; chunks?: Array<{ text: string; timestamp: [number, number | null] }> }>;
let asr: Promise<Asr> | null = null;

const post = (msg: Record<string, unknown>) => (self as unknown as Worker).postMessage(msg);

function load(id: number): Promise<Asr> {
  if (!asr) {
    asr = createPipeline<Asr>('automatic-speech-recognition', MODEL, progress => post({ id, type: 'download', progress })).catch(err => {
      asr = null;
      throw err;
    });
  }
  return asr;
}

self.onmessage = async (e: MessageEvent<{ id: number; audio: Float32Array; words: boolean }>) => {
  const { id, audio, words } = e.data;
  try {
    const model = await load(id);
    post({ id, type: 'inference' });
    const out = await model(audio, {
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: words ? 'word' : false
    });
    post({ id, type: 'done', text: (out.text || '').trim(), chunks: out.chunks || [] });
  } catch (err) {
    asr = null;
    post({ id, type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
};
