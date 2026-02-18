import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageDropZoneProps {
  image: { previewUrl: string } | null;
  isDragging: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  label?: string;
  compact?: boolean;
}

export default function ImageDropZone({
  image,
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
  onClear,
  label = 'Drop an image here or click to upload',
  compact = false,
}: ImageDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (image) {
    return (
      <div className="relative group">
        <img
          src={image.previewUrl}
          alt="Uploaded"
          className={`w-full ${compact ? 'max-h-48' : 'max-h-80'} object-contain rounded-xl border border-gray-200 bg-gray-50`}
        />
        <button
          onClick={onClear}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="w-4 h-4 text-red-500" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
        compact ? 'p-6' : 'p-10'
      } ${
        isDragging
          ? 'border-primary-400 bg-primary-50/50'
          : 'border-gray-300 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-50'
      }`}
    >
      <div
        className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}
      >
        {isDragging ? (
          <Upload className={`${compact ? 'w-5 h-5' : 'w-7 h-7'} text-primary-500`} />
        ) : (
          <ImageIcon className={`${compact ? 'w-5 h-5' : 'w-7 h-7'} text-gray-400`} />
        )}
      </div>
      <div className="text-center">
        <p className={`${compact ? 'text-sm' : 'text-base'} font-medium text-gray-600`}>
          {label}
        </p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG, or WebP</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        className="hidden"
      />
    </div>
  );
}
