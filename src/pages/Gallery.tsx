import React, { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Filter,
  Grid,
  List,
  Heart,
  Download,
  Share2,
  Trash2,
  FolderOpen,
  Tag,
  Calendar,
  Star,
  Eye,
  Settings,
  Plus,
  Image as ImageIcon,
  Zap,
  Clock,
  MoreVertical,
  CheckSquare,
  Square,
  SortAsc,
  SortDesc
} from 'lucide-react';

// Import the cloud gallery service
import cloudGalleryService, { UserImage, Folder as FolderType } from '../services/cloudGalleryService';

// Loading component
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading your gallery...</p>
    </div>
  </div>
);

// Image card component
const ImageCard: React.FC<{
  image: UserImage;
  viewMode: 'grid' | 'list';
  onSelect: (image: UserImage) => void;
  onToggleFavorite: (imageId: string, isFavorite: boolean) => void;
  onDelete: (imageId: string) => void;
  selectedImages: string[];
}> = ({ image, viewMode, onSelect, onToggleFavorite, onDelete, selectedImages }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isSelected = selectedImages.includes(image.id);

  if (viewMode === 'list') {
    return (
      <motion.div
        className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all ${
          isSelected ? 'ring-2 ring-primary-500' : ''
        }`}
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex">
          {/* Checkbox */}
          <div className="p-3 flex items-center">
            <button
              onClick={() => onSelect(image)}
              className="text-gray-400 hover:text-primary-600"
            >
              {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
            </button>
          </div>

          {/* Thumbnail */}
          <div className="w-24 h-24 flex-shrink-0 relative">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <img
              src={image.thumbnail_url || image.image_url}
              alt={image.prompt.substring(0, 50)}
              className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = image.image_url;
              }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                  {image.prompt}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    {image.model}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(image.created_at)}
                  </span>
                  {image.generation_time_ms && (
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {(image.generation_time_ms / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
                {image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {image.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {image.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{image.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onToggleFavorite(image.id, !image.is_favorite)}
                  className={`p-1.5 rounded ${
                    image.is_favorite
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${image.is_favorite ? 'fill-current' : ''}`} />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => window.open(image.image_url, '_blank')}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Full Size
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = image.image_url;
                            link.download = `generated-image-${image.id}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                        <button
                          onClick={() => onDelete(image.id)}
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group ${
        isSelected ? 'ring-2 ring-primary-500' : ''
      }`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Image */}
      <div className="aspect-square relative overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <img
          src={image.thumbnail_url || image.image_url}
          alt={image.prompt.substring(0, 50)}
          className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity group-hover:scale-105`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = image.image_url;
          }}
        />

        {/* Selection overlay */}
        <div className="absolute top-2 left-2">
          <button
            onClick={() => onSelect(image)}
            className={`p-1 rounded ${
              isSelected
                ? 'bg-primary-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          </button>
        </div>

        {/* Favorite button */}
        <button
          onClick={() => onToggleFavorite(image.id, !image.is_favorite)}
          className={`absolute top-2 right-2 p-1.5 rounded-full ${
            image.is_favorite
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${image.is_favorite ? 'fill-current' : ''}`} />
        </button>

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => window.open(image.image_url, '_blank')}
            className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30"
            title="View full size"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = image.image_url;
              link.download = `generated-image-${image.id}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {image.prompt}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span className="flex items-center">
            <Zap className="w-3 h-3 mr-1" />
            {image.model}
          </span>
          <span>{formatDate(image.created_at)}</span>
        </div>

        {image.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {image.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {tag}
              </span>
            ))}
            {image.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{image.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Gallery: React.FC = () => {
  const [images, setImages] = useState<UserImage[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'favorites'>('newest');
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Load user content
  useEffect(() => {
    loadUserContent();
  }, [selectedFolder, sortBy, filterFavorites]);

  const loadUserContent = async () => {
    setLoading(true);
    try {
      const options: any = {
        folderId: selectedFolder || undefined,
        isFavorite: filterFavorites || undefined,
        searchQuery: searchQuery || undefined,
        limit: 100
      };

      const userImages = await cloudGalleryService.getImages(options);
      const userFolders = await cloudGalleryService.getFolders();

      // Sort images
      let sortedImages = [...userImages];
      switch (sortBy) {
        case 'oldest':
          sortedImages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
        case 'favorites':
          sortedImages.sort((a, b) => {
            if (a.is_favorite && !b.is_favorite) return -1;
            if (!a.is_favorite && b.is_favorite) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          break;
        default: // newest
          sortedImages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
      }

      setImages(sortedImages);
      setFolders(userFolders);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter images based on search
  const filteredImages = images.filter(image =>
    !searchQuery ||
    image.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle image selection
  const handleImageSelect = (image: UserImage) => {
    setSelectedImages(prev =>
      prev.includes(image.id)
        ? prev.filter(id => id !== image.id)
        : [...prev, image.id]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(filteredImages.map(img => img.id));
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (imageId: string, isFavorite: boolean) => {
    try {
      await cloudGalleryService.toggleFavorite(imageId, isFavorite);
      setImages(prev =>
        prev.map(img =>
          img.id === imageId ? { ...img, is_favorite: isFavorite } : img
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Handle delete
  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await cloudGalleryService.deleteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      setSelectedImages(prev => prev.filter(id => id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedImages.length} images?`)) return;

    try {
      for (const imageId of selectedImages) {
        await cloudGalleryService.deleteImage(imageId);
      }
      setImages(prev => prev.filter(img => !selectedImages.includes(img.id)));
      setSelectedImages([]);
    } catch (error) {
      console.error('Error deleting images:', error);
    }
  };

  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-gray-50/80 to-gray-100/80 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700 transition-colors mb-2">
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Your Gallery</h1>
            <p className="text-gray-600">
              {images.length} {images.length === 1 ? 'image' : 'images'} saved
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Link to="/editor" className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Link>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search images, prompts, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={selectedFolder || ''}
                onChange={(e) => setSelectedFolder(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Folders</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="favorites">Favorites First</option>
              </select>

              <button
                onClick={() => setFilterFavorites(!filterFavorites)}
                className={`px-3 py-2 border rounded-lg flex items-center ${
                  filterFavorites
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${filterFavorites ? 'fill-current' : ''}`} />
                Favorites
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bulk Actions */}
        {selectedImages.length > 0 && (
          <motion.div
            className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700">
                {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  {selectedImages.length === filteredImages.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1 inline" />
                  Delete Selected
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Gallery Content */}
        {loading ? (
          <LoadingComponent />
        ) : filteredImages.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {images.length === 0 ? 'No images yet' : 'No images match your search'}
            </h3>
            <p className="text-gray-600 mb-6">
              {images.length === 0
                ? 'Start creating personalized content to see it here!'
                : 'Try adjusting your search or filters.'
              }
            </p>
            <Link to="/editor" className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Image
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
                : 'space-y-4'
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {filteredImages.map((image, index) => (
              <ImageCard
                key={image.id}
                image={image}
                viewMode={viewMode}
                onSelect={handleImageSelect}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
                selectedImages={selectedImages}
              />
            ))}
          </motion.div>
        )}

        {/* Stats Footer */}
        {images.length > 0 && (
          <motion.div
            className="mt-12 text-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <p>
              {filteredImages.length} of {images.length} images shown
              {folders.length > 0 && ` • ${folders.length} folder${folders.length !== 1 ? 's' : ''}`}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Gallery;