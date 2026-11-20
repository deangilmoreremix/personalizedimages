/**
 * Animated GIF encoding with gifenc (replaces gifshot): small, fast, no web-worker blobs,
 * and per-frame palettes for better colour. Everything runs in the browser.
 */
import { GIFEncoder, applyPalette, quantize } from 'gifenc';

export interface RawFrame {
  /** RGBA pixels, width * height * 4 */
  data: Uint8ClampedArray | Uint8Array;
  width: number;
  height: number;
  /** Frame delay in milliseconds */
  delayMs: number;
}

export interface EncodeOptions {
  /** 2-256. Fewer colours = smaller file (email-optimised GIFs use 64). */
  maxColors?: number;
  /** 0 = loop forever (default), -1 = play once. */
  repeat?: number;
  onProgress?: (done: number, total: number) => void;
}

/** Encode already-rasterised frames. Pure (no DOM): easy to test. */
export function encodeGifFrames(frames: RawFrame[], opts: EncodeOptions = {}): Uint8Array {
  if (!frames.length) throw new Error('No frames to encode');
  const { maxColors = 256, repeat = 0, onProgress } = opts;
  const colors = Math.min(256, Math.max(2, Math.round(maxColors)));
  const enc = GIFEncoder();
  frames.forEach((f, i) => {
    if (f.data.length !== f.width * f.height * 4) throw new Error(`Frame ${i} has the wrong pixel buffer size`);
    const palette = quantize(f.data, colors);
    const index = applyPalette(f.data, palette);
    // GIF delay is in 1/100 s; browsers clamp very small values, so keep a 20 ms floor.
    enc.writeFrame(index, f.width, f.height, { palette, delay: Math.max(20, Math.round(f.delayMs)), repeat, first: i === 0 });
    onProgress?.(i + 1, frames.length);
  });
  enc.finish();
  return enc.bytes();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load a frame image'));
    img.src = src;
  });
}

function bytesToDataUrl(bytes: Uint8Array, mime = 'image/gif'): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(new Blob([bytes as BlobPart], { type: mime }));
  });
}

export interface ImageFrameInput {
  src: string; // data URL (or same-origin URL)
  delayMs: number;
}

/**
 * Draw each image onto a width x height canvas (cover-fit, centred) and encode.
 * Resolves to a GIF data URL.
 */
export async function encodeGifFromImages(
  frames: ImageFrameInput[],
  size: { width: number; height: number },
  opts: EncodeOptions = {}
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas is not available');

  const raw: RawFrame[] = [];
  for (const f of frames) {
    const img = await loadImage(f.src);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size.width, size.height);
    const s = Math.max(size.width / img.naturalWidth, size.height / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (size.width - w) / 2, (size.height - h) / 2, w, h);
    raw.push({ data: ctx.getImageData(0, 0, size.width, size.height).data, width: size.width, height: size.height, delayMs: f.delayMs });
  }
  return bytesToDataUrl(encodeGifFrames(raw, opts));
}
