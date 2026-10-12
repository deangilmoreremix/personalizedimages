// This utility file handles API calls to various AI services
// It supports direct API calls and edge function calls through Supabase

import { callEdgeFunction, isSupabaseConfigured } from './supabaseClient';
import { getUserProvidedApiKey } from './apiUtils';
import { quickEnhance, type GeneratorCategory } from './promptEnhancer';
import { STOCK_SEARCH_UNAVAILABLE_MESSAGE } from '../services/stockImageService';

export interface OpenAIConfig {
  model?: string;
  aspectRatio?: string;
  style?: string;
  temperature?: number;
}

export interface ImageGenerationOptions {
  aspectRatio?: string;
  style?: string;
  quality?: 'standard' | 'high';
  negativePrompt?: string;
}

export interface ImageEditOptions {
  mode: 'enhance' | 'colorize' | 'restore' | 'stylize' | 'remove_background' | 'blur_background' | 'custom' | 'text_render' | 'compose' | 'style_transfer' | 'semantic_mask';
  intensity?: number;
  style?: string;
  customPrompt?: string;
  textToRender?: string;
  fontStyle?: string;
  secondaryImages?: string[];
  aspectRatio?: string;
  responseModalities?: ('Text' | 'Image')[];
  maskData?: string;
  maskPrompt?: string;
}

const OPENAI_KEY_MISSING_MESSAGE =
  'OpenAI API key not configured. Add your key in Settings → API Keys.';

function requireOpenAIKey(): string {
  const apiKey = getUserProvidedApiKey('openai');
  if (!apiKey) throw new Error(OPENAI_KEY_MISSING_MESSAGE);
  return apiKey;
}

/**
 * Generate an image description that can be used for AI image generation
 */
export async function generateImageDescriptionWithAI(tokens: Record<string, string>): Promise<string> {
  try {
    console.log('🖋️ Generating AI image description with tokens:', tokens);
    
    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('image-description', { tokens });
        
        if (result && result.description) {
          return result.description;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for image description:', edgeError);
        // Continue to direct API fallback
      }
    }
    
    const apiKey = requireOpenAIKey();

    // Convert tokens to a string representation
    const tokenString = Object.entries(tokens)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const prompt = `Create a detailed description for a personalized marketing image that includes the following personalization tokens: ${tokenString || 'No tokens provided'}. The description should include visual elements, composition, and how the personalized elements should be integrated. Format the description as a prompt for image generation.`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        input: prompt,
        max_output_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const description = (data.output || [])
      .flatMap((item: any) => item.content || [])
      .filter((part: any) => part.type === 'output_text')
      .map((part: any) => part.text || '')
      .join('')
      .trim();

    if (!description) {
      throw new Error('No description generated');
    }

    return description;
  } catch (error) {
    console.error('Error generating image description:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Generate an image with DALL-E (OpenAI) - Enhanced with all DALL-E 3 features
 */
export async function generateImageWithDalle(
  prompt: string,
  options: {
    size?: '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    style?: 'natural' | 'vivid';
    n?: number;
  } = {}
): Promise<string> {
  try {
    console.log('🖼️ Generating image with GPT Image 2.5');

    // Set defaults for GPT Image 2.5 features
    const {
      size = '1024x1024',
      quality = 'standard',
      style = 'natural',
      n = 1
    } = options;

    // BYOK-first: when the user has supplied their own OpenAI key, generate
    // with it directly. The provider bills the user, so platform credits are
    // never consumed and the metered edge function is not called.
    if (getUserProvidedApiKey('openai')) {
      return generateImageWithUserKey(prompt, { size, quality, style, n });
    }

    // Platform-funded path: metered by the authenticated edge function.
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('image-generation', {
          provider: 'openai',
          prompt,
          size,
          quality,
          style,
          n
        });

        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for image generation:', edgeError);
        // Fall through to the unavailable error below
      }
    }

    throw new Error('Image generation is unavailable. Please add your own OpenAI API key in settings (starts with sk-) or contact support.');
  } catch (error) {
    console.error('Error generating image with GPT Image 2.5:', error);
    throw error;
  }
}

/**
 * Generate an image directly with the user's own OpenAI key (BYOK only).
 * Never routes through the platform edge function.
 */
