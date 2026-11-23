import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveProject, getProject, listProjects, deleteProject,
  saveImage, listImages, deleteImage, pruneImages, dataUrlToBlob, _resetLocalStore
} from '../localStore';

beforeEach(async () => {
  _resetLocalStore();
  await new Promise<void>(res => {
    const r = indexedDB.deleteDatabase('videoremix-local');
    r.onsuccess = r.onerror = r.onblocked = () => res();
  });
});

describe('localStore projects', () => {
  it('saves, reads, updates (keeping createdAt) and deletes', async () => {
    const p = await saveProject({ name: 'Poster', kind: 'layers', data: { layers: [1] } });
    expect((await getProject(p.id))?.name).toBe('Poster');
    await new Promise(r => setTimeout(r, 5));
    const u = await saveProject({ id: p.id, name: 'Poster v2', data: { layers: [1, 2] } });
    expect(u.createdAt).toBe(p.createdAt);
    expect(u.updatedAt).toBeGreaterThan(p.updatedAt);
    expect(u.kind).toBe('layers');
    await deleteProject(p.id);
    expect(await getProject(p.id)).toBeUndefined();
  });

  it('lists most recently updated first', async () => {
    const a = await saveProject({ name: 'A', data: {} });
    await new Promise(r => setTimeout(r, 5));
    await saveProject({ name: 'B', data: {} });
    await new Promise(r => setTimeout(r, 5));
    await saveProject({ id: a.id, name: 'A', data: { x: 1 } });
    expect((await listProjects()).map(p => p.name)).toEqual(['A', 'B']);
  });
});

describe('localStore images', () => {
  it('stores blobs and lists newest first', async () => {
    const i1 = await saveImage({ image: new Blob(['one'], { type: 'image/png' }), prompt: 'first' });
    await new Promise(r => setTimeout(r, 5));
    await saveImage({ image: new Blob(['two'], { type: 'image/png' }), prompt: 'second', model: 'm' });
    const list = await listImages();
    expect(list.map(i => i.prompt)).toEqual(['second', 'first']);
    // (Blob byte-size round-trip is verified in the real-browser e2e; jsdom Blobs don't survive fake-indexeddb.)
    await deleteImage(i1.id);
    expect((await listImages()).length).toBe(1);
  });

  it('prunes beyond the cap, oldest first', async () => {
    for (let i = 0; i < 5; i++) {
      await saveImage({ image: new Blob([String(i)]), prompt: `p${i}` });
      await new Promise(r => setTimeout(r, 3));
    }
    expect(await pruneImages(3)).toBe(2);
    expect((await listImages()).map(i => i.prompt)).toEqual(['p4', 'p3', 'p2']);
  });
});

describe('dataUrlToBlob', () => {
  it('decodes base64 and percent-encoded data URLs without fetch', async () => {
    const b = dataUrlToBlob('data:image/png;base64,QUJD');
    expect(b.type).toBe('image/png');
    expect(b.size).toBe(3);
    expect(dataUrlToBlob('data:text/plain,hi%20there').size).toBe(8);
    expect(() => dataUrlToBlob('http://x')).toThrow();
  });
});
