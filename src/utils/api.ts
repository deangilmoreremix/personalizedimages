// This utility file handles API calls to various AI services
// It supports direct API calls and edge function calls through Supabase

import { callEdgeFunction, isSupabaseConfigured, supabase } from './supabaseClient';
import { getGeminiApiKey, getOpenAIApiKey, getGiphyApiKey, getFreepikApiKey, hasApiKey, blobToBase64 } from './apiUtils';
import { generateImageWithGeminiNano as generateImageWithGeminiNanoService, editImageWithGeminiNano as editImageWithGeminiNanoService, generateVariationsWithGeminiNano as generateVariationsWithGeminiNanoService, GeminiNanoConfig, ImageEditOptions, ImageGenerationOptions } from './geminiNanoApi';
import { responsesGenerateImage, responsesGenerateText } from './openaiClient';
import { quickEnhance, type GeneratorCategory } from './promptEnhancer';

async function toDataUrlFromUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch image');
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Failed to read image')));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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
    
    // Fall back to direct API call to Gemini
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      // Fallback to dummy response if no API key is available
      console.warn('No Gemini API key available, returning fallback description');
      return `A personalized marketing image for ${tokens['FIRSTNAME'] || 'the user'} featuring vibrant colors and modern design elements. The image includes professional branding for ${tokens['COMPANY'] || 'the company'} with a clean layout that emphasizes the key message.`;
    }
    
    // Convert tokens to a string representation
    const tokenString = Object.entries(tokens)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const prompt = `Create a detailed description for a personalized marketing image that includes the following personalization tokens: ${tokenString || 'No tokens provided'}. The description should include visual elements, composition, and how the personalized elements should be integrated. Format the description as a prompt for image generation.`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!description) {
      throw new Error('No description generated');
    }
    
    return description;
  } catch (error) {
    console.error('Error generating image description:', error);
    // Return a fallback description if all else fails
    return `A personalized high-quality marketing image for ${tokens['FIRSTNAME'] || 'the user'} from ${tokens['COMPANY'] || 'the company'}.`;
  }
}

/**
 * Generate an image with OpenAI GPT Image 2.6 via the Responses API (optionally streaming)
 */
export async function generateImageWithDalle(
  prompt: string,
  options: {
    size?: '1024x1024' | '1792x1024' | '1024x1792' | '1536x1024' | '1024x1536' | 'auto';
    quality?: 'standard' | 'hd' | 'low' | 'medium' | 'high' | 'auto';
    style?: 'natural' | 'vivid';
    n?: number;
    /** Override the image model (defaults to GPT Image 2.6 Sunburst). */
    imageModel?: string;
    /** Live streaming: called with progressive previews while the image renders. */
    onPartial?: (preview: { dataUrl: string; index: number }) => void;
    signal?: AbortSignal;
  } = {}
): Promise<string> {
  // NOTE: name kept for backwards compatibility; this now uses the Responses API
  // with GPT Image 2.6 (dall-e-3 was removed from the API on 2026-05-12).
  try {
    console.log('🖼️ Generating image with GPT Image 2.6 (Responses API)');
    const { size = '1024x1024', quality = 'standard', style, imageModel, onPartial, signal } = options;

    // Edge function first, unless live streaming is requested (streaming goes through the
    // Responses client, which uses the edge proxy automatically when no browser key exists).
    if (isSupabaseConfigured() && !onPartial && getOpenAIApiKey() === '') {
      try {
        const result = await callEdgeFunction('image-generation', {
          provider: 'openai',
          prompt,
          size,
          quality,
          style
        });
        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for image generation:', edgeError);
      }
    }

    const styled = style === 'vivid' ? `${prompt}\n\nStyle: vivid, dramatic, hyper-real.` : prompt;
    const result = await responsesGenerateImage(
      { prompt: styled, size, quality, imageModel, onPartial },
      signal
    );
    return result.dataUrl;
  } catch (error) {
    console.error('Error generating image with GPT Image:', error);
    throw error;
  }
}

/**
 * Generate image variations with DALL-E
 */
