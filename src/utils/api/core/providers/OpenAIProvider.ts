/**
 * OpenAI Provider Implementation (Responses API)
 *
 * Image generation / editing uses GPT Image 2.6 through the Responses API
 * `image_generation` tool. Vision uses a mainline model through the same API.
 * (dall-e-2 / dall-e-3 were removed from the API on 2026-05-12.)
 */

import { getApiKey } from '../../../env';
import {
  DEFAULT_IMAGE_MODEL,
  DEFAULT_TEXT_MODEL,
  analyzeImage as coreAnalyzeImage,
  generateImage as coreGenerateImage,
  type ImageFormat
} from '../../../openaiResponses';

const env = (import.meta as any).env || {};
const IMAGE_MODEL: string = env.VITE_OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL;
const TEXT_MODEL: string = env.VITE_OPENAI_TEXT_MODEL || DEFAULT_TEXT_MODEL;

export interface OpenAIOptions {
  /** Image model (GPT Image). Legacy DALL-E ids are ignored and mapped to the default. */
  model?: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792' | '1536x1024' | '1024x1536' | 'auto';
  quality?: 'standard' | 'hd' | 'low' | 'medium' | 'high' | 'auto';
  /** @deprecated GPT Image has no `style` parameter; kept so existing callers compile. */
  style?: 'natural' | 'vivid';
  /** 'url' is no longer available: results are always data URLs. Kept for compatibility. */
  response_format?: 'url' | 'b64_json';
  format?: ImageFormat;
  n?: number; // Number of variations to generate
  timeout?: number; // Request timeout in milliseconds (default: 180000)
  /** Live streaming: progressive previews while the image renders. */
  onPartial?: (preview: { dataUrl: string; index: number }) => void;
}

const DEFAULT_TIMEOUT = 180000; // high quality renders can take a while

function resolveImageModel(model?: string): string {
  return model && model.startsWith('gpt-image') ? model : IMAGE_MODEL;
}

export class OpenAIProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = getApiKey('openai') || '';
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
  }

  private async withTimeout<T>(timeoutMs: number, fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fn(controller.signal);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /** Generate an image (returns a data URL). Streams previews when `onPartial` is set. */
  async generateImage(prompt: string, options: OpenAIOptions = {}): Promise<string> {
    const { size = '1024x1024', quality = 'standard', timeout = DEFAULT_TIMEOUT, format, onPartial } = options;
    return this.withTimeout(timeout, async signal => {
      const result = await coreGenerateImage(
        { prompt, size, quality, format, onPartial, imageModel: resolveImageModel(options.model) },
        { apiKey: this.apiKey, signal },
        { imageModel: IMAGE_MODEL, textModel: TEXT_MODEL }
      );
      return result.dataUrl;
    });
  }

  /** Edit an image, optionally with a mask (inpainting). `image` / `mask` are data URLs. */
  async editImage(image: string, mask: string | undefined, prompt: string, options: OpenAIOptions = {}): Promise<string> {
    const { size = '1024x1024', quality = 'high', timeout = DEFAULT_TIMEOUT, format, onPartial } = options;
    return this.withTimeout(timeout, async signal => {
      const result = await coreGenerateImage(
        { prompt, size, quality, format, onPartial, inputImages: [image], mask: mask || undefined, imageModel: resolveImageModel(options.model) },
        { apiKey: this.apiKey, signal },
        { imageModel: IMAGE_MODEL, textModel: TEXT_MODEL }
      );
      return result.dataUrl;
    });
  }

  /** Variations are produced by re-imagining the source image with GPT Image. */
  async generateVariations(image: string, options: OpenAIOptions = {}): Promise<string[]> {
    const { n = 1, size = '1024x1024', quality = 'medium', timeout = DEFAULT_TIMEOUT } = options;
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const dataUrl = await this.withTimeout(timeout, async signal => {
        const result = await coreGenerateImage(
          {
            prompt: `Create a creative variation of the provided image, keeping its subject recognisable. Variation ${i + 1} of ${n}.`,
            size,
            quality,
            inputImages: [image],
            imageModel: resolveImageModel(options.model)
          },
          { apiKey: this.apiKey, signal },
          { imageModel: IMAGE_MODEL, textModel: TEXT_MODEL }
        );
        return result.dataUrl;
      });
      out.push(dataUrl);
    }
    return out;
  }

  /** Analyze an image with a mainline vision-capable model. */
  async analyzeImage(imageUrl: string, prompt: string = 'Describe this image in detail'): Promise<string> {
    return this.withTimeout(60000, signal =>
      coreAnalyzeImage(imageUrl, prompt, { apiKey: this.apiKey, signal }, { model: TEXT_MODEL, maxOutputTokens: 500 })
    );
  }

  /** Check if API key is valid */
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
