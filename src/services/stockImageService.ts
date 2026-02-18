import { supabase, isSupabaseConfigured, callEdgeFunction } from '../utils/supabaseClient';
import { getFreepikApiKey, hasApiKey } from '../utils/apiUtils';

export interface StockResource {
  id: number;
  title: string;
  url: string;
  filename: string;
  thumbnailUrl: string | null;
  previewUrl: string | null;
  type: 'photo' | 'vector' | 'psd' | 'icon' | 'video' | string | null;
  orientation: 'horizontal' | 'vertical' | 'square' | string | null;
  width: number | null;
  height: number | null;
  downloads: number;
  likes: number;
  author: string | null;
  publishedAt: string | null;
  license: string | null;
  requiresAttribution?: boolean;
  attributionText?: string;
  attributionUrl?: string;
}

export interface StockSearchOptions {
  keywords?: string;
  content_type?: 'photo' | 'vector' | 'psd' | 'icon' | 'video';
  orientation?: 'horizontal' | 'vertical' | 'square';
  license?: string;
  page?: number;
  per_page?: number;
  color?: string;
  ai_generated?: boolean;
}

export interface StockSearchResult {
  resources: StockResource[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  creditsRemaining?: number;
}

export interface StockFavorite {
  id: string;
  user_id: string;
  resource_id: string;
  resource_type: string;
  title: string | null;
  thumbnail_url: string | null;
  preview_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface StockDownload {
  id: string;
  user_id: string;
  resource_id: string;
  resource_type: string;
  title: string | null;
  download_format: string | null;
  download_url: string | null;
  used_in_module: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const CACHE_DURATION = 5 * 60 * 1000;
const searchCache = new Map<string, { data: StockSearchResult; timestamp: number }>();

function getCacheKey(options: StockSearchOptions): string {
  return JSON.stringify(options);
}

function getCachedResult(key: string): StockSearchResult | null {
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  searchCache.delete(key);
  return null;
}

function setCacheResult(key: string, data: StockSearchResult): void {
  searchCache.set(key, { data, timestamp: Date.now() });
  if (searchCache.size > 50) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) searchCache.delete(oldestKey);
  }
}

export const stockImageService = {
  isAvailable(): boolean {
    return hasApiKey('freepik') || isSupabaseConfigured();
  },

  async search(options: StockSearchOptions = {}): Promise<StockSearchResult> {
    const cacheKey = getCacheKey(options);
    const cached = getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('freepik-resources', options);
        if (result && result.resources) {
          const searchResult: StockSearchResult = {
            resources: result.resources.map((r: StockResource) => ({
              ...r,
              previewUrl: r.thumbnailUrl
            })),
            meta: result.meta,
            creditsRemaining: result.creditsRemaining
          };
          setCacheResult(cacheKey, searchResult);
          return searchResult;
        }
      } catch (error) {
        console.warn('Edge function failed for stock search:', error);
      }
    }

    const apiKey = getFreepikApiKey();
    if (!apiKey) {
      throw new Error('Stock image API not configured. Please add VITE_FREEPIK_API_KEY to your environment.');
    }

    const params = new URLSearchParams();
    if (options.keywords) params.append('keywords', options.keywords);
    if (options.content_type) params.append('content_type', options.content_type);
    if (options.orientation) params.append('orientation', options.orientation);
    if (options.license) params.append('license', options.license);
    if (options.page && options.page > 1) params.append('page', options.page.toString());
    if (options.per_page) params.append('per_page', options.per_page.toString());