export async function generateImageVariations(
  imageUrl: string,
  options: {
    n?: number;
    size?: '1024x1024' | '1792x1024' | '1024x1792' | '1536x1024' | '1024x1536';
  } = {}
): Promise<string[]> {
  // /v1/images/variations no longer exists for current models: variations are produced by
  // editing the source image with GPT Image 2.6 through the Responses API.
  try {
    console.log('🔄 Generating image variations with GPT Image 2.6');
    const { n = 1, size = '1024x1024' } = options;
    const source = imageUrl.startsWith('data:') ? imageUrl : await toDataUrlFromUrl(imageUrl);
    const results: string[] = [];
    for (let i = 0; i < n; i++) {
      const r = await responsesGenerateImage({
        prompt: `Create a creative variation of the provided image, keeping its subject recognisable. Variation ${i + 1} of ${n}.`,
        inputImages: [source],
        size
      });
      results.push(r.dataUrl);
    }
    return results;
  } catch (error) {
    console.error('Error generating image variations:', error);
    throw error;
  }
}

/**
 * Edit image with DALL-E (inpainting/outpainting)
 */
export async function editImageWithDalle(
  imageUrl: string,
  maskUrl: string,
  prompt: string,
  options: {
    size?: '1024x1024' | '1792x1024' | '1024x1792' | '1536x1024' | '1024x1536';
    onPartial?: (preview: { dataUrl: string; index: number }) => void;
  } = {}
): Promise<string> {
  try {
    console.log('✏️ Editing image with GPT Image 2.6');
    const { size = '1024x1024', onPartial } = options;

    const [source, mask] = await Promise.all([
      imageUrl.startsWith('data:') ? imageUrl : toDataUrlFromUrl(imageUrl),
      maskUrl ? (maskUrl.startsWith('data:') ? maskUrl : toDataUrlFromUrl(maskUrl)) : Promise.resolve(undefined)
    ]);

    const result = await responsesGenerateImage({
      prompt,
      inputImages: [source],
      mask,
      size,
      quality: 'high',
      onPartial
    });
    return result.dataUrl;
  } catch (error) {
    console.error('Error editing image with GPT Image:', error);
    // Return original image as fallback
    return imageUrl;
  }
}

/**
 * Generate an image with GPT Image 2.6 (Responses API)
 */
export async function generateImageWithGptImage(
  prompt: string,
  options: { onPartial?: (preview: { dataUrl: string; index: number }) => void; imageModel?: string; signal?: AbortSignal } = {}
): Promise<string> {
  try {
    console.log('🖼️ Generating image with GPT Image 2.6');
    const { signal, ...imageOptions } = options;
    const result = await responsesGenerateImage({ prompt, ...imageOptions }, signal);
    return result.dataUrl;
  } catch (error) {
    console.error('Error generating image with GPT Image:', error);
    throw error;
  }
}

/**
 * Generate an image with Gemini
 * NOTE: Gemini doesn't natively generate images, so this falls back to OpenAI DALL-E
 */
export async function generateImageWithGemini(prompt: string, aspectRatio: string = '1:1', style: string = ''): Promise<string> {
  try {
    console.log('🖼️ Generating image with Gemini (fallback to OpenAI)');
    console.warn('Note: Gemini does not support native image generation. Using OpenAI DALL-E as fallback.');

    // Enhance prompt with style if provided
    let enhancedPrompt = prompt;
    if (style && style !== 'photography' && !prompt.toLowerCase().includes(style.toLowerCase())) {
      enhancedPrompt = `${prompt} (${style} style)`;
    }

    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('image-generation', {
          provider: 'openai',
          prompt: enhancedPrompt,
          aspectRatio
        });

        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for image generation:', edgeError);
      }
    }

    // Fall back to OpenAI DALL-E since Gemini doesn't generate images
    const openaiKey = getOpenAIApiKey();
    if (!openaiKey) {
      throw new Error('OpenAI API key is required for image generation. Please add VITE_OPENAI_API_KEY to your .env file or get a valid API key from https://platform.openai.com/api-keys');
    }

    // Map aspect ratio to DALL-E sizes
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
 * Generate an image with Gemini 2.0 Flash
 * NOTE: Gemini doesn't natively generate images, so this falls back to OpenAI DALL-E
 */
