import { describe, it, expect, vi, beforeEach } from 'vitest';

class FakeWorker {
  static instances: FakeWorker[] = [];
  listeners: Record<string, Array<(e: any) => void>> = { message: [], error: [] };
  posted: any[] = [];
  terminated = false;
  constructor() {
    FakeWorker.instances.push(this);
  }
  addEventListener(t: string, fn: (e: any) => void) {
    this.listeners[t].push(fn);
  }
  removeEventListener(t: string, fn: (e: any) => void) {
    this.listeners[t] = this.listeners[t].filter(f => f !== fn);
  }
  postMessage(m: any) {
    this.posted.push(m);
  }
  terminate() {
    this.terminated = true;
  }
  emit(data: any) {
    this.listeners.message.forEach(f => f({ data }));
  }
}

describe('localBackgroundRemoval', () => {
  beforeEach(() => {
    vi.resetModules();
    FakeWorker.instances = [];
    (globalThis as any).Worker = FakeWorker;
    (URL as any).createObjectURL = vi.fn(() => 'blob:result');
  });

  it('reports progress and resolves with an object URL', async () => {
    const { removeBackgroundLocal } = await import('../localBackgroundRemoval');
    const progress: Array<[number, string]> = [];
    const p = removeBackgroundLocal('data:image/png;base64,AAA', { format: 'webp', onProgress: (n, s) => progress.push([n, s]) });
    const w = FakeWorker.instances[0];
    const { id, mime } = w.posted[0];
    expect(mime).toBe('image/webp');

    w.emit({ id: id + 999, type: 'done', blob: new Blob() }); // other request: ignored
    w.emit({ id, type: 'download', progress: 50 });
    w.emit({ id, type: 'inference' });
    w.emit({ id, type: 'done', blob: new Blob(['x']) });

    await expect(p).resolves.toBe('blob:result');
    expect(progress).toEqual([[40, 'download'], [85, 'inference'], [100, 'inference']]);
  });

  it('rejects when the worker reports an error', async () => {
    const { removeBackgroundLocal } = await import('../localBackgroundRemoval');
    const p = removeBackgroundLocal('data:x');
    const w = FakeWorker.instances[0];
    w.emit({ id: w.posted[0].id, type: 'error', message: 'model failed' });
    await expect(p).rejects.toThrow('model failed');
  });

  it('aborts and terminates the worker', async () => {
    const { removeBackgroundLocal } = await import('../localBackgroundRemoval');
    const ac = new AbortController();
    const p = removeBackgroundLocal('data:x', { signal: ac.signal });
    ac.abort();
    await expect(p).rejects.toMatchObject({ name: 'AbortError' });
    expect(FakeWorker.instances[0].terminated).toBe(true);
  });

  it('rejects when Workers are unsupported', async () => {
    delete (globalThis as any).Worker;
    const { removeBackgroundLocal, isLocalRemovalSupported } = await import('../localBackgroundRemoval');
    expect(isLocalRemovalSupported()).toBe(false);
    await expect(removeBackgroundLocal('data:x')).rejects.toThrow(/not supported/);
  });
});
