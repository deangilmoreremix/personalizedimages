/**
 * This module handles streaming AI responses using the Gemini 1.5 Flash API
 */

import { getGeminiApiKey, hasApiKey } from './apiUtils';
import { supabase, supabaseUrl, isSupabaseConfigured } from './supabaseClient';
import { FEATURES } from '../components/ui/FeatureDialogProvider';
import { generateImageWithDalle, generateImageWithGemini, generateImageWithGemini2Flash, generateImageWithImagen, generateImageWithGptImage } from './api';

interface StreamingOptions {
  messages: Array<{role: string, content: string}>;
  userContext?: Record<string, any>;
  onTokenReceived?: (token: string) => void;
  onComplete?: (fullResponse: string, suggestedFeatures?: string[]) => void;
  temperature?: number;
}

/**
 * Streams an AI response using the Gemini API, with proper error handling and fallbacks
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

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Request-ID': requestId
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
          throw new Error(`Edge function returned status ${response.status}`);
        }

        // The edge function should return a readable stream
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is not readable');
        }

        const decoder = new TextDecoder();
        let done = false;

        // Process the stream
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          
          if (value) {
            const text = decoder.decode(value);
            
            // Handle special markers in the stream
            if (text.includes('FEATURES:')) {
              // Extract feature suggestions
              const featuresMatch = text.match(/FEATURES:(\[.*?\])/);
              if (featuresMatch && featuresMatch[1]) {
                try {
                  suggestedFeatures = JSON.parse(featuresMatch[1]);
                } catch (e) {
                  console.error('Failed to parse feature suggestions:', e);
                }
                
                // Remove the features marker from the displayed text
                const textWithoutFeatures = text.replace(/FEATURES:\[.*?\]/, '');
                fullResponse += textWithoutFeatures;
                onTokenReceived(textWithoutFeatures);
              }
            } else {
              // Regular token
              fullResponse += text;
              onTokenReceived(text);
            }
          }
        }

        console.log(`✅ [${requestId}] Stream completed successfully`);
        if (suggestedFeatures.length === 0) {
          // Try to extract feature suggestions from the content
          suggestedFeatures = extractFeatureSuggestions(fullResponse);
        }
        
        onComplete(fullResponse, suggestedFeatures);
        return;
      } catch (edgeError) {
        console.warn('Edge function streaming failed, falling back to direct API:', edgeError);
        // Fall through to direct API call
      }
    }

    // Fallback: Direct API call to Gemini
    if (!hasApiKey('gemini')) {
      throw new Error('Gemini API key is not configured');
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not available');
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`;

    // Format messages for Gemini API
    // Prepend a system message with feature information
    const systemMessage = `You are an AI assistant for a creative tool called VideoRemix that helps users create personalized images, action figures, Ghibli-style images, cartoon-style images, memes, and other visual content using AI. 
    
First name: ${userContext['FIRSTNAME'] || 'User'}
Last name: ${userContext['LASTNAME'] || 'Unknown'}
Company: ${userContext['COMPANY'] || 'Unknown'}

The available features are:
- AI Image Generator (image): Create custom images from text descriptions
- Action Figure Generator (action-figure): Create personalized action figures
- Studio Ghibli Style (ghibli): Create images in the style of Studio Ghibli
- Cartoon Style (cartoon): Transform images into cartoon styles
- Meme Generator (meme): Create personalized memes
- Crazy Image Generator (crazy): Create wild, surreal images
- GIF Editor (gif): Create animated GIFs with personalization
- Email-Ready Image Editor (email): Design images optimized for email

When suggesting features, include the feature ID in brackets like [image] at the end of your response like this: "You might want to try our AI Image Generator [image]"

First provide a helpful, conversational response, then recommend 1-3 relevant features when appropriate.
IMPORTANT: Keep responses concise (max 3-4 sentences).
At the end of your response include a marker with feature IDs like this: FEATURES:["image","action-figure"]`;

    const formattedMessages = [
      { role: 'system', parts: [{ text: systemMessage }] },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          temperature,
          topP: 0.8,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let streamBuffer = '';
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      if (value) {
        const chunk = decoder.decode(value);
        streamBuffer += chunk;
        
        // Try to parse complete JSON objects from the buffer
        let startIndex = 0;
        let endIndex = 0;
        
        while ((endIndex = streamBuffer.indexOf('}\n', startIndex)) !== -1) {
          const jsonStr = streamBuffer.substring(startIndex, endIndex + 1);
          startIndex = endIndex + 2; // Move past the "}\n"
          
          try {
            const dataObj = JSON.parse(jsonStr);
            if (dataObj.candidates?.[0]?.content?.parts?.[0]?.text) {
              const text = dataObj.candidates[0].content.parts[0].text;
              fullResponse += text;
              onTokenReceived(text);
            }
          } catch (e) {
            console.warn('Failed to parse JSON chunk:', e);
          }
        }
        
        // Keep remaining incomplete JSON in buffer
        streamBuffer = streamBuffer.substring(startIndex);
      }
    }

    // Try to extract feature suggestions
    suggestedFeatures = extractFeatureSuggestions(fullResponse);
    
    // Remove any FEATURES marker from the text before completing
    const cleanResponse = fullResponse.replace(/FEATURES:\[.*?\]/g, '').trim();
    
    onComplete(cleanResponse, suggestedFeatures);
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
  provider = 'gemini',
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
        // Generate the actual image based on the provider
        if (provider === 'openai') {
          generateImageWithDalle(prompt, dalleOptions)
            .then(imageUrl => onComplete?.(imageUrl))
            .catch(error => console.error('Error generating image:', error));
        } else if (provider === 'gemini') {
          generateImageWithGemini(prompt)
            .then(imageUrl => onComplete?.(imageUrl))
            .catch(error => console.error('Error generating image:', error));
        } else if (provider === 'gemini2flash') {
          generateImageWithGemini2Flash(prompt)
            .then(imageUrl => onComplete?.(imageUrl))
            .catch(error => console.error('Error generating image:', error));
        } else if (provider === 'imagen') {
          generateImageWithImagen(prompt)
            .then(imageUrl => onComplete?.(imageUrl))
            .catch(error => console.error('Error generating image:', error));
        } else if (provider === 'gpt-image-1') {
          generateImageWithGptImage(prompt)
            .then(imageUrl => onComplete?.(imageUrl))
            .catch(error => console.error('Error generating image:', error));
        } else {
          // Default to Gemini
          generateImageWithGemini(prompt)
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