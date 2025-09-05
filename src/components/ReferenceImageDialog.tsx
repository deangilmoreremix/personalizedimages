import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Search, Clock, Image as ImageIcon, Trash, Check, Grid, List, ArrowLeft, Info, Download, RefreshCw, Sparkles } from 'lucide-react';
import { getStoredReferenceImages, removeStoredReferenceImage, StoredImage, storeReferenceImage } from '../utils/imageStorageUtils';

interface ReferenceImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  category?: string;
  multipleSelect?: boolean;
  title?: string;
}

const ReferenceImageDialog: React.FC<ReferenceImageDialogProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  category = 'general',
  multipleSelect = false,
  title = 'Select Reference Image'
}) => {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Load images when the dialog opens
  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen, category]);

  // Load images from storage
  const loadImages = () => {
    setIsLoading(true);
    try {
      const storedImages = getStoredReferenceImages(category);
      setImages(storedImages);
    } catch (error) {
      console.error('Error loading reference images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter images based on search term
  const filteredImages = images.filter(image => {
    if (!searchTerm) return true;
    
    // Check if name, id or metadata contains search term
    const name = image.name || '';
    const metadataStr = image.metadata ? JSON.stringify(image.metadata).toLowerCase() : '';
    
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metadataStr.includes(searchTerm.toLowerCase())
    );
  });

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle image selection
  const handleSelectImage = (imageUrl: string) => {
    if (multipleSelect) {
      if (selectedImages.includes(imageUrl)) {
        setSelectedImages(selectedImages.filter(url => url !== imageUrl));
      } else {
        setSelectedImages([...selectedImages, imageUrl]);
      }
    } else {
      onSelectImage(imageUrl);
      onClose();
    }
  };

  // Handle confirm selection for multiple images
  const handleConfirmSelection = () => {
    if (selectedImages.length > 0) {
      // In multi-select mode, we would handle all selected images
      // For this example, we'll just use the first one
      onSelectImage(selectedImages[0]);
      onClose();
    }
  };

  // Handle image deletion
  const handleDeleteImage = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      removeStoredReferenceImage(imageId, category);
      setImages(images.filter(img => img.id !== imageId));
      
      // Remove from selection if selected
      const imageToRemove = images.find(img => img.id === imageId);
      if (imageToRemove && selectedImages.includes(imageToRemove.imageUrl)) {
        setSelectedImages(selectedImages.filter(url => url !== imageToRemove.imageUrl));
      }
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploadingFile(true);
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      
      // Store the image in local storage
      const storedImage = storeReferenceImage(imageUrl, category, {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      // Add to the list of images
      setImages([storedImage, ...images]);
      
      // Select the newly uploaded image
      if (multipleSelect) {
        setSelectedImages([...selectedImages, imageUrl]);
      } else {
        onSelectImage(imageUrl);
        onClose();
      }
      
      setUploadingFile(false);
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      setUploadingFile(false);
    };
    
    reader.readAsDataURL(file);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Dialog animation variants
  const dialogVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.3, 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      } 
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95, 
      transition: { duration: 0.2 } 
    }
  };

  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.05,  
        duration: 0.2
      }
    })
  };

  // Animation for the draggable area
  const dragAreaVariants = {
    inactive: { 
      backgroundColor: 'rgba(243, 244, 246, 1)',
      borderColor: 'rgba(229, 231, 235, 1)' 
    },
    active: { 
      backgroundColor: 'rgba(219, 234, 254, 1)', 
      borderColor: 'rgba(96, 165, 250, 1)',
      scale: 1.01
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        variants={dialogVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            {showInfo && (
              <motion.button
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="mr-3 p-1.5 rounded-full hover:bg-gray-100"
                onClick={() => setShowInfo(false)}
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </motion.button>
            )}
            <div className="flex items-center">
              <motion.div
                className="bg-blue-100 p-2 rounded-full mr-3"
                initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Sparkles className="h-6 w-6 text-blue-600" />
              </motion.div>
              
              <h2 className="text-xl font-bold text-gray-900">Personalized {title}</h2>
            </div>
          </div>
          
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {showInfo ? (
              <motion.div
                key="info-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 overflow-auto p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">About Personalized Reference Images</h3>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                      <Info className="w-5 h-5 text-blue-600 mr-2" />
                      What are personalized reference images?
                    </h4>
                    <p className="text-blue-700 text-sm">
                      Reference images help guide AI models when generating personalized content. 
                      By uploading a reference, you can influence the style, composition, and elements of the generated images while incorporating personalized details like customer names and information.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">How personalization works</h4>
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start">
                        <div className="bg-gray-100 p-1 rounded-full mr-2 mt-0.5">
                          <span className="flex items-center justify-center w-4 h-4 text-gray-600 font-medium">1</span>
                        </div>
                        <span>Upload a photo that will be personalized with customer details</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-gray-100 p-1 rounded-full mr-2 mt-0.5">
                          <span className="flex items-center justify-center w-4 h-4 text-gray-600 font-medium">2</span>
                        </div>
                        <span>The AI will analyze the reference image while adding personalization tokens like names and details</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-gray-100 p-1 rounded-full mr-2 mt-0.5">
                          <span className="flex items-center justify-center w-4 h-4 text-gray-600 font-medium">3</span>
                        </div>
                        <span>Personalization tokens [FIRSTNAME], [COMPANY], etc. will be combined with your reference</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-gray-100 p-1 rounded-full mr-2 mt-0.5">
                          <span className="flex items-center justify-center w-4 h-4 text-gray-600 font-medium">4</span>
                        </div>
                        <span>The result will be a highly personalized image for each of your customers</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Best practices for personalization</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      <li>Use high-quality images that clearly show the subject</li>
                      <li>Choose references with uncluttered backgrounds for better personalization</li>
                      <li>Upload images that match the style you want in the personalized result</li>
                      <li>For action figures, use clear front-facing images of the person</li>
                      <li>For scene personalization, choose reference images with similar composition</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2 flex items-center">
                      <Sparkles className="w-4 h-4 text-green-600 mr-2" />
                      Personalization benefits
                    </h4>
                    <p className="text-sm text-green-700">
                      Images personalized with customer details drive 985% higher engagement and click-through rates. Each customer receives content that feels created just for them.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="images-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                {/* Search and controls */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Search box */}
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search personalized images..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setSearchTerm('')}
                        >
                          <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                        </button>
                      )}
                    </div>
                    
                    {/* View mode toggle */}
                    <div className="flex border rounded-lg overflow-hidden">
                      <button
                        className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-700' : 'bg-white text-gray-500'}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid view"
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'bg-white text-gray-500'}`}
                        onClick={() => setViewMode('list')}
                        title="List view"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Info button */}
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      onClick={() => setShowInfo(true)}
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Main content area */}
                <div className="flex-1 overflow-auto p-4">
                  {isLoading ? (
                    <div className="h-40 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                  ) : filteredImages.length === 0 ? (
                    <div className="text-center py-10">
                      <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">No personalized reference images found</p>
                      <p className="text-gray-400 text-sm">
                        Upload an image to get started with personalization
                      </p>
                    </div>
                  ) : (
                    <>
                      {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {filteredImages.map((image, index) => (
                            <motion.div
                              key={image.id}
                              custom={index}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                              className={`relative rounded-lg border overflow-hidden cursor-pointer ${
                                selectedImages.includes(image.imageUrl) 
                                  ? 'ring-2 ring-blue-500 border-blue-500' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleSelectImage(image.imageUrl)}
                            >
                              <div className="aspect-square overflow-hidden bg-gray-100">
                                <img
                                  src={image.thumbnail || image.imageUrl}
                                  alt={image.name || 'Personalized reference image'}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              
                              {/* Image info overlay with personalization indicator */}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent text-white p-2 text-xs">
                                <div className="flex items-center">
                                  <Sparkles className="w-3 h-3 text-primary-300 mr-1" />
                                  <div className="truncate">
                                    {image.name || 'Personalized image'}
                                  </div>
                                </div>
                                <div className="text-white/70 text-[10px] mt-0.5">
                                  {formatDate(image.createdAt)}
                                </div>
                              </div>
                              
                              {/* Selection checkmark */}
                              {selectedImages.includes(image.imageUrl) && (
                                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              )}
                              
                              {/* Delete button */}
                              <button
                                className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white rounded-full p-1.5 opacity-0 hover:opacity-100 transition-opacity"
                                onClick={(e) => handleDeleteImage(image.id, e)}
                                aria-label="Delete image"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredImages.map((image, index) => (
                            <motion.div
                              key={image.id}
                              custom={index}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              className={`flex items-center p-3 rounded-lg border ${
                                selectedImages.includes(image.imageUrl) 
                                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:bg-gray-50'
                              } cursor-pointer`}
                              onClick={() => handleSelectImage(image.imageUrl)}
                            >
                              <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 mr-3 flex-shrink-0">
                                <img
                                  src={image.thumbnail || image.imageUrl}
                                  alt={image.name || 'Personalized reference'}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-800 truncate flex items-center">
                                  <Sparkles className="w-3 h-3 text-primary-500 mr-1" />
                                  {image.name || `Personalized Image ${formatDate(image.createdAt)}`}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatDate(image.createdAt)}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {selectedImages.includes(image.imageUrl) && (
                                  <div className="bg-blue-500 rounded-full p-1">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                                )}
                                
                                <button
                                  className="p-1.5 text-gray-400 hover:text-red-500"
                                  onClick={(e) => handleDeleteImage(image.id, e)}
                                  aria-label="Delete image"
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Drag & drop personalized upload area */}
                  <motion.div
                    className={`mt-6 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer text-center ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                    }`}
                    variants={dragAreaVariants}
                    animate={dragActive ? "active" : "inactive"}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white p-3 rounded-full shadow-sm mb-4"
                    >
                      <Upload className="h-6 w-6 text-blue-500" />
                    </motion.div>
                    
                    {uploadingFile ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                        <p className="text-sm font-medium text-blue-600">Uploading personalized image...</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-700">
                          Drag and drop a personalized image here, or <span className="text-blue-600">browse</span>
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Supports JPG, PNG, WEBP up to 10MB
                        </p>
                      </>
                    )}
                    
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-500 mr-1.5" />
              {multipleSelect && `${selectedImages.length} personalized image${selectedImages.length !== 1 ? 's' : ''} selected`}
              {!multipleSelect && !showInfo && `${filteredImages.length} personalized image${filteredImages.length !== 1 ? 's' : ''}`}
            </div>
            <div className="flex space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={onClose}
              >
                Cancel
              </button>
              
              {multipleSelect && (
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedImages.length > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={handleConfirmSelection}
                  disabled={selectedImages.length === 0}
                >
                  Select Personalized {selectedImages.length > 0 ? `(${selectedImages.length})` : ''}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReferenceImageDialog;