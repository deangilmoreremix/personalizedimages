/**
 * Cloud Gallery Service
 * Manages user images, folders, prompts, and analytics in Supabase
 */

import { supabase } from '../utils/supabaseClient';

export interface UserImage {
  id: string;
  user_id: string;
  image_url: string;
  thumbnail_url?: string;
  prompt: string;
  enhanced_prompt?: string;
  tokens: Record<string, string>;
  model: string;
  style?: string;
  aspect_ratio?: string;
  quality?: string;
  tags: string[];
  is_favorite: boolean;
  folder_id?: string;
  generation_time_ms?: number;
  cost_estimate?: number;
  rating?: number;
  notes?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  parent_id?: string;
  color?: string;
  icon?: string;
  sort_order: number;
  is_archived: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PromptHistory {
  id: string;
  user_id: string;
  prompt: string;
  enhanced_prompt?: string;
  tokens: Record<string, string>;
  model: string;
  style?: string;
  category?: string;
  success_rate: number;
  avg_rating?: number;
  use_count: number;
  last_used_at: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface GenerationQueueItem {
  id: string;
  user_id: string;
  prompt: string;
  tokens: Record<string, string>;
  model: string;
  style?: string;
  options: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  result_image_id?: string;
  error_message?: string;
  attempts: number;
  max_attempts: number;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface TokenProfile {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  tokens: Record<string, string>;
  is_default: boolean;
  category?: string;
  use_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

class CloudGalleryService {
  // ===== IMAGE MANAGEMENT =====

  async saveImage(imageData: Partial<UserImage>): Promise<UserImage | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_images')
      .insert({
        ...imageData,
        user_id: user.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving image:', error);
      throw error;
    }

    return data;
  }

  async getImages(options: {
    limit?: number;
    offset?: number;
    folderId?: string;
    tags?: string[];
    isFavorite?: boolean;
    searchQuery?: string;
  } = {}): Promise<UserImage[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    let query = supabase
      .from('user_images')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (options.limit) query = query.limit(options.limit);
    if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    if (options.folderId) query = query.eq('folder_id', options.folderId);
    if (options.isFavorite) query = query.eq('is_favorite', true);
    if (options.tags && options.tags.length > 0) {
      query = query.contains('tags', options.tags);
    }
    if (options.searchQuery) {
      query = query.textSearch('prompt', options.searchQuery);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching images:', error);
      return [];
    }

    return data || [];
  }

  async getImageById(id: string): Promise<UserImage | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
      .from('user_images')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching image:', error);
      return null;
    }

    return data;
  }

  async updateImage(id: string, updates: Partial<UserImage>): Promise<UserImage | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { user_id: _uid, id: _id, created_at: _ca, ...safeUpdates } = updates as any;

    const { data, error } = await supabase
      .from('user_images')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating image:', error);
      throw error;
    }

    return data;
  }

  async deleteImage(id: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase
      .from('user_images')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase
      .from('user_images')
      .update({ is_favorite: isFavorite })
      .eq('id', id)
      .eq('user_id', user.user.id);

    return !error;
  }

  async addTags(imageId: string, tags: string[]): Promise<boolean> {
    const image = await this.getImageById(imageId);
    if (!image) return false;

    const newTags = Array.from(new Set([...image.tags, ...tags]));

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase
      .from('user_images')
      .update({ tags: newTags })
      .eq('id', imageId)
      .eq('user_id', user.user.id);

    return !error;
  }

  async removeTags(imageId: string, tags: string[]): Promise<boolean> {
    const image = await this.getImageById(imageId);
    if (!image) return false;

    const newTags = image.tags.filter(tag => !tags.includes(tag));

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase
      .from('user_images')
      .update({ tags: newTags })
      .eq('id', imageId)
      .eq('user_id', user.user.id);

    return !error;
  }

  // ===== FOLDER MANAGEMENT =====

  async createFolder(folderData: Partial<Folder>): Promise<Folder | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('folders')
      .insert({
        ...folderData,
        user_id: user.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating folder:', error);
      throw error;
    }

    return data;
  }

  async getFolders(parentId?: string | null): Promise<Folder[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    let query = supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('is_archived', false)
      .order('sort_order', { ascending: true });

    if (parentId === null) {
      query = query.is('parent_id', null);
    } else if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching folders:', error);
      return [];
    }

