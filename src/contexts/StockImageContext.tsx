import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import stockImageService, {
  StockResource,
  StockSearchOptions,
  StockSearchResult,
  StockFavorite,
  StockDownload
} from '../services/stockImageService';

interface StockImageContextState {
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  searchResults: StockResource[];
  favorites: StockFavorite[];
  recentDownloads: StockDownload[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  searchQuery: string;
  filters: StockSearchOptions;
  selectedResource: StockResource | null;
  isPickerOpen: boolean;
}

interface StockImageContextActions {
  search: (options?: StockSearchOptions) => Promise<void>;
  loadMore: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<StockSearchOptions>) => void;
  clearFilters: () => void;
  selectResource: (resource: StockResource | null) => void;
  addToFavorites: (resource: StockResource) => Promise<boolean>;
  removeFromFavorites: (resourceId: string | number) => Promise<boolean>;
  isFavorite: (resourceId: string | number) => boolean;
  recordDownload: (resource: StockResource, format: string, downloadUrl: string, moduleName: string) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
  refreshDownloadHistory: () => Promise<void>;
  openPicker: (onSelect?: (resource: StockResource) => void) => void;
  closePicker: () => void;
  trackUsage: (moduleName: string, actionType: 'search' | 'preview' | 'download' | 'use', resourceId?: string | number, searchQuery?: string) => void;
}

interface StockImageContextValue extends StockImageContextState, StockImageContextActions {}

const StockImageContext = createContext<StockImageContextValue | null>(null);

interface StockImageProviderProps {
  children: ReactNode;
}

export function StockImageProvider({ children }: StockImageProviderProps) {
  const [state, setState] = useState<StockImageContextState>({
    isAvailable: false,
    isLoading: false,
    error: null,
    searchResults: [],
    favorites: [],
    recentDownloads: [],
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    searchQuery: '',
    filters: {},
    selectedResource: null,
    isPickerOpen: false
  });

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [onSelectCallback, setOnSelectCallback] = useState<((resource: StockResource) => void) | null>(null);

  useEffect(() => {
    const checkAvailability = () => {
      const available = stockImageService.isAvailable();
      setState(prev => ({ ...prev, isAvailable: available }));
    };

    checkAvailability();
  }, []);

  useEffect(() => {
    if (state.isAvailable) {
      refreshFavorites();
      refreshDownloadHistory();
    }
  }, [state.isAvailable]);

  const search = useCallback(async (options: StockSearchOptions = {}) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const searchOptions: StockSearchOptions = {
        ...state.filters,
        ...options,
        keywords: options.keywords ?? state.searchQuery,
        page: 1,
        per_page: 20
      };

      const result: StockSearchResult = await stockImageService.search(searchOptions);

      setState(prev => ({
        ...prev,
        isLoading: false,
        searchResults: result.resources,
        currentPage: result.meta.current_page,
        totalPages: result.meta.last_page,
        totalResults: result.meta.total
      }));

      stockImageService.trackUsage('global', 'search', undefined, searchOptions.keywords);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed'
      }));
    }
  }, [state.searchQuery, state.filters]);

  const loadMore = useCallback(async () => {
    if (state.isLoading || state.currentPage >= state.totalPages) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const searchOptions: StockSearchOptions = {
        ...state.filters,
        keywords: state.searchQuery,
        page: state.currentPage + 1,
        per_page: 20
      };

      const result: StockSearchResult = await stockImageService.search(searchOptions);

      setState(prev => ({
        ...prev,
        isLoading: false,
        searchResults: [...prev.searchResults, ...result.resources],
        currentPage: result.meta.current_page
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load more'
      }));
    }
  }, [state.isLoading, state.currentPage, state.totalPages, state.filters, state.searchQuery]);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<StockSearchOptions>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {},
      searchQuery: ''
    }));
  }, []);

  const selectResource = useCallback((resource: StockResource | null) => {
    setState(prev => ({ ...prev, selectedResource: resource }));
    if (resource) {
      stockImageService.trackUsage('global', 'preview', resource.id);
    }
  }, []);

  const addToFavorites = useCallback(async (resource: StockResource): Promise<boolean> => {
    const success = await stockImageService.addFavorite(resource);
    if (success) {
      setFavoriteIds(prev => new Set([...prev, resource.id.toString()]));
      await refreshFavorites();
    }
    return success;
  }, []);

  const removeFromFavorites = useCallback(async (resourceId: string | number): Promise<boolean> => {
    const success = await stockImageService.removeFavorite(resourceId);
    if (success) {
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(resourceId.toString());
        return newSet;
      });
      await refreshFavorites();
    }
    return success;
  }, []);

  const isFavorite = useCallback((resourceId: string | number): boolean => {
    return favoriteIds.has(resourceId.toString());
  }, [favoriteIds]);

  const recordDownload = useCallback(async (
    resource: StockResource,
    format: string,
    downloadUrl: string,
    moduleName: string
  ): Promise<boolean> => {
    const success = await stockImageService.recordDownload(resource, format, downloadUrl, moduleName);
    if (success) {
      stockImageService.trackUsage(moduleName, 'download', resource.id);
      await refreshDownloadHistory();
    }
    return success;
  }, []);

  const refreshFavorites = useCallback(async () => {
    const favorites = await stockImageService.getFavorites();
    setState(prev => ({ ...prev, favorites }));
    setFavoriteIds(new Set(favorites.map(f => f.resource_id)));
  }, []);

  const refreshDownloadHistory = useCallback(async () => {
    const downloads = await stockImageService.getDownloadHistory(20);
    setState(prev => ({ ...prev, recentDownloads: downloads }));
  }, []);

  const openPicker = useCallback((onSelect?: (resource: StockResource) => void) => {
    setOnSelectCallback(() => onSelect || null);
    setState(prev => ({ ...prev, isPickerOpen: true }));
  }, []);

  const closePicker = useCallback(() => {
    setOnSelectCallback(null);
    setState(prev => ({ ...prev, isPickerOpen: false, selectedResource: null }));
  }, []);

  const trackUsage = useCallback((
    moduleName: string,
    actionType: 'search' | 'preview' | 'download' | 'use',
    resourceId?: string | number,
    searchQuery?: string
  ) => {
    stockImageService.trackUsage(moduleName, actionType, resourceId, searchQuery);
  }, []);

  const handleResourceSelect = useCallback((resource: StockResource) => {
    if (onSelectCallback) {
      onSelectCallback(resource);
      stockImageService.trackUsage('picker', 'use', resource.id);
    }
    closePicker();
  }, [onSelectCallback, closePicker]);

  const contextValue: StockImageContextValue = {
    ...state,
    search,
    loadMore,
    setSearchQuery,
    setFilters,
    clearFilters,
    selectResource,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    recordDownload,
    refreshFavorites,
    refreshDownloadHistory,
    openPicker,
    closePicker,
    trackUsage
  };

  return (
    <StockImageContext.Provider value={contextValue}>
      {children}
      {state.isPickerOpen && (
        <StockImagePickerModal
          onSelect={handleResourceSelect}
          onClose={closePicker}
        />
      )}
    </StockImageContext.Provider>
  );
}

