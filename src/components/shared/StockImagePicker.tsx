import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Heart, Download, Grid, List, Filter, Loader2, Image, Camera, PenTool, Layers, Video } from 'lucide-react';
import { useStockImages, useStockFavorites } from '../../hooks/useStockImages';
import { StockResource, StockSearchOptions } from '../../services/stockImageService';

interface StockImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (resource: StockResource) => void;
  title?: string;
  moduleName?: string;
  initialQuery?: string;
  allowedTypes?: Array<'photo' | 'vector' | 'psd' | 'icon' | 'video'>;
  showFavorites?: boolean;
  multiSelect?: boolean;
  onMultiSelect?: (resources: StockResource[]) => void;
}

type ViewMode = 'grid' | 'list';
type TabMode = 'search' | 'favorites' | 'recent';

const typeIcons: Record<string, React.ReactNode> = {
  photo: <Camera className="w-4 h-4" />,
  vector: <PenTool className="w-4 h-4" />,
  psd: <Layers className="w-4 h-4" />,
  icon: <Grid className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />
};

export function StockImagePicker({
  isOpen,
  onClose,
  onSelect,
  title = 'Stock Image Library',
  moduleName = 'stock-picker',
  initialQuery = '',
  allowedTypes,
  showFavorites = true,
  multiSelect = false,
  onMultiSelect
}: StockImagePickerProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabMode>('search');
  const [selectedResources, setSelectedResources] = useState<StockResource[]>([]);
  const [previewResource, setPreviewResource] = useState<StockResource | null>(null);
  const [filters, setFilters] = useState<StockSearchOptions>({});

  const {
    resources,
    isLoading,
    error,
    hasMore,
    search,
    loadMore,
    toggleFavorite,
    isFavorite,
    isAvailable
  } = useStockImages({
    moduleName,
    autoLoad: false,
    perPage: 24
  });

  const { favorites, isLoading: favoritesLoading, refresh: refreshFavorites } = useStockFavorites();

  useEffect(() => {
    if (isOpen && resources.length === 0) {
      search(initialQuery, filters);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'favorites') {
      refreshFavorites();
    }
  }, [activeTab]);

  const handleSearch = useCallback(() => {
    const searchFilters: StockSearchOptions = { ...filters };
    if (allowedTypes && allowedTypes.length === 1) {
      searchFilters.content_type = allowedTypes[0];
    }
    search(searchQuery, searchFilters);
  }, [searchQuery, filters, allowedTypes, search]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResourceClick = (resource: StockResource) => {
    if (multiSelect) {
      setSelectedResources(prev => {
        const isSelected = prev.some(r => r.id === resource.id);
        if (isSelected) {
          return prev.filter(r => r.id !== resource.id);
        }
        return [...prev, resource];
      });
    } else {
      onSelect(resource);
      onClose();
    }
  };

  const handleConfirmMultiSelect = () => {
    if (onMultiSelect && selectedResources.length > 0) {
      onMultiSelect(selectedResources);
      onClose();
    }
  };

  const handleToggleFavorite = async (resource: StockResource, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(resource);
    if (activeTab === 'favorites') {
      refreshFavorites();
    }
  };

  const displayResources = activeTab === 'favorites' ? favorites : resources;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Image className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showFavorites && (
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'search'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Search className="w-4 h-4 inline-block mr-2" />
              Search
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Heart className="w-4 h-4 inline-block mr-2" />
              Favorites ({favorites.length})
            </button>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-64 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search stock images..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>

              {(!allowedTypes || allowedTypes.length > 1) && (
                <select
                  value={filters.content_type || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    content_type: e.target.value as StockSearchOptions['content_type'] || undefined
                  }))}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white min-w-32"
                >
                  <option value="">All Types</option>
                  {(allowedTypes || ['photo', 'vector', 'psd', 'icon', 'video']).map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}s
                    </option>
                  ))}
                </select>
              )}

              <select
                value={filters.orientation || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  orientation: e.target.value as StockSearchOptions['orientation'] || undefined
                }))}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white min-w-36"
              >
                <option value="">Any Orientation</option>
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
                <option value="square">Square</option>
              </select>

              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </button>

              <div className="flex items-center gap-1 border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {!isAvailable ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Image className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Stock Library Not Available</p>
              <p className="text-sm mt-1">Please configure your API key to access stock images.</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-medium">Error loading images</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : isLoading && displayResources.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : displayResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Image className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">
                {activeTab === 'favorites' ? 'No favorites yet' : 'No images found'}
              </p>
              <p className="text-sm mt-1">
                {activeTab === 'favorites'
                  ? 'Heart images to add them to your favorites'
                  : 'Try adjusting your search terms'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {displayResources.map((resource) => (
                <StockImageCard
                  key={resource.id}
                  resource={resource}
                  isSelected={selectedResources.some(r => r.id === resource.id)}
                  isFavorite={isFavorite(resource.id)}
                  onSelect={() => handleResourceClick(resource)}
                  onToggleFavorite={(e) => handleToggleFavorite(resource, e)}
                  onPreview={() => setPreviewResource(resource)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {displayResources.map((resource) => (
                <StockImageListItem
                  key={resource.id}
                  resource={resource}
                  isSelected={selectedResources.some(r => r.id === resource.id)}
                  isFavorite={isFavorite(resource.id)}
                  onSelect={() => handleResourceClick(resource)}
                  onToggleFavorite={(e) => handleToggleFavorite(resource, e)}
                />
              ))}
            </div>
          )}

          {activeTab === 'search' && hasMore && displayResources.length > 0 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium transition-colors flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>

        {multiSelect && selectedResources.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedResources.length} image{selectedResources.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedResources([])}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear
              </button>
              <button
                onClick={handleConfirmMultiSelect}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Use Selected
              </button>
            </div>
          </div>
        )}

        {!multiSelect && (
          <div className="p-3 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-500">
            Click an image to use it in your project
          </div>
        )}
      </div>

      {previewResource && (
        <StockImagePreviewModal
          resource={previewResource}
          onClose={() => setPreviewResource(null)}
          onSelect={() => {
            handleResourceClick(previewResource);
            setPreviewResource(null);
          }}
          isFavorite={isFavorite(previewResource.id)}
          onToggleFavorite={(e) => handleToggleFavorite(previewResource, e)}
        />
      )}
    </div>
  );
}

