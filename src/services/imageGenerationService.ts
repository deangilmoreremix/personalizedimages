import { supabase, isSupabaseConfigured, callEdgeFunction } from '../utils/supabaseClient';

export interface GenerationOptions {
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: string;
  category?: string;
}

export interface GenerationResult {
  imageUrl: string;
  provider: string;
  creditsRemaining?: number;
}

export class InsufficientCreditsError extends Error {
  remainingCredits: number;
  constructor(remaining: number) {
    super('Insufficient credits. Please purchase more credits to continue generating.');
    this.name = 'InsufficientCreditsError';
    this.remainingCredits = remaining;
  }
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

export async function checkCredits(): Promise<{ allowed: boolean; balance: number }> {
  const userId = await getUserId();
  if (!userId || !supabase) return { allowed: true, balance: -1 };

  const { data, error } = await (supabase as any)
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return { allowed: true, balance: -1 };
  return { allowed: data.balance > 0, balance: data.balance };
}

async function deductCredit(prompt: string, provider: string, imageUrl: string): Promise<void> {
  const userId = await getUserId();
  if (!userId || !supabase) return;

  const sb = supabase as any;

  const { data: credits } = await sb
    .from('user_credits')
    .select('balance, total_used')
    .eq('user_id', userId)
    .maybeSingle();

  if (!credits) return;

  const newBalance = credits.balance - 1;
  const newTotalUsed = credits.total_used + 1;

  await sb
    .from('user_credits')
    .update({ balance: newBalance, total_used: newTotalUsed, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  await sb.from('credit_transactions').insert({
    user_id: userId,
    type: 'usage',
    amount: -1,
    balance_after: newBalance,
    description: `Image generation: ${prompt.substring(0, 100)}`,
    metadata: { provider, image_url: imageUrl }
  });

  await sb.from('usage_logs').insert({
    user_id: userId,
    provider,
    operation: 'image_generation',
    credits_used: 1,
    request_metadata: { prompt: prompt.substring(0, 500) },
    response_metadata: { image_url: imageUrl }
  });
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

  const { data, error } = await (supabase as any)
    .from('generated_images')
    .insert({
      user_id: userId,
      prompt,
      image_url: imageUrl,
      provider,
      model: 'dall-e-3',
      category,
      tokens_used: tokensUsed || {}
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

  const creditCheck = await checkCredits();
  if (creditCheck.balance >= 0 && !creditCheck.allowed) {
    throw new InsufficientCreditsError(creditCheck.balance);
  }

  const { size = '1024x1024', quality = 'standard', style, category = 'ai-image' } = options;

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
        await deductCredit(prompt, 'openai', result.imageUrl);
        await saveGeneratedImage(prompt, result.imageUrl, 'openai', category);
        return {
          imageUrl: result.imageUrl,
          provider: 'openai',
          creditsRemaining: result.creditsRemaining
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

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new GenerationError(
      'OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your environment.',
      500,
      false
    );
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt + (style ? ` Style: ${style}` : ''),
      n: 1,
      size,
      quality
    })
  });

  if (!response.ok) {
    let errorMessage = 'Image generation failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch { /* ignore parse error */ }

    if (response.status === 429) {
      throw new GenerationError('Rate limit exceeded. Please wait a moment and try again.', 429, true);
    }
    throw new GenerationError(errorMessage, response.status, response.status >= 500);
  }

  const data = await response.json();
  const imageUrl = data?.data?.[0]?.url;
  if (!imageUrl) {
    throw new GenerationError('No image URL returned from API', 500, true);
  }

  try {
    await deductCredit(prompt, 'openai', imageUrl);
    await saveGeneratedImage(prompt, imageUrl, 'openai', category);
  } catch (e) {
    console.error('Post-generation tracking failed:', e);
  }

  return { imageUrl, provider: 'openai' };
}
