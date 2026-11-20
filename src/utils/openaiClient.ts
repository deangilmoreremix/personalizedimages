/**
 * App-level OpenAI Responses API client.
 *
 * Key resolution order:
 *   1. user/env OpenAI key  -> direct to api.openai.com
 *   2. Supabase configured  -> `openai-responses` edge function proxy (key stays server-side,
 *      SSE streaming passes straight through)
 */
import { getOpenAIApiKey } from './apiUtils';
import { supabase, supabaseUrl, isSupabaseConfigured } from './supabaseClient';
import {
  DEFAULT_IMAGE_MODEL,
  DEFAULT_TEXT_MODEL,
  FAST_IMAGE_MODEL,
  analyzeImage as coreAnalyzeImage,
  generateImage as coreGenerateImage,
  generateText as coreGenerateText,
  type ImageOptions,
  type ImageResult,
  type ResponsesConfig,
  type TextOptions
} from './openaiResponses';

export * from './openaiResponses';

const env = (import.meta as any).env || {};

export const TEXT_MODEL: string = env.VITE_OPENAI_TEXT_MODEL || DEFAULT_TEXT_MODEL;
export const IMAGE_MODEL: string = env.VITE_OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL;
export const FAST_IMAGE_MODEL_ID: string = env.VITE_OPENAI_FAST_IMAGE_MODEL || FAST_IMAGE_MODEL;

export const IMAGE_MODEL_CHOICES = [
  { id: IMAGE_MODEL, label: 'GPT Image 2.6 Sunburst', description: 'Detailed visual work' },
  { id: FAST_IMAGE_MODEL_ID, label: 'GPT Image 2.6 Flare', description: 'Fast iteration' }
] as const;

export async function resolveResponsesConfig(signal?: AbortSignal): Promise<ResponsesConfig> {
  const apiKey = getOpenAIApiKey();
  if (apiKey) return { apiKey, signal, baseUrl: env.VITE_OPENAI_BASE_URL || undefined };

  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token || env.VITE_SUPABASE_ANON_KEY || '';
    return {
      apiKey: '',
      baseUrl: `${supabaseUrl}/functions/v1/openai-responses`,
      // The proxy exposes POST <baseUrl>/responses
      headers: { Authorization: `Bearer ${token}`, apikey: env.VITE_SUPABASE_ANON_KEY || '' },
      signal
    };
  }

  throw new Error(
    'OpenAI is not configured. Add an OpenAI key in Settings > API Keys (or VITE_OPENAI_API_KEY), or configure Supabase.'
  );
}

export async function responsesGenerateImage(
  opts: ImageOptions,
  signal?: AbortSignal
): Promise<ImageResult> {
  const cfg = await resolveResponsesConfig(signal);
  return coreGenerateImage(opts, cfg, { imageModel: IMAGE_MODEL, textModel: TEXT_MODEL });
}

export async function responsesGenerateText(opts: TextOptions, signal?: AbortSignal) {
  const cfg = await resolveResponsesConfig(signal);
  return coreGenerateText(opts, cfg, TEXT_MODEL);
}

export async function responsesAnalyzeImage(
  imageUrl: string,
  prompt: string,
  opts: { maxOutputTokens?: number; detail?: 'low' | 'high' | 'auto' } = {},
  signal?: AbortSignal
) {
  const cfg = await resolveResponsesConfig(signal);
  return coreAnalyzeImage(imageUrl, prompt, cfg, { model: TEXT_MODEL, ...opts });
}