async function generateImageWithUserKey(
  prompt: string,
  options: {
    size: '1024x1024' | '1792x1024' | '1024x1792';
    quality: 'standard' | 'hd';
    style?: 'natural' | 'vivid';
    n: number;
  }
): Promise<string> {
  const apiKey = getUserProvidedApiKey('openai');
  if (!apiKey) {
    throw new Error('Image generation is unavailable. Please add your own OpenAI API key in settings (starts with sk-) or contact support.');
  }

  const { size, quality, n } = options;
  const styleHint = options.style === 'vivid' ? ' vivid' : '';

  // Map legacy aspect sizes to GPT Image 2.5 supported sizes
  const gptSize = size === '1792x1024' ? '1536x1024' : size === '1024x1792' ? '1024x1536' : size;

  // GPT Image 2.5 via the Images API (JSON). GPT image models always return base64.
  const gptResponse = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-image-2.5-sunburst',
      prompt: prompt + styleHint,
      n: n,
      size: gptSize,
      quality: quality === 'hd' ? 'high' : 'medium',
      output_format: 'png'
    }),
  });

    if (!gptResponse.ok) {
      let errorMessage = `${gptResponse.status} `;

      try {
        const errorData = await gptResponse.json();
        errorMessage += errorData.error?.message || 'Unknown error';
      } catch {
        errorMessage += 'Unknown error';
      }

      throw new Error(errorMessage);
    }

    const gptData = await gptResponse.json();
    const b64 = gptData.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error('Image provider returned no image data');
    }
    return `data:image/png;base64,${b64}`;
}

/**
 * Generate image variations with GPT Image 2.5
 */
export async function generateImageVariations(
  imageUrl: string,
  options: {
    n?: number;
    size?: '1024x1024' | '1792x1024' | '1024x1792';
  } = {}
): Promise<string[]> {
  try {
    console.log('🔄 Generating image variations');

    const { n = 1, size = '1024x1024' } = options;

    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('image-variations', {
          provider: 'openai',
          imageUrl,
          count: n
        });

        if (result && result.imageUrls && Array.isArray(result.imageUrls)) {
          return result.imageUrls;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for image variations:', edgeError);

      }
    }

    requireOpenAIKey();

    const variationPrompts = [
      'Create a creative variation of this image with different colors and lighting.',
      'Create a variation of this image with a different artistic style.',
      'Create a variation of this image from a different perspective or angle.',
      'Create a variation of this image with a different mood or atmosphere.'
    ];

    const variations: string[] = [];
    for (let i = 0; i < n; i++) {
      const variation = await editImageWithDalle(
        imageUrl,
        '',
        variationPrompts[i % variationPrompts.length],
        { size }
      );
      variations.push(variation);
    }

    if (variations.length === 0) {
      throw new Error('No variations could be generated');
    }
    return variations;
  } catch (error) {
    console.error('Error generating image variations:', error);
    throw error;
  }
}

/**
 * Edit image with GPT Image 2.5 (server edge function or the user's own key via BYOK)
 */
export async function editImageWithDalle(
  imageUrl: string,
  maskUrl: string,
  prompt: string,
  options: {
    size?: '1024x1024' | '1792x1024' | '1024x1792';
  } = {}
): Promise<string> {
  try {
    console.log('✏️ Editing image with GPT Image 2.5');

    const { size = '1024x1024' } = options;

    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('image-editing', {
          imageUrl,
          editOptions: { prompt, size, maskUrl }
        });

        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for image editing:', edgeError);
        // Continue to direct API fallback
      }
    }

    // Fall back to direct API call using the USER'S OWN key only (BYOK)
    const apiKey = getUserProvidedApiKey('openai');
    if (!apiKey) {
      console.warn('No user-provided OpenAI API key available, returning original image');
      return imageUrl;
    }

    // GPT Image 2.5 edits endpoint accepts JSON with image_url references
    // (HTTPS URL or base64 data URL), no binary fetch needed.
    const gptSize = size === '1792x1024' ? '1536x1024' : size === '1024x1792' ? '1024x1536' : size;
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-image-2.5-sunburst',
        images: [{ image_url: imageUrl }],
        prompt: prompt,
        n: 1,
        size: gptSize,
        output_format: 'png'
      })
    });

    if (!response.ok) {
      let errorMessage = `${response.status} `;

      try {
        const errorData = await response.json();
        errorMessage += errorData.error?.message || 'Unknown error';
      } catch {
        errorMessage += 'Unknown error';
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error('Image provider returned no image data');
    }
    return `data:image/png;base64,${b64}`;
  } catch (error) {
    console.error('Error editing image:', error);
    // Return original image as fallback
    return imageUrl;
  }
}

/**
 * Generate an image with GPT-4 Vision (gpt-image-1)
 */
