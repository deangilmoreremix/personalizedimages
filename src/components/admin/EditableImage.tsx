import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Loader } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import ImageUploadModal from './ImageUploadModal';
import { getImageBySlot } from '../../services/landingPageContentService';

interface EditableImageProps {
  src: string;
  alt: string;
  section: string;
  slot: string;
  className?: string;
  children?: React.ReactNode;
}

export default function EditableImage({
  src,
  alt,
  section,
  slot,
  className = '',
  children
}: EditableImageProps) {
  const { isEditMode } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(src);
  const [currentAltText, setCurrentAltText] = useState(alt);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    loadImageFromDatabase();
  }, [section, slot]);

  const loadImageFromDatabase = async () => {
    setIsLoading(true);
    try {
      const image = await getImageBySlot(section, slot);
      if (image) {
        setCurrentImageUrl(image.image_url);
        setCurrentAltText(image.alt_text);
      }
    } catch (error) {
      console.error('Error loading image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    loadImageFromDatabase();
  };

  return (
    <>
      <div
        className={`relative ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isLoading ? (
          <div className="flex items-center justify-center bg-gray-100 rounded-lg">
            <Loader className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <>
            <img
              src={currentImageUrl}
              alt={currentAltText}
              className={className}
            />
            {children}
          </>
        )}

        <AnimatePresence>
          {isEditMode && isHovered && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-lg"
            >
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-white text-gray-900 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 font-medium"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Image</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {isEditMode && !isHovered && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded-md text-xs font-medium shadow-lg"
          >
            <Edit className="w-3 h-3" />
          </motion.div>
        )}
      </div>

      <ImageUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section={section}
        slot={slot}
        currentImageUrl={currentImageUrl}
        currentAltText={currentAltText}
        onSuccess={handleSuccess}
      />
    </>
  );
}
