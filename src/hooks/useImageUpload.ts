import { useState, useCallback } from 'react';

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export interface UploadedImage {
  file: File;
  previewUrl: string;
  dataUrl: string;
}

export function useImageUpload() {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    setUploadError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Please upload a PNG, JPG, WebP, or GIF image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadError(`File is ${sizeMB}MB. Maximum allowed size is 4MB.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImage({
        file,
        previewUrl,
        dataUrl: reader.result as string,
      });
    };
    reader.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      setUploadError('Failed to read the file. Please try again.');
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
    setUploadError(null);
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
    uploadError,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileSelect,
    clearImage,
    setFromUrl,
  };
}
