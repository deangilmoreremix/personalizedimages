import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, Heart, Grid, List, Loader2 } from 'lucide-react';
import { fetchFreepikResources } from '../utils/api';
import { hasApiKey } from '../utils/apiUtils';

interface FreepikResource {
  id: number;
  title: string;
  url: string;
  filename: string;
  thumbnailUrl: string | null;
  type: string | null;
  orientation: string | null;
  width: number | null;
  height: number | null;
  downloads: number;
  likes: number;
  author: string | null;
  publishedAt: string | null;
  license: string | null;
}

interface FreepikResourceGalleryProps {
  onResourceSelect?: (resource: FreepikResource) => void;
  maxHeight?: string;
  showFilters?: boolean;
}

const FreepikResourceGallery: React.FC<FreepikResourceGalleryProps> = ({
  onResourceSelect,
  maxHeight = '600px',
  showFilters = true
}) => {
  const [resources, setResources] = useState<FreepikResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'photo' | 'vector' | 'psd' | 'icon' | 'video' | ''>('');
  const [selectedOrientation, setSelectedOrientation] = useState<'horizontal' | 'vertical' | 'square' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Check if stock API is available
  const isStockAvailable = hasApiKey('freepik');

  const loadResources = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!isStockAvailable) {
      setError('Stock API key not configured. Please add VITE_FREEPIK_API_KEY to your environment variables.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const options: any = {
        page,
        per_page: 20
      };

      if (searchQuery.trim()) {
        options.keywords = searchQuery.trim();
      }

      if (selectedType) {
        options.content_type = selectedType;
      }

      if (selectedOrientation) {
        options.orientation = selectedOrientation;
      }

      const result = await fetchFreepikResources(options);

      if (append) {
        setResources(prev => [...prev, ...result.resources]);
      } else {
        setResources(result.resources);
      }

      setHasMore(result.meta.current_page < result.meta.last_page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, selectedOrientation, isStockAvailable]);

  // Initial load
  useEffect(() => {
    loadResources(1, false);
  }, [loadResources]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadResources(1, false);
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadResources(nextPage, true);
  };

  const toggleFavorite = (resourceId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(resourceId)) {
        newFavorites.delete(resourceId);
      } else {
        newFavorites.add(resourceId);
      }
      return newFavorites;
    });
  };

  const handleResourceClick = (resource: FreepikResource) => {
    if (onResourceSelect) {
      onResourceSelect(resource);
    }
  };

  if (!isStockAvailable) {
    return (
      <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Stock Library Not Available</h3>
          <p className="text-sm">Please configure your API key to access stock resources.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Stock Resources</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="photo">Photo</option>
            <option value="vector">Vector</option>
            <option value="psd">PSD</option>
            <option value="icon">Icon</option>
            <option value="video">Video</option>
          </select>

          <select
            value={selectedOrientation}
            onChange={(e) => setSelectedOrientation(e.target.value as any)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Orientations</option>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
            <option value="square">Square</option>
          </select>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Search
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div
        className={`overflow-y-auto ${maxHeight ? `max-h-[${maxHeight}]` : ''}`}
        style={{ maxHeight }}
      >
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="group relative bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleResourceClick(resource)}
              >
                <div className="aspect-square bg-gray-100 relative">
                  {resource.thumbnailUrl ? (
                    <img
                      src={resource.thumbnailUrl}
                      alt={resource.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-2 opacity-50">📷</div>
                        <div className="text-xs">No preview</div>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(resource.id);
                      }}
                      className={`p-1 rounded-full ${
                        favorites.has(resource.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <Heart className="w-3 h-3" fill={favorites.has(resource.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs font-medium truncate">{resource.title}</p>
                    <div className="flex items-center justify-between text-white/80 text-xs">
                      <span>{resource.type || 'Unknown'}</span>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>{resource.downloads}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center gap-4 p-3 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleResourceClick(resource)}
              >
                <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                  {resource.thumbnailUrl ? (
                    <img
                      src={resource.thumbnailUrl}
                      alt={resource.title}
                      className="w-full h-full object-cover rounded"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      📷
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{resource.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>{resource.type || 'Unknown'}</span>
                    <span>{resource.orientation || 'Unknown'}</span>
                    {resource.author && <span>by {resource.author}</span>}
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{resource.downloads}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{resource.likes}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(resource.id);
                  }}
                  className={`p-2 rounded-full ${
                    favorites.has(resource.id)
                      ? 'text-red-500'
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className="w-4 h-4" fill={favorites.has(resource.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading resources...</span>
          </div>
        )}

        {!loading && hasMore && resources.length > 0 && (
          <div className="text-center py-4">
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Load More
            </button>
          </div>
        )}

        {!loading && resources.length === 0 && !error && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No resources found. Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreepikResourceGallery;