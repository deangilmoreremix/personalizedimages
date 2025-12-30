/**
 * Core API Types
 *
 * Shared type definitions for the unified API system.
 */

export type AIProvider = 'openai' | 'gemini' | 'gemini-nano' | 'imagen' | 'leonardo' | 'giphy' | 'freepik';

// Base request interface
export interface ImageGenerationRequest {
  prompt: string;
  provider?: AIProvider;
  style?: ImageStyle;
  size?: '1024x1024' | '1792x1024' | '1024x1792' | '512x512' | '256x256';
  quality?: 'standard' | 'hd';
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
  negativePrompt?: string;
  referenceImages?: string[];
  count?: number;
  model?: string; // Specific model override
  outputFormat?: OutputFormat;
  appliedTokens?: any[]; // Array of tokens to apply
}

// Image editing request
export interface ImageEditingRequest {
  imageUrl: string;
  editPrompt: string;
  maskUrl?: string; // For mask-based editing
  provider?: 'openai' | 'gemini';
  strength?: number; // 0-1, how strongly to apply edits
}

// Image analysis request
export interface ImageAnalysisRequest {
  imageUrl: string;
  analysisType: 'description' | 'tags' | 'objects' | 'colors' | 'sentiment';
  provider?: 'openai' | 'gemini';
  customPrompt?: string;
}

// Video generation request
export interface VideoGenerationRequest {
  imageUrl: string;
  duration?: number; // seconds, 1-10
  prompt?: string;
  provider?: 'gemini-veo' | 'nano-banana';
  style?: 'smooth' | 'cinematic' | 'animated';
}

// Response interfaces
export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  imageUrls?: string[]; // For multiple generations
  error?: string;
  provider: string;
  requestId: string;
  metadata?: {
    generationTime: number;
    model: string;
    cost?: number;
    fallbackUsed?: boolean;
    variationIndex?: number;
    totalVariations?: number;
  };
}

export interface ImageEditingResponse {
  success: boolean;
  editedImageUrl?: string;
  error?: string;
  provider: string;
  requestId: string;
  metadata?: {
    editTime: number;
    model: string;
  };
}

export interface ImageAnalysisResponse {
  success: boolean;
  analysis?: string;
  tags?: string[];
  objects?: string[];
  colors?: string[];
  error?: string;
  provider: string;
  requestId: string;
}

export interface VideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
  provider: string;
  requestId: string;
  metadata?: {
    duration: number;
    format: string;
  };
}

// Streaming interfaces
export interface StreamingOptions {
  onProgress?: (progress: number) => void;
  onStatusUpdate?: (status: string) => void;
  onPartialResult?: (partialData: any) => void;
  abortController?: AbortController;
}

// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public provider: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class RateLimitError extends APIError {
  constructor(provider: string, public resetTime: number) {
    super(`Rate limit exceeded for ${provider}`, provider, 429, true);
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends APIError {
  constructor(provider: string) {
    super(`Authentication failed for ${provider}`, provider, 401, false);
    this.name = 'AuthenticationError';
  }
}

// Utility types
export type ImageStyle = 'photography' | 'painting' | 'digital-art' | 'sketch' | 'cartoon' | 'anime' | 'illustration' | 'ghibli' | 'meme' | 'surreal';

export type OutputFormat = 'url' | 'base64' | 'blob';

export interface GenerationOptions {
  style?: ImageStyle;
  size?: string;
  quality?: 'standard' | 'hd';
  aspectRatio?: string;
  negativePrompt?: string;
  referenceImages?: string[];
  count?: number;
  outputFormat?: OutputFormat;
}

// Cache interfaces
export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface CacheOptions {
  ttl?: number;
  key?: string;
}

// Retry configuration
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

// Provider status
export interface ProviderStatus {
  provider: string;
  available: boolean;
  rateLimited: boolean;
  resetTime?: number;
  lastError?: string;
}