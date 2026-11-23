import { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

interface Props {
  src: string;
  onCancel: () => void;
  /** Receives the cropped image as a PNG data URL. */
  onDone: (dataUrl: string, size: { width: number; height: number }) => void;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = src;
  });
}

export async function cropToDataUrl(src: string, area: Area): Promise<{ dataUrl: string; width: number; height: number }> {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height };
}

const ASPECTS: Array<{ label: string; value: number | undefined }> = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:5', value: 4 / 5 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 }
];

export default function CropDialog({ src, onCancel, onDone }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  const apply = async () => {
    if (!area) return;
    setBusy(true);
    try {
      const r = await cropToDataUrl(src, area);
      onDone(r.dataUrl, { width: r.width, height: r.height });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div role="dialog" aria-label="Crop image" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-xl overflow-hidden">
        <div className="relative h-80 bg-gray-900">
          <Cropper image={src} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onComplete} />
        </div>
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {ASPECTS.map(a => (
              <button
                key={a.label}
                onClick={() => setAspect(a.value)}
                className={`px-2 py-1 text-xs rounded border ${aspect === a.value ? 'bg-violet-100 border-violet-300 text-violet-700' : 'border-gray-200 text-gray-600'}`}
              >
                {a.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 text-xs text-gray-600">
            Zoom
            <input type="range" min={1} max={4} step={0.05} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="flex-1" aria-label="Zoom" />
          </label>
          <div className="flex justify-end gap-2">
            <button onClick={onCancel} className="px-3 py-1.5 text-sm rounded border border-gray-200">Cancel</button>
            <button onClick={apply} disabled={!area || busy} className="px-3 py-1.5 text-sm rounded bg-violet-600 text-white disabled:opacity-50">
              {busy ? 'Cropping…' : 'Apply crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
