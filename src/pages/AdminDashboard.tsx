import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Image, Users, History, AlertCircle, CheckCircle, Upload, Loader } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { getAllImagesBySection, LandingPageImage } from '../services/landingPageContentService';
import ImageUploadModal from '../components/admin/ImageUploadModal';

export default function AdminDashboard() {
  const { isAdmin, userRole } = useAdmin();
  const [images, setImages] = useState<LandingPageImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<LandingPageImage | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadAllImages();
    }
  }, [isAdmin]);

  const loadAllImages = async () => {
    setIsLoading(true);
    try {
      const sections = ['hero', 'templates', 'features'];
      const allImages: LandingPageImage[] = [];

      for (const section of sections) {
        const sectionImages = await getAllImagesBySection(section);
        allImages.push(...sectionImages);
      }

      setImages(allImages);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditImage = (image: LandingPageImage) => {
    setSelectedImage(image);
    setIsUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    loadAllImages();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container-custom">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage landing page content and images</p>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Role: {userRole?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Image className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">{images.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Images</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {images.filter(img => img.is_active).length}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Active Images</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">1</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Admin Users</h3>
          </motion.div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">Landing Page Images</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={image.image_url}
                        alt={image.alt_text}
                        className="w-full h-full object-cover"
                      />
                      {image.is_active && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                          Active
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-primary-600 uppercase">
                          {image.section}
                        </span>
                        <span className="text-xs text-gray-400 mx-2">•</span>
                        <span className="text-xs text-gray-600">{image.slot}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {image.alt_text}
                      </p>
                      <button
                        onClick={() => handleEditImage(image)}
                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Change Image</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {images.length === 0 && (
                <div className="text-center py-12">
                  <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No images found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <ImageUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedImage(null);
          }}
          section={selectedImage.section}
          slot={selectedImage.slot}
          currentImageUrl={selectedImage.image_url}
          currentAltText={selectedImage.alt_text}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
