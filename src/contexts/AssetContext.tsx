import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import stockImageService, { StockResource } from '../services/stockImageService';

// Asset Types
export interface Asset {
  id: string;
  source: 'stock' | 'user_upload' | 'generated' | 'premium';
  externalId?: string;
  type: 'image' | 'video' | 'vector' | 'psd' | 'icon';
  title: string;
  description?: string;
  thumbnailUrl: string | null;
  downloadUrl?: string;
  width?: number | null;
  height?: number | null;
  orientation?: 'horizontal' | 'vertical' | 'square';
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  author?: string | null;
  downloads?: number;
  likes?: number;
  license?: string | null;
}

export interface UserAsset extends Asset {
  userId: string;
  addedAt: Date;
  usageCount: number;
  isFavorite: boolean;
  collections?: string[];
  tags?: string[];
}

export interface AssetSearchQuery {
  query?: string;
  type?: Asset['type'] | 'all';
  orientation?: Asset['orientation'];
  source?: Asset['source'] | 'all';
  limit?: number;
  offset?: number;
}

export interface AssetContextType {
  // Asset collections
  availableAssets: Asset[];
  userLibrary: UserAsset[];
  recentAssets: Asset[];
  favoriteAssets: Asset[];
  collections: Record<string, Asset[]>;

  // Loading states
  isLoading: boolean;
  isSearching: boolean;

  // Asset management functions
  searchAssets: (query: AssetSearchQuery) => Promise<Asset[]>;
  addToUserLibrary: (asset: Asset) => Promise<void>;
  removeFromUserLibrary: (assetId: string) => Promise<void>;
  toggleFavorite: (assetId: string) => Promise<void>;
  createCollection: (name: string, assets: Asset[]) => Promise<void>;
  addToCollection: (collectionName: string, asset: Asset) => Promise<void>;
  removeFromCollection: (collectionName: string, assetId: string) => Promise<void>;

  // Asset retrieval
  getAssetById: (id: string) => Asset | undefined;
  getUserAssetById: (id: string) => UserAsset | undefined;

  // Analytics
  trackAssetUsage: (assetId: string, tool: string, action: string) => Promise<void>;
  getAssetUsageStats: (assetId: string) => Promise<any>;

  // Cache management
  refreshAssets: () => Promise<void>;
  clearCache: () => void;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const useAssetContext = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssetContext must be used within an AssetProvider');
  }
  return context;
};

interface AssetProviderProps {
  children: React.ReactNode;
}

