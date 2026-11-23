/**
 * Local-first storage (IndexedDB): projects (layer editor docs, prompts, token sets) and generated
 * images. Works offline, needs no login, and keeps images as Blobs (not giant base64 strings).
 */
const DB_NAME = 'videoremix-local';
const DB_VERSION = 1;

export interface LocalProject {
  id: string;
  name: string;
  kind: 'layers' | 'prompt' | 'other';
  /** JSON-serialisable document (e.g. layer-editor state, prompt + tokens). */
  data: unknown;
  /** Small data URL preview. */
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
}

export interface LocalImage {
  id: string;
  blob: Blob;
  prompt: string;
  model?: string;
  source?: string;
  projectId?: string;
  createdAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

export function isLocalStoreSupported(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDb(): Promise<IDBDatabase> {
  if (!isLocalStoreSupported()) return Promise.reject(new Error('IndexedDB is not available'));
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' }).createIndex('updatedAt', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('images')) {
          const s = db.createObjectStore('images', { keyPath: 'id' });
          s.createIndex('createdAt', 'createdAt');
          s.createIndex('projectId', 'projectId');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    });
  }
  return dbPromise;
}

/** Test helper: forget the cached connection. */
export function _resetLocalStore() {
  dbPromise?.then(db => db.close()).catch(() => {});
  dbPromise = null;
}

function tx<T>(store: 'projects' | 'images', mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    db =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        t.oncomplete = () => resolve(req.result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      })
  );
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;

/* ---------------- projects ---------------- */

export async function saveProject(
  input: Partial<LocalProject> & Pick<LocalProject, 'name' | 'data'>
): Promise<LocalProject> {
  const now = Date.now();
  const existing = input.id ? await getProject(input.id) : undefined;
  const project: LocalProject = {
    id: input.id || newId(),
    name: input.name,
    kind: input.kind || existing?.kind || 'other',
    data: input.data,
    thumbnail: input.thumbnail ?? existing?.thumbnail,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
  await tx('projects', 'readwrite', s => s.put(project));
  return project;
}

export const getProject = (id: string): Promise<LocalProject | undefined> => tx('projects', 'readonly', s => s.get(id));

/** Most recently updated first. */
export async function listProjects(): Promise<LocalProject[]> {
  const all = await tx<LocalProject[]>('projects', 'readonly', s => s.getAll());
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export const deleteProject = (id: string) => tx('projects', 'readwrite', s => s.delete(id)).then(() => undefined);

/* ---------------- images ---------------- */

/** Decode a data URL without fetch(): the app's CSP does not allow data: in connect-src. */
export function dataUrlToBlob(dataUrl: string): Blob {
  const m = /^data:([^;,]*)(;base64)?,(.*)$/s.exec(dataUrl);
  if (!m) throw new Error('Not a data URL');
  const mime = m[1] || 'application/octet-stream';
  const raw = m[2] ? atob(m[3]) : decodeURIComponent(m[3]);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function saveImage(
  input: { image: Blob | string; prompt: string; model?: string; source?: string; projectId?: string }
): Promise<LocalImage> {
  const blob = typeof input.image === 'string' ? (input.image.startsWith('data:') ? dataUrlToBlob(input.image) : await (await fetch(input.image)).blob()) : input.image;
  const rec: LocalImage = {
    id: newId(),
    blob,
    prompt: input.prompt,
    model: input.model,
    source: input.source,
    projectId: input.projectId,
    createdAt: Date.now()
  };
  await tx('images', 'readwrite', s => s.put(rec));
  return rec;
}

/** Most recent first. */
export async function listImages(limit = 50): Promise<LocalImage[]> {
  const all = await tx<LocalImage[]>('images', 'readonly', s => s.getAll());
  return all.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export const deleteImage = (id: string) => tx('images', 'readwrite', s => s.delete(id)).then(() => undefined);

/** Keep storage bounded: drop the oldest images beyond `max`. */
export async function pruneImages(max = 200): Promise<number> {
  const all = (await tx<LocalImage[]>('images', 'readonly', s => s.getAll())).sort((a, b) => b.createdAt - a.createdAt);
  const extra = all.slice(max);
  for (const img of extra) await deleteImage(img.id);
  return extra.length;
}

export async function storageEstimate(): Promise<{ usage: number; quota: number } | null> {
  try {
    const e = await navigator.storage?.estimate?.();
    return e ? { usage: e.usage || 0, quota: e.quota || 0 } : null;
  } catch {
    return null;
  }
}

/** Ask the browser not to evict our data under storage pressure. */
export async function requestPersistence(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
