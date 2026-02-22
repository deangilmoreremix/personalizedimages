import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, Maximize } from 'lucide-react';

interface ImageCanvasProps {
  imageUrl: string | null;
  overlayText?: string;
  textPosition?: { x: number; y: number };
  textStyle?: {
    fontSize: number;
    fontFamily: string;
    color: string;
    bold: boolean;
    italic: boolean;
  };
  onPositionChange?: (pos: { x: number; y: number }) => void;
}

export default function ImageCanvas({
  imageUrl,
  overlayText,
  textPosition = { x: 50, y: 50 },
  textStyle = { fontSize: 24, fontFamily: 'Arial', color: '#ffffff', bold: false, italic: false },
  onPositionChange,
}: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (imgRef.current && imageLoaded) {
      const img = imgRef.current;
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * zoom;
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }

    if (overlayText) {
      const fontWeight = textStyle.bold ? 'bold' : 'normal';
      const fontStyle = textStyle.italic ? 'italic' : 'normal';
      ctx.font = `${fontStyle} ${fontWeight} ${textStyle.fontSize * zoom}px ${textStyle.fontFamily}`;
      ctx.fillStyle = textStyle.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      const tx = (textPosition.x / 100) * canvas.width;
      const ty = (textPosition.y / 100) * canvas.height;
      ctx.fillText(overlayText, tx, ty);

      ctx.shadowColor = 'transparent';
    }
  }, [imageUrl, overlayText, textPosition, textStyle, zoom, imageLoaded]);

  useEffect(() => {
    if (!imageUrl) {
      setImageLoaded(false);
      imgRef.current = null;
      drawCanvas();
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawCanvas();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    return () => observer.disconnect();
  }, [drawCanvas]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onPositionChange) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onPositionChange({ x, y });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 bg-gray-100 border-b border-gray-200">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.1, 3))}
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.1, 0.3))}
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          title="Fit to View"
        >
          <Maximize className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-xs text-gray-500 ml-auto">{Math.round(zoom * 100)}%</span>
      </div>

      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-gray-200">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="absolute inset-0 cursor-crosshair"
        />
        {!imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Move className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No image loaded</p>
              <p className="text-xs">Generate or upload an image to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
