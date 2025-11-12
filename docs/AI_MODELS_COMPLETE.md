# Complete AI Models Documentation

## Table of Contents
1. [Overview](#overview)
2. [OpenAI Models](#openai-models)
3. [Google AI Models](#google-ai-models)
4. [Model Comparison](#model-comparison)
5. [Integration Code Examples](#integration-code-examples)
6. [Best Practices](#best-practices)
7. [Cost Optimization](#cost-optimization)

---

## Overview

The platform integrates with 6 state-of-the-art AI models, each with unique strengths and capabilities. This document provides complete technical specifications, use cases, and implementation details for each model.

### Supported AI Models

| Model | Provider | Primary Use Case | Generation Speed | Cost |
|-------|----------|------------------|------------------|------|
| DALL-E 3 | OpenAI | High-quality, versatile generation | 15-30s | $0.040/image |
| GPT-4 Vision (gpt-image-1) | OpenAI | Advanced understanding & personalization | 20-35s | $0.060/image |
| Gemini AI | Google | Natural compositions, context-aware | 10-20s | $0.010/image |
| Gemini 2.5 Flash | Google | Ultra-fast generation, streaming | 3-8s | $0.0025/image |
| Imagen 3 | Google | Photorealistic output, precise control | 12-22s | $0.020/image |
| Gemini Nano | Google | On-device editing & enhancement | <1s | Free (local) |

---

## OpenAI Models

### 1. DALL-E 3

#### Overview
DALL-E 3 is OpenAI's most advanced image generation model, known for its ability to understand complex prompts and generate highly detailed, creative images.

#### Technical Specifications

**API Endpoint**: `https://api.openai.com/v1/images/generations`

**Model ID**: `dall-e-3`

**Capabilities**:
- Superior text rendering within images
- Advanced prompt understanding
- Style consistency
- Complex scene composition
- Multiple size options

**Image Sizes**:
- `1024x1024` - Square (1:1 aspect ratio)
- `1792x1024` - Landscape (16:9 aspect ratio)
- `1024x1792` - Portrait (9:16 aspect ratio)

**Quality Options**:
- `standard` - Faster generation, good quality (default)
- `hd` - Highest detail and sharpness, slower generation

**Style Options**:
- `natural` - More natural, less hyper-real images (default)
- `vivid` - Hyper-real and dramatic images

#### Code Implementation

```typescript
// File: src/utils/api.ts

interface DalleOptions {
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'natural' | 'vivid';
}

export async function generateImageWithDalle(
  prompt: string,
  options: DalleOptions = {}
): Promise<string> {
  const {
    size = '1024x1024',
    quality = 'standard',
    style = 'natural'
  } = options;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        quality: quality,
        style: style,
        response_format: 'url'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`DALL-E 3 error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data[0].url;

  } catch (error) {
    console.error('DALL-E 3 generation failed:', error);
    throw error;
  }
}
```

#### Edge Function Implementation

```typescript
// File: supabase/functions/image-generation/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { prompt, model, settings } = await req.json();

    if (model === 'openai') {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: settings?.size || '1024x1024',
          quality: settings?.quality || 'standard',
          style: settings?.style || 'natural'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Generation failed');
      }

      return new Response(
        JSON.stringify({
          imageUrl: data.data[0].url,
          model: 'dall-e-3',
          generationTime: Date.now() - startTime
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

#### Prompt Engineering for DALL-E 3

**Best Practices**:

1. **Be Specific and Detailed**
```typescript
// Poor prompt
"A person in an office"

// Better prompt
"Professional portrait photograph of a confident business executive in a modern glass-walled office, natural lighting from large windows, wearing a navy blue suit, sitting at a minimalist desk with a laptop, cityscape visible in background, photorealistic style"
```

2. **Use Art Style Keywords**
```typescript
const styleKeywords = {
  photography: "photograph, photorealistic, high resolution, natural lighting",
  painting: "oil painting, brushstrokes, canvas texture, artistic",
  digital: "digital art, 3D render, smooth, polished, detailed",
  sketch: "pencil sketch, hand-drawn, linework, artistic study"
};
```

3. **Specify Technical Details**
```typescript
const technicalDetails = {
  lighting: "natural lighting, golden hour, studio lighting, dramatic lighting",
  composition: "rule of thirds, centered, symmetrical, dynamic angle",
  quality: "8k, ultra high definition, professional, award-winning"
};
```

#### Use Cases

**Ideal For**:
- Marketing materials with text overlays
- Professional headshots and portraits
- Product photography mockups
- Social media content
- Complex scene compositions
- Branded content with specific color schemes

**Not Recommended For**:
- Batch processing (expensive)
- Real-time applications (slower)
- Simple illustrations (overkill)

#### Error Handling

```typescript
try {
  const imageUrl = await generateImageWithDalle(prompt, options);
} catch (error) {
  if (error.message.includes('content_policy_violation')) {
    // Content was flagged
    showError('Content does not meet safety guidelines');
  } else if (error.message.includes('rate_limit_exceeded')) {
    // Too many requests
    showError('Rate limit exceeded. Please wait a moment');
  } else if (error.message.includes('invalid_api_key')) {
    // Authentication failed
    showError('API configuration error');
  } else {
    // Generic error
    showError('Image generation failed. Please try again');
  }
}
```

---

### 2. GPT-4 Vision (gpt-image-1)

#### Overview
GPT-4 Vision with image generation capabilities offers advanced understanding of complex prompts and exceptional personalization features.

#### Technical Specifications

**API Endpoint**: `https://api.openai.com/v1/images/generations`

**Model ID**: `gpt-image-1`

**Capabilities**:
- Superior prompt understanding
- Advanced personalization
- Context-aware generation
- Exceptional detail
- Smart composition

#### Code Implementation

```typescript
export async function generateImageWithGptImage(
  prompt: string
): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url'
      })
    });

    if (!response.ok) {
      throw new Error('GPT-Image generation failed');
    }

    const data = await response.json();
    return data.data[0].url;

  } catch (error) {
    console.error('GPT-Image generation error:', error);
    throw error;
  }
}
```

#### Personalization Example

```typescript
const personalizedPrompt = `
Create a professional action figure of ${tokens.FIRSTNAME} ${tokens.LASTNAME},
who works as ${tokens.JOBTITLE} at ${tokens.COMPANY}.
The figure should reflect their professional role with appropriate accessories
and be presented in a premium collector's edition box with ${tokens.COMPANY} branding.
Use ${brandColors.primary} as the primary color for the packaging.
Make the figure recognizable as a professional in the tech industry.
Include a laptop, smartphone, and coffee cup as accessories.
Photorealistic toy photography style, studio lighting, white background.
`;
```

#### Use Cases

**Ideal For**:
- Personalized marketing materials
- Complex character generation
- Story-driven content
- Brand-specific imagery
- Executive portraits
- Custom merchandise designs

---

## Google AI Models

### 3. Gemini AI

#### Overview
Google's Gemini AI excels at understanding context and generating natural-looking compositions with strong attention to scene coherence.

#### Technical Specifications

**API Endpoint**: `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent`

**Model ID**: `gemini-pro-vision`

**Capabilities**:
- Natural scene composition
- Strong context understanding
- Cultural awareness
- Balanced aesthetics
- Good for landscapes and environments

#### Code Implementation

```typescript
export async function generateImageWithGemini(
  prompt: string,
  aspectRatio: string = '1:1',
  style: string = 'photography'
): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

    // Enhance prompt with aspect ratio and style
    const enhancedPrompt = `${prompt}. Style: ${style}. Aspect ratio: ${aspectRatio}.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate an image: ${enhancedPrompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('Gemini generation failed');
    }

    const data = await response.json();
    // Extract image URL from response
    const imageUrl = data.candidates[0].content.parts[0].imageUrl;

    return imageUrl;

  } catch (error) {
    console.error('Gemini generation error:', error);
    throw error;
  }
}
```

#### Best Practices for Gemini

```typescript
// Gemini responds well to conversational prompts
const conversationalPrompt = `
I need an image showing a peaceful Japanese garden in the Studio Ghibli style.
The scene should include a small wooden bridge over a koi pond,
surrounded by cherry blossom trees in full bloom.
The lighting should be soft and magical, like early morning with mist.
Include whimsical details like floating spirits or small forest creatures.
The overall feeling should be serene and nostalgic.
`;

// Gemini excels with cultural context
const culturalPrompt = `
Create an image of a traditional Indian wedding celebration.
Show vibrant colors, elaborate decorations with marigold flowers,
guests in colorful traditional attire, and festive lighting.
Capture the joy and energy of the celebration while respecting
cultural authenticity. Style: vibrant photography, warm colors.
`;
```

#### Use Cases

**Ideal For**:
- Natural landscapes
- Cultural scenes
- Environmental portraits
- Architectural visualization
- Story illustrations
- Contextual compositions

---

### 4. Gemini 2.5 Flash

#### Overview
Gemini 2.5 Flash is optimized for ultra-fast generation with streaming capabilities, perfect for real-time applications.

#### Technical Specifications

**API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent`

**Model ID**: `gemini-2.5-flash`

**Capabilities**:
- Ultra-fast generation (2-4x faster)
- Real-time streaming
- Interactive experience
- Good quality-to-speed ratio
- Lower cost

#### Streaming Implementation

```typescript
export async function generateImageWithGemini2Flash(
  prompt: string,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate an image: ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 8192
          }
        })
      }
    );

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedData = '';
    let progress = 0;

    while (true) {
      const { done, value } = await reader!.read();

      if (done) break;

      const chunk = decoder.decode(value);
      accumulatedData += chunk;

      // Update progress
      progress = Math.min(progress + 10, 95);
      onProgress?.(progress, 'Generating image...');

      // Parse streaming response
      try {
        const lines = accumulatedData.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonData = JSON.parse(line.substring(6));
            if (jsonData.candidates?.[0]?.content?.parts?.[0]?.imageUrl) {
              const imageUrl = jsonData.candidates[0].content.parts[0].imageUrl;
              onProgress?.(100, 'Complete!');
              return imageUrl;
            }
          }
        }
      } catch (e) {
        // Continue accumulating if JSON is incomplete
      }
    }

    throw new Error('No image URL in response');

  } catch (error) {
    console.error('Gemini 2.5 Flash error:', error);
    throw error;
  }
}
```

#### Real-time Progress Updates

```typescript
// Component usage with streaming
const [progress, setProgress] = useState(0);
const [status, setStatus] = useState('');

const handleGenerate = async () => {
  try {
    const imageUrl = await generateImageWithGemini2Flash(
      prompt,
      (prog, stat) => {
        setProgress(prog);
        setStatus(stat);
      }
    );

    setGeneratedImage(imageUrl);
  } catch (error) {
    console.error(error);
  }
};

// UI
<div className="progress-bar">
  <div className="progress" style={{ width: `${progress}%` }} />
  <span>{status}</span>
</div>
```

#### Use Cases

**Ideal For**:
- Real-time generation demos
- Interactive applications
- High-volume generation
- Quick iterations
- User feedback loops
- Cost-sensitive projects

---

### 5. Imagen 3

#### Overview
Google's Imagen 3 is optimized for photorealistic output with exceptional detail and precise prompt following.

#### Technical Specifications

**API Endpoint**: `https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/publishers/google/models/imagen-3:predict`

**Model ID**: `imagen-3`

**Capabilities**:
- Photorealistic quality
- Precise prompt following
- Multiple aspect ratios
- Fine detail control
- Excellent for product photography

#### Code Implementation

```typescript
export async function generateImageWithImagen(
  prompt: string,
  aspectRatio: string = '1:1'
): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    const projectId = import.meta.env.VITE_GOOGLE_PROJECT_ID;

    const response = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3:predict`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          instances: [{
            prompt: prompt
          }],
          parameters: {
            sampleCount: 1,
            aspectRatio: aspectRatio,
            safetyFilterLevel: 'block_some',
            personGeneration: 'allow_all'
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('Imagen 3 generation failed');
    }

    const data = await response.json();
    const imageData = data.predictions[0].bytesBase64Encoded;

    // Convert base64 to blob URL
    const blob = base64ToBlob(imageData, 'image/png');
    const imageUrl = URL.createObjectURL(blob);

    return imageUrl;

  } catch (error) {
    console.error('Imagen 3 error:', error);
    throw error;
  }
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}
```

#### Prompt Engineering for Imagen 3

```typescript
// Imagen 3 excels with technical photography terms
const technicalPrompt = `
Product photography of a luxury watch on a velvet cushion.
Studio lighting with softbox, f/2.8 aperture, 50mm lens.
Macro detail showing the craftsmanship of the watch face.
Dark background with subtle gradient, professional commercial style.
8K resolution, tack sharp focus, professional color grading.
`;

// Specific aspect ratios
const aspectRatios = {
  square: '1:1',
  landscape: '16:9',
  portrait: '9:16',
  wide: '21:9',
  tall: '4:5'
};
```

#### Use Cases

**Ideal For**:
- Product photography
- Professional portraits
- Marketing materials
- Print media
- High-resolution needs
- Photorealistic scenes

---

### 6. Gemini Nano (On-Device)

#### Overview
Gemini Nano runs locally in the browser for instant, private image editing and enhancement without server calls.

#### Technical Specifications

**Runtime**: Browser (WebGPU)

**Model**: `gemini-nano-vision`

**Capabilities**:
- On-device processing
- Instant results (<1s)
- No API costs
- Privacy-focused
- Enhancement modes
- Background operations

#### Implementation

```typescript
// File: src/utils/geminiNanoApi.ts

interface GeminiNanoSession {
  generate: (input: any) => Promise<string>;
  edit: (input: any) => Promise<string>;
}

let nanoSession: GeminiNanoSession | null = null;

export async function initializeGeminiNano(): Promise<boolean> {
  try {
    // Check if AI capabilities are available
    if (!('ai' in window)) {
      console.warn('Gemini Nano not available');
      return false;
    }

    // @ts-ignore - Browser AI API
    const ai = window.ai;

    if (!ai || !ai.createSession) {
      return false;
    }

    // Create session
    nanoSession = await ai.createSession({
      model: 'gemini-nano-vision',
      temperature: 0.7
    });

    console.log('Gemini Nano initialized successfully');
    return true;

  } catch (error) {
    console.error('Failed to initialize Gemini Nano:', error);
    return false;
  }
}

interface GenerateOptions {
  aspectRatio?: string;
  style?: string;
  quality?: 'standard' | 'high';
  negativePrompt?: string;
}

export async function generateImageWithGeminiNano(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  if (!nanoSession) {
    throw new Error('Gemini Nano not initialized');
  }

  try {
    const enhancedPrompt = buildEnhancedPrompt(prompt, options);

    const result = await nanoSession.generate({
      prompt: enhancedPrompt,
      negative_prompt: options.negativePrompt,
      guidance_scale: 7.5,
      num_inference_steps: options.quality === 'high' ? 50 : 30
    });

    // Result is base64 encoded
    return `data:image/png;base64,${result}`;

  } catch (error) {
    console.error('Gemini Nano generation failed:', error);
    throw error;
  }
}

interface EditOptions {
  mode: 'enhance' | 'colorize' | 'stylize' | 'custom';
  intensity?: number;
  style?: string;
  customPrompt?: string;
}

export async function editImageWithGeminiNano(
  imageUrl: string,
  options: EditOptions
): Promise<string> {
  if (!nanoSession) {
    throw new Error('Gemini Nano not initialized');
  }

  try {
    // Convert image URL to base64
    const imageBase64 = await imageUrlToBase64(imageUrl);

    const editInstruction = buildEditInstruction(options);

    const result = await nanoSession.edit({
      image: imageBase64,
      instruction: editInstruction,
      intensity: options.intensity || 1.0
    });

    return `data:image/png;base64,${result}`;

  } catch (error) {
    console.error('Gemini Nano edit failed:', error);
    throw error;
  }
}

function buildEditInstruction(options: EditOptions): string {
  switch (options.mode) {
    case 'enhance':
      return 'Enhance image quality, improve clarity and sharpness, adjust colors for optimal appearance';

    case 'colorize':
      return 'Add vibrant colors to the image, enhance saturation, create visually appealing color palette';

    case 'stylize':
      return `Apply ${options.style} artistic style to the image while preserving the subject`;

    case 'custom':
      return options.customPrompt || 'Improve the image';

    default:
      return 'Enhance image';
  }
}

async function imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:image/png;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function buildEnhancedPrompt(prompt: string, options: GenerateOptions): string {
  let enhanced = prompt;

  if (options.style) {
    enhanced += `, ${options.style} style`;
  }

  if (options.aspectRatio && options.aspectRatio !== '1:1') {
    enhanced += `, ${options.aspectRatio} aspect ratio`;
  }

  if (options.quality === 'high') {
    enhanced += ', highly detailed, 8k, professional quality';
  }

  return enhanced;
}
```

#### Component Usage

```typescript
// File: src/components/GeminiNanoPersonalizationEditor.tsx

import { useEffect, useState } from 'react';
import {
  initializeGeminiNano,
  generateImageWithGeminiNano,
  editImageWithGeminiNano
} from '../utils/geminiNanoApi';

export function GeminiNanoEditor() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    initializeGeminiNano().then(setIsAvailable);
  }, []);

  const handleGenerate = async () => {
    if (!isAvailable) {
      alert('Gemini Nano is not available in your browser');
      return;
    }

    setIsGenerating(true);
    try {
      const imageUrl = await generateImageWithGeminiNano(prompt, {
        quality: 'high',
        style: 'photorealistic'
      });

      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhance = async () => {
    if (!generatedImage) return;

    setIsGenerating(true);
    try {
      const enhanced = await editImageWithGeminiNano(generatedImage, {
        mode: 'enhance',
        intensity: 0.8
      });

      setGeneratedImage(enhanced);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAvailable) {
    return (
      <div className="alert alert-warning">
        Gemini Nano requires Chrome Canary with AI features enabled.
        <a href="chrome://flags/#optimization-guide-on-device-model">
          Enable here
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* UI components */}
    </div>
  );
}
```

#### Use Cases

**Ideal For**:
- Quick image edits
- Privacy-sensitive applications
- Offline functionality
- Real-time filters
- Enhancement tools
- Cost-free processing

---

## Model Comparison

### Speed Comparison

```
Gemini 2.5 Flash  ████░░░░░░ 3-8s    (Fastest)
Gemini AI         ██████░░░░ 10-20s
Imagen 3          ███████░░░ 12-22s
DALL-E 3          █████████░ 15-30s
GPT-4 Vision      ██████████ 20-35s  (Slowest)
Gemini Nano       █ <1s      (Instant - Local)
```

### Cost Comparison

```
Gemini Nano       FREE (local processing)
Gemini 2.5 Flash  $0.0025/image  ████░░░░░░
Gemini AI         $0.010/image   ███████░░░
Imagen 3          $0.020/image   █████████░
DALL-E 3          $0.040/image   ████████████
GPT-4 Vision      $0.060/image   ███████████████
```

### Quality Comparison

```
Photorealism:
Imagen 3          ██████████ 10/10
DALL-E 3          █████████░  9/10
GPT-4 Vision      █████████░  9/10
Gemini AI         ████████░░  8/10
Gemini 2.5 Flash  ███████░░░  7/10
Gemini Nano       ██████░░░░  6/10

Prompt Understanding:
GPT-4 Vision      ██████████ 10/10
DALL-E 3          █████████░  9/10
Gemini AI         █████████░  9/10
Imagen 3          ████████░░  8/10
Gemini 2.5 Flash  ████████░░  8/10
Gemini Nano       ███████░░░  7/10

Creative Interpretation:
DALL-E 3          ██████████ 10/10
GPT-4 Vision      █████████░  9/10
Gemini AI         ████████░░  8/10
Imagen 3          ███████░░░  7/10
Gemini 2.5 Flash  ███████░░░  7/10
Gemini Nano       ██████░░░░  6/10
```

### Feature Matrix

| Feature | DALL-E 3 | GPT-4 Vision | Gemini AI | Gemini Flash | Imagen 3 | Gemini Nano |
|---------|----------|--------------|-----------|--------------|----------|-------------|
| Multiple Sizes | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Style Control | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Quality Options | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Streaming | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| Offline Mode | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Batch Processing | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Image Editing | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Text Rendering | ✓✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Reference Images | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Best Practices

### 1. Model Selection Strategy

```typescript
function selectOptimalModel(useCase: string, requirements: Requirements): string {
  // For high-quality marketing materials
  if (requirements.quality === 'highest' && requirements.budget === 'high') {
    return 'dall-e-3'; // Best quality, highest cost
  }

  // For photorealistic product shots
  if (useCase === 'product-photography') {
    return 'imagen-3'; // Best photorealism
  }

  // For personalized content at scale
  if (requirements.personalization && requirements.volume === 'high') {
    return 'gpt-image-1'; // Best personalization understanding
  }

  // For real-time demos or interactive apps
  if (requirements.speed === 'critical') {
    return 'gemini-2.5-flash'; // Fastest generation
  }

  // For cost-sensitive projects
  if (requirements.budget === 'low' && requirements.volume === 'high') {
    return 'gemini-2.5-flash'; // Most cost-effective
  }

  // For local/offline processing
  if (requirements.privacy || requirements.offline) {
    return 'gemini-nano'; // Local processing
  }

  // Default balanced choice
  return 'gemini-ai'; // Good balance of quality, speed, and cost
}
```

### 2. Prompt Optimization

```typescript
class PromptOptimizer {
  static optimizeForModel(prompt: string, model: string): string {
    switch (model) {
      case 'dall-e-3':
        return this.optimizeForDALLE(prompt);

      case 'imagen-3':
        return this.optimizeForImagen(prompt);

      case 'gemini-ai':
        return this.optimizeForGemini(prompt);

      default:
        return prompt;
    }
  }

  private static optimizeForDALLE(prompt: string): string {
    // DALL-E responds well to artistic and technical terms
    return `${prompt}. Professional quality, detailed, high resolution, award-winning.`;
  }

  private static optimizeForImagen(prompt: string): string {
    // Imagen excels with photography terminology
    return `${prompt}. Professional photography, studio lighting, sharp focus, 8k.`;
  }

  private static optimizeForGemini(prompt: string): string {
    // Gemini prefers conversational, descriptive language
    return `Please create an image showing: ${prompt}. The image should be visually appealing and well-composed.`;
  }
}
```

### 3. Error Recovery

```typescript
async function generateWithFallback(
  prompt: string,
  preferredModel: string
): Promise<string> {
  const models = [preferredModel, 'gemini-ai', 'gemini-2.5-flash'];

  for (const model of models) {
    try {
      console.log(`Attempting generation with ${model}`);
      const imageUrl = await generateImage(prompt, model);
      return imageUrl;
    } catch (error) {
      console.warn(`${model} failed, trying next model`);

      if (model === models[models.length - 1]) {
        throw new Error('All models failed');
      }
    }
  }

  throw new Error('Generation failed');
}
```

### 4. Caching Strategy

```typescript
class ImageGenerationCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 15 * 60 * 1000; // 15 minutes

  async generate(
    prompt: string,
    model: string,
    options: any
  ): Promise<string> {
    const cacheKey = this.createCacheKey(prompt, model, options);

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      console.log('Returning cached result');
      return cached.imageUrl;
    }

    // Generate new
    const imageUrl = await this.generateFresh(prompt, model, options);

    // Store in cache
    this.cache.set(cacheKey, {
      imageUrl,
      timestamp: Date.now()
    });

    return imageUrl;
  }

  private createCacheKey(prompt: string, model: string, options: any): string {
    return `${model}:${prompt}:${JSON.stringify(options)}`;
  }

  private async generateFresh(
    prompt: string,
    model: string,
    options: any
  ): Promise<string> {
    switch (model) {
      case 'openai':
        return generateImageWithDalle(prompt, options);
      case 'gemini':
        return generateImageWithGemini(prompt, options.aspectRatio, options.style);
      // ... other models
      default:
        throw new Error(`Unknown model: ${model}`);
    }
  }
}
```

---

## Cost Optimization

### Strategies for Reducing Costs

#### 1. Use Gemini 2.5 Flash for Iterations

```typescript
async function iterativeGeneration(
  prompt: string,
  iterations: number = 3
): Promise<string> {
  // Use fast/cheap model for iterations
  console.log('Generating variations with Gemini Flash...');
  const variations = await Promise.all(
    Array(iterations).fill(0).map(() =>
      generateImageWithGemini2Flash(prompt)
    )
  );

  // User selects best variation
  const selectedVariation = await showVariationSelector(variations);

  // Use premium model for final high-quality version
  console.log('Generating final version with DALL-E 3...');
  const final = await generateImageWithDalle(prompt, {
    quality: 'hd',
    style: 'vivid'
  });

  return final;
}
```

#### 2. Batch Processing Optimization

```typescript
async function optimizedBatchGeneration(
  items: BatchItem[],
  budget: number
): Promise<BatchResult[]> {
  const costs = {
    'dall-e-3': 0.04,
    'gemini-ai': 0.01,
    'gemini-2.5-flash': 0.0025
  };

  // Calculate optimal model for budget
  const maxItems = Math.floor(budget / costs['gemini-2.5-flash']);

  if (items.length <= maxItems) {
    // Use cheapest model for entire batch
    return batchGenerate(items, 'gemini-2.5-flash');
  }

  // Hybrid approach: high priority items with better model
  const highPriority = items.slice(0, Math.floor(budget / costs['dall-e-3']));
  const lowPriority = items.slice(highPriority.length);

  const [highQuality, standardQuality] = await Promise.all([
    batchGenerate(highPriority, 'dall-e-3'),
    batchGenerate(lowPriority, 'gemini-2.5-flash')
  ]);

  return [...highQuality, ...standardQuality];
}
```

#### 3. Intelligent Caching

```typescript
class SmartCache {
  async generateWithSmartCaching(
    prompt: string,
    model: string
  ): Promise<string> {
    // Check for similar prompts (fuzzy matching)
    const similarCached = await this.findSimilarCached(prompt);

    if (similarCached && similarCached.similarity > 0.9) {
      console.log('Using similar cached result');
      return similarCached.imageUrl;
    }

    // Generate new
    const imageUrl = await generate(prompt, model);

    // Cache with metadata
    await this.cacheWithMetadata(prompt, imageUrl, {
      model,
      timestamp: Date.now(),
      cost: MODEL_COSTS[model]
    });

    return imageUrl;
  }

  private async findSimilarCached(prompt: string): Promise<CachedResult | null> {
    // Use semantic similarity (simple version)
    const cached = await this.getAllCached();

    for (const entry of cached) {
      const similarity = this.calculateSimilarity(prompt, entry.prompt);
      if (similarity > 0.9) {
        return { ...entry, similarity };
      }
    }

    return null;
  }

  private calculateSimilarity(a: string, b: string): number {
    // Simple Jaccard similarity
    const setA = new Set(a.toLowerCase().split(' '));
    const setB = new Set(b.toLowerCase().split(' '));

    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return intersection.size / union.size;
  }
}
```

---

## Integration Code Examples

### Complete Generation Flow

```typescript
// File: src/services/imageGenerationService.ts

import {
  generateImageWithDalle,
  generateImageWithGemini,
  generateImageWithGemini2Flash,
  generateImageWithImagen,
  generateImageWithGptImage
} from '../utils/api';

import { cloudGalleryService } from './cloudGalleryService';
import { resolveTokens } from '../utils/tokenResolver';

interface GenerationRequest {
  prompt: string;
  model: AIModel;
  tokens: Record<string, string>;
  settings: GenerationSettings;
  saveToGallery?: boolean;
}

interface GenerationSettings {
  aspectRatio?: string;
  style?: string;
  quality?: 'standard' | 'high' | 'hd';
  size?: string;
  dalleStyle?: 'natural' | 'vivid';
}

type AIModel = 'openai' | 'gemini' | 'gemini2flash' | 'imagen' | 'gpt-image-1' | 'gemini-nano';

export class ImageGenerationService {
  async generate(request: GenerationRequest): Promise<string> {
    // 1. Resolve personalization tokens
    const resolvedPrompt = resolveTokens(request.prompt, request.tokens);

    // 2. Validate request
    this.validateRequest(request);

    // 3. Generate image
    const startTime = Date.now();
    const imageUrl = await this.generateWithModel(
      resolvedPrompt,
      request.model,
      request.settings
    );
    const generationTime = Date.now() - startTime;

    // 4. Save to gallery if requested
    if (request.saveToGallery) {
      await cloudGalleryService.saveImage({
        image_url: imageUrl,
        prompt: resolvedPrompt,
        model: request.model,
        tokens: request.tokens,
        settings: request.settings,
        metadata: {
          generationTime,
          timestamp: new Date().toISOString()
        }
      });
    }

    // 5. Track analytics
    await this.trackGeneration(request.model, generationTime);

    return imageUrl;
  }

  private async generateWithModel(
    prompt: string,
    model: AIModel,
    settings: GenerationSettings
  ): Promise<string> {
    try {
      switch (model) {
        case 'openai':
          return await generateImageWithDalle(prompt, {
            size: settings.size as any,
            quality: settings.quality === 'hd' ? 'hd' : 'standard',
            style: settings.dalleStyle || 'natural'
          });

        case 'gemini':
          return await generateImageWithGemini(
            prompt,
            settings.aspectRatio || '1:1',
            settings.style || 'photography'
          );

        case 'gemini2flash':
          return await generateImageWithGemini2Flash(prompt);

        case 'imagen':
          return await generateImageWithImagen(
            prompt,
            settings.aspectRatio || '1:1'
          );

        case 'gpt-image-1':
          return await generateImageWithGptImage(prompt);

        case 'gemini-nano':
          // Handle Gemini Nano separately as it's client-side only
          throw new Error('Gemini Nano must be called from client');

        default:
          throw new Error(`Unsupported model: ${model}`);
      }
    } catch (error) {
      console.error(`Generation failed with ${model}:`, error);
      throw error;
    }
  }

  private validateRequest(request: GenerationRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    if (request.prompt.length > 2000) {
      throw new Error('Prompt too long (max 2000 characters)');
    }

    // Model-specific validation
    if (request.model === 'openai' && request.settings.size) {
      const validSizes = ['1024x1024', '1792x1024', '1024x1792'];
      if (!validSizes.includes(request.settings.size)) {
        throw new Error(`Invalid size for DALL-E 3: ${request.settings.size}`);
      }
    }
  }

  private async trackGeneration(model: AIModel, generationTime: number): Promise<void> {
    // Track usage analytics
    const costs = {
      'openai': 0.04,
      'gpt-image-1': 0.06,
      'gemini': 0.01,
      'gemini2flash': 0.0025,
      'imagen': 0.02,
      'gemini-nano': 0
    };

    await supabase.from('usage_analytics').insert({
      event_type: 'generation',
      model_used: model,
      cost: costs[model],
      metadata: {
        generationTime
      }
    });
  }
}

// Export singleton
export const imageGenerationService = new ImageGenerationService();
```

### Component Integration

```typescript
// File: src/components/AIImageGenerator.tsx (simplified)

import { useState } from 'react';
import { imageGenerationService } from '../services/imageGenerationService';

export function AIImageGenerator({ tokens }: Props) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>('openai');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const imageUrl = await imageGenerationService.generate({
        prompt,
        model: selectedModel,
        tokens,
        settings: {
          aspectRatio: '1:1',
          quality: 'high',
          style: 'photography'
        },
        saveToGallery: true
      });

      setGeneratedImage(imageUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="ai-image-generator">
      {/* Model selection UI */}
      <select value={selectedModel} onChange={e => setSelectedModel(e.target.value as AIModel)}>
        <option value="openai">DALL-E 3 ($0.04)</option>
        <option value="gpt-image-1">GPT-4 Vision ($0.06)</option>
        <option value="gemini">Gemini AI ($0.01)</option>
        <option value="gemini2flash">Gemini Flash ($0.0025)</option>
        <option value="imagen">Imagen 3 ($0.02)</option>
      </select>

      {/* Prompt input */}
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe the image..."
      />

      {/* Generate button */}
      <button onClick={handleGenerate} disabled={isGenerating || !prompt}>
        {isGenerating ? 'Generating...' : 'Generate Image'}
      </button>

      {/* Error display */}
      {error && <div className="error">{error}</div>}

      {/* Result display */}
      {generatedImage && (
        <div className="result">
          <img src={generatedImage} alt="Generated" />
        </div>
      )}
    </div>
  );
}
```

---

**Last Updated**: November 2025
**Version**: 2.0.0
