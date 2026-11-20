/**
 * Free on-device transcription: record from the microphone (or decode a file) and run Whisper
 * in a worker. First use downloads the model (~40 MB, cached afterwards).
 */
export interface WordChunk {
  text: string;
  start: number;
  end: number;
}

export interface TranscriptionResult {
  text: string;
  words: WordChunk[];
}

export interface TranscribeOptions {
  words?: boolean;
  onProgress?: (percent: number, stage: 'download' | 'inference') => void;
  signal?: AbortSignal;
}

let worker: Worker | null = null;
let nextId = 1;
const WHISPER_RATE = 16000;

function getWorker(): Worker {
  if (!worker) worker = new Worker(new URL('../workers/whisper.worker.ts', import.meta.url), { type: 'module' });
  return worker;
}

export function isSpeechToTextSupported(): boolean {
  return typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined';
}

export function isMicSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
}

/** Decode any browser-supported audio into mono 16 kHz Float32 samples. */
export async function decodeToMono16k(data: ArrayBuffer): Promise<Float32Array> {
  const Ctx: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  const ctx = new Ctx();
  try {
    const decoded = await ctx.decodeAudioData(data.slice(0));
    const frames = Math.max(1, Math.ceil(decoded.duration * WHISPER_RATE));
    const offline = new OfflineAudioContext(1, frames, WHISPER_RATE); // down-mixes to mono + resamples
    const src = offline.createBufferSource();
    src.buffer = decoded;
    src.connect(offline.destination);
    src.start();
    const rendered = await offline.startRendering();
    return rendered.getChannelData(0);
  } finally {
    ctx.close().catch(() => {});
  }
}

export function transcribe(audio: Float32Array, opts: TranscribeOptions = {}): Promise<TranscriptionResult> {
  const { words = false, onProgress, signal } = opts;
  if (!isSpeechToTextSupported()) return Promise.reject(new Error('On-device transcription is not supported in this browser'));

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
        case 'done': {
          cleanup();
          onProgress?.(100, 'inference');
          const chunks = (e.data.chunks || []) as Array<{ text: string; timestamp: [number, number | null] }>;
          resolve({
            text: e.data.text as string,
            words: chunks.map(c => ({
              text: c.text.trim(),
              start: c.timestamp[0],
              end: c.timestamp[1] ?? c.timestamp[0] + 0.3
            }))
          });
          break;
        }
        case 'error':
          cleanup();
          reject(new Error(e.data.message || 'Transcription failed'));
          break;
      }
    };
    const onError = (e: ErrorEvent) => {
      cleanup();
      worker = null;
      reject(new Error(e.message || 'Transcription worker crashed'));
    };
    const onAbort = () => {
      cleanup();
      worker?.terminate();
      worker = null;
      reject(new DOMException('Aborted', 'AbortError'));
    };
    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);
    signal?.addEventListener('abort', onAbort);
    w.postMessage({ id, audio, words });
  });
}

export async function transcribeFile(file: Blob, opts: TranscribeOptions = {}): Promise<TranscriptionResult> {
  return transcribe(await decodeToMono16k(await file.arrayBuffer()), opts);
}

export interface MicRecording {
  /** Stops recording and resolves with the captured audio blob. */
  stop: () => Promise<Blob>;
  cancel: () => void;
}

export async function startMicRecording(): Promise<MicRecording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
  const rec = new MediaRecorder(stream);
  const parts: Blob[] = [];
  rec.ondataavailable = e => e.data.size && parts.push(e.data);
  rec.start();
  const release = () => stream.getTracks().forEach(t => t.stop());
  return {
    stop: () =>
      new Promise<Blob>(resolve => {
        rec.onstop = () => {
          release();
          resolve(new Blob(parts, { type: rec.mimeType || 'audio/webm' }));
        };
        rec.state !== 'inactive' ? rec.stop() : rec.onstop?.(new Event('stop'));
      }),
    cancel: () => {
      rec.onstop = null;
      if (rec.state !== 'inactive') rec.stop();
      release();
    }
  };
}
