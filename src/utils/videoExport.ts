/**
 * Browser-side video export (WebCodecs via Mediabunny): turns personalized images into a
 * slideshow video with cross-fades. No server, no upload. MP4/H.264 when the browser can encode
 * it, otherwise WebM (VP9/VP8).
 */
import { BufferTarget, CanvasSource, Mp4OutputFormat, Output, QUALITY_HIGH, WebMOutputFormat, canEncodeVideo, type VideoCodec } from 'mediabunny';

export interface SlideshowOptions {
  width: number;
  height: number;
  secondsPerSlide?: number;
  fps?: number;
  /** Cross-fade length in seconds (0 = hard cuts). */
  fadeSeconds?: number;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
}

export interface TimelineFrame {
  /** Presentation timestamp (s) */
  time: number;
  duration: number;
  /** Index of the slide shown; for fades `next` is the incoming slide and `mix` its opacity (0-1). */
  slide: number;
  next?: number;
  mix?: number;
}

/** Even dimensions (required by H.264), clamped to a sane maximum. */
export function evenSize(width: number, height: number, max = 1920): { width: number; height: number } {
  const s = Math.min(1, max / Math.max(width, height));
  const even = (n: number) => Math.max(2, Math.round((n * s) / 2) * 2);
  return { width: even(width), height: even(height) };
}

/** Pure frame plan: one held frame per slide plus fps-rate cross-fade frames between slides. */
export function planTimeline(count: number, { secondsPerSlide = 2, fps = 30, fadeSeconds = 0.4 } = {}): TimelineFrame[] {
  if (count <= 0) return [];
  const frames: TimelineFrame[] = [];
  const fadeFrames = count > 1 ? Math.max(0, Math.round(fadeSeconds * fps)) : 0;
  const fadeLen = fadeFrames / fps;
  // Every slide is on screen for secondsPerSlide: hold + the cross-fade into the next slide
  // (the last slide has no fade, so it simply holds for the full time).
  let t = 0;
  for (let i = 0; i < count; i++) {
    const last = i === count - 1;
    const hold = Math.max(1 / fps, last ? secondsPerSlide : secondsPerSlide - fadeLen);
    frames.push({ time: t, duration: hold, slide: i });
    t += hold;
    if (i < count - 1 && fadeFrames > 0) {
      for (let f = 1; f <= fadeFrames; f++) {
        frames.push({ time: t, duration: 1 / fps, slide: i, next: i + 1, mix: f / (fadeFrames + 1) });
        t += 1 / fps;
      }
    }
  }
  return frames;
}

export async function pickCodec(width: number, height: number): Promise<{ codec: VideoCodec; container: 'mp4' | 'webm' } | null> {
  const tries: Array<{ codec: VideoCodec; container: 'mp4' | 'webm' }> = [
    { codec: 'avc', container: 'mp4' },
    { codec: 'vp9', container: 'webm' },
    { codec: 'vp8', container: 'webm' }
  ];
  for (const t of tries) {
    try {
      if (await canEncodeVideo(t.codec, { width, height })) return t;
    } catch {
      /* try next */
    }
  }
  return null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load a slide image'));
    img.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, alpha = 1) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  ctx.globalAlpha = 1;
}

export interface SlideshowResult {
  blob: Blob;
  mime: string;
  extension: 'mp4' | 'webm';
  codec: VideoCodec;
  durationSeconds: number;
}

export async function exportSlideshow(images: string[], opts: SlideshowOptions): Promise<SlideshowResult> {
  if (!images.length) throw new Error('Add at least one image');
  if (typeof VideoEncoder === 'undefined') throw new Error('Video export needs a browser with WebCodecs (Chrome, Edge or Safari 16.4+)');

  const { fps = 30, secondsPerSlide = 2, fadeSeconds = 0.4, onProgress, signal } = opts;
  const { width, height } = evenSize(opts.width, opts.height);
  const pick = await pickCodec(width, height);
  if (!pick) throw new Error('This browser cannot encode video at this size');

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');

  const imgs = await Promise.all(images.map(loadImage));
  const plan = planTimeline(imgs.length, { secondsPerSlide, fps, fadeSeconds });

  const output = new Output({
    format: pick.container === 'mp4' ? new Mp4OutputFormat() : new WebMOutputFormat(),
    target: new BufferTarget()
  });
  const source = new CanvasSource(canvas, { codec: pick.codec, bitrate: QUALITY_HIGH });
  output.addVideoTrack(source, { frameRate: fps });
  await output.start();

  try {
    for (let i = 0; i < plan.length; i++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const f = plan[i];
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      drawCover(ctx, imgs[f.slide], width, height);
      if (f.next !== undefined && f.mix !== undefined) drawCover(ctx, imgs[f.next], width, height, f.mix);
      await source.add(f.time, f.duration);
      onProgress?.(i + 1, plan.length);
    }
    source.close();
    await output.finalize();
  } catch (e) {
    await output.cancel().catch(() => {});
    throw e;
  }

  const buffer = (output.target as BufferTarget).buffer;
  if (!buffer) throw new Error('Encoding produced no data');
  const mime = pick.container === 'mp4' ? 'video/mp4' : 'video/webm';
  const last = plan[plan.length - 1];
  return { blob: new Blob([buffer], { type: mime }), mime, extension: pick.container, codec: pick.codec, durationSeconds: last.time + last.duration };
}
