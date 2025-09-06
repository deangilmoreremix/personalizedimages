import { supabase } from '../utils/supabaseClient';

// =========================================
// USER PROFILE OPERATIONS
// =========================================

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const userProfileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  },

  async createProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  }
};

// =========================================
// PERSONALIZATION TOKENS
// =========================================

export interface PersonalizationToken {
  id: string;
  user_id: string;
  token_key: string;
  token_value: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export const tokenService = {
  async getUserTokens(userId: string): Promise<PersonalizationToken[]> {
    const { data, error } = await supabase
      .from('personalization_tokens')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user tokens:', error);
      return [];
    }

    return data || [];
  },

  async saveToken(token: Omit<PersonalizationToken, 'id' | 'created_at' | 'updated_at'>): Promise<PersonalizationToken | null> {
    const { data, error } = await supabase
      .from('personalization_tokens')
      .upsert(token, { onConflict: 'user_id,token_key' })
      .select()
      .single();

    if (error) {
      console.error('Error saving token:', error);
      return null;
    }

    return data;
  },

  async deleteToken(tokenId: string): Promise<boolean> {
    const { error } = await supabase
      .from('personalization_tokens')
      .delete()
      .eq('id', tokenId);

    if (error) {
      console.error('Error deleting token:', error);
      return false;
    }

    return true;
  },

  async getTokenByKey(userId: string, tokenKey: string): Promise<PersonalizationToken | null> {
    const { data, error } = await supabase
      .from('personalization_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('token_key', tokenKey)
      .single();

    if (error) {
      console.error('Error fetching token by key:', error);
      return null;
    }

    return data;
  }
};

// =========================================
// GENERATED IMAGES
// =========================================

export interface GeneratedImage {
  id: string;
  user_id?: string;
  prompt: string;
  image_url: string;
  thumbnail_url?: string;
  provider: string;
  model?: string;
  category?: string;
  tokens_used?: Record<string, string>;
  created_at: string;
}

export const imageService = {
  async saveGeneratedImage(image: Omit<GeneratedImage, 'id' | 'created_at'>): Promise<GeneratedImage | null> {
    const { data, error } = await supabase
      .from('generated_images')
      .insert(image)
      .select()
      .single();

    if (error) {
      console.error('Error saving generated image:', error);
      return null;
    }

    return data;
  },

  async getUserImages(userId: string, category?: string, limit = 50): Promise<GeneratedImage[]> {
    let query = supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user images:', error);
      return [];
    }

    return data || [];
  },

  async deleteImage(imageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('generated_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  }
};

// =========================================
// USER PROJECTS
// =========================================

export interface UserProject {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_id: string;
  position: number;
  created_at: string;
}

export const projectService = {
  async createProject(project: Omit<UserProject, 'id' | 'created_at' | 'updated_at'>): Promise<UserProject | null> {
    const { data, error } = await supabase
      .from('user_projects')
      .insert(project)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return null;
    }

    return data;
  },

  async getUserProjects(userId: string): Promise<UserProject[]> {
    const { data, error } = await supabase
      .from('user_projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user projects:', error);
      return [];
    }

    return data || [];
  },

  async updateProject(projectId: string, updates: Partial<UserProject>): Promise<UserProject | null> {
    const { data, error } = await supabase
      .from('user_projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return null;
    }

    return data;
  },

  async deleteProject(projectId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }

    return true;
  },

  async addImageToProject(projectId: string, imageId: string, position = 0): Promise<ProjectImage | null> {
    const { data, error } = await supabase
      .from('project_images')
      .insert({
        project_id: projectId,
        image_id: imageId,
        position
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding image to project:', error);
      return null;
    }

    return data;
  },

  async getProjectImages(projectId: string): Promise<(GeneratedImage & { position: number })[]> {
    const { data, error } = await supabase
      .from('project_images')
      .select(`
        position,
        generated_images (*)
      `)
      .eq('project_id', projectId)
      .order('position');

    if (error) {
      console.error('Error fetching project images:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item.generated_images,
      position: item.position
    }));
  }
};

// =========================================
// REFERENCE IMAGES
// =========================================

export interface ReferenceImage {
  id: string;
  user_id?: string;
  filename: string;
  original_url: string;
  thumbnail_url?: string;
  category?: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

export const referenceImageService = {
  async saveReferenceImage(image: Omit<ReferenceImage, 'id' | 'created_at'>): Promise<ReferenceImage | null> {
    const { data, error } = await supabase
      .from('reference_images')
      .insert(image)
      .select()
      .single();

    if (error) {
      console.error('Error saving reference image:', error);
      return null;
    }

    return data;
  },

  async getUserReferenceImages(userId: string, category?: string): Promise<ReferenceImage[]> {
    let query = supabase
      .from('reference_images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reference images:', error);
      return [];
    }

    return data || [];
  },

  async deleteReferenceImage(imageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('reference_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Error deleting reference image:', error);
      return false;
    }

    return true;
  }
};

// =========================================
// API USAGE TRACKING
// =========================================

export interface ApiUsage {
  id: string;
  user_id?: string;
  provider: string;
  endpoint: string;
  tokens_used: number;
  cost_cents: number;
  created_at: string;
}

export const apiUsageService = {
  async trackUsage(usage: Omit<ApiUsage, 'id' | 'created_at'>): Promise<ApiUsage | null> {
    const { data, error } = await supabase
      .from('api_usage')
      .insert(usage)
      .select()
      .single();

    if (error) {
      console.error('Error tracking API usage:', error);
      return null;
    }

    return data;
  },

  async getUserUsage(userId: string, days = 30): Promise<ApiUsage[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API usage:', error);
      return [];
    }

    return data || [];
  },

  async getUsageStats(userId: string, days = 30): Promise<{
    totalCost: number;
    totalTokens: number;
    byProvider: Record<string, { cost: number; tokens: number; calls: number }>;
  }> {
    const usage = await this.getUserUsage(userId, days);

    const stats = {
      totalCost: 0,
      totalTokens: 0,
      byProvider: {} as Record<string, { cost: number; tokens: number; calls: number }>
    };

    usage.forEach(record => {
      stats.totalCost += record.cost_cents;
      stats.totalTokens += record.tokens_used;

      if (!stats.byProvider[record.provider]) {
        stats.byProvider[record.provider] = { cost: 0, tokens: 0, calls: 0 };
      }

      stats.byProvider[record.provider].cost += record.cost_cents;
      stats.byProvider[record.provider].tokens += record.tokens_used;
      stats.byProvider[record.provider].calls += 1;
    });

    return stats;
  }
};

// =========================================
// UTILITY FUNCTIONS
// =========================================

export const dbUtils = {
  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  },

  async getTableCounts(): Promise<Record<string, number>> {
    const tables = [
      'user_profiles',
      'personalization_tokens',
      'generated_images',
      'user_projects',
      'reference_images',
      'user_fonts',
      'generated_videos',
      'api_usage'
    ];

    const counts: Record<string, number> = {};

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        counts[table] = error ? 0 : (count || 0);
      } catch {
        counts[table] = 0;
      }
    }

    return counts;
  }
};