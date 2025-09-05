# VideoRemix Edge Function API Documentation

This document outlines the API endpoints provided by the Supabase Edge Functions for VideoRemix.

## Base URL

```
https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/functions/v1/
```

## Authentication

All endpoints require authentication using one of the following methods:

1. **Anonymous Key**: For public endpoints, you can use the Supabase anonymous key:
   ```
   Authorization: Bearer [SUPABASE_ANON_KEY]
   ```

2. **User JWT**: For authenticated requests, use the user's JWT token:
   ```
   Authorization: Bearer [USER_JWT_TOKEN]
   ```

## Common Response Format

All endpoints return responses in the following format:

```json
{
  "data": { /* Response data */ },
  "error": null | { "message": "Error message" }
}
```

## API Endpoints

### Image Generation

#### Generate an image from text

**Endpoint**: `POST /image-generation`

**Request Body**:
```json
{
  "provider": "openai" | "gemini" | "gemini2flash" | "imagen",
  "prompt": "A detailed description of the image you want to generate",
  "aspectRatio": "1:1" | "4:3" | "3:4" | "16:9" | "9:16",
  "style": "photography" | "painting" | "digital-art" | "sketch" | "cartoon" | "anime" | "illustration"
}
```

**Response**:
```json
{
  "imageUrl": "data:image/png;base64,..." | "https://..."
}
```

### Reference Image Generation

#### Generate an image based on a reference

**Endpoint**: `POST /reference-image`

**Request Body**:
```json
{
  "basePrompt": "A detailed description of the image you want to generate",
  "provider": "openai" | "gemini",
  "referenceImageUrl": "https://example.com/reference.jpg",
  "style": "photography" | "painting" | "digital-art" | "sketch" | "cartoon" | "anime" | "illustration"
}
```

**Response**:
```json
{
  "imageUrl": "data:image/png;base64,..." | "https://..."
}
```

### Action Figure Generator

#### Generate an action figure

**Endpoint**: `POST /action-figure`

**Request Body**:
```json
{
  "prompt": "A detailed description of the action figure you want to generate",
  "provider": "openai" | "gemini",
  "referenceImageUrl": "https://example.com/reference.jpg"
}
```

**Response**:
```json
{
  "imageUrl": "data:image/png;base64,..." | "https://..."
}
```

### Ghibli-Style Image Generator

#### Generate an image in Studio Ghibli style

**Endpoint**: `POST /ghibli-image`

**Request Body**:
```json
{
  "prompt": "A detailed description of the Ghibli-style scene you want to generate",
  "provider": "openai" | "gemini",
  "referenceImageUrl": "https://example.com/reference.jpg"
}
```

**Response**:
```json
{
  "imageUrl": "data:image/png;base64,..." | "https://..."
}
```

### Crazy Image Generator

#### Generate a wild, surreal image

**Endpoint**: `POST /crazy-image`

**Request Body**:
```json
{
  "prompt": "A detailed description of the crazy image you want to generate",
  "provider": "openai" | "gemini",
  "referenceImageUrl": "https://example.com/reference.jpg"
}
```

**Response**:
```json
{
  "imageUrl": "data:image/png;base64,..." | "https://..."
}
```

### Meme Generator

#### Generate a meme

**Endpoint**: `POST /meme-generator`

**Request Body**:
```json
{
  "topText": "Text for the top of the meme",
  "bottomText": "Text for the bottom of the meme",
  "referenceImageUrl": "https://example.com/meme-template.jpg",
  "additionalStyle": "watercolor" | "comic" | "oil-painting" | "etc..."
}
```

**Response**:
```json
{
  "imageUrl": "data:image/png;base64,..." | "https://..."
}
```

### Image Analysis

#### Analyze an image

**Endpoint**: `POST /image-analysis`

**Request Body**:
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "action": "analyze" | "detect-objects" | "generate-caption" | "extract-colors" | "suggest-improvements",
  "analysisPrompt": "Optional custom prompt for analysis"
}
```

**Response**:
```json
{
  "result": "Analysis text or structured data based on the action"
}
```

### AI Assistant Stream

#### Stream AI assistant responses

**Endpoint**: `POST /assistant-stream`

**Request Body**:
```json
{
  "messages": [
    { "role": "user", "content": "User message" },
    { "role": "assistant", "content": "Assistant response" }
  ],
  "userContext": {
    "FIRSTNAME": "User's first name",
    "COMPANY": "User's company",
    "etc...": "Other personalization tokens"
  },
  "temperature": 0.7
}
```

**Response**: 
A streaming response of text chunks until the response is complete.

### Prompt Recommendations

#### Get enhanced prompt suggestions

**Endpoint**: `POST /prompt-recommendations`

**Request Body**:
```json
{
  "basePrompt": "Initial prompt idea",
  "tokens": {
    "FIRSTNAME": "User's first name",
    "COMPANY": "User's company"
  },
  "style": "DALL-E" | "Gemini" | "Imagen"
}
```

**Response**:
```json
{
  "recommendations": [
    "Enhanced prompt 1",
    "Enhanced prompt 2",
    "Enhanced prompt 3"
  ]
}
```

### Image-to-Video Conversion

#### Convert an image to a video

**Endpoint**: `POST /image-to-video/create`

**Request Body**:
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "prompt": "Optional guidance for video generation",
  "motionType": "zoom" | "pan" | "3d" | "cinematic",
  "duration": 3,
  "provider": "gemini" | "leonardo",
  "paymentIntentId": "pi_123456789"
}
```

**Response**:
```json
{
  "jobId": "job_123456789",
  "status": "pending",
  "estimatedCompletionTime": "2023-04-01T12:00:00Z"
}
```

#### Check video job status

**Endpoint**: `POST /image-to-video/status`

**Request Body**:
```json
{
  "jobId": "job_123456789"
}
```

**Response**:
```json
{
  "jobId": "job_123456789",
  "status": "pending" | "processing" | "completed" | "failed",
  "progress": 50,
  "videoUrl": "https://example.com/video.mp4",
  "error": "Error message if failed"
}
```

### Stripe Payment Integration

#### Create a payment intent

**Endpoint**: `POST /create-payment-intent`

**Request Body**:
```json
{
  "amount": 100,
  "currency": "usd",
  "videoId": "video_123456789",
  "metadata": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

**Response**:
```json
{
  "clientSecret": "pi_123456789_secret_987654321",
  "paymentIntentId": "pi_123456789"
}
```

## Rate Limits and Quotas

- Image generation: 100 requests per day per user
- Video generation: 20 requests per day per user
- AI Assistant: 200 requests per day per user
- Image Analysis: 50 requests per day per user

Exceeding these limits will result in a 429 Too Many Requests response.

## Error Handling

Error responses will have a status code other than 200 and include an error message:

```json
{
  "error": "Detailed error message explaining what went wrong"
}
```

Common error status codes:
- 400: Bad Request - Invalid parameters
- 401: Unauthorized - Missing or invalid authentication
- 402: Payment Required - Payment needed for this operation
- 403: Forbidden - Insufficient permissions
- 429: Too Many Requests - Rate limit exceeded
- 500: Internal Server Error - Something went wrong on the server