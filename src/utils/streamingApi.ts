/**
 * This module handles streaming AI responses using the OpenAI Responses API
 * through the assistant-stream Supabase Edge Function (BYOK).
 */

import { getUserApiKey } from './userApiKeyStorage';
import { supabase, supabaseUrl, isSupabaseConfigured } from './supabaseClient';
import { FEATURES } from '../components/ui/FeatureDialogProvider';
import { generateImageWithDalle, generateImageWithGptImage } from './api';

const ASSISTANT_KEY_MISSING_MESSAGE =
  'OpenAI API key not configured. Add your key in Settings → API Keys.';

function isKeyMissingError(status: number, body: string): boolean {
  return status === 400 && body.includes('API key not configured');
}

interface StreamingOptions {
  messages: Array<{role: string, content: string}>;
  userContext?: Record<string, any>;
  onTokenReceived?: (token: string) => void;
  onComplete?: (fullResponse: string, suggestedFeatures?: string[]) => void;
  temperature?: number;
}

/**
 * Streams an AI response using the OpenAI assistant edge function, with proper error handling
 */
export async function streamAIResponse({
  messages,
  userContext = {},
  onTokenReceived = () => {},
  onComplete = () => {},
  temperature = 0.7
}: StreamingOptions): Promise<void> {
  let fullResponse = '';
  let suggestedFeatures: string[] = [];

  try {
    // First try using Edge Function for security and consistent performance
    if (isSupabaseConfigured() && supabase) {
      try {
        const streamController = new AbortController();
        const requestId = `stream_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        const { data: authData } = await supabase.auth.getSession();
        const token = authData?.session?.access_token || '';

        const apiUrl = `${supabaseUrl}/functions/v1/assistant-stream`;
        const userApiKey = getUserApiKey('openai');

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Request-ID': requestId,
            ...(userApiKey ? { 'x-user-api-key': userApiKey } : {}),
          },
          body: JSON.stringify({
            messages,
            userContext,
            temperature
          }),
          signal: streamController.signal
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Edge function error: ${response.status} - ${errorText}`);
          if (isKeyMissingError(response.status, errorText)) {
            onComplete(ASSISTANT_KEY_MISSING_MESSAGE);
            return;
          }
          throw new Error(`Edge function returned status ${response.status}`);
        }

        // The assistant-stream edge function returns a single JSON envelope
        // {text, model, message} for every provider.
        const payload = await response.json().catch(() => null);
        const assistantText = typeof payload === 'string'
          ? payload
          : (payload?.text || payload?.message || '');

        if (!assistantText) {
          throw new Error('Assistant returned an empty response');
        }

        // Extract feature suggestions and strip the marker from the displayed text
        const featuresMatch = assistantText.match(/FEATURES:(\[.*?\])/);
        if (featuresMatch && featuresMatch[1]) {
          try {
            suggestedFeatures = JSON.parse(featuresMatch[1]);
          } catch (e) {
            console.error('Failed to parse feature suggestions:', e);
          }
        }
        const cleanText = assistantText.replace(/FEATURES:\[.*?\]/g, '').trim();
        fullResponse = cleanText;
        onTokenReceived(cleanText);

        console.log(`✅ [${requestId}] Assistant response received`);
        if (suggestedFeatures.length === 0) {
          suggestedFeatures = extractFeatureSuggestions(cleanText);
        }

        onComplete(fullResponse, suggestedFeatures);
        return;
      } catch (edgeError) {
        console.warn('Edge function streaming failed, falling back to direct API:', edgeError);
        // Fall through to direct API call
      }
    }

    onComplete(ASSISTANT_KEY_MISSING_MESSAGE);
  } catch (error) {
    console.error('Error streaming AI response:', error);
    const errorMessage = 'Sorry, I encountered an error while processing your request. Please try again.';
    onComplete(errorMessage);
  }
}

/**
 * Stream real-time generation status for image generation
 */
