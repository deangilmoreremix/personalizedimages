export interface VideoConversionOptions {
  duration?: number;        // Duration in seconds
  effect?: VideoEffect;     // Effect to apply
  resolution?: string;      // e.g. "720p", "1080p"
  includeAudio?: boolean;   // Whether to include audio
  audioTrack?: string;      // ID or URL of audio track
  loopCount?: number;       // Number of times to loop (for short videos)
  watermark?: boolean;      // Whether to include watermark
  text?: string;            // Text overlay
  textPosition?: 'top' | 'bottom' | 'center';
  outputFormat?: 'mp4' | 'webm' | 'gif';
  quality?: 'low' | 'medium' | 'high';
}

export type VideoEffect = 
  | 'zoom'
  | 'pan'
  | 'fade'
  | 'bounce'
  | 'pulse'
  | 'float'
  | 'parallax'
  | 'ken-burns'
  | 'glitch'
  | 'pixelate'
  | 'blur'
  | 'none';

interface VideoPreset {
  id: string;
  name: string;
  description: string;
  options: VideoConversionOptions;
  previewUrl?: string;
}

export interface VideoConversionResult {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  sourceImageUrl: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  createdAt: number;
  completedAt?: number;
  error?: string;
  downloadUrl?: string;
  previewUrl?: string;
  paymentRequired: boolean;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  paymentAmount?: number;
  paymentCurrency?: string;
}

export interface VideoProcessingStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  estimatedTimeRemaining?: number;
}