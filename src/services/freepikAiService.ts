import { callEdgeFunction } from '../utils/supabaseClient';
import { makeRateLimitedRequest, RATE_LIMITS } from '../utils/rateLimiter';

export interface FreepikTaskResult {
  taskId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  resultUrl?: string;
  resultUrls?: string[];
  error?: string;
  progress?: number;
}

export interface FreepikGenerateOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numImages?: number;
  guidanceScale?: number;
  seed?: number;
  styling?: {
    color?: string;
    framing?: string;
    lighting?: string;
    photography?: string;
  };
}

export interface FreepikUpscaleOptions {
  imageUrl: string;
  scaleFactor?: 2 | 4;
  mode?: 'creative' | 'precision';
  creativity?: number;
  resemblance?: number;
  optimizeFor?: 'faces' | 'art' | 'photo';
}

export interface FreepikRelightOptions {
  imageUrl: string;
  lightDirection?: string;
  lightIntensity?: number;
  ambientLight?: number;
}

export interface FreepikStyleTransferOptions {
  imageUrl: string;
  styleImageUrl?: string;
  styleName?: string;
  strength?: number;
}

export interface FreepikRemoveBgOptions {
  imageUrl: string;
  outputFormat?: 'png' | 'webp';
}

export interface FreepikPromptImproveResult {
  improvedPrompt: string;
  originalPrompt: string;
}

const POLL_INTERVAL = 2000;
const MAX_POLL_ATTEMPTS = 90;
const MAX_PROMPT_LENGTH = 2000;

function sanitizePrompt(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, MAX_PROMPT_LENGTH);
}

async function pollTask(
  edgeFunctionName: string,
  taskId: string,
  onProgress?: (progress: number) => void,
  extraPayload?: Record<string, unknown>
): Promise<FreepikTaskResult> {
  let attempts = 0;

  while (attempts < MAX_POLL_ATTEMPTS) {
    attempts++;

    const result = await callEdgeFunction(edgeFunctionName, {
      action: 'status',
      taskId,
      ...extraPayload,
    });

    if (result.status === 'COMPLETED') {
      onProgress?.(100);
      return {
        taskId,
        status: 'COMPLETED',
        resultUrl: result.resultUrl,
        resultUrls: result.resultUrls,
      };
    }

    if (result.status === 'FAILED') {
      return {
        taskId,
        status: 'FAILED',
        error: result.error || 'Task failed',
      };
    }

    const progress = Math.min(
      Math.round((attempts / MAX_POLL_ATTEMPTS) * 90),
      90
    );
    onProgress?.(progress);

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }

  return {
    taskId,
    status: 'FAILED',
    error: 'Task timed out after maximum polling attempts',
  };
}

function rateLimitedEdgeCall(functionName: string, payload: Record<string, unknown>) {
  return makeRateLimitedRequest(
    `freepik:${functionName}`,
    RATE_LIMITS.IMAGE_GENERATION,
    () => callEdgeFunction(functionName, payload)
  );
}

export const freepikAiService = {
  async generateImage(
    options: FreepikGenerateOptions,
    onProgress?: (progress: number) => void
  ): Promise<FreepikTaskResult> {
    onProgress?.(5);
    const sanitized = {
      ...options,
      prompt: sanitizePrompt(options.prompt),
      negativePrompt: options.negativePrompt ? sanitizePrompt(options.negativePrompt) : undefined,
    };
    const result = await rateLimitedEdgeCall('freepik-ai-image', {
      action: 'generate',
      ...sanitized,
    });

    if (result.taskId) {
      return pollTask('freepik-ai-image', result.taskId, onProgress);
    }

    if (result.resultUrl) {
      onProgress?.(100);
      return {
        taskId: 'direct',
        status: 'COMPLETED',
        resultUrl: result.resultUrl,
        resultUrls: result.resultUrls,
      };
    }

    return { taskId: '', status: 'FAILED', error: result.error || 'Unknown error' };
  },

  async upscaleImage(
    options: FreepikUpscaleOptions,
    onProgress?: (progress: number) => void
  ): Promise<FreepikTaskResult> {
    onProgress?.(5);
    const result = await rateLimitedEdgeCall('freepik-upscale', {
      action: 'upscale',
      ...options,
    });

    if (result.taskId) {
      const upscaleMode = result.mode || options.mode || 'precision';
      return pollTask('freepik-upscale', result.taskId, onProgress, { mode: upscaleMode });
    }

    if (result.resultUrl) {
      onProgress?.(100);
      return { taskId: 'direct', status: 'COMPLETED', resultUrl: result.resultUrl };
    }

    return { taskId: '', status: 'FAILED', error: result.error || 'Unknown error' };
  },

  async removeBackground(
    options: FreepikRemoveBgOptions,
    onProgress?: (progress: number) => void
  ): Promise<FreepikTaskResult> {
    onProgress?.(10);
    const result = await rateLimitedEdgeCall('freepik-remove-bg', {
      action: 'remove',
      ...options,
    });

    if (result.taskId) {
      return pollTask('freepik-remove-bg', result.taskId, onProgress);
    }

    if (result.resultUrl) {
      onProgress?.(100);
      return { taskId: 'direct', status: 'COMPLETED', resultUrl: result.resultUrl };
    }

    return { taskId: '', status: 'FAILED', error: result.error || 'Unknown error' };
  },

  async relightImage(
    options: FreepikRelightOptions,
    onProgress?: (progress: number) => void
  ): Promise<FreepikTaskResult> {
    onProgress?.(5);
    const result = await rateLimitedEdgeCall('freepik-relight', {
      action: 'relight',
      ...options,
    });

    if (result.taskId) {
      return pollTask('freepik-relight', result.taskId, onProgress);
    }

    if (result.resultUrl) {
      onProgress?.(100);
      return { taskId: 'direct', status: 'COMPLETED', resultUrl: result.resultUrl };
    }

    return { taskId: '', status: 'FAILED', error: result.error || 'Unknown error' };
  },

  async styleTransfer(
    options: FreepikStyleTransferOptions,
    onProgress?: (progress: number) => void
  ): Promise<FreepikTaskResult> {
    onProgress?.(5);
    const result = await rateLimitedEdgeCall('freepik-style-transfer', {
      action: 'transfer',
      ...options,
    });

    if (result.taskId) {
      return pollTask('freepik-style-transfer', result.taskId, onProgress);
    }

    if (result.resultUrl) {
      onProgress?.(100);
      return { taskId: 'direct', status: 'COMPLETED', resultUrl: result.resultUrl };
    }

    return { taskId: '', status: 'FAILED', error: result.error || 'Unknown error' };
  },

  async improvePrompt(prompt: string): Promise<FreepikPromptImproveResult> {
    const cleanPrompt = sanitizePrompt(prompt);
    const result = await rateLimitedEdgeCall('freepik-improve-prompt', {
      prompt: cleanPrompt,
    });

    return {
      improvedPrompt: result.improvedPrompt || prompt,
      originalPrompt: prompt,
    };
  },
};

export default freepikAiService;
