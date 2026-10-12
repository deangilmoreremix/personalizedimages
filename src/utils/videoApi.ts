import { VideoConversionOptions, VideoConversionResult, VideoProcessingStatus } from '../types/VideoTypes';
import { callEdgeFunction, isSupabaseConfigured } from './supabaseClient';

/**
 * Convert an image to a video with animation effects
 */
export async function convertImageToVideo(
  imageUrl: string, 
  options: VideoConversionOptions = {}
): Promise<VideoConversionResult> {
  try {
    console.log('🎬 Converting image to video', { imageUrl, options });

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not properly configured for video conversion');
    }

    try {
      const result = await callEdgeFunction('image-to-video', {
        imageUrl,
        duration: options.duration,
        prompt: (options as VideoConversionOptions & { prompt?: string }).prompt
      });

      if (result && result.id) {
        return result;
      }
    } catch (edgeError) {
      console.warn('Edge function failed for image-to-video conversion:', edgeError);
      throw new Error('Failed to convert image to video: Edge function error');
    }

    throw new Error('Video conversion failed');
  } catch (error) {
    console.error('Error converting image to video:', error);
    throw error;
  }
}

/**
 * Check the status of a video conversion
 */
export async function checkVideoProcessingStatus(videoId: string): Promise<VideoProcessingStatus> {
  try {
    console.log('🔍 Checking video processing status', { videoId });
    
    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('video-status', {
          videoId
        });
        
        if (result && result.status) {
          return result;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for video status check:', edgeError);
        throw new Error('Failed to check video status: Edge function error');
      }
    } else {
      throw new Error('Supabase not properly configured for video status check');
    }
    
    throw new Error('Video status check failed');
  } catch (error) {
    console.error('Error checking video processing status:', error);
    throw error;
  }
}

/**
 * Get a video conversion result
 */
export async function getVideoConversionResult(videoId: string): Promise<VideoConversionResult> {
  try {
    console.log('🎥 Getting video conversion result', { videoId });
    
    // Try edge function first
    if (isSupabaseConfigured()) {
      try {
        const result = await callEdgeFunction('video-result', {
          videoId
        });
        
        if (result && result.id) {
          return result;
        }
      } catch (edgeError) {
        console.warn('Edge function failed for video result:', edgeError);
        throw new Error('Failed to get video result: Edge function error');
      }
    } else {
      throw new Error('Supabase not properly configured for video result');
    }
    
    throw new Error('Video result fetch failed');
  } catch (error) {
    console.error('Error getting video conversion result:', error);
    throw error;
  }
}

/**
 * Get video presets for quick selection
 */
export function getVideoPresets() {
  return [
    {
      id: 'zoom',
      name: 'Zoom In',
      description: 'Slowly zoom into the image',
      options: {
        duration: 3,
        effect: 'zoom',
        resolution: '720p',
        includeAudio: false,
        outputFormat: 'mp4',
        quality: 'high'
      },
      previewUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
    },
    {
      id: 'pan',
      name: 'Pan Across',
      description: 'Smoothly pan across the image',
      options: {
        duration: 4,
        effect: 'pan',
        resolution: '720p',
        includeAudio: false,
        outputFormat: 'mp4',
        quality: 'high'
      },
      previewUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
    },
    {
      id: 'ken-burns',
      name: 'Ken Burns Effect',
      description: 'Classic documentary-style pan and zoom',
      options: {
        duration: 5,
        effect: 'ken-burns',
        resolution: '1080p',
        includeAudio: false,
        outputFormat: 'mp4',
        quality: 'high'
      },
      previewUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
    },
    {
      id: 'parallax',
      name: 'Parallax',
      description: '3D parallax effect with depth',
      options: {
        duration: 4,
        effect: 'parallax',
        resolution: '720p',
        includeAudio: false,
        outputFormat: 'mp4',
        quality: 'high'
      },
      previewUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
    },
    {
      id: 'pulse',
      name: 'Pulse',
      description: 'Subtle pulsing animation',
      options: {
        duration: 3,
        effect: 'pulse',
        resolution: '720p',
        includeAudio: false,
        outputFormat: 'mp4',
        quality: 'high'
      },
      previewUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
    }
  ];
}