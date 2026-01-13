import { useState, useCallback, useEffect } from 'react';
import stockImageService, {
  StockResource,
  StockSearchOptions,
  StockSearchResult
} from '../services/stockImageService';

interface UseStockImagesOptions {
  initialQuery?: string;
  initialFilters?: StockSearchOptions;
  autoLoad?: boolean;
  perPage?: number;
  moduleName?: string;
}

interface UseStockImagesReturn {
  resources: StockResource[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  hasMore: boolean;
  search: (query?: string, options?: StockSearchOptions) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  clearResults: () => void;
  favorites: Set<number>;
  toggleFavorite: (resource: StockResource) => Promise<void>;
  isFavorite: (resourceId: number) => boolean;
  selectImage: (resource: StockResource, downloadUrl?: string) => Promise<void>;
  isAvailable: boolean;
}

export function useStockImages(options: UseStockImagesOptions = {}): UseStockImagesReturn {
  const {
    initialQuery = '',
    initialFilters = {},
    autoLoad = false,
    perPage = 20,
    moduleName = 'unknown'
  } = options;

  const [resources, setResources] = useState<StockResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [lastQuery, setLastQuery] = useState(initialQuery);
  const [lastFilters, setLastFilters] = useState(initialFilters);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsAvailable(stockImageService.isAvailable());
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      const favs = await stockImageService.getFavorites();
      setFavorites(new Set(favs.map(f => parseInt(f.resource_id))));
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    if (autoLoad && isAvailable) {
      search(initialQuery, initialFilters);
    }
  }, [autoLoad, isAvailable]);

  const search = useCallback(async (query?: string, searchOptions?: StockSearchOptions) => {
    setIsLoading(true);
    setError(null);

    const searchQuery = query ?? lastQuery;
    const filters = searchOptions ?? lastFilters;

    setLastQuery(searchQuery);
    setLastFilters(filters);

    try {
      const result: StockSearchResult = await stockImageService.search({
        ...filters,
        keywords: searchQuery || undefined,
        page: 1,
        per_page: perPage
      });

      setResources(result.resources);
      setCurrentPage(result.meta.current_page);
      setTotalPages(result.meta.last_page);
      setTotalResults(result.meta.total);

      stockImageService.trackUsage(moduleName, 'search', undefined, searchQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, [lastQuery, lastFilters, perPage, moduleName]);

  const loadMore = useCallback(async () => {
    if (isLoading || currentPage >= totalPages) return;

    setIsLoading(true);

    try {
      const result: StockSearchResult = await stockImageService.search({
        ...lastFilters,
        keywords: lastQuery || undefined,
        page: currentPage + 1,
        per_page: perPage
      });

      setResources(prev => [...prev, ...result.resources]);
      setCurrentPage(result.meta.current_page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentPage, totalPages, lastQuery, lastFilters, perPage]);

  const refresh = useCallback(async () => {
    await search(lastQuery, lastFilters);
  }, [search, lastQuery, lastFilters]);

  const clearResults = useCallback(() => {
    setResources([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalResults(0);
    setError(null);
  }, []);

  const toggleFavorite = useCallback(async (resource: StockResource) => {
    const resourceId = resource.id;
    const isFav = favorites.has(resourceId);

    if (isFav) {
      const success = await stockImageService.removeFavorite(resourceId);
      if (success) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(resourceId);
          return newSet;
        });
      }
    } else {
      const success = await stockImageService.addFavorite(resource);
      if (success) {
        setFavorites(prev => new Set([...prev, resourceId]));
      }
    }
  }, [favorites]);

  const isFavorite = useCallback((resourceId: number): boolean => {
    return favorites.has(resourceId);
  }, [favorites]);

  const selectImage = useCallback(async (resource: StockResource, downloadUrl?: string) => {
    stockImageService.trackUsage(moduleName, 'use', resource.id);

    if (downloadUrl) {
      await stockImageService.recordDownload(
        resource,
        'original',
        downloadUrl,
        moduleName
      );
    }
  }, [moduleName]);

  return {
    resources,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalResults,
    hasMore: currentPage < totalPages,
    search,
    loadMore,
    refresh,
    clearResults,
    favorites,
    toggleFavorite,
    isFavorite,
    selectImage,
    isAvailable
  };
}

export function useStockImagePicker(moduleName: string = 'picker') {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<StockResource | null>(null);
  const [onSelectCallback, setOnSelectCallback] = useState<((resource: StockResource) => void) | null>(null);

  const open = useCallback((onSelect?: (resource: StockResource) => void) => {
    if (onSelect) {
      setOnSelectCallback(() => onSelect);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedResource(null);
    setOnSelectCallback(null);
  }, []);

  const select = useCallback((resource: StockResource) => {
    setSelectedResource(resource);
    stockImageService.trackUsage(moduleName, 'use', resource.id);

    if (onSelectCallback) {
      onSelectCallback(resource);
    }
    close();
  }, [onSelectCallback, close, moduleName]);

  return {
    isOpen,
    selectedResource,
    open,
    close,
    select
  };
}

export function useStockFavorites() {
  const [favorites, setFavorites] = useState<StockResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const favs = await stockImageService.getFavorites();
      const resources: StockResource[] = favs.map(f => ({
        id: parseInt(f.resource_id),
        title: f.title || '',
        url: (f.metadata as Record<string, unknown>)?.url as string || '',
        filename: '',
        thumbnailUrl: f.thumbnail_url,
        previewUrl: f.preview_url,
        type: f.resource_type as StockResource['type'],
        orientation: null,
        width: (f.metadata as Record<string, unknown>)?.width as number || null,
        height: (f.metadata as Record<string, unknown>)?.height as number || null,
        downloads: (f.metadata as Record<string, unknown>)?.downloads as number || 0,
        likes: (f.metadata as Record<string, unknown>)?.likes as number || 0,
        author: (f.metadata as Record<string, unknown>)?.author as string || null,
        publishedAt: f.created_at,
        license: null
      }));
      setFavorites(resources);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    isLoading,
    refresh: loadFavorites
  };
}

export function useStockDownloadHistory(limit: number = 20) {
  const [downloads, setDownloads] = useState<Array<{
    resource: StockResource;
    downloadedAt: string;
    module: string;
    format: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const history = await stockImageService.getDownloadHistory(limit);
      const mapped = history.map(d => ({
        resource: {
          id: parseInt(d.resource_id),
          title: d.title || '',
          url: (d.metadata as Record<string, unknown>)?.url as string || '',
          filename: '',
          thumbnailUrl: null,
          previewUrl: null,
          type: d.resource_type as StockResource['type'],
          orientation: null,
          width: (d.metadata as Record<string, unknown>)?.width as number || null,
          height: (d.metadata as Record<string, unknown>)?.height as number || null,
          downloads: 0,
          likes: 0,
          author: (d.metadata as Record<string, unknown>)?.author as string || null,
          publishedAt: null,
          license: null
        },
        downloadedAt: d.created_at,
        module: d.used_in_module || 'unknown',
        format: d.download_format || 'unknown'
      }));
      setDownloads(mapped);
    } catch (err) {
      console.error('Failed to load download history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    downloads,
    isLoading,
    refresh: loadHistory
  };
}

export default useStockImages;
