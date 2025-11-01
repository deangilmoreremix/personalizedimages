// This utility file handles API calls to various AI services
// It supports direct API calls and edge function calls through Supabase

import { callEdgeFunction, isSupabaseConfigured, supabase } from './supabaseClient';
import { getGeminiApiKey, getOpenAIApiKey, getGiphyApiKey, hasApiKey, blobToBase64 } from './apiUtils';
import { generateImageWithGeminiNano as generateImageWithGeminiNanoService, editImageWithGeminiNano as editImageWithGeminiNanoService, generateVariationsWithGeminiNano as generateVariationsWithGeminiNanoService, GeminiNanoConfig, ImageEditOptions, ImageGenerationOptions } from './geminiNanoApi';

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
    console.log('🖼️ Generating image with DALL-E 3 (Enhanced)');

    // Set defaults for DALL-E 3 features
    const {
      size = '1024x1024',
      quality = 'standard',
      style = 'natural',
      n = 1
    } = options;

    // Try edge function first
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
        console.warn('Edge function failed for DALL-E image generation:', edgeError);
        // Continue to direct API fallback
      }
    }

    // Fall back to direct API call
    const apiKey = getOpenAIApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key is required. Please configure VITE_OPENAI_API_KEY in your environment variables.');
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: n,
        size: size,
        quality: quality,
        style: style
      }),
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
    return data.data[0].url;
  } catch (error) {
    console.error('Error generating image with DALL-E:', error);
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
    size?: '1024x1024' | '1792x1024' | '1024x1792';
  } = {}
): Promise<string[]> {
  try {
    console.log('🔄 Generating image variations with DALL-E');

    const { n = 1, size = '1024x1024' } = options;

    const apiKey = getOpenAIApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key is required for image variations. Please configure VITE_OPENAI_API_KEY in your environment variables.');
    }

    // First, fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch reference image');
    }

    const imageBlob = await imageResponse.blob();
    const base64Data = await blobToBase64(imageBlob);

    const response = await fetch('https://api.openai.com/v1/images/variations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: new URLSearchParams({
        image: base64Data,
        n: n.toString(),
        size: size
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
    return data.data.map((item: any) => item.url);
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
    size?: '1024x1024' | '1792x1024' | '1024x1792';
  } = {}
): Promise<string> {
  try {
    console.log('✏️ Editing image with DALL-E');

    const { size = '1024x1024' } = options;

    const apiKey = getOpenAIApiKey();
    if (!apiKey) {
      console.warn('No OpenAI API key available, returning original image');
      return imageUrl;
    }

    // Fetch and convert images to base64
    const [imageResponse, maskResponse] = await Promise.all([
      fetch(imageUrl),
      fetch(maskUrl)
    ]);

    if (!imageResponse.ok || !maskResponse.ok) {
      throw new Error('Failed to fetch image or mask');
    }

    const [imageBlob, maskBlob] = await Promise.all([
      imageResponse.blob(),
      maskResponse.blob()
    ]);

    const [imageBase64, maskBase64] = await Promise.all([
      blobToBase64(imageBlob),
      blobToBase64(maskBlob)
    ]);

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: new URLSearchParams({
        image: imageBase64,
        mask: maskBase64,
        prompt: prompt,
        n: '1',
        size: size
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
    return data.data[0].url;
  } catch (error) {
    console.error('Error editing image with DALL-E:', error);
    // Return original image as fallback
    return imageUrl;
  }
}

/**
 * Generate an image with GPT-4 Vision (gpt-image-1)
 */
export async function generateImageWithGptImage(prompt: string): Promise<string> {
  try {
    console.log('🖼️ Generating image with GPT-4 Vision (gpt-image-1)');
    
    // Try edge function first
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
        console.warn('Edge function failed for GPT-4 Vision image generation:', edgeError);
        // Continue to direct API fallback
      }
    }
    
    // Fall back to direct API call
    const apiKey = getOpenAIApiKey();
    if (!apiKey) {
      

      throw new Error('API configuration required. Please configure your API keys in environment variables.');
    }
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      }),
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
    return data.data[0].url;
  } catch (error) {
    console.error('Error generating image with GPT-4 Vision:', error);
    throw error;
  }
}

/**
 * Generate an image with Gemini
 */
export async function generateImageWithGemini(prompt: string, aspectRatio: string = '1:1', style: string = ''): Promise<string> {
  try {
    console.log('🖼️ Generating image with Gemini');
    
    // Enhance prompt with style if provided
    let enhancedPrompt = prompt;
    if (style && style !== 'photography' && !prompt.toLowerCase().includes(style.toLowerCase())) {
      enhancedPrompt = `${prompt} (${style} style)`;
    }
    
    // Add aspect ratio if not already in prompt
    if (!enhancedPrompt.toLowerCase().includes('aspect ratio')) {
      enhancedPrompt = `${enhancedPrompt} (${aspectRatio} aspect ratio)`;
    }
    
    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('image-generation', {
          provider: 'gemini',
          prompt: enhancedPrompt,
          aspectRatio
        });
        
        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for Gemini image generation:', edgeError);
        // Continue to direct API fallback
      }
    }
    
    // Fall back to direct API call
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      
      throw new Error('API configuration required. Please configure your API keys in environment variables.');
    }
    
    const geminiModel = 'gemini-2.5-flash'; // Or another appropriate model
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${geminiModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: enhancedPrompt }] }],
        generationConfig: {
          responseMediaType: "IMAGE"
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the image from the response
    for (const candidate of data.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error('No image found in Gemini response');
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    throw error;
  }
}

/**
 * Generate an image with Gemini 2.0 Flash
 */
export async function generateImageWithGemini2Flash(prompt: string): Promise<string> {
  try {
    console.log('🖼️ Generating image with Gemini 2.0 Flash');

    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('image-generation', {
          provider: 'gemini2flash',
          prompt
        });

        if (result && result.imageUrl) {
          return result.imageUrl;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for Gemini 2.0 Flash image generation:', edgeError);
        // Continue to direct API fallback
      }
    }

    // Fall back to direct API call
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      
      throw new Error('API configuration required. Please configure your API keys in environment variables.');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMediaType: "IMAGE"
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract the image from the response
    for (const candidate of data.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error('No image found in Gemini 2.0 Flash response');
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
    
    // Enhance the prompt for Ghibli style
    const enhancedPrompt = `Studio Ghibli style animation: ${prompt}. Soft colors, whimsical atmosphere, detailed backgrounds, watercolor style painting, magical elements, inspired by Hayao Miyazaki's art direction.`;
    
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
    
    // Enhance the prompt for cartoon style
    const enhancedPrompt = `${prompt} in ${style} style. Clean lines, vibrant colors, simplified features, animated look.`;
    
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
    
    // Enhance the prompt for action figure style
    const enhancedPrompt = `Create a highly detailed, professional-quality product photo of an action figure: ${prompt}. The figure should look like a real commercial toy with articulation points, detailed textures, realistic packaging design, and toy store lighting.`;
    
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

    throw new Error('Invalid provider specified for action figure generation');
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

    const prompt = `Based on this prompt: "${basePrompt}" and personalization tokens (${tokenString}), generate 3 enhanced prompt variations for ${modelName} style image generation. Make them detailed and specific, following best practices for DALL-E 3 image generation. Format as a JSON array of strings.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';

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