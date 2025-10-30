import { supabase } from '../utils/supabaseClient';

export interface ActionFigureTemplate {
  id: string;
  template_id: string;
  name: string;
  description: string;
  prompt: string;
  packaging: string;
  accessories: string[];
  style: string;
  preview?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemeTemplate {
  id: string;
  template_id: string;
  name: string;
  url: string;
  category: string;
  description: string;
  default_top_text?: string;
  default_bottom_text?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartoonTheme {
  id: string;
  theme_id: string;
  name: string;
  description: string;
  style_keywords: string;
  preview?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserGeneratedImage {
  id: string;
  user_id?: string;
  image_url: string;
  prompt: string;
  template_type: string;
  template_id?: string;
  provider: string;
  metadata: Record<string, any>;
  created_at: string;
}

export const templatesService = {
  async getActionFigureTemplates(category?: string): Promise<ActionFigureTemplate[]> {
    try {
      let query = supabase
        .from('action_figure_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching action figure templates:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch action figure templates:', error);
      return [];
    }
  },

  async getActionFigureTemplateById(templateId: string): Promise<ActionFigureTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('action_figure_templates')
        .select('*')
        .eq('template_id', templateId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching action figure template:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch action figure template:', error);
      return null;
    }
  },

  async getMemeTemplates(category?: string): Promise<MemeTemplate[]> {
    try {
      let query = supabase
        .from('meme_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching meme templates:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch meme templates:', error);
      return [];
    }
  },

  async getCartoonThemes(): Promise<CartoonTheme[]> {
    try {
      const { data, error } = await supabase
        .from('cartoon_themes')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching cartoon themes:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch cartoon themes:', error);
      return [];
    }
  },

  async saveGeneratedImage(imageData: {
    image_url: string;
    prompt: string;
    template_type: string;
    template_id?: string;
    provider: string;
    metadata?: Record<string, any>;
  }): Promise<UserGeneratedImage | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('user_generated_images')
        .insert({
          user_id: user?.id || null,
          ...imageData,
          metadata: imageData.metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving generated image:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to save generated image:', error);
      return null;
    }
  },

  async getUserGeneratedImages(limit: number = 50): Promise<UserGeneratedImage[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_generated_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user generated images:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch user generated images:', error);
      return [];
    }
  },

  generateActionFigurePrompt(
    template: ActionFigureTemplate,
    personalizedData: Record<string, string>
  ): string {
    let personalizedPrompt = template.prompt;

    Object.entries(personalizedData).forEach(([key, value]) => {
      if (value) {
        const tokenRegex = new RegExp(`\\[${key}\\]`, 'gi');
        personalizedPrompt = personalizedPrompt.replace(tokenRegex, value);
      }
    });

    return personalizedPrompt;
  }
};

export default templatesService;
