import { useState, useCallback } from 'react';

export interface UploadedImage {
  file: File;
  previewUrl: string;
  dataUrl: string;
}

export function useImageUpload() {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const previewUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImage({
        file,
        previewUrl,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const clearImage = useCallback(() => {
    if (image) {
      URL.revokeObjectURL(image.previewUrl);
    }
    setImage(null);
  }, [image]);

  const setFromUrl = useCallback((url: string) => {
    setImage({
      file: new File([], 'remote-image'),
      previewUrl: url,
      dataUrl: url,
    });
  }, []);

  return {
    image,
    isDragging,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileSelect,
    clearImage,
    setFromUrl,
  };
}