export async function generateImageWithGemini2Flash(prompt: string): Promise<string> {
  try {
    console.log('🖼️ Generating image with Gemini 2.0 Flash (fallback to OpenAI)');
    console.warn('Note: Gemini does not support native image generation. Using OpenAI DALL-E as fallback.');

    // Use the standard Gemini function which now properly falls back to OpenAI
    return await generateImageWithGemini(prompt, '1:1', '');
  } catch (error) {
    console.error('Error generating image with Gemini 2.0 Flash:', error);
    throw error;
  }
}

/**
 * Generate an image with Gemini Nano (Optimized for speed and efficiency)
 */
export async function generateImageWithGeminiNano(
  prompt: string,
  options: ImageGenerationOptions = {},
  config: GeminiNanoConfig = {}
): Promise<string> {
  try {
    console.log('🚀 Generating image with Gemini Nano (Optimized)');

    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('image-generation', {
          provider: 'gemini-nano',
          prompt,
          options,
          config
        });

        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for Gemini Nano image generation:', edgeError);
        // Continue to direct API fallback
      }
    }

    // Fall back to direct API call using Gemini Nano service
    return await generateImageWithGeminiNanoService(prompt, options, config);
  } catch (error) {
    console.error('Error generating image with Gemini Nano:', error);
    throw new Error('Invalid provider specified for action figure generation');
  }
}

/**
 * Fetch resources from Freepik API
 */