interface StockImageCardProps {
  resource: StockResource;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onPreview: () => void;
}

function StockImageCard({
  resource,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onPreview
}: StockImageCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-blue-300'
      }`}
    >
      {resource.thumbnailUrl ? (
        <img
          src={resource.thumbnailUrl}
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <Image className="w-8 h-8" />
        </div>
      )}

      {isSelected && (
        <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <button
        onClick={onToggleFavorite}
        className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${
          isFavorite
            ? 'bg-red-500 text-white'
            : 'bg-white/80 text-gray-600 hover:bg-white opacity-0 group-hover:opacity-100'
        }`}
      >
        <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-xs font-medium truncate">{resource.title}</p>
        <div className="flex items-center justify-between text-white/80 text-xs mt-0.5">
          <span className="flex items-center gap-1">
            {typeIcons[resource.type || 'photo']}
            <span className="capitalize">{resource.type || 'Photo'}</span>
          </span>
          {resource.author && (
            <span className="truncate max-w-20">by {resource.author}</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface StockImageListItemProps {
  resource: StockResource;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

function StockImageListItem({
  resource,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite
}: StockImageListItemProps) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-4 p-3 bg-white border rounded-lg cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {resource.thumbnailUrl ? (
          <img
            src={resource.thumbnailUrl}
            alt={resource.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Image className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-900 truncate">{resource.title}</h4>
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
          <span className="flex items-center gap-1 capitalize">
            {typeIcons[resource.type || 'photo']}
            {resource.type || 'Photo'}
          </span>
          <span>{resource.orientation || 'Unknown'}</span>
          {resource.author && <span>by {resource.author}</span>}
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {resource.downloads}
          </span>
        </div>
      </div>

      <button
        onClick={onToggleFavorite}
        className={`p-2 rounded-full transition-colors ${
          isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
        }`}
      >
        <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}

interface StockImagePreviewModalProps {
  resource: StockResource;
  onClose: () => void;
  onSelect: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

function StockImagePreviewModal({
  resource,
  onClose,
  onSelect,
  isFavorite,
  onToggleFavorite
}: StockImagePreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {resource.previewUrl || resource.thumbnailUrl ? (
            <img
              src={resource.previewUrl || resource.thumbnailUrl || ''}
              alt={resource.title}
              className="max-h-[60vh] w-auto mx-auto"
            />
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-100">
              <Image className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
            <span className="flex items-center gap-1 capitalize">
              {typeIcons[resource.type || 'photo']}
              {resource.type || 'Photo'}
            </span>
            {resource.orientation && <span>{resource.orientation}</span>}
            {resource.width && resource.height && (
              <span>{resource.width} x {resource.height}</span>
            )}
            {resource.author && <span>by {resource.author}</span>}
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {resource.downloads} downloads
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {resource.likes} likes
            </span>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <button
              onClick={onToggleFavorite}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isFavorite
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onSelect}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Use This Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockImagePicker;