    const response = await fetch(`https://api.freepik.com/v1/resources?${params}`, {
      method: 'GET',
      headers: {
        'x-freepik-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Stock API error: ${response.status}`);
    }

    const data = await response.json();
    const searchResult: StockSearchResult = {
      resources: (data.data || []).map((resource: Record<string, unknown>) => ({
        id: resource.id,
        title: resource.title,
        url: resource.url,
        filename: resource.filename,
        thumbnailUrl: (resource.image as Record<string, unknown>)?.source?.url || null,
        previewUrl: (resource.image as Record<string, unknown>)?.source?.url || null,
        type: (resource.image as Record<string, unknown>)?.type || null,
        orientation: (resource.image as Record<string, unknown>)?.orientation || null,
        width: (resource.image as Record<string, unknown>)?.source?.size
          ? parseInt(((resource.image as Record<string, unknown>).source as Record<string, unknown>).size?.toString().split('x')[0] || '0')
          : null,
        height: (resource.image as Record<string, unknown>)?.source?.size
          ? parseInt(((resource.image as Record<string, unknown>).source as Record<string, unknown>).size?.toString().split('x')[1] || '0')
          : null,
        downloads: (resource.stats as Record<string, unknown>)?.downloads || 0,
        likes: (resource.stats as Record<string, unknown>)?.likes || 0,
        author: (resource.author as Record<string, unknown>)?.name || null,
        publishedAt: (resource.meta as Record<string, unknown>)?.published_at || null,
        license: (resource.licenses as Array<Record<string, unknown>>)?.[0]?.type || null
      })),
      meta: data.meta
    };

    setCacheResult(cacheKey, searchResult);
    return searchResult;
  },

  async getResourceDetails(resourceId: string | number): Promise<StockResource | null> {
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('freepik-resources', {
          resource_id: resourceId
        });
        if (result && result.resource) {
          return result.resource;
        }
      } catch (error) {
        console.warn('Edge function failed for resource details:', error);
      }
    }
    return null;
  },

  async getFavorites(): Promise<StockFavorite[]> {
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('stock_favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }

    return data || [];
  },

  async addFavorite(resource: StockResource): Promise<boolean> {
    if (!supabase) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('stock_favorites')
      .upsert({
        user_id: user.id,
        resource_id: resource.id.toString(),
        resource_type: resource.type || 'photo',
        title: resource.title,
        thumbnail_url: resource.thumbnailUrl,
        preview_url: resource.previewUrl || resource.thumbnailUrl,
        metadata: {
          width: resource.width,
          height: resource.height,
          author: resource.author,
          downloads: resource.downloads,
          likes: resource.likes,
          url: resource.url
        }
      }, {
        onConflict: 'user_id,resource_id'
      });

    if (error) {
      console.error('Error adding favorite:', error);
      return false;
    }

    return true;
  },

  async removeFavorite(resourceId: string | number): Promise<boolean> {
    if (!supabase) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('stock_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('resource_id', resourceId.toString());

    if (error) {
      console.error('Error removing favorite:', error);
      return false;
    }

    return true;
  },

  async isFavorite(resourceId: string | number): Promise<boolean> {
    if (!supabase) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('stock_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('resource_id', resourceId.toString())
      .maybeSingle();

    return !!data;
  },

  async recordDownload(
    resource: StockResource,
    format: string,
    downloadUrl: string,
    moduleName: string
  ): Promise<boolean> {
    if (!supabase) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('stock_downloads')
      .insert({
        user_id: user.id,
        resource_id: resource.id.toString(),
        resource_type: resource.type || 'photo',
        title: resource.title,
        download_format: format,
        download_url: downloadUrl,
        used_in_module: moduleName,
        metadata: {
          width: resource.width,
          height: resource.height,
          author: resource.author,
          url: resource.url
        }
      });

    if (error) {
      console.error('Error recording download:', error);
      return false;
    }

    return true;
  },

  async getDownloadHistory(limit: number = 50): Promise<StockDownload[]> {
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('stock_downloads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching download history:', error);
      return [];
    }

    return data || [];
  },

  async trackUsage(
    moduleName: string,
    actionType: 'search' | 'preview' | 'download' | 'use',
    resourceId?: string | number,
    searchQuery?: string
  ): Promise<void> {
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('stock_usage_analytics')
      .insert({
        user_id: user?.id || null,
        module_name: moduleName,
        action_type: actionType,
        resource_id: resourceId?.toString() || null,
        search_query: searchQuery || null,
        metadata: {}
      });
  },

  clearCache(): void {
    searchCache.clear();
  },

  async getPopularSearches(): Promise<string[]> {
    return [
      'business',
      'technology',
      'nature',
      'marketing',
      'office',
      'team',
      'success',
      'creative',
      'abstract',
      'professional'
    ];
  },

  async getCategories(): Promise<Array<{ id: string; name: string; icon: string }>> {
    return [
      { id: 'photo', name: 'Photos', icon: 'Camera' },
      { id: 'vector', name: 'Vectors', icon: 'PenTool' },
      { id: 'psd', name: 'PSD Files', icon: 'Layers' },
      { id: 'icon', name: 'Icons', icon: 'Grid' },
      { id: 'video', name: 'Videos', icon: 'Video' }
    ];
  }
};

export default stockImageService;