export async function fetchFreepikResources(options: {
  keywords?: string
  content_type?: 'photo' | 'vector' | 'psd' | 'icon' | 'video'
  orientation?: 'horizontal' | 'vertical' | 'square'
  license?: string
  page?: number
  per_page?: number
}): Promise<{
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
  try {
    console.log('📚 Fetching Freepik resources');

    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('freepik-resources', options);

        if (result && result.resources) {
          return {
            resources: result.resources,
            meta: result.meta
          };
        }
      } catch (edgeError) {
        console.warn('Edge function failed for Freepik resources:', edgeError);
        // Continue to direct API fallback
      }
    }

    // Fall back to direct API call
    const apiKey = getFreepikApiKey();
    if (!apiKey) {
      throw new Error('Freepik API key is required. Please configure VITE_FREEPIK_API_KEY in your environment variables.');
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (options.keywords) params.append('keywords', options.keywords);
    if (options.content_type) params.append('content_type', options.content_type);
    if (options.orientation) params.append('orientation', options.orientation);
    if (options.license) params.append('license', options.license);
    if (options.page && options.page > 1) params.append('page', options.page.toString());
    if (options.per_page && options.per_page !== 20) params.append('per_page', options.per_page.toString());

    const response = await fetch(`https://api.freepik.com/v1/resources?${params}`, {
      method: 'GET',
      headers: {
        'x-freepik-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = `${response.status} `;

      try {
        const errorData = await response.json();
        errorMessage += errorData.message || 'Unknown error';
      } catch {
        errorMessage += 'Unknown error';
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Transform response to match our interface
    const transformedData = data.data?.map((resource: any) => ({
      id: resource.id,
      title: resource.title,
      url: resource.url,
      filename: resource.filename,
      thumbnailUrl: resource.image?.source?.url || null,
      type: resource.image?.type || null,
      orientation: resource.image?.orientation || null,
      width: resource.image?.source?.size ? parseInt(resource.image.source.size.split('x')[0]) : null,
      height: resource.image?.source?.size ? parseInt(resource.image.source.size.split('x')[1]) : null,
      downloads: resource.stats?.downloads || 0,
      likes: resource.stats?.likes || 0,
      author: resource.author?.name || null,
      publishedAt: resource.meta?.published_at || null,
      license: resource.licenses?.[0]?.type || null
    })) || [];

    return {
      resources: transformedData,
      meta: data.meta
    };
  } catch (error) {
    console.error('Error fetching Freepik resources:', error);
    throw error;
  }
}

/**
 * Generate an image with Imagen 4 (Google's high-fidelity model)
 */
export async function generateImageWithImagen4(
  prompt: string,
  options: {
    aspectRatio?: string;
    quality?: 'standard' | 'high';
    negativePrompt?: string;
    personGeneration?: 'dont_allow' | 'allow_adult' | 'allow_all';
    numberOfImages?: number;
  } = {}
): Promise<string[]> {
  try {
    console.log('🎨 Generating image with Imagen 4');

    const {
      aspectRatio = '1:1',
      quality = 'standard',
      negativePrompt = '',
      personGeneration = 'allow_adult',
      numberOfImages = 1
    } = options;

    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('image-generation', {
          provider: 'imagen-4',
          prompt,
          aspectRatio,
          quality,
          negativePrompt,
          personGeneration,
          numberOfImages
        });

        if (result && result.imageUrls && Array.isArray(result.imageUrls)) {
          return result.imageUrls;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for Imagen 4 image generation:', edgeError);
        // Continue to direct API fallback
      }
    }

    // Fall back to direct API call
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key is required for Imagen 4. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instances: [{
          prompt: prompt + (negativePrompt ? `. Avoid: ${negativePrompt}` : '')
        }],
        parameters: {
          sampleCount: Math.min(numberOfImages, 4), // Imagen 4 supports up to 4
          aspectRatio,
          imageSize: quality === 'high' ? '2K' : '1K',
          personGeneration
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Imagen 4 API error response:', errorText);

      if (response.status === 403) {
        throw new Error(
          'Imagen 4 API access denied. This typically means:\n' +
          '1. The API key needs proper authentication setup\n' +
          '2. Imagen 4 requires a Google Cloud project with billing enabled\n' +
          '3. You may need to use a different image generation provider\n\n' +
          'For now, please use OpenAI DALL-E or Gemini Nano as your image generation provider.'
        );
      }

      throw new Error(`Imagen 4 API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Extract images from Imagen 4 response
    const imageUrls: string[] = [];
    if (data.predictions && Array.isArray(data.predictions)) {
      for (const prediction of data.predictions) {
        if (prediction.bytesBase64Encoded) {
          imageUrls.push(`data:image/png;base64,${prediction.bytesBase64Encoded}`);
        }
      }
    }

    if (imageUrls.length === 0) {
      throw new Error('No images found in Imagen 4 API response');
    }

    return imageUrls;
  } catch (error) {
    console.error('Error generating image with Imagen 4:', error);
    throw new Error('Invalid provider specified for cartoon-style image generation');
  }
}

/**
 * Edit an image with Gemini Nano
 */
export async function editImageWithGeminiNano(
  imageUrl: string,
  editOptions: ImageEditOptions,
  config: GeminiNanoConfig = {}
): Promise<string> {
  try {
    console.log('✏️ Editing image with Gemini Nano');

    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('image-editing', {
          provider: 'gemini-nano',
          imageUrl,
          editOptions,
          config
        });

        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for Gemini Nano image editing:', edgeError);
        // Continue to direct API fallback
      }
    }

    // Fall back to direct API call using Gemini Nano service
    return await editImageWithGeminiNanoService(imageUrl, editOptions, config);
  } catch (error) {
    console.error('Error editing image with Gemini Nano:', error);
    // Return original image as fallback
    return imageUrl;
  }
}

/**
 * Generate image variations with Gemini Nano
 */
export async function generateVariationsWithGeminiNano(
  imageUrl: string,
  count: number = 3,
  config: GeminiNanoConfig = {}
): Promise<string[]> {
  try {
    console.log('🔄 Generating variations with Gemini Nano');

    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('image-variations', {
          provider: 'gemini-nano',
          imageUrl,
          count,
          config
        });

        if (result && result.imageUrls && Array.isArray(result.imageUrls)) {
          return result.imageUrls;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for Gemini Nano variations:', edgeError);
        // Continue to direct API fallback
      }
    }

    // Fall back to direct API call using Gemini Nano service
    return await generateVariationsWithGeminiNanoService(imageUrl, count, config);
  } catch (error) {
    console.error('Error generating variations with Gemini Nano:', error);
    throw error;
  }
}

/**
 * Generate an image with Imagen (Google)
 */
export async function generateImageWithImagen(prompt: string, aspectRatio: string = '1:1'): Promise<string> {
  try {
    console.log('🖼️ Generating image with Imagen');
    
    // Add aspect ratio if not already in prompt
    let enhancedPrompt = prompt;
    if (!enhancedPrompt.toLowerCase().includes('aspect ratio')) {
      enhancedPrompt = `${enhancedPrompt} (${aspectRatio} aspect ratio)`;
    }
    
    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('image-generation', {
          provider: 'imagen',
          prompt: enhancedPrompt,
          aspectRatio
        });
        
        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for Imagen image generation:', edgeError);
        // Continue to direct API fallback
      }
    }
    
    // For now, we use Gemini's API as a proxy to Imagen capabilities
    return generateImageWithGemini(enhancedPrompt, aspectRatio);
  } catch (error) {
    console.error('Error generating image with Imagen:', error);
    throw error;
  }
}

/**
 * Generate an image using a reference image
 */
async function generateImageWithReferenceGemini(prompt: string, referenceImageUrl: string): Promise<string> {
  try {
    console.log('🖼️ Generating image with reference using Gemini');
    
    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('reference-image', {
          provider: 'gemini',
          prompt,
          referenceImageUrl
        });
        
        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for reference-based image generation:', edgeError);
        // Continue to direct API fallback
      }
    }
    
    // Fall back to direct API call
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      
      throw new Error('API configuration required. Please configure your API keys in environment variables.');
    }
    
    try {
      // Fetch the reference image
      const imageResponse = await fetch(referenceImageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch reference image');
      }
      
      const imageBlob = await imageResponse.blob();
      
      // Convert to base64
      const base64Data = await blobToBase64(imageBlob);
      
      // Call Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `Using this image as reference, create: ${prompt}` },
                {
                  inline_data: {
                    mime_type: imageBlob.type,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMediaType: "IMAGE"
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract the image from the response
      for (const part of data.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      
      throw new Error('No image found in Gemini response');
    } catch (error) {
      console.error('Error with direct API call for reference image:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error generating image with reference:', error);
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
    
    // Fall back to direct API call
    const apiKey = getOpenAIApiKey();
    if (!apiKey) {
      
      throw new Error('API configuration required. Please configure your API keys in environment variables.');
    }
    
    // For now, we'll use a modified prompt that references the image
    // In a real implementation, you would use the Vision API to analyze the reference image
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
export async function generateGhibliStyleImage(prompt: string, provider: string = 'gemini', referenceImageUrl?: string): Promise<string> {
  try {
    console.log(`🌟 Generating Ghibli-style image with ${provider}`);
    
    const enhancedPrompt = quickEnhance(`Studio Ghibli style: ${prompt}`, 'ghibli');
    
    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('ghibli-image', {
          prompt: enhancedPrompt,
          provider,
          referenceImageUrl
        });
        
        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for Ghibli-style image generation:', edgeError);
        // Continue to direct API fallback
      }
    }
    
    // Fall back to using appropriate provider
    if (provider === 'gpt-image-1') {
      if (referenceImageUrl) {
        return generateImageWithReferenceGptImage(enhancedPrompt, referenceImageUrl);
      } else {
        return generateImageWithGptImage(enhancedPrompt);
      }
    } else if (provider === 'gemini' || provider === 'gemini-nano' || provider === 'openai') {
      console.log(`Using ${provider === 'gemini' ? 'Gemini' : provider === 'gemini-nano' ? 'Gemini Nano' : 'DALL-E'} API directly for Ghibli-style image`);

      if (provider === 'gemini-nano') {
        // Use Gemini Nano for faster generation
        return generateImageWithGeminiNano(enhancedPrompt, {
          style: 'ghibli',
          aspectRatio: '16:9'
        });
      } else if (provider === 'gemini') {
        if (referenceImageUrl) {
          return generateImageWithReferenceGemini(enhancedPrompt, referenceImageUrl);
        } else {
          return generateImageWithGemini(enhancedPrompt);
        }
      } else {
        return generateImageWithDalle(enhancedPrompt);
      }
    }
    
    // If no provider matches, use fallback image
    console.warn('Invalid provider specified, using placeholder image');
    throw new Error('API configuration required. Please configure your API keys in environment variables.');
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
    
    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('reference-image', {
          imageType: 'cartoonStyle',
          basePrompt: enhancedPrompt,
          provider,
          referenceImageUrl,
          style
        });
        
        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for cartoon-style image generation:', edgeError);
        // Continue to direct API fallback
      }
    }
    
    // Fall back to using appropriate provider
    if (provider === 'gpt-image-1') {
      if (referenceImageUrl) {
        return generateImageWithReferenceGptImage(enhancedPrompt, referenceImageUrl);
      } else {
        return generateImageWithGptImage(enhancedPrompt);
      }
    } else if (provider === 'gemini' || provider === 'openai') {
      console.log(`Using ${provider === 'gemini' ? 'Gemini' : 'DALL-E'} API directly for cartoon-style image`);
      
      if (provider === 'gemini') {
        if (referenceImageUrl) {
          return generateImageWithReferenceGemini(enhancedPrompt, referenceImageUrl);
        } else {
          return generateImageWithGemini(enhancedPrompt);
        }
      } else {
        // If we have a reference image, add that context to the prompt
        if (referenceImageUrl) {
          return generateImageWithDalle(`Using a reference image as inspiration: ${enhancedPrompt}`);
        } else {
          return generateImageWithDalle(enhancedPrompt);
        }
      }
    }

    throw new Error('Invalid provider specified for cartoon-style image generation');
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
    
    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('meme-generator', {
          topText,
          bottomText,
          referenceImageUrl,
          additionalStyle,
          provider: 'gpt-image-1' // Use GPT-4 Vision for enhanced meme generation
        });
        
        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for meme generation:', edgeError);
        // Continue to direct API fallback
      }
    }
    
    // If edge function fails, provide a fallback implementation 
    // This is a simple implementation that returns the reference image with text overlay
    console.warn('Meme generation via edge function failed, returning reference image as fallback');
    return referenceImageUrl;
  } catch (error) {
    console.error('Error generating meme:', error);
    // Return the original reference image as a fallback
    return referenceImageUrl;
  }
}

/**
 * Generate an action figure image
 */
export async function generateActionFigure(prompt: string, provider: string = 'openai', referenceImageUrl?: string): Promise<string> {
  try {
    console.log(`🤖 Generating action figure with ${provider}`);

    const enhancedPrompt = quickEnhance(`Create an action figure: ${prompt}`, 'action-figure');

    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('action-figure', {
          prompt: enhancedPrompt,
          provider,
          referenceImageUrl
        });

        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for action figure generation:', edgeError);
        // Continue to direct API fallback
      }
    }

    // Fall back to direct API calls
    if (provider === 'gpt-image-1') {
      if (referenceImageUrl) {
        return generateImageWithReferenceGptImage(enhancedPrompt, referenceImageUrl);
      } else {
        return generateImageWithGptImage(enhancedPrompt);
      }
    } else if (provider === 'gemini-nano') {
      // Use Gemini Nano for on-device generation
      return generateImageWithGeminiNano(enhancedPrompt, {
        aspectRatio: '1:1',
        quality: 'standard'
      });
    } else if (provider === 'gemini' || provider === 'openai') {
      console.log(`Using ${provider === 'gemini' ? 'Gemini' : 'DALL-E'} API directly for action figure`);

      if (provider === 'gemini') {
        if (referenceImageUrl) {
          return generateImageWithReferenceGemini(enhancedPrompt, referenceImageUrl);
        } else {
          return generateImageWithGemini(enhancedPrompt);
        }
      } else {
        // If we have a reference image, add that context to the prompt
        if (referenceImageUrl) {
          return generateImageWithDalle(`Using a reference image as inspiration: ${enhancedPrompt}`);
        } else {
          return generateImageWithDalle(enhancedPrompt);
        }
      }
    }

    throw new Error(`Invalid provider specified for action figure generation: ${provider}. Supported providers are: openai, gemini, gemini-nano, gpt-image-1`);
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
    
    // Fall back to direct API call to OpenAI
    const apiKey = getOpenAIApiKey();
    if (!apiKey) {
      console.warn('No OpenAI API key available, returning basic recommendations');
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

    const prompt = `Based on this prompt: "${basePrompt}" and personalization tokens (${tokenString}), generate 3 enhanced prompt variations for ${modelName} style image generation. Make them detailed and specific, following best practices for GPT Image generation. Format as a JSON array of strings.`;

    const { text: responseText } = await responsesGenerateText({ input: prompt, maxOutputTokens: 1024 });

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