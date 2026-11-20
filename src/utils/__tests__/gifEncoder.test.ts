import { describe, it, expect } from 'vitest';
import { encodeGifFrames } from '../gifEncoder';

const solid = (w: number, h: number, rgb: [number, number, number]) => {
  const d = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < d.length; i += 4) {
    d[i] = rgb[0];
    d[i + 1] = rgb[1];
    d[i + 2] = rgb[2];
    d[i + 3] = 255;
  }
  return d;
};
const ascii = (b: Uint8Array, from: number, to: number) => String.fromCharCode(...b.slice(from, to));

describe('encodeGifFrames', () => {
  it('writes a valid animated GIF with the right size, frame count, delays and loop flag', () => {
    const frames = [
      { data: solid(16, 8, [255, 0, 0]), width: 16, height: 8, delayMs: 100 },
      { data: solid(16, 8, [0, 255, 0]), width: 16, height: 8, delayMs: 250 },
      { data: solid(16, 8, [0, 0, 255]), width: 16, height: 8, delayMs: 500 }
    ];
    const bytes = encodeGifFrames(frames);
    expect(ascii(bytes, 0, 6)).toBe('GIF89a');
    expect(bytes[6] | (bytes[7] << 8)).toBe(16); // logical screen width
    expect(bytes[8] | (bytes[9] << 8)).toBe(8); // height
    expect(bytes[bytes.length - 1]).toBe(0x3b); // trailer

    // Graphic control extensions (0x21 0xF9) carry the delays in centiseconds.
    const delays: number[] = [];
    for (let i = 0; i < bytes.length - 8; i++) {
      if (bytes[i] === 0x21 && bytes[i + 1] === 0xf9 && bytes[i + 2] === 4) delays.push(bytes[i + 4] | (bytes[i + 5] << 8));
    }
    expect(delays).toEqual([10, 25, 50]);
    expect(ascii(bytes, 0, bytes.length)).toContain('NETSCAPE2.0'); // loop extension
  });

  it('reports progress and respects maxColors', () => {
    const progress: number[] = [];
    const noisy = new Uint8ClampedArray(32 * 32 * 4);
    for (let i = 0; i < noisy.length; i++) noisy[i] = (i * 37) % 256;
    const f = [{ data: noisy, width: 32, height: 32, delayMs: 100 }];
    const small = encodeGifFrames(f, { maxColors: 4, onProgress: d => progress.push(d) });
    const big = encodeGifFrames(f, { maxColors: 256 });
    expect(progress).toEqual([1]);
    expect(small.length).toBeLessThan(big.length);
  });

  it('floors tiny delays and rejects bad input', () => {
    const bytes = encodeGifFrames([{ data: solid(2, 2, [1, 2, 3]), width: 2, height: 2, delayMs: 1 }]);
    const i = bytes.findIndex((b, k) => b === 0x21 && bytes[k + 1] === 0xf9);
    expect(bytes[i + 4] | (bytes[i + 5] << 8)).toBe(2); // 20 ms floor -> 2 cs
    expect(() => encodeGifFrames([])).toThrow('No frames');
    expect(() => encodeGifFrames([{ data: new Uint8ClampedArray(3), width: 2, height: 2, delayMs: 100 }])).toThrow('wrong pixel buffer');
  });
});
