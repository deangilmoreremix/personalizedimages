import React, { useRef, useState } from 'react';
import { Upload, X, ImageIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReferenceImageSectionProps {
  imageUrl: string | null;
  onImageSelected: (url: string) => void;
  onClearImage: () => void;
  title?: string;
  description?: string;
  className?: string;
}

export const ReferenceImageSection: React.FC<ReferenceImageSectionProps> = ({
  imageUrl,
  onImageSelected,
  onClearImage,
  title = 'Reference Image',
  description = 'Upload an image for AI reference (optional)',
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelected(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{title}</label>
      <p className="text-xs text-gray-500">{description}</p>

      {/* Upload Area or Preview */}
      <AnimatePresence mode="wait">
        {imageUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group"
          >
            <div className="relative rounded-lg overflow-hidden border-2 border-green-500 bg-gray-50">
              <img
                src={imageUrl}
                alt="Reference"
                className="w-full h-40 object-cover"
              />

              {/* Success Badge */}
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-medium">
                <Check className="w-3 h-3" />
                Reference Active
              </div>

              {/* Remove Button */}
              <button
                onClick={onClearImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                title="Remove reference image"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium"
                >
                  Change Image
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
          >
            <div className="text-center">
              <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-600 font-medium mb-1">
                {isDragging ? 'Drop image here' : 'Upload Reference Image'}
              </p>
              <p className="text-xs text-gray-500">
                Click or drag and drop (JPG, PNG, WebP)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
        className="hidden"
      />
    </div>
  );
};

export default ReferenceImageSection;
