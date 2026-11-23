/**
 * Image editing with GPT Image 2.6 through the Responses API.
 * A vision model writes precise edit instructions, then GPT Image edits the *source image*
 * (not a re-imagined copy).
 */

import { getOpenAIApiKey, hasApiKey } from './apiUtils';
import {
  DEFAULT_IMAGE_MODEL,
  DEFAULT_TEXT_MODEL,
  analyzeImage,
  generateImage
} from './openaiResponses';

const env = (import.meta as any).env || {};
const IMAGE_MODEL: string = env.VITE_OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL;
const TEXT_MODEL: string = env.VITE_OPENAI_TEXT_MODEL || DEFAULT_TEXT_MODEL;

export interface GPT5EditOptions {
  mode: 'enhance' | 'adjust' | 'transform' | 'effects' | 'custom';
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
  rotation?: number;
  customPrompt?: string;
}

export interface GPT5EditResult {
  imageUrl: string;
  editedWith: string;
  metadata?: {
    originalPrompt?: string;
    editInstructions?: string;
  };
}

/**
 * GPT-4o Image Editor Service Class
 */
export class GPT5ImageEditorService {
  private apiKey: string | null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || getOpenAIApiKey() || null;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  private ensureApiKey(): void {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required for GPT-5 image editing. Please configure VITE_OPENAI_API_KEY in your environment.');
    }
  }

  /**
   * Edit an image using GPT-4o vision and DALL-E 3
   * Strategy: Use GPT-4o to analyze the image and create an edit prompt,
   * then use DALL-E 3 to generate the edited version
   */
  async editImage(
    imageUrl: string,
    options: GPT5EditOptions & { onPartial?: (p: { dataUrl: string; index: number }) => void }
  ): Promise<GPT5EditResult> {
    this.ensureApiKey();
    try {
      // Step 1: have a vision model turn the requested adjustments into edit instructions
      const analysisPrompt = this.createAnalysisPrompt(options);
      const editInstructions = await this.analyzeImageWithGPT4o(imageUrl, analysisPrompt);

      // Step 2: edit the original image with GPT Image (optionally streaming previews)
      const editedImageUrl = await this.generateEditedImageWithDALLE(editInstructions, imageUrl, options.onPartial);

      return {
        imageUrl: editedImageUrl,
        editedWith: IMAGE_MODEL,
        metadata: { editInstructions }
      };
    } catch (error) {
      console.error('Error editing image with GPT Image:', error);
      throw error;
    }
  }

  /** Analyze an image with a mainline vision model (Responses API). */
  private async analyzeImageWithGPT4o(imageUrl: string, prompt: string): Promise<string> {
    this.ensureApiKey();
    return analyzeImage(imageUrl, prompt, { apiKey: this.apiKey as string }, { model: TEXT_MODEL, maxOutputTokens: 1000 });
  }

  /** Edit (or generate) with GPT Image 2.6. When `sourceImage` is given it is edited in place. */
  private async generateEditedImageWithDALLE(
    prompt: string,
    sourceImage?: string,
    onPartial?: (p: { dataUrl: string; index: number }) => void
  ): Promise<string> {
    this.ensureApiKey();
    const result = await generateImage(
      {
        prompt,
        quality: 'high',
        size: '1024x1024',
        inputImages: sourceImage ? [sourceImage] : undefined,
        onPartial
      },
      { apiKey: this.apiKey as string },
      { imageModel: IMAGE_MODEL, textModel: TEXT_MODEL }
    );
    return result.dataUrl;
  }

  /**
   * Create analysis prompt based on edit options
   */
  private createAnalysisPrompt(options: GPT5EditOptions): string {
    const { mode, brightness, contrast, saturation, blur, rotation, customPrompt } = options;

    let basePrompt = 'Analyze this image carefully and write precise edit instructions that apply the following modifications while preserving everything else:\n\n';

    switch (mode) {
      case 'enhance':
        basePrompt += `- Enhance the overall quality and clarity
- Improve sharpness and detail
- Optimize colors and lighting
- Maintain the original composition and subject`;
        break;

      case 'adjust':
        const adjustments: string[] = [];
        if (brightness !== undefined && brightness !== 100) {
          adjustments.push(`- ${brightness > 100 ? 'Increase' : 'Decrease'} brightness by ${Math.abs(brightness - 100)}%`);
        }
        if (contrast !== undefined && contrast !== 100) {
          adjustments.push(`- ${contrast > 100 ? 'Increase' : 'Decrease'} contrast by ${Math.abs(contrast - 100)}%`);
        }
        if (saturation !== undefined && saturation !== 100) {
          adjustments.push(`- ${saturation > 100 ? 'Increase' : 'Decrease'} color saturation by ${Math.abs(saturation - 100)}%`);
        }
        if (blur !== undefined && blur > 0) {
          adjustments.push(`- Apply ${blur}px blur effect`);
        }
        if (rotation !== undefined && rotation !== 0) {
          adjustments.push(`- Rotate the composition by ${rotation} degrees`);
        }
        basePrompt += adjustments.length > 0 ? adjustments.join('\n') : '- Maintain the original appearance';
        break;

      case 'transform':
        basePrompt += `- Transform the style while keeping the subject recognizable
- Apply artistic enhancement
- Improve composition and visual appeal
- Maintain key elements of the original`;
        break;

      case 'effects':
        basePrompt += `- Apply creative visual effects
- Enhance with professional filters
- Add depth and dimension
- Create a polished, professional result`;
        break;

      case 'custom':
        basePrompt += customPrompt || '- Apply general improvements';
        break;

      default:
        basePrompt += '- Apply general enhancements to improve the image';
    }

    basePrompt += '\n\nIMPORTANT: Your response should ONLY be the edit instructions. Do not include explanations or commentary.';

    return basePrompt;
  }

  /**
   * Create variations of an image
   */
  async createVariations(
    imageUrl: string,
    count: number = 3
  ): Promise<string[]> {
    this.ensureApiKey();
    try {
      console.log('Creating variations with GPT Image 2.6');

      // Analyze the original image
      const analysisPrompt = 'Describe this image in detail, including composition, colors, style, and mood. Then create 3 different image prompts for variations that maintain the core subject but explore different styles, angles, or color schemes.';

      const variationPrompts = await this.analyzeImageWithGPT4o(imageUrl, analysisPrompt);

      // Parse and generate variations (simplified - in production, parse individual prompts)
      const variations: string[] = [];

      for (let i = 0; i < count; i++) {
        const variationPrompt = `${variationPrompts} - Variation ${i + 1}`;
        const variationUrl = await this.generateEditedImageWithDALLE(variationPrompt, imageUrl);
        variations.push(variationUrl);
      }

      return variations;
    } catch (error) {
      console.error('Error creating variations:', error);
      throw error;
    }
  }
}

let _gpt5ImageEditorInstance: GPT5ImageEditorService | null = null;

function getGPT5ImageEditor(): GPT5ImageEditorService {
  if (!_gpt5ImageEditorInstance) {
    _gpt5ImageEditorInstance = new GPT5ImageEditorService();
  }
  return _gpt5ImageEditorInstance;
}

export const gpt5ImageEditor = {
  isAvailable: () => hasApiKey('openai'),
  editImage: (imageUrl: string, options: GPT5EditOptions) =>
    getGPT5ImageEditor().editImage(imageUrl, options),
  createVariations: (imageUrl: string, count?: number) =>
    getGPT5ImageEditor().createVariations(imageUrl, count),
};

export const editImageWithGPT5 = (
  imageUrl: string,
  options: GPT5EditOptions
): Promise<GPT5EditResult> => {
  return getGPT5ImageEditor().editImage(imageUrl, options);
};

export const createVariationsWithGPT5 = (
  imageUrl: string,
  count?: number
): Promise<string[]> => {
  return getGPT5ImageEditor().createVariations(imageUrl, count);
};

export const isGPT5EditorAvailable = (): boolean => hasApiKey('openai');