export function streamImageGeneration({
  prompt,
  onStatusUpdate,
  onProgress,
  onComplete,
  provider = 'openai',
  steps = 10,
  dalleOptions = {}
}: {
  prompt: string;
  onStatusUpdate?: (message: string) => void;
  onProgress?: (progress: number) => void;
  onComplete?: (imageUrl: string) => void;
  provider?: string;
  steps?: number;
  dalleOptions?: {
    size?: '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    style?: 'natural' | 'vivid';
  };
}) {
  // Simulated generation steps for now - in a real implementation, this would connect to the API
  let currentStep = 0;
  const totalSteps = steps;
  
  // Generation step descriptions
  const generationSteps = [
    "Analyzing prompt...",
    "Setting up model parameters...",
    "Starting image generation...",
    "Creating base composition...",
    "Adding foreground elements...",
    "Rendering background...",
    "Adding lighting effects...",
    "Incorporating visual details...",
    "Applying color grading...",
    "Finalizing image...",
  ];

  // Start streaming status updates
  const interval = setInterval(() => {
    if (currentStep >= totalSteps) {
      clearInterval(interval);
      return;
    }
    
    // Calculate progress percentage
    const progress = Math.round((currentStep / totalSteps) * 100);
    
    // Get the current step description
    const statusMessage = generationSteps[currentStep % generationSteps.length];
    
    // Send updates
    onStatusUpdate?.(statusMessage);
    onProgress?.(progress);
    
    currentStep++;
    
    // When complete, return a placeholder image URL
    if (currentStep >= totalSteps) {
      clearInterval(interval);
      setTimeout(() => {
        if (provider === 'gpt-image-1') {
          generateImageWithGptImage(prompt)
            .then(imageUrl => onComplete?.(imageUrl))
            .catch(error => console.error('Error generating image:', error));
        } else {
          generateImageWithDalle(prompt, dalleOptions)
            .then(imageUrl => onComplete?.(imageUrl))
            .catch(error => console.error('Error generating image:', error));
        }
      }, 500);
    }
  }, 300);
  
  // Return a cleanup function to cancel the streaming
  return () => {
    clearInterval(interval);
  };
}

/**
 * Stream AI reasoning about image generation
 */
export function streamAIReasoning({
  prompt,
  onReasoningUpdate,
  onComplete
}: {
  prompt: string;
  onReasoningUpdate?: (reasoning: string) => void;
  onComplete?: (fullReasoning: string) => void;
}) {
  // Simulated reasoning steps
  const reasoningSteps = [
    "Analyzing prompt components...",
    "Identifying key visual elements: [prompt analysis]",
    "Determining composition and layout based on prompt context...",
    "Selecting color palette and lighting appropriate for the described scene...",
    "Planning foreground elements and focal points...",
    "Considering background details and atmosphere...",
    "Deciding on style and artistic approach based on prompt cues...",
    "Finalizing generation parameters for optimal results..."
  ];
  
  let fullReasoning = '';
  let currentStep = 0;
  
  // Replace placeholder with actual prompt analysis
  const processedReasoningSteps = reasoningSteps.map(step => 
    step.replace('[prompt analysis]', analyzePrompt(prompt))
  );
  
  // Start streaming reasoning
  const interval = setInterval(() => {
    if (currentStep >= processedReasoningSteps.length) {
      clearInterval(interval);
      return;
    }
    
    // Add the next step to the full reasoning
    fullReasoning += processedReasoningSteps[currentStep] + '\n\n';
    
    // Send update
    onReasoningUpdate?.(fullReasoning);
    
    currentStep++;
    
    // When complete
    if (currentStep >= processedReasoningSteps.length) {
      clearInterval(interval);
      onComplete?.(fullReasoning);
    }
  }, 700);
  
  // Return a cleanup function
  return () => {
    clearInterval(interval);
  };
}

// Helper function to analyze a prompt (simplified)
function analyzePrompt(prompt: string): string {
  const elements = [];
  
  // Check for subjects
  if (prompt.match(/person|man|woman|child|boy|girl|people/i)) {
    elements.push('human subject');
  }
  
  if (prompt.match(/landscape|mountain|forest|beach|ocean|sky/i)) {
    elements.push('natural landscape');
  }
  
  if (prompt.match(/city|building|architecture|urban/i)) {
    elements.push('urban environment');
  }
  
  // Check for style cues
  if (prompt.match(/realistic|photorealistic|detailed/i)) {
    elements.push('photorealistic style');
  }
  
  if (prompt.match(/painting|watercolor|oil|acrylic|artistic/i)) {
    elements.push('painting style');
  }
  
  if (prompt.match(/cartoon|anime|stylized/i)) {
    elements.push('stylized rendering');
  }
  
  // Check for lighting/atmosphere
  if (prompt.match(/sunset|sunrise|golden hour/i)) {
    elements.push('warm lighting');
  }
  
  if (prompt.match(/night|dark|moonlight/i)) {
    elements.push('night setting');
  }
  
  if (prompt.match(/fog|mist|rain|snow|storm/i)) {
    elements.push('atmospheric conditions');
  }
  
  // If no specific elements found
  if (elements.length === 0) {
    elements.push('general scene elements');
  }
  
  return elements.join(', ');
}

/**
 * Helper function to extract feature suggestions from text
 */
function extractFeatureSuggestions(text: string): string[] {
  const featuresMatch = text.match(/FEATURES:(\[.*?\])/);
  if (featuresMatch && featuresMatch[1]) {
    try {
      return JSON.parse(featuresMatch[1]);
    } catch (e) {
      console.error('Failed to parse feature suggestions:', e);
    }
  }

  // Fallback: extract feature IDs mentioned in brackets
  const features: string[] = [];
  const featureMap = FEATURES ? Object.keys(FEATURES) : [];
  
  featureMap.forEach(featureId => {
    const regex = new RegExp(`\\[${featureId}\\]`, 'g');
    if (regex.test(text)) {
      features.push(featureId);
    }
  });

  return features;
}