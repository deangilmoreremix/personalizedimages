import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid,
  List,
  Search,
  Filter,
  Folder,
  FolderPlus,
  Star,
  StarOff,
  Download,
  Trash2,
  Edit3,
  Eye,
  Tag,
  Calendar,
  Image as ImageIcon,
  MoreVertical,
  Upload,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { cloudGalleryService, UserImage, Folder as FolderType } from '../services/cloudGalleryService';
import { DESIGN_SYSTEM, getGridClasses, getButtonClasses, getAlertClasses, commonStyles } from './ui/design-system';

interface GalleryProps {
  onImageSelect?: (image: UserImage) => void;
  selectedImages?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  maxSelection?: number;
}

const Gallery: React.FC<GalleryProps> = ({
  onImageSelect,
  selectedImages = [],
  onSelectionChange,
  maxSelection
}) => {
  // State management
  const [images, setImages] = useState<UserImage[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'favorites'>('newest');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Modal states
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showImageDetails, setShowImageDetails] = useState<UserImage | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Form states
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');

  // Load data
  useEffect(() => {
    loadImages();
    loadFolders();
  }, [currentFolder, searchQuery, selectedTags, sortBy, showOnlyFavorites]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const options: any = {
        folderId: currentFolder || undefined,
        searchQuery: searchQuery || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        isFavorite: showOnlyFavorites || undefined
      };

      // Apply sorting
      let sortedImages = await cloudGalleryService.getImages(options);

      switch (sortBy) {
        case 'oldest':
          sortedImages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
        case 'rating':
          sortedImages.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'favorites':
          sortedImages.sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));
          break;
        default: // newest
          sortedImages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      setImages(sortedImages);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const folderData = await cloudGalleryService.getFolders();
      setFolders(folderData);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  // Get all unique tags from images
  const allTags = Array.from(new Set(images.flatMap(img => img.tags))).sort();

  const handleImageClick = (image: UserImage) => {
    if (maxSelection && selectedImages.length >= maxSelection && !selectedImages.includes(image.id)) {
      return; // Don't allow selection beyond max
    }

    if (onSelectionChange) {
      const isSelected = selectedImages.includes(image.id);
      if (isSelected) {
        onSelectionChange(selectedImages.filter(id => id !== image.id));
      } else {
        onSelectionChange([...selectedImages, image.id]);
      }
    } else if (onImageSelect) {
      onImageSelect(image);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await cloudGalleryService.createFolder({
        name: newFolderName,
        description: newFolderDescription,
        parent_id: currentFolder
      });
      setNewFolderName('');
      setNewFolderDescription('');
      setShowCreateFolder(false);
      loadFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleToggleFavorite = async (imageId: string, isFavorite: boolean) => {
    try {
      await cloudGalleryService.toggleFavorite(imageId, !isFavorite);
      loadImages();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await cloudGalleryService.deleteImage(imageId);
      loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedImages.length} images?`)) return;

    try {
      for (const imageId of selectedImages) {
        await cloudGalleryService.deleteImage(imageId);
      }
      onSelectionChange?.([]);
      loadImages();
    } catch (error) {
      console.error('Error deleting images:', error);
    }
  };

  const handleBulkMove = async (folderId: string | null) => {
    try {
      await cloudGalleryService.moveImagesToFolder(selectedImages, folderId);
      onSelectionChange?.([]);
      loadImages();
    } catch (error) {
      console.error('Error moving images:', error);
    }
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={DESIGN_SYSTEM.components.section}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className={commonStyles.sectionHeader}>
            <ImageIcon className="w-6 h-6 text-primary-500 mr-2" />
            Image Gallery
          </h2>
          <p className="text-gray-600 mt-1">
            {currentFolder ? `Viewing folder: ${folders.find(f => f.id === currentFolder)?.name}` : 'All your generated images'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Create Folder */}
          <button
            onClick={() => setShowCreateFolder(true)}
            className={getButtonClasses('secondary')}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search images by prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rated</option>
            <option value="favorites">Favorites First</option>
          </select>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
              showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          {/* Favorites Toggle */}
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
              showOnlyFavorites ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <Star className="w-4 h-4" />
            Favorites
          </button>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Tags:</span>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
                      selectedTags.includes(tag)
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Folder Navigation */}
      {folders.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Folder className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Folders:</span>
            <button
              onClick={() => setCurrentFolder(null)}
              className={`px-3 py-1 rounded-full text-xs ${
                currentFolder === null
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Images
            </button>
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setCurrentFolder(folder.id)}
                className={`px-3 py-1 rounded-full text-xs ${
                  currentFolder === folder.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {folder.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedImages.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Move to Folder */}
              <select
                onChange={(e) => handleBulkMove(e.target.value === 'none' ? null : e.target.value)}
                className="px-3 py-1 text-xs border border-gray-300 rounded"
                defaultValue=""
              >
                <option value="">Move to...</option>
                <option value="none">Root</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>

              {/* Bulk Delete */}
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>

              {/* Clear Selection */}
              <button
                onClick={() => onSelectionChange?.([])}
                className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Images Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Loading images...</span>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedTags.length > 0 || showOnlyFavorites
              ? 'Try adjusting your search or filters'
              : 'Start generating images to see them here'}
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? getGridClasses(4)
            : 'space-y-4'
        }>
          {images.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative group ${
                viewMode === 'grid'
                  ? 'aspect-square overflow-hidden rounded-xl bg-gray-100 cursor-pointer'
                  : 'bg-white rounded-xl shadow-sm border border-gray-100 p-4'
              }`}
              onClick={() => handleImageClick(image)}
            >
              {/* Selection Indicator */}
              {selectedImages.includes(image.id) && (
                <div className="absolute top-2 left-2 z-10 bg-primary-600 text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}

              {/* Favorite Indicator */}
              {image.is_favorite && (
                <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-white rounded-full p-1">
                  <Star className="w-3 h-3 fill-current" />
                </div>
              )}

              {viewMode === 'grid' ? (
                <>
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowImageDetails(image);
                        }}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(image.id, image.is_favorite);
                        }}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30"
                      >
                        {image.is_favorite ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(image.image_url, '_blank');
                        }}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // List view
                <div className="flex gap-4">
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    loading="lazy"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate mb-1">
                          {image.prompt.length > 100 ? `${image.prompt.substring(0, 100)}...` : image.prompt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(image.created_at)}
                          </span>
                          <span>{image.model}</span>
                          {image.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current text-yellow-500" />
                              {image.rating}
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

                      <div className="flex items-center gap-1 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowImageDetails(image);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(image.id, image.is_favorite);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          {image.is_favorite ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(image.image_url, '_blank');
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(image.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Folder Modal */}
      <AnimatePresence>
        {showCreateFolder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateFolder(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter folder name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newFolderDescription}
                    onChange={(e) => setNewFolderDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe this folder"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateFolder(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className={getButtonClasses('primary')}
                >
                  Create Folder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Details Modal */}
      <AnimatePresence>
        {showImageDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowImageDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">Image Details</h3>
                <button
                  onClick={() => setShowImageDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={showImageDetails.image_url}
                    alt={showImageDetails.prompt}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{showImageDetails.prompt}</p>
                  </div>

                  {showImageDetails.enhanced_prompt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enhanced Prompt</label>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{showImageDetails.enhanced_prompt}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <p className="text-sm text-gray-600">{showImageDetails.model}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                      <p className="text-sm text-gray-600">{formatDate(showImageDetails.created_at)}</p>
                    </div>
                  </div>

                  {showImageDetails.tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {showImageDetails.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(showImageDetails.tokens).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Personalization Tokens</label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        {Object.entries(showImageDetails.tokens).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="font-medium">{key}:</span>
                            <span className="text-gray-600">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => window.open(showImageDetails.image_url, '_blank')}
                      className={getButtonClasses('primary')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(showImageDetails.id, showImageDetails.is_favorite)}
                      className={getButtonClasses('secondary')}
                    >
                      {showImageDetails.is_favorite ? <StarOff className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                      {showImageDetails.is_favorite ? 'Unfavorite' : 'Favorite'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;