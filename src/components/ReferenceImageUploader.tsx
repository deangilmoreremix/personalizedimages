import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Upload, Image as ImageIcon, RefreshCw, Scan, Clipboard, Bot, Image, Rocket, Sparkles, Info, Check, ArrowRight, MessageSquare, Zap, Mic, VolumeX, Volume2, Plus as PlusIcon, History } from 'lucide-react';
import { storeReferenceImage, createImageThumbnail, removeStoredReferenceImage, StoredImage, getStoredReferenceImages } from '../utils/imageStorageUtils';
import ReferenceImageDialog from './ReferenceImageDialog';
import Tooltip from './ui/Tooltip';

interface ReferenceImageUploaderProps {
  onImageSelected: (imageUrl: string) => void;
  currentImage?: string | null;
  onClearImage?: () => void;
  category?: string;
  className?: string;
  showHistory?: boolean;
}

const ReferenceImageUploader: React.FC<ReferenceImageUploaderProps> = ({
  onImageSelected,
  currentImage = null,
  onClearImage,
  category = 'general',
  className = '',
  showHistory = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showTip, setShowTip] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(Array.from(e.dataTransfer.files));
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload([file]);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      setIsUploading(true);
      
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageUrl = e.target?.result as string;
          
          // Create a thumbnail for storage
          const thumbnail = await createImageThumbnail(imageUrl, 150, 150);
          
          // Store image metadata
          storeReferenceImage(imageUrl, category, {
            name: file.name,
            type: file.type,
            size: file.size,
            thumbnail,
            lastUsed: Date.now()
          });
          
          // Notify parent component
          onImageSelected(imageUrl);
          setIsUploading(false);
        };
        
        reader.onerror = () => {
          console.error('Error reading file');
          setIsUploading(false);
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading file:', error);
        setIsUploading(false);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {currentImage ? (
        /* Image preview with personalization indicators */
        <motion.div 
          className="relative rounded-lg overflow-hidden border border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <img 
            src={currentImage} 
            alt="Personalized Reference" 
            className="w-full h-auto max-h-48 object-contain"
          />
          
          {/* Personalization markers */}
          <motion.div 
            className="absolute right-3 top-3 bg-primary-500/80 text-white px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Sparkles className="w-3 h-3 inline mr-1" />
            Personalized Reference
          </motion.div>
          
          {/* Animation sparkle effect on load */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-400 rounded-full"
              animate={{
                scale: [1, 2, 0],
                opacity: [1, 0.5, 0],
              }}
              transition={{ duration: 1, delay: 0.1 }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary-300 rounded-full"
              animate={{
                scale: [1, 1.5, 0],
                opacity: [1, 0.5, 0],
              }}
              transition={{ duration: 1, delay: 0.2 }}
            />
            <motion.div
              className="absolute top-2/3 right-1/3 w-2 h-2 bg-primary-400 rounded-full"
              animate={{
                scale: [1, 2, 0],
                opacity: [1, 0.5, 0],
              }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </motion.div>
          
          {/* Controls */}
          <div className="absolute top-2 right-2 flex space-x-2">
            {/* Clear image button */}
            {onClearImage && (
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                whileTap={{ scale: 0.9 }}
                className="p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-md text-gray-700 hover:text-red-600 transition-colors"
                onClick={onClearImage}
                title="Clear personalized reference image"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
            
            {/* Replace image button */}
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
              whileTap={{ scale: 0.9 }}
              className="p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-md text-gray-700 hover:text-primary-600 transition-colors"
              onClick={triggerFileInput}
              title="Replace personalized reference image"
            >
              <Upload className="w-4 h-4" />
            </motion.button>
          </div>
          
          {/* Personalization info button with tooltip */}
          <div className="absolute bottom-2 left-2">
            <Tooltip content="Reference images help create personalized AI-generated content featuring your customer's name and details">
              <motion.button
                className="p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-md text-gray-700 hover:text-blue-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setShowTip(true)}
                onMouseLeave={() => setShowTip(false)}
              >
                <Info className="w-4 h-4" />
              </motion.button>
            </Tooltip>
          </div>
          
          {/* Status indicator */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white rounded-lg p-3 flex items-center shadow-lg">
                <RefreshCw className="w-5 h-5 text-primary-500 animate-spin mr-2" />
                <span className="text-sm font-medium">Processing personalized image...</span>
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </motion.div>
      ) : (
        /* Personalized upload zone */
        <motion.div
          className={`border-2 ${
            isDragging ? 'border-primary-500 bg-primary-50' : 'border-dashed border-gray-300 bg-gray-50'
          } rounded-lg transition-colors duration-200`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          whileHover={{ scale: 1.01, borderColor: '#8b5cf6' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            {isUploading ? (
              <div className="flex flex-col items-center">
                <RefreshCw className="h-10 w-10 text-primary-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-primary-700">
                  Uploading personalized image...
                </p>
              </div>
            ) : (
              <>
                <motion.div 
                  className="mb-3 relative"
                  animate={{ 
                    y: [0, -5, 0],
                    boxShadow: [
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)", 
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    ]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <div className="bg-primary-100 rounded-full p-3">
                    <Upload className="h-8 w-8 text-primary-600" />
                  </div>
                  
                  {/* Personalization indicator */}
                  <motion.div
                    className="absolute -top-1 -right-1 bg-primary-300 rounded-full p-1"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      repeatType: "reverse"
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </motion.div>
                </motion.div>
                
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  {isDragging ? "Drop image for personalization" : "Upload personalized reference image"}
                </p>
                <p className="mb-3 text-xs text-gray-500">
                  Drag & drop or click to browse
                </p>
                
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileInput();
                  }}
                  className="px-3 py-1 text-xs text-primary-600 border border-primary-300 bg-primary-50 hover:bg-primary-100 rounded flex items-center"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PlusIcon className="w-3 h-3 mr-1.5" />
                  Browse personalized images
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Personalized history toggle button */}
      {showHistory && (
        <motion.div 
          className="mt-2 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setShowHistoryPanel(true);
            }}
            className="text-xs px-2 py-1 text-gray-600 hover:text-primary-600 flex items-center hover:bg-gray-100 rounded transition-colors"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            <History className="w-3 h-3 mr-1" />
            Recent personalized images
          </motion.button>
        </motion.div>
      )}
      
      {/* Reference Image Dialog */}
      {showHistoryPanel && (
        <ReferenceImageDialog
          isOpen={showHistoryPanel}
          onClose={() => setShowHistoryPanel(false)}
          onSelectImage={(url) => {
            onImageSelected(url);
            setShowHistoryPanel(false);
          }}
          category={category}
          title="Select Personalized Reference Image"
        />
      )}
    </div>
  );
};

export default ReferenceImageUploader;