export async function generateImageWithGptImage(prompt: string): Promise<string> {
  try {
    console.log('🖼️ Generating image with GPT Image 2.5');

    // BYOK-first: use the user's own key when supplied so the metered platform
    // edge function is never called for user-funded generation.
    if (getUserProvidedApiKey('openai')) {
      return generateImageWithUserKey(prompt, { size: '1024x1024', quality: 'standard', n: 1 });
    }

    // Platform-funded path: metered by the authenticated edge function.
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('image-generation', {
          provider: 'gpt-image-1',
          prompt
        });

        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for image generation:', edgeError);
      }
    }

    throw new Error('Image generation is unavailable. Please add your own OpenAI API key in settings (starts with sk-) or contact support.');
  } catch (error) {
    console.error('Error generating image with GPT Image 2.5:', error);
    throw error;
  }
}

/**
 * Generate an image with GPT Image 2.5
 */
export async function generateImageWithGemini(prompt: string, aspectRatio: string = '1:1', style: string = ''): Promise<string> {
  try {
    console.log('🖼️ Generating image with GPT Image 2.5');

    // Enhance prompt with style if provided
    let enhancedPrompt = prompt;
    if (style && style !== 'photography' && !prompt.toLowerCase().includes(style.toLowerCase())) {
      enhancedPrompt = `${prompt} (${style} style)`;
    }

    // Map aspect ratio to GPT Image 2.5 sizes
    let size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024';
    if (aspectRatio === '16:9' || aspectRatio === '1792:1024') {
      size = '1792x1024';
    } else if (aspectRatio === '9:16' || aspectRatio === '1024:1792') {
      size = '1024x1792';
    }

    return await generateImageWithDalle(enhancedPrompt, { size, quality: 'standard', style: 'vivid' });
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

/**
 * Generate an image with GPT Image 2.5
 */
export async function generateImageWithGemini2Flash(prompt: string): Promise<string> {
  try {
    console.log('🖼️ Generating image with GPT Image 2.5');
    return await generateImageWithGemini(prompt, '1:1', '');
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

/**
 * Generate an image with GPT Image 2.5
 */
export async function generateImageWithGeminiNano(
  prompt: string,
  options: ImageGenerationOptions = {},
  _config: OpenAIConfig = {}
): Promise<string> {
  try {
    console.log('🚀 Generating image with GPT Image 2.5');

    const size: '1024x1024' | '1792x1024' | '1024x1792' =
      options.aspectRatio === '16:9' ? '1792x1024' : options.aspectRatio === '9:16' ? '1024x1792' : '1024x1024';

    return await generateImageWithDalle(prompt, {
      size,
      quality: options.quality === 'high' ? 'hd' : 'standard',
      style: 'natural'
    });
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

/**
 * Stock resource search is no longer available in this application.
 */
export async function fetchFreepikResources(): Promise<{
  resources: Array<{
    id: number
    title: string
    url: string
    filename: string
    thumbnailUrl: string | null
    type: string | null
    orientation: string | null
    width: number | null
    height: number | null
    downloads: number
    likes: number
    author: string | null
    publishedAt: string | null
    license: string | null
  }>
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}> {
  throw new Error(STOCK_SEARCH_UNAVAILABLE_MESSAGE);
}

/**
 * Edit an image with GPT Image 2.5
 */
export async function editImageWithGeminiNano(
  imageUrl: string,
  editOptions: ImageEditOptions,
  _config: OpenAIConfig = {}
): Promise<string> {
  const prompt = buildEditPrompt(editOptions);
  return editImageWithDalle(imageUrl, editOptions.maskData ? `data:image/png;base64,${editOptions.maskData}` : '', prompt);
}

/**
 * Generate image variations with GPT Image 2.5
 */
export async function generateVariationsWithGeminiNano(
  imageUrl: string,
  count: number = 3,
  _config: OpenAIConfig = {}
): Promise<string[]> {
  return generateImageVariations(imageUrl, { n: count });
}

function buildEditPrompt(editOptions: ImageEditOptions): string {
  if (editOptions.customPrompt) return editOptions.customPrompt;
  if (editOptions.maskPrompt) return editOptions.maskPrompt;

  switch (editOptions.mode) {
    case 'colorize':
      return 'Add natural, realistic colors to this image.';
    case 'restore':
      return 'Restore and improve the quality of this image.';
    case 'stylize':
      return `Restyle this image${editOptions.style ? ` in a ${editOptions.style} style` : ''}.`;
    case 'remove_background':
      return 'Remove the background from this image, leaving the subject on a clean transparent background.';
    case 'blur_background':
      return 'Blur the background of this image while keeping the subject sharp.';
    case 'text_render':
      return `Render the text "${editOptions.textToRender || ''}"${editOptions.fontStyle ? ` in a ${editOptions.fontStyle} font` : ''} onto this image.`;
    case 'compose':
      return 'Compose this image with the provided secondary images into a single cohesive image.';
    case 'style_transfer':
      return `Transfer the artistic style${editOptions.style ? ` of ${editOptions.style}` : ''} onto this image.`;
    case 'enhance':
    default:
      return 'Enhance the quality, sharpness and lighting of this image.';
  }
}

/**
 * Generate an image with GPT Image 2.5
 */
export async function generateImageWithImagen(prompt: string, aspectRatio: string = '1:1'): Promise<string> {
  try {
    console.log('🖼️ Generating image with GPT Image 2.5');

    // Add aspect ratio if not already in prompt
    let enhancedPrompt = prompt;
    if (!enhancedPrompt.toLowerCase().includes('aspect ratio')) {
      enhancedPrompt = `${enhancedPrompt} (${aspectRatio} aspect ratio)`;
    }

    return generateImageWithGemini(enhancedPrompt, aspectRatio);
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

/**
 * Generate an image using a reference image with GPT-4 Vision
 */
async function generateImageWithReferenceGptImage(prompt: string, referenceImageUrl: string): Promise<string> {
  try {
    console.log('🖼️ Generating image with reference using GPT-4 Vision');
    
    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('reference-image', {
          provider: 'gpt-image-1',
          prompt,
          referenceImageUrl
        });
        
        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for reference-based image generation with GPT-4 Vision:', edgeError);
        // Continue to direct API fallback
      }
    }
    
    // Fall back to direct API call using the USER'S OWN key only (BYOK)
    // For now, we'll use a modified prompt that references the image
    // (GPT Image 2.5 generation improves on the reference via the prompt).
    const enhancedPrompt = `Using a reference image as inspiration: ${prompt}. The reference image contains important visual elements that should be incorporated into the generated image.`;
    
    return generateImageWithGptImage(enhancedPrompt);
  } catch (error) {
    console.error('Error generating image with reference using GPT-4 Vision:', error);
    throw error;
  }
}

/**
 * Generate Ghibli-style imagery
 */
function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export async function generateGhibliStyleImage(prompt: string, provider: string = 'openai', referenceImageUrl?: string): Promise<string> {
  try {
    console.log(`🌟 Generating Ghibli-style image with ${provider}`);

    const enhancedPrompt = quickEnhance(`Studio Ghibli style: ${prompt}`, 'ghibli');

    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('ghibli-image', {
          prompt: enhancedPrompt,
          provider: 'openai',
          referenceImageUrl: referenceImageUrl && isHttpUrl(referenceImageUrl) ? referenceImageUrl : undefined
        });

        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for Ghibli-style image generation:', edgeError);
      }
    }

    if (referenceImageUrl) {
      return generateImageWithReferenceGptImage(enhancedPrompt, referenceImageUrl);
    }
    return generateImageWithDalle(enhancedPrompt);
  } catch (error) {
    console.error('Error generating Ghibli-style image:', error);
    throw error;
  }
}

/**
 * Generate a cartoon-style image
 */
export async function generateCartoonImage(prompt: string, provider: string = 'openai', referenceImageUrl?: string, style: string = 'cartoon'): Promise<string> {
  try {
    console.log(`🎨 Generating cartoon-style image with ${provider}`);

    const enhancedPrompt = quickEnhance(`${prompt} in ${style} style`, 'cartoon');

    if (getUserProvidedApiKey('openai')) {
      if (referenceImageUrl) {
        return generateImageWithReferenceGptImage(enhancedPrompt, referenceImageUrl);
      }
      return generateImageWithDalle(enhancedPrompt);
    }

    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('cartoon-style', {
          prompt: enhancedPrompt,
          provider: 'openai',
          style,
          referenceImageUrl
        });

        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for cartoon-style image generation:', edgeError);
      }
    }

    throw new Error(OPENAI_KEY_MISSING_MESSAGE);
  } catch (error) {
    console.error('Error generating cartoon-style image:', error);
    throw error;
  }
}

/**
 * Generate a meme with reference image and text
 */
export async function generateMemeWithReference(topText: string, bottomText: string, referenceImageUrl: string, additionalStyle?: string): Promise<string> {
  try {
    console.log('🎭 Generating meme with reference');
    
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not properly configured for meme generation');
    }
    
    try {
      const result = await callEdgeFunction('meme-generator', {
        topText,
        bottomText,
        referenceImageUrl,
        additionalStyle,
        provider: 'gpt-image-1'
      });
      
      if (result && result.imageUrl) {
        return result.imageUrl;
      }
    } catch (edgeError) {
      console.warn('Edge function failed for meme generation:', edgeError);
      throw new Error('Failed to generate the AI meme. Please try again.');
    }
    
    throw new Error('Failed to generate the AI meme. Please try again.');
  } catch (error) {
    console.error('Error generating meme:', error);
    throw error;
  }
}

/**
 * Generate an action figure image
 */
export async function generateActionFigure(prompt: string, provider: string = 'openai', referenceImageUrl?: string): Promise<string> {
  try {
    console.log(`🤖 Generating action figure with ${provider}`);

    const enhancedPrompt = quickEnhance(`Create an action figure: ${prompt}`, 'action-figure');

    if (getUserProvidedApiKey('openai')) {
      if (referenceImageUrl) {
        return generateImageWithReferenceGptImage(enhancedPrompt, referenceImageUrl);
      }
      return generateImageWithDalle(enhancedPrompt);
    }

    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('action-figure', {
          prompt: enhancedPrompt,
          provider: 'openai',
          referenceImageUrl
        });

        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for action figure generation:', edgeError);
      }
    }

    throw new Error(OPENAI_KEY_MISSING_MESSAGE);
  } catch (error) {
    console.error('Error generating action figure:', error);
    throw error;
  }
}

