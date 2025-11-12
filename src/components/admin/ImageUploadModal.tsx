import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { uploadImageToStorage, updateLandingPageImage } from '../../services/landingPageContentService';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  slot: string;
  currentImageUrl?: string;
  currentAltText?: string;
  onSuccess?: () => void;
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  section,
  slot,
  currentImageUrl,
  currentAltText,
  onSuccess
}: ImageUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState(currentAltText || '');
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setUploadError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    maxSize: 10485760,
    multiple: false
  });

  const handleUpload = async () => {
    if (!selectedFile || !altText.trim()) {
      setUploadError('Please select an image and provide alt text');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const imageUrl = await uploadImageToStorage(selectedFile, section, slot);

      if (!imageUrl) {
        throw new Error('Failed to upload image');
      }

      const success = await updateLandingPageImage(section, slot, imageUrl, altText, title);

      if (!success) {
        throw new Error('Failed to update landing page image');
      }

      setUploadSuccess(true);

      setTimeout(() => {
        onSuccess?.();
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAltText(currentAltText || '');
    setTitle('');
    setUploadError(null);
    setUploadSuccess(false);
  };

  const handleClose = () => {
    if (!isUploading) {
      onClose();
      setTimeout(resetForm, 300);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Upload Image</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {section} / {slot}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isUploading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {currentImageUrl && !previewUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Image
                    </label>
                    <img
                      src={currentImageUrl}
                      alt={currentAltText}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {previewUrl ? 'New Image Preview' : 'Upload New Image'}
                  </label>
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border-2 border-primary-500"
                      />
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      {isDragActive ? (
                        <p className="text-primary-600 font-medium">Drop the image here</p>
                      ) : (
                        <>
                          <p className="text-gray-700 font-medium mb-1">
                            Drag and drop an image here
                          </p>
                          <p className="text-sm text-gray-500">
                            or click to browse (Max 10MB)
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="altText" className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Text <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="altText"
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image for accessibility"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={isUploading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for accessibility and SEO
                  </p>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title (Optional)
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Image title or caption"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={isUploading}
                  />
                </div>

                {uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Upload Failed</p>
                      <p className="text-sm text-red-600">{uploadError}</p>
                    </div>
                  </motion.div>
                )}

                {uploadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Success!</p>
                      <p className="text-sm text-green-600">Image uploaded successfully</p>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
                <button
                  onClick={handleClose}
                  disabled={isUploading}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile || !altText.trim()}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      <span>Upload Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
