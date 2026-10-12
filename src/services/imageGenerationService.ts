import { supabase, isSupabaseConfigured, callEdgeFunction } from '../utils/supabaseClient';
import { getUserProvidedApiKey } from '../utils/apiUtils';
import { generateImageWithGptImage } from '../utils/api';

export interface GenerationOptions {
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: string;
  category?: string;
}

export interface GenerationResult {
  imageUrl: string;
  provider: string;
}

export class GenerationError extends Error {
  statusCode?: number;
  retryable: boolean;
  constructor(message: string, statusCode?: number, retryable = false) {
    super(message);
    this.name = 'GenerationError';
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

async function getUserId(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await (supabase as any).auth.getSession();
    return data.session?.user?.id || null;
  } catch {
    return null;
  }
}

export async function saveGeneratedImage(
  prompt: string,
  imageUrl: string,
  provider: string,
  category: string,
  tokensUsed?: Record<string, string>
): Promise<string | null> {
  const userId = await getUserId();
  if (!userId || !supabase) return null;

  // The deployed generated_images table has (id, url, prompt, user_id, model,
  // size, quality, format, compression, background, action,
  // previous_response_id, created_at, updated_at). Persist only those columns;
  // the prompt carries the category/style context.
  const { data, error } = await (supabase as any)
    .from('generated_images')
    .insert({
      user_id: userId,
      prompt: category && category !== 'ai-image' ? `[${category}] ${prompt}` : prompt,
      url: imageUrl,
      model: 'gpt-image-2.5-sunburst'
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Failed to save generated image:', error);
    return null;
  }
  return data?.id || null;
}

export async function generateImage(
  prompt: string,
  options: GenerationOptions = {}
): Promise<GenerationResult> {
  if (!prompt || prompt.trim().length < 3) {
    throw new GenerationError('Prompt must be at least 3 characters long.');
  }

  const { size = '1024x1024', quality = 'standard', style, category = 'ai-image' } = options;

  if (getUserProvidedApiKey('openai')) {
    const imageUrl = await generateImageWithGptImage(prompt, { size, quality, style });
    await saveGeneratedImage(prompt, imageUrl, 'openai', category);
    return {
      imageUrl,
      provider: 'openai',
    };
  }

  if (isSupabaseConfigured()) {
    try {
      const result = await callEdgeFunction('image-generation', {
        prompt,
        provider: 'openai',
        size,
        quality,
        style: style || undefined
      });

      if (result?.imageUrl) {
        await saveGeneratedImage(prompt, result.imageUrl, 'openai', category);
        return {
          imageUrl: result.imageUrl,
          provider: 'openai',
        };
      }
    } catch (edgeError: any) {
      const msg = edgeError?.message || '';
      if (msg.includes('429')) {
        throw new GenerationError('Rate limit exceeded. Please wait a moment and try again.', 429, true);
      }
      if (msg.includes('401')) {
        throw new GenerationError('Authentication required. Please sign in.', 401, false);
      }
      console.warn('Edge function unavailable, attempting direct API:', edgeError);
    }
  }

  throw new GenerationError(
    'Image generation service is currently unavailable. Please ensure the edge function is configured.',
    503,
    true
  );
}
