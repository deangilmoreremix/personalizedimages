/** Pure layer-editor model: no React/Konva imports so it is easy to test. */
export type LayerBase = {
  id: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  visible: boolean;
};

export type ImageLayer = LayerBase & {
  type: 'image';
  src: string; // data URL or blob/object URL
  width: number;
  height: number;
};

export type TextLayer = LayerBase & {
  type: 'text';
  /** May contain [TOKENS] such as [FIRSTNAME]. */
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  bold: boolean;
  align: 'left' | 'center' | 'right';
  width: number;
  stroke: string;
  strokeWidth: number;
};

export type Layer = ImageLayer | TextLayer;

export interface EditorDoc {
  width: number;
  height: number;
  background: string;
  layers: Layer[]; // bottom -> top
}


let counter = 0;
export const newLayerId = () => `layer_${Date.now().toString(36)}_${(counter++).toString(36)}`;

export function createTextLayer(doc: Pick<EditorDoc, 'width' | 'height'>, over: Partial<TextLayer> = {}): TextLayer {
  const width = Math.round(doc.width * 0.8);
  return {
    id: newLayerId(),
    type: 'text',
    name: 'Text',
    text: 'Hello [FIRSTNAME]!',
    x: Math.round((doc.width - width) / 2),
    y: Math.round(doc.height * 0.4),
    width,
    rotation: 0,
    opacity: 1,
    visible: true,
    fontSize: Math.max(24, Math.round(doc.width / 14)),
    fontFamily: 'Inter, Arial, sans-serif',
    fill: '#ffffff',
    bold: true,
    align: 'center',
    stroke: '#000000',
    strokeWidth: 2,
    ...over
  };
}

export function createImageLayer(doc: Pick<EditorDoc, 'width' | 'height'>, src: string, natural: { width: number; height: number }, over: Partial<ImageLayer> = {}): ImageLayer {
  // Fit inside the canvas, centered.
  const scale = Math.min(doc.width / natural.width, doc.height / natural.height, 1);
  const width = Math.round(natural.width * scale);
  const height = Math.round(natural.height * scale);
  return {
    id: newLayerId(),
    type: 'image',
    name: 'Image',
    src,
    width,
    height,
    x: Math.round((doc.width - width) / 2),
    y: Math.round((doc.height - height) / 2),
    rotation: 0,
    opacity: 1,
    visible: true,
    ...over
  };
}

import { compactKey, resolveTokens, unmatchedTokens, type TokenValues } from '../../utils/tokenText';
export { compactKey, resolveTokens, unmatchedTokens };
export type { TokenValues };

/** Distinct token names used by any text layer, in first-use order. */
export function collectTokens(layers: Layer[]): string[] {
  const seen = new Set<string>();
  for (const l of layers) {
    if (l.type !== 'text') continue;
    for (const m of l.text.matchAll(/\[([A-Za-z0-9_]+)\]/g)) seen.add(m[1].toUpperCase());
  }
  return [...seen];
}

export function moveLayer(layers: Layer[], id: string, dir: 'up' | 'down' | 'top' | 'bottom'): Layer[] {
  const i = layers.findIndex(l => l.id === id);
  if (i < 0) return layers;
  const next = layers.slice();
  const [item] = next.splice(i, 1);
  const to = dir === 'up' ? Math.min(layers.length - 1, i + 1) : dir === 'down' ? Math.max(0, i - 1) : dir === 'top' ? layers.length - 1 : 0;
  next.splice(to, 0, item);
  return next;
}

export function updateLayer(layers: Layer[], id: string, patch: Partial<Layer>): Layer[] {
  return layers.map(l => (l.id === id ? ({ ...l, ...patch } as Layer) : l));
}

export const removeLayer = (layers: Layer[], id: string) => layers.filter(l => l.id !== id);

/** Normalise a CSV header to a token name: "First Name" -> FIRST_NAME. */
export function headerToToken(h: string): string {
  return h.trim().replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').toUpperCase();
}

/** Turn parsed CSV rows into token value maps (keys normalised). */
export function rowsToTokenValues(rows: Array<Record<string, string>>): TokenValues[] {
  return rows
    .map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [headerToToken(k), String(v ?? '').trim()])))
    .filter(r => Object.values(r).some(v => v !== ''));
}

export function safeFileName(s: string, fallback = 'image'): string {
  const out = s.replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60);
  return out || fallback;
}

export function serializeDoc(doc: EditorDoc): unknown {
  return JSON.parse(JSON.stringify(doc));
}

export function isEditorDoc(x: any): x is EditorDoc {
  return !!x && typeof x.width === 'number' && typeof x.height === 'number' && Array.isArray(x.layers);
}

export { parseCsv } from '../../utils/csv';
