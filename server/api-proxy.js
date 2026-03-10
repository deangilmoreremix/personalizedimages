/**
 * Server-Side API Proxy
 * 
 * This proxy handles all API calls from the client, keeping API keys secure
 * on the server side. This is a critical security fix.
 * 
 * Usage:
 *   POST /api/proxy/openai
 *   POST /api/proxy/gemini
 *   POST /api/proxy/gemini-nano
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// API Key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // Validate API key format
  if (!apiKey.startsWith('sk-') && !apiKey.startsWith('AIza')) {
    return res.status(401).json({ error: 'Invalid API key format' });
  }
  
  next();
};

// Input validation middleware
const validateInput = (req, res, next) => {
  const { prompt, provider, options } = req.body;
  
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required and must be a string' });
  }
  
  if (prompt.length > 2000) {
    return res.status(400).json({ error: 'Prompt exceeds maximum length of 2000 characters' });
  }
  
  if (!provider || typeof provider !== 'string') {
    return res.status(400).json({ error: 'Provider is required' });
  }
  
  // Sanitize prompt
  const sanitizedPrompt = prompt
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[<>\"'&]/g, '') // Remove dangerous characters
    .trim();
  
  if (sanitizedPrompt.length === 0) {
    return res.status(400).json({ error: 'Prompt contains only dangerous characters' });
  }
  
  req.body.sanitizedPrompt = sanitizedPrompt;
  
  next();
};

// OpenAI API Proxy
app.post('/api/proxy/openai', validateApiKey, validateInput, async (req, res) => {
  try {
    const { sanitizedPrompt, options } = req.body;
    const apiKey = req.headers['x-api-key'];
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: sanitizedPrompt,
        n: 1,
        size: options?.size || '1024x1024',
        quality: options?.quality || 'standard',
        style: options?.style || 'natural'
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'OpenAI API error' });
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('OpenAI proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Gemini API Proxy
app.post('/api/proxy/gemini', validateApiKey, validateInput, async (req, res) => {
  try {
    const { sanitizedPrompt, options } = req.body;
    const apiKey = req.headers['x-api-key'];
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: sanitizedPrompt }] }],
        generationConfig: {
          responseMediaType: "IMAGE",
          ...(options?.aspectRatio && {
            imageConfig: { aspectRatio: options.aspectRatio }
          })
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'Gemini API error' });
    }
    
    const data = await response.json();
    
    // Extract image from response
    for (const candidate of data.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
          return res.json({
            data: [{
              url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
            }]
          });
        }
      }
    }
    
    res.status(404).json({ error: 'No image found in Gemini response' });
    
  } catch (error) {
    console.error('Gemini proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Gemini Nano API Proxy
app.post('/api/proxy/gemini-nano', validateApiKey, validateInput, async (req, res) => {
  try {
    const { sanitizedPrompt, options } = req.body;
    const apiKey = req.headers['x-api-key'];
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: sanitizedPrompt }] }],
        generationConfig: {
          responseMediaType: "IMAGE",
          temperature: 0.7,
          ...(options?.aspectRatio && {
            imageConfig: { aspectRatio: options.aspectRatio }
          })
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'Gemini Nano API error' });
    }
    
    const data = await response.json();
    
    // Extract image from response
    for (const candidate of data.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
          return res.json({
            data: [{
              url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
            }]
          });
        }
      }
    }
    
    res.status(404).json({ error: 'No image found in Gemini Nano response' });
    
  } catch (error) {
    console.error('Gemini Nano proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Proxy Server running on port ${PORT}`);
  console.log(`Allowed origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:3000, http://localhost:5173'}`);
});

module.exports = app;