/**
 * Get prompt recommendations based on a base prompt
 */
export async function getPromptRecommendations(basePrompt: string, tokens: Record<string, string> = {}, modelName: string = 'DALL-E'): Promise<string[]> {
  try {
    console.log('💡 Generating prompt recommendations');
    
    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('prompt-recommendations', {
          basePrompt,
          tokens,
          style: modelName
        });
        
        if (result && result.recommendations && Array.isArray(result.recommendations)) {
          return result.recommendations;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for prompt recommendations:', edgeError);
        // Continue to direct API fallback
      }
    }
    
    // Fall back to direct API call using the USER'S OWN key only (BYOK)
    // OpenAI text operations go through the Responses API.
    const apiKey = getUserProvidedApiKey('openai');
    if (!apiKey) {
      console.warn('No user-provided OpenAI API key available, returning basic recommendations');
      // Return some fallback recommendations
      return [
        `${basePrompt} with detailed lighting and high-quality finish`,
        `${basePrompt} with a creative composition and vibrant colors`,
        `${basePrompt} in a photorealistic style with dramatic lighting`
      ];
    }

    // Format tokens for the API request
    const tokenString = Object.entries(tokens)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const prompt = `Based on this prompt: "${basePrompt}" and personalization tokens (${tokenString}), generate 3 enhanced prompt variations for ${modelName} style image generation. Make them detailed and specific, following best practices for image generation. Format as a JSON array of strings.`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        input: prompt,
        max_output_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = (data.output || [])
      .flatMap((item: any) => item.content || [])
      .filter((part: any) => part.type === 'output_text')
      .map((part: any) => part.text || '')
      .join('');

    let recommendations;

    try {
      // Try to parse the response as JSON
      recommendations = JSON.parse(responseText);
    } catch (e) {
      // If parsing fails, extract strings from the text
      const matches = responseText.match(/"([^"]+)"/g);
      if (matches) {
        recommendations = matches.map((match: string) => match.replace(/"/g, ''));
      } else {
        throw new Error('Failed to parse recommendations from response');
      }
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error generating prompt recommendations:', error);
    // Return fallback recommendations
    return [
      `${basePrompt} with detailed lighting and composition`,
      `${basePrompt} with vibrant colors and creative perspective`,
      `${basePrompt} in a professional style`
    ];
  }
}

/**
 * Helper: Calculate image dimensions from aspect ratio
 */
function getImageDimensionsFromAspectRatio(aspectRatio: string, maxDimension: number = 1024): { width: number, height: number } {
  const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
  
  if (widthRatio >= heightRatio) {
    // Landscape or square
    return {
      width: maxDimension,
      height: Math.round(maxDimension * (heightRatio / widthRatio))
    };
  } else {
    // Portrait
    return {
      width: Math.round(maxDimension * (widthRatio / heightRatio)),
      height: maxDimension
    };
  }
}