export function useStockImages() {
  const context = useContext(StockImageContext);
  if (!context) {
    throw new Error('useStockImages must be used within a StockImageProvider');
  }
  return context;
}

function StockImagePickerModal({
  onSelect,
  onClose
}: {
  onSelect: (resource: StockResource) => void;
  onClose: () => void;
}) {
  const {
    searchResults,
    isLoading,
    searchQuery,
    setSearchQuery,
    search,
    loadMore,
    currentPage,
    totalPages,
    filters,
    setFilters,
    isFavorite,
    addToFavorites,
    removeFromFavorites
  } = useStockImages();

  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    if (searchResults.length === 0) {
      search();
    }
  }, []);

  const handleSearch = () => {
    setSearchQuery(localQuery);
    search({ keywords: localQuery });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleFavorite = async (resource: StockResource, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite(resource.id)) {
      await removeFromFavorites(resource.id);
    } else {
      await addToFavorites(resource);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Stock Image Library</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search stock images..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filters.content_type || ''}
              onChange={(e) => setFilters({ content_type: e.target.value as StockSearchOptions['content_type'] || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Types</option>
              <option value="photo">Photos</option>
              <option value="vector">Vectors</option>
              <option value="psd">PSD</option>
              <option value="icon">Icons</option>
            </select>

            <select
              value={filters.orientation || ''}
              onChange={(e) => setFilters({ orientation: e.target.value as StockSearchOptions['orientation'] || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Any Orientation</option>
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
              <option value="square">Square</option>
            </select>

            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && searchResults.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg">No images found</p>
              <p className="text-sm mt-1">Try adjusting your search terms</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {searchResults.map((resource) => (
                  <div
                    key={resource.id}
                    onClick={() => onSelect(resource)}
                    className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
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
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    <button
                      onClick={(e) => toggleFavorite(resource, e)}
                      className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${
                        isFavorite(resource.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <svg className="w-4 h-4" fill={isFavorite(resource.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium truncate">{resource.title}</p>
                      <div className="flex items-center gap-2 text-white/80 text-xs mt-0.5">
                        <span className="capitalize">{resource.type || 'Photo'}</span>
                        {resource.author && <span>by {resource.author}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {currentPage < totalPages && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium transition-colors"
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-3 border-t bg-gray-50 text-center text-sm text-gray-500">
          Click an image to use it in your project
        </div>
      </div>
    </div>
  );
}

export { StockImageContext };
export type { StockImageContextValue, StockImageContextState, StockImageContextActions };
