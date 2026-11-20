import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer as KLayer, Rect, Image as KImage, Text as KText, Transformer } from 'react-konva';
import type Konva from 'konva';
import { ArrowDown, ArrowUp, Crop, Download, Eye, EyeOff, FolderOpen, ImagePlus, Save, Scissors, Trash2, Type, Upload, Users } from 'lucide-react';
import CropDialog from './CropDialog';
import {
  collectTokens, createImageLayer, createTextLayer, isEditorDoc, moveLayer, parseCsv, removeLayer, resolveTokens,
  rowsToTokenValues, safeFileName, serializeDoc, unmatchedTokens, updateLayer, type EditorDoc, type ImageLayer, type Layer, type TextLayer, type TokenValues
} from './layerModel';
import { deleteProject, listImages, listProjects, saveProject, type LocalImage, type LocalProject } from '../../services/localStore';
import { removeBackgroundBlob } from '../../services/localBackgroundRemoval';
import { notifyDone } from '../../services/notifications';
import { trackEvent } from '../../services/analyticsBeacon';

const PRESETS = [
  { label: 'Square 1:1', w: 1080, h: 1080 },
  { label: 'Landscape 16:9', w: 1280, h: 720 },
  { label: 'Portrait 4:5', w: 1080, h: 1350 },
  { label: 'Story 9:16', w: 720, h: 1280 }
];
const DISPLAY = 560; // max on-screen canvas edge (px)

const readAsDataUrl = (b: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(b);
  });

function useHtmlImage(src: string): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    let live = true;
    const i = new Image();
    i.onload = () => live && setImg(i);
    i.src = src;
    return () => {
      live = false;
    };
  }, [src]);
  return img;
}

const nextFrame = () => new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

interface NodeProps {
  layer: Layer;
  text: string;
  selected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<Layer>) => void;
  register: (id: string, node: Konva.Node | null) => void;
}

function LayerNode({ layer, text, onSelect, onChange, register }: NodeProps) {
  const img = useHtmlImage(layer.type === 'image' ? layer.src : '');
  const common = {
    id: layer.id,
    x: layer.x,
    y: layer.y,
    rotation: layer.rotation,
    opacity: layer.opacity,
    visible: layer.visible,
    draggable: true,
    onMouseDown: onSelect,
    onTap: onSelect,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => onChange({ x: Math.round(e.target.x()), y: Math.round(e.target.y()) })
  };
  if (layer.type === 'image') {
    return (
      <KImage
        {...common}
        ref={(n: Konva.Image | null) => register(layer.id, n)}
        image={img || undefined}
        width={layer.width}
        height={layer.height}
        onTransformEnd={e => {
          const n = e.target;
          onChange({ x: Math.round(n.x()), y: Math.round(n.y()), rotation: Math.round(n.rotation()), width: Math.round(n.width() * n.scaleX()), height: Math.round(n.height() * n.scaleY()) });
          n.scaleX(1);
          n.scaleY(1);
        }}
      />
    );
  }
  return (
    <KText
      {...common}
      ref={(n: Konva.Text | null) => register(layer.id, n)}
      text={text}
      width={layer.width}
      fontSize={layer.fontSize}
      fontFamily={layer.fontFamily}
      fontStyle={layer.bold ? 'bold' : 'normal'}
      fill={layer.fill}
      align={layer.align}
      stroke={layer.strokeWidth > 0 ? layer.stroke : undefined}
      strokeWidth={layer.strokeWidth}
      fillAfterStrokeEnabled
      onTransformEnd={e => {
        const n = e.target as Konva.Text;
        onChange({
          x: Math.round(n.x()),
          y: Math.round(n.y()),
          rotation: Math.round(n.rotation()),
          width: Math.round(n.width() * n.scaleX()),
          fontSize: Math.max(8, Math.round(layer.fontSize * n.scaleY()))
        });
        n.scaleX(1);
        n.scaleY(1);
      }}
    />
  );
}

export default function LayerEditor({ initialImageId }: { initialImageId?: string }) {
  const [doc, setDoc] = useState<EditorDoc>({ width: 1080, height: 1080, background: '#1f2937', layers: [] });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tokenValues, setTokenValues] = useState<TokenValues>({ FIRSTNAME: 'Sarah', COMPANY: 'Acme Inc' });
  const [preview, setPreview] = useState(true);
  const [cropId, setCropId] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [history, setHistory] = useState<Array<LocalImage & { url: string }>>([]);
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [projectName, setProjectName] = useState('Untitled design');
  const [batch, setBatch] = useState<Array<{ name: string; url: string }>>([]);
  const [batchBusy, setBatchBusy] = useState(false);

  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const nodes = useRef<Record<string, Konva.Node | null>>({});

  const scale = Math.min(DISPLAY / doc.width, DISPLAY / doc.height);
  const selected = doc.layers.find(l => l.id === selectedId) || null;
  const tokens = useMemo(() => collectTokens(doc.layers), [doc.layers]);

  const register = useCallback((id: string, node: Konva.Node | null) => {
    nodes.current[id] = node;
  }, []);

  // Attach the transformer to the selected node.
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const n = selectedId ? nodes.current[selectedId] : null;
    tr.nodes(n ? [n] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, doc.layers]);

  const patchLayer = (id: string, patch: Partial<Layer>) => setDoc(d => ({ ...d, layers: updateLayer(d.layers, id, patch) }));

  const addImage = useCallback(async (dataUrl: string, name = 'Image') => {
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error('Could not load image'));
      img.src = dataUrl;
    });
    setDoc(d => {
      const layer = createImageLayer(d, dataUrl, { width: img.naturalWidth, height: img.naturalHeight }, { name });
      setSelectedId(layer.id);
      return { ...d, layers: [...d.layers, layer] };
    });
  }, []);

  // Load history + projects; optionally open an image handed over from the generator.
  const refreshLocal = useCallback(async () => {
    try {
      const [imgs, projs] = await Promise.all([listImages(18), listProjects()]);
      setHistory(await Promise.all(imgs.map(async i => ({ ...i, url: await readAsDataUrl(i.blob) }))));
      setProjects(projs);
      return imgs;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    (async () => {
      const imgs = await refreshLocal();
      const hit = initialImageId ? imgs.find(i => i.id === initialImageId) : null;
      if (hit) await addImage(await readAsDataUrl(hit.blob), 'Generated image');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImageId]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await addImage(await readAsDataUrl(f), f.name.replace(/\.[^.]+$/, ''));
    e.target.value = '';
  };

  const addText = () =>
    setDoc(d => {
      const layer = createTextLayer(d);
      setSelectedId(layer.id);
      return { ...d, layers: [...d.layers, layer] };
    });

  const removeBg = async () => {
    if (selected?.type !== 'image') return;
    setStatus('Removing background (on your device)…');
    try {
      const blob = await removeBackgroundBlob(selected.src, {
        onProgress: (_p, st) => setStatus(st === 'download' ? 'Downloading AI model (first use only)…' : 'Removing background…')
      });
      patchLayer(selected.id, { src: await readAsDataUrl(blob), name: `${selected.name} (cutout)` } as Partial<ImageLayer>);
      setStatus('Background removed');
    } catch (e) {
      setStatus(e instanceof Error ? `Background removal failed: ${e.message}` : 'Background removal failed');
    }
  };

  const exportPng = useCallback(async (values?: TokenValues): Promise<string> => {
    const stage = stageRef.current;
    if (!stage) throw new Error('Stage not ready');
    const tr = trRef.current;
    const prevTokens = tokenValues;
    const prevPreview = preview;
    if (values) {
      setTokenValues(values);
      setPreview(true);
    }
    tr?.visible(false);
    await nextFrame();
    const url = stage.toDataURL({ pixelRatio: 1 / scale, mimeType: 'image/png' });
    tr?.visible(true);
    if (values) {
      setTokenValues(prevTokens);
      setPreview(prevPreview);
    }
    return url;
  }, [scale, tokenValues, preview]);

  const download = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFileName(name)}.png`;
    a.click();
  };

  const onCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const rows = rowsToTokenValues(parseCsv(await f.text())).slice(0, 200);
    if (!rows.length) {
      setStatus('CSV has no data rows');
      return;
    }
    const missing = unmatchedTokens(tokens, Object.keys(rows[0]));
    setBatchBusy(true);
    setBatch([]);
    const out: Array<{ name: string; url: string }> = [];
    try {
      for (let i = 0; i < rows.length; i++) {
        setStatus(`Rendering ${i + 1} / ${rows.length}…`);
        const url = await exportPng(rows[i]);
        const label = rows[i].FIRSTNAME || rows[i].FIRST_NAME || rows[i].NAME || rows[i].FULL_NAME || `row${i + 1}`;
        out.push({ name: `${String(i + 1).padStart(3, '0')}_${label}`, url });
      }
      setBatch(out);
      trackEvent('batch_rendered', { count: out.length });
      notifyDone('Personalized images ready', { body: `${out.length} image${out.length === 1 ? '' : 's'} rendered`, tag: 'batch-ready', url: '/features/layer-editor' });
      setStatus(
        `Rendered ${out.length} personalized image${out.length === 1 ? '' : 's'}` +
          (missing.length ? ` — no CSV column for ${missing.map(m => `[${m}]`).join(', ')}` : '')
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Batch failed');
    } finally {
      setBatchBusy(false);
    }
  };

  const downloadAll = async () => {
    for (const b of batch) {
      download(b.url, b.name);
      await new Promise(r => setTimeout(r, 250));
    }
  };

  const save = async () => {
    try {
      const thumb = await exportPng().then(u => u).catch(() => undefined);
      const p = await saveProject({ id: projectId, name: projectName || 'Untitled design', kind: 'layers', data: { doc: serializeDoc(doc), tokenValues }, thumbnail: thumb });
      setProjectId(p.id);
      setStatus(`Saved “${p.name}” on this device`);
      refreshLocal();
    } catch (e) {
      setStatus('Could not save (storage unavailable)');
    }
  };

  const openProject = (p: LocalProject) => {
    const data = p.data as { doc?: unknown; tokenValues?: TokenValues };
    if (!isEditorDoc(data?.doc)) return setStatus('That project could not be opened');
    setDoc(data.doc);
    if (data.tokenValues) setTokenValues(data.tokenValues);
    setProjectId(p.id);
    setProjectName(p.name);
    setSelectedId(null);
    setStatus(`Opened “${p.name}”`);
  };

  const cropTarget = doc.layers.find(l => l.id === cropId && l.type === 'image') as ImageLayer | undefined;

  return (
    <div className="grid lg:grid-cols-[220px_minmax(0,1fr)_300px] gap-4 p-4" data-testid="layer-editor">
      {/* Left: assets */}
      <aside className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border border-dashed border-gray-300 cursor-pointer hover:border-violet-400">
            <Upload className="w-4 h-4" /> Upload image
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} aria-label="Upload image" />
          </label>
          <button onClick={addText} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">
            <Type className="w-4 h-4" /> Add text
          </button>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">Canvas</p>
          <select
            aria-label="Canvas size"
            className="w-full text-sm border border-gray-200 rounded px-2 py-1"
            value={`${doc.width}x${doc.height}`}
            onChange={e => {
              const [w, h] = e.target.value.split('x').map(Number);
              setDoc(d => ({ ...d, width: w, height: h }));
            }}
          >
            {PRESETS.map(p => (
              <option key={p.label} value={`${p.w}x${p.h}`}>{p.label}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 mt-2 text-xs text-gray-600">
            Background
            <input type="color" value={doc.background} onChange={e => setDoc(d => ({ ...d, background: e.target.value }))} aria-label="Background color" />
          </label>
        </div>

        {history.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1"><ImagePlus className="w-3 h-3" /> Saved images</p>
            <div className="grid grid-cols-3 gap-1">
              {history.map(h => (
                <button key={h.id} onClick={() => addImage(h.url, 'Saved image')} title={h.prompt} className="aspect-square rounded overflow-hidden bg-gray-100 hover:ring-2 hover:ring-violet-400">
                  <img src={h.url} alt={`Add: ${h.prompt.slice(0, 30)}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1"><FolderOpen className="w-3 h-3" /> Projects (this device)</p>
          {projects.length === 0 ? (
            <p className="text-xs text-gray-400">None saved yet</p>
          ) : (
            <ul className="space-y-1">
              {projects.slice(0, 8).map(p => (
                <li key={p.id} className="flex items-center gap-1 text-xs">
                  <button onClick={() => openProject(p)} className="flex-1 text-left truncate text-violet-700 hover:underline">{p.name}</button>
                  <button aria-label={`Delete ${p.name}`} onClick={() => deleteProject(p.id).then(refreshLocal)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Center: canvas */}
      <main className="space-y-3 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <input value={projectName} onChange={e => setProjectName(e.target.value)} aria-label="Project name" className="text-sm border border-gray-200 rounded px-2 py-1" />
          <button onClick={save} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded border border-gray-200 hover:bg-gray-50"><Save className="w-4 h-4" /> Save</button>
          <button onClick={async () => download(await exportPng(), projectName)} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-violet-600 text-white hover:bg-violet-700"><Download className="w-4 h-4" /> Export PNG</button>
          {status && <span role="status" className="text-xs text-gray-600">{status}</span>}
        </div>

        <div className="overflow-auto bg-[conic-gradient(#e5e7eb_25%,#f9fafb_0_50%,#e5e7eb_0_75%,#f9fafb_0)] [background-size:16px_16px] rounded-lg inline-block max-w-full">
          <Stage ref={stageRef} width={doc.width * scale} height={doc.height * scale} scaleX={scale} scaleY={scale} onMouseDown={e => e.target === e.target.getStage() && setSelectedId(null)} data-testid="stage">
            <KLayer>
              <Rect x={0} y={0} width={doc.width} height={doc.height} fill={doc.background} onMouseDown={() => setSelectedId(null)} />
              {doc.layers.map(l => (
                <LayerNode
                  key={l.id}
                  layer={l}
                  text={l.type === 'text' ? (preview ? resolveTokens(l.text, tokenValues) : l.text) : ''}
                  selected={l.id === selectedId}
                  onSelect={() => setSelectedId(l.id)}
                  onChange={patch => patchLayer(l.id, patch)}
                  register={register}
                />
              ))}
              <Transformer ref={trRef} rotateEnabled keepRatio={false} boundBoxFunc={(o, n) => (n.width < 8 || n.height < 8 ? o : n)} />
            </KLayer>
          </Stage>
        </div>
      </main>

      {/* Right: layers + properties + personalization */}
      <aside className="space-y-4">
        <section>
          <p className="text-xs font-medium text-gray-700 mb-1">Layers</p>
          {doc.layers.length === 0 ? (
            <p className="text-xs text-gray-400">Upload an image or add text to begin</p>
          ) : (
            <ul className="space-y-1" aria-label="Layers">
              {[...doc.layers].reverse().map(l => (
                <li key={l.id} className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${l.id === selectedId ? 'border-violet-300 bg-violet-50' : 'border-gray-200'}`}>
                  <button onClick={() => setSelectedId(l.id)} className="flex-1 text-left truncate">{l.type === 'text' ? `T  ${l.text.slice(0, 18)}` : l.name}</button>
                  <button aria-label={`Toggle ${l.name}`} onClick={() => patchLayer(l.id, { visible: !l.visible })}>{l.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}</button>
                  <button aria-label={`Move ${l.name} up`} onClick={() => setDoc(d => ({ ...d, layers: moveLayer(d.layers, l.id, 'up') }))}><ArrowUp className="w-3 h-3" /></button>
                  <button aria-label={`Move ${l.name} down`} onClick={() => setDoc(d => ({ ...d, layers: moveLayer(d.layers, l.id, 'down') }))}><ArrowDown className="w-3 h-3" /></button>
                  <button aria-label={`Delete ${l.name}`} onClick={() => { setDoc(d => ({ ...d, layers: removeLayer(d.layers, l.id) })); if (selectedId === l.id) setSelectedId(null); }} className="text-gray-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {selected && (
          <section className="space-y-2" aria-label="Properties">
            <p className="text-xs font-medium text-gray-700">Properties</p>
            <label className="flex items-center gap-2 text-xs text-gray-600">Opacity
              <input type="range" min={0.05} max={1} step={0.05} value={selected.opacity} onChange={e => patchLayer(selected.id, { opacity: Number(e.target.value) })} className="flex-1" aria-label="Opacity" />
            </label>
            {selected.type === 'text' ? (
              <>
                <textarea aria-label="Text" value={selected.text} onChange={e => patchLayer(selected.id, { text: e.target.value } as Partial<TextLayer>)} className="w-full text-sm border border-gray-200 rounded px-2 py-1 min-h-[60px]" />
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <label>Size <input type="number" min={8} max={400} value={selected.fontSize} onChange={e => patchLayer(selected.id, { fontSize: Number(e.target.value) } as Partial<TextLayer>)} className="w-full border border-gray-200 rounded px-1" aria-label="Font size" /></label>
                  <label>Color <input type="color" value={selected.fill} onChange={e => patchLayer(selected.id, { fill: e.target.value } as Partial<TextLayer>)} className="w-full" aria-label="Text color" /></label>
                  <label>Outline <input type="color" value={selected.stroke} onChange={e => patchLayer(selected.id, { stroke: e.target.value } as Partial<TextLayer>)} className="w-full" aria-label="Outline color" /></label>
                  <label>Outline px <input type="number" min={0} max={20} value={selected.strokeWidth} onChange={e => patchLayer(selected.id, { strokeWidth: Number(e.target.value) } as Partial<TextLayer>)} className="w-full border border-gray-200 rounded px-1" aria-label="Outline width" /></label>
                </div>
                <div className="flex gap-1">
                  {(['left', 'center', 'right'] as const).map(a => (
                    <button key={a} onClick={() => patchLayer(selected.id, { align: a } as Partial<TextLayer>)} className={`px-2 py-0.5 text-xs rounded border ${selected.align === a ? 'bg-violet-100 border-violet-300' : 'border-gray-200'}`}>{a}</button>
                  ))}
                  <button onClick={() => patchLayer(selected.id, { bold: !selected.bold } as Partial<TextLayer>)} className={`px-2 py-0.5 text-xs rounded border font-bold ${selected.bold ? 'bg-violet-100 border-violet-300' : 'border-gray-200'}`}>B</button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setCropId(selected.id)} className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50"><Crop className="w-3 h-3" /> Crop</button>
                <button onClick={removeBg} className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50"><Scissors className="w-3 h-3" /> Remove background</button>
              </div>
            )}
          </section>
        )}

        <section className="space-y-2" aria-label="Personalization">
          <p className="text-xs font-medium text-gray-700 flex items-center gap-1"><Users className="w-3 h-3" /> Personalization</p>
          {tokens.length === 0 ? (
            <p className="text-xs text-gray-400">Use tokens like [FIRSTNAME] in text layers to personalize.</p>
          ) : (
            <>
              {tokens.map(t => (
                <label key={t} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-24 truncate">[{t}]</span>
                  <input value={tokenValues[t] ?? ''} onChange={e => setTokenValues(v => ({ ...v, [t]: e.target.value }))} className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm" aria-label={`Value for ${t}`} />
                </label>
              ))}
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={preview} onChange={e => setPreview(e.target.checked)} /> Preview with values
              </label>
              <label className={`flex items-center justify-center gap-2 px-3 py-2 text-xs rounded border border-dashed cursor-pointer ${batchBusy ? 'opacity-50 pointer-events-none' : 'border-gray-300 hover:border-violet-400'}`}>
                <Upload className="w-3 h-3" /> Batch from CSV (one image per row)
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={onCsv} aria-label="Batch CSV" />
              </label>
            </>
          )}
          {batch.length > 0 && (
            <div className="space-y-1" data-testid="batch-results">
              <div className="flex items-center justify-between text-xs"><span>{batch.length} ready</span><button onClick={downloadAll} className="text-violet-700 hover:underline">Download all</button></div>
              <ul className="max-h-40 overflow-auto space-y-1">
                {batch.map(b => (
                  <li key={b.name} className="flex items-center gap-2 text-xs">
                    <img src={b.url} alt={b.name} className="w-8 h-8 object-cover rounded" />
                    <span className="flex-1 truncate">{b.name}</span>
                    <button onClick={() => download(b.url, b.name)} aria-label={`Download ${b.name}`}><Download className="w-3 h-3" /></button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </aside>

      {cropTarget && (
        <CropDialog
          src={cropTarget.src}
          onCancel={() => setCropId(null)}
          onDone={(dataUrl, size) => {
            const fit = Math.min(doc.width / size.width, doc.height / size.height, 1);
            patchLayer(cropTarget.id, { src: dataUrl, width: Math.round(size.width * fit), height: Math.round(size.height * fit) } as Partial<ImageLayer>);
            setCropId(null);
          }}
        />
      )}
    </div>
  );
}