export const AssetProvider: React.FC<AssetProviderProps> = ({ children }) => {
  // State management
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [userLibrary, setUserLibrary] = useState<UserAsset[]>([]);
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  const [favoriteAssets, setFavoriteAssets] = useState<Asset[]>([]);
  const [collections, setCollections] = useState<Record<string, Asset[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize assets on mount
  useEffect(() => {
    loadInitialAssets();
    loadUserLibrary();
  }, []);

  const mapStockResourceToAsset = (resource: StockResource): Asset => ({
    id: `stock-${resource.id}`,
    source: 'stock',
    externalId: resource.id.toString(),
    type: resource.type === 'photo' ? 'image' : (resource.type as Asset['type']) || 'image',
    title: resource.title,
    thumbnailUrl: resource.thumbnailUrl,
    downloadUrl: resource.url,
    width: resource.width,
    height: resource.height,
    orientation: resource.orientation as Asset['orientation'],
    author: resource.author,
    downloads: resource.downloads,
    likes: resource.likes,
    license: resource.license,
    createdAt: new Date(resource.publishedAt || Date.now()),
    metadata: {
      freepikId: resource.id,
      filename: resource.filename
    }
  });

  const loadInitialAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await stockImageService.search({ per_page: 50 });
      const formattedAssets: Asset[] = result.resources.map(mapStockResourceToAsset);
      setAvailableAssets(formattedAssets);
    } catch (error) {
      console.error('Failed to load initial assets:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserLibrary = useCallback(async () => {
    try {
      // Load from localStorage for now (will be replaced with database later)
      const savedLibrary = localStorage.getItem('user_asset_library');
      if (savedLibrary) {
        const parsedLibrary: UserAsset[] = JSON.parse(savedLibrary);
        setUserLibrary(parsedLibrary);

        // Extract favorites
        const favorites = parsedLibrary.filter(asset => asset.isFavorite);
        setFavoriteAssets(favorites.map(ua => ({ ...ua, id: ua.id.replace('user-', '') })));
      }
    } catch (error) {
      console.error('Failed to load user library:', error);
    }
  }, []);

  const searchAssets = useCallback(async (query: AssetSearchQuery): Promise<Asset[]> => {
    setIsSearching(true);
    try {
      const { query: searchQuery, type, orientation, source, limit = 20, offset = 0 } = query;

      if (source === 'stock' || source === 'all' || !source) {
        const result = await stockImageService.search({
          keywords: searchQuery,
          content_type: type && type !== 'all' ? (type === 'image' ? 'photo' : type as 'photo' | 'vector' | 'psd' | 'icon' | 'video') : undefined,
          orientation: orientation,
          per_page: limit,
          page: Math.floor(offset / limit) + 1
        });

        return result.resources.map(mapStockResourceToAsset);
      }

      if (source === 'user_upload') {
        return userLibrary
          .filter(asset =>
            (!searchQuery || asset.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (!type || type === 'all' || asset.type === type) &&
            (!orientation || asset.orientation === orientation)
          )
          .slice(offset, offset + limit)
          .map(ua => ({ ...ua, id: ua.id.replace('user-', '') }));
      }

      return [];
    } catch (error) {
      console.error('Asset search failed:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [userLibrary]);

  const addToUserLibrary = useCallback(async (asset: Asset) => {
    try {
      const userAsset: UserAsset = {
        ...asset,
        id: `user-${asset.id}`,
        userId: 'local-user', // For now, use local user
        addedAt: new Date(),
        usageCount: 0,
        isFavorite: false,
        collections: [],
        tags: []
      };

      setUserLibrary(prev => {
        const updated = [...prev, userAsset];
        localStorage.setItem('user_asset_library', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to add asset to library:', error);
      throw error;
    }
  }, []);

  const removeFromUserLibrary = useCallback(async (assetId: string) => {
    try {
      setUserLibrary(prev => {
        const updated = prev.filter(asset => asset.id !== `user-${assetId}`);
        localStorage.setItem('user_asset_library', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to remove asset from library:', error);
      throw error;
    }
  }, []);

  const toggleFavorite = useCallback(async (assetId: string) => {
    try {
      const isCurrentlyFavorite = favoriteAssets.some(asset => asset.id === assetId);

      // Update local state
      setUserLibrary(prev => {
        const updated = prev.map(asset =>
          asset.id === `user-${assetId}`
            ? { ...asset, isFavorite: !isCurrentlyFavorite }
            : asset
        );
        localStorage.setItem('user_asset_library', JSON.stringify(updated));
        return updated;
      });

      if (isCurrentlyFavorite) {
        setFavoriteAssets(prev => prev.filter(asset => asset.id !== assetId));
      } else {
        const asset = availableAssets.find(a => a.id === assetId) ||
                     userLibrary.find(a => a.id === `user-${assetId}`);
        if (asset) {
          setFavoriteAssets(prev => [...prev, asset]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }, [favoriteAssets, availableAssets, userLibrary]);

  const createCollection = useCallback(async (name: string, assets: Asset[]) => {
    setCollections(prev => ({
      ...prev,
      [name]: assets
    }));

    // TODO: Save to database
  }, []);

  const addToCollection = useCallback(async (collectionName: string, asset: Asset) => {
    setCollections(prev => ({
      ...prev,
      [collectionName]: [...(prev[collectionName] || []), asset]
    }));

    // TODO: Save to database
  }, []);

  const removeFromCollection = useCallback(async (collectionName: string, assetId: string) => {
    setCollections(prev => ({
      ...prev,
      [collectionName]: prev[collectionName]?.filter(asset => asset.id !== assetId) || []
    }));

    // TODO: Save to database
  }, []);

  const getAssetById = useCallback((id: string): Asset | undefined => {
    return availableAssets.find(asset => asset.id === id) ||
           userLibrary.find(asset => asset.id === `user-${id}`) ||
           favoriteAssets.find(asset => asset.id === id);
  }, [availableAssets, userLibrary, favoriteAssets]);

  const getUserAssetById = useCallback((id: string): UserAsset | undefined => {
    return userLibrary.find(asset => asset.id === `user-${id}`);
  }, [userLibrary]);

  const trackAssetUsage = useCallback(async (assetId: string, tool: string, action: string) => {
    try {
      // Store usage data in localStorage for now
      const usageKey = 'asset_usage_stats';
      const existingUsage = JSON.parse(localStorage.getItem(usageKey) || '{}');

      if (!existingUsage[assetId]) {
        existingUsage[assetId] = { totalUsage: 0, usageByTool: {} };
      }

      existingUsage[assetId].totalUsage += 1;
      existingUsage[assetId].usageByTool[tool] = (existingUsage[assetId].usageByTool[tool] || 0) + 1;

      localStorage.setItem(usageKey, JSON.stringify(existingUsage));

      // Update usage count in user library
      setUserLibrary(prev => {
        const updated = prev.map(asset =>
          asset.id === `user-${assetId}`
            ? { ...asset, usageCount: asset.usageCount + 1 }
            : asset
        );
        localStorage.setItem('user_asset_library', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to track asset usage:', error);
    }
  }, []);

  const getAssetUsageStats = useCallback(async (assetId: string) => {
    try {
      const usageKey = 'asset_usage_stats';
      const existingUsage = JSON.parse(localStorage.getItem(usageKey) || '{}');

      const assetStats = existingUsage[assetId] || { totalUsage: 0, usageByTool: {} };

      return {
        totalUsage: assetStats.totalUsage || 0,
        usageByTool: assetStats.usageByTool || {},
        recentUsage: [] // Not tracking individual usage events in localStorage
      };
    } catch (error) {
      console.error('Failed to get asset usage stats:', error);
      return { totalUsage: 0, usageByTool: {}, recentUsage: [] };
    }
  }, []);

  const refreshAssets = useCallback(async () => {
    await loadInitialAssets();
    await loadUserLibrary();
  }, [loadInitialAssets, loadUserLibrary]);

  const clearCache = useCallback(() => {
    setAvailableAssets([]);
    setUserLibrary([]);
    setRecentAssets([]);
    setFavoriteAssets([]);
    setCollections({});
  }, []);

  const contextValue: AssetContextType = {
    availableAssets,
    userLibrary,
    recentAssets,
    favoriteAssets,
    collections,
    isLoading,
    isSearching,
    searchAssets,
    addToUserLibrary,
    removeFromUserLibrary,
    toggleFavorite,
    createCollection,
    addToCollection,
    removeFromCollection,
    getAssetById,
    getUserAssetById,
    trackAssetUsage,
    getAssetUsageStats,
    refreshAssets,
    clearCache
  };

  return (
    <AssetContext.Provider value={contextValue}>
      {children}
    </AssetContext.Provider>
  );
};