    return data || [];
  }

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { user_id: _uid, id: _id, created_at: _ca, ...safeUpdates } = updates as any;

    const { data, error } = await supabase
      .from('folders')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating folder:', error);
      throw error;
    }

    return data;
  }

  async deleteFolder(id: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (error) {
      console.error('Error deleting folder:', error);
      return false;
    }

    return true;
  }

  async moveImagesToFolder(imageIds: string[], folderId: string | null): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase
      .from('user_images')
      .update({ folder_id: folderId })
      .in('id', imageIds)
      .eq('user_id', user.user.id);

    return !error;
  }

  // ===== PROMPT HISTORY =====

  async savePromptHistory(promptData: Partial<PromptHistory>): Promise<PromptHistory | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Check if this exact prompt already exists
    const { data: existing } = await supabase
      .from('prompt_history')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('prompt', promptData.prompt)
      .eq('model', promptData.model)
      .maybeSingle();

    if (existing) {
      // Update existing prompt
      const { data, error } = await supabase
        .from('prompt_history')
        .update({
          use_count: existing.use_count + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      return data;
    }

    // Create new prompt history
    const { data, error } = await supabase
      .from('prompt_history')
      .insert({
        ...promptData,
        user_id: user.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving prompt history:', error);
      throw error;
    }

    return data;
  }

  async getPromptHistory(options: {
    limit?: number;
    searchQuery?: string;
    category?: string;
  } = {}): Promise<PromptHistory[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    let query = supabase
      .from('prompt_history')
      .select('*')
      .eq('user_id', user.user.id)
      .order('last_used_at', { ascending: false });

    if (options.limit) query = query.limit(options.limit);
    if (options.category) query = query.eq('category', options.category);
    if (options.searchQuery) {
      query = query.textSearch('prompt', options.searchQuery);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching prompt history:', error);
      return [];
    }

    return data || [];
  }

  async getMostUsedPrompts(limit: number = 10): Promise<PromptHistory[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data, error } = await supabase
      .from('prompt_history')
      .select('*')
      .eq('user_id', user.user.id)
      .order('use_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching most used prompts:', error);
      return [];
    }

    return data || [];
  }

  // ===== GENERATION QUEUE =====

  async addToQueue(queueData: Partial<GenerationQueueItem>): Promise<GenerationQueueItem | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('generation_queue')
      .insert({
        ...queueData,
        user_id: user.user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to queue:', error);
      throw error;
    }

    return data;
  }

  async getQueueItems(status?: string): Promise<GenerationQueueItem[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    let query = supabase
      .from('generation_queue')
      .select('*')
      .eq('user_id', user.user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching queue items:', error);
      return [];
    }

    return data || [];
  }

  async updateQueueItem(id: string, updates: Partial<GenerationQueueItem>): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { user_id: _uid, id: _id, created_at: _ca, ...safeUpdates } = updates as any;

    const { error } = await supabase
      .from('generation_queue')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', user.user.id);

    return !error;
  }

  async cancelQueueItem(id: string): Promise<boolean> {
    return this.updateQueueItem(id, { status: 'cancelled' });
  }

  // ===== TOKEN PROFILES =====

  async saveTokenProfile(profileData: Partial<TokenProfile>): Promise<TokenProfile | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('token_profiles')
      .insert({
        ...profileData,
        user_id: user.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving token profile:', error);
      throw error;
    }

    return data;
  }

  async getTokenProfiles(): Promise<TokenProfile[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data, error } = await supabase
      .from('token_profiles')
      .select('*')
      .eq('user_id', user.user.id)
      .order('is_default', { ascending: false })
      .order('last_used_at', { ascending: false });

    if (error) {
      console.error('Error fetching token profiles:', error);
      return [];
    }

    return data || [];
  }

  async getDefaultTokenProfile(): Promise<TokenProfile | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
      .from('token_profiles')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('is_default', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching default token profile:', error);
      return null;
    }

    return data;
  }

  async setDefaultTokenProfile(id: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    // Unset all defaults
    await supabase
      .from('token_profiles')
      .update({ is_default: false })
      .eq('user_id', user.user.id);

    // Set new default
    const { error } = await supabase
      .from('token_profiles')
      .update({ is_default: true })
      .eq('id', id);

    return !error;
  }

  async updateTokenProfile(id: string, updates: Partial<TokenProfile>): Promise<TokenProfile | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { user_id: _uid, id: _id, created_at: _ca, ...safeUpdates } = updates as any;

    const { data, error } = await supabase
      .from('token_profiles')
      .update(safeUpdates)
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating token profile:', error);
      throw error;
    }

    return data;
  }

  async deleteTokenProfile(id: string): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    const { error } = await supabase
      .from('token_profiles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);

    return !error;
  }

  // ===== ANALYTICS =====

  async trackEvent(eventType: string, eventData: Record<string, any> = {}): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: user.user?.id,
        event_type: eventType,
        event_data: eventData
      });

    if (error) {
      console.error('Error tracking event:', error);
      return false;
    }

    return true;
  }

  async getAnalytics(options: {
    eventType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}): Promise<any[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    let query = supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (options.eventType) query = query.eq('event_type', options.eventType);
    if (options.startDate) query = query.gte('created_at', options.startDate);
    if (options.endDate) query = query.lte('created_at', options.endDate);
    if (options.limit) query = query.limit(options.limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }

    return data || [];
  }
}

export const cloudGalleryService = new CloudGalleryService();
export default cloudGalleryService;
