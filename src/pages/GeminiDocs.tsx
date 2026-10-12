import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Cpu, Image as ImageIcon, Book, LayoutGrid, MessageSquare, Camera } from 'lucide-react';

const GeminiDocs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
              OpenAI Integration Guide
            </h1>
            <p className="text-xl text-gray-600">
              Complete documentation for implementing the OpenAI Responses API and GPT Image 2.5 in your
              PersonalizedImages application
            </p>
          </motion.div>

          {/* Overview Section */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Book className="w-6 h-6 text-purple-600 mr-2" />
              OpenAI API Overview
            </h2>
            
            <p className="mb-6 text-gray-700">
              PersonalizedImages runs on two OpenAI model families: the Responses API for text and the
              GPT Image 2.5 model for images. Every call uses the API key you add in Settings → API Keys.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-bold mb-2 text-purple-800">GPT Image 2.5</h3>
                <p className="text-sm text-purple-700">
                  Image generation and editing model used for every image feature. Generates
                  images from prompts and edits existing images with the Images API.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-bold mb-2 text-purple-800">Responses API</h3>
                <p className="text-sm text-purple-700">
                  Text model used for image descriptions, prompt recommendations and the AI assistant.
                  Accepts simple text input and returns structured text output.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-bold mb-2 text-purple-800">BYOK Model</h3>
                <p className="text-sm text-purple-700">
                  Bring-your-own-key: your OpenAI key is sent only to OpenAI and OpenAI bills your
                  account. There are no application credits, subscriptions or platform-funded calls.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-bold mb-2 text-purple-800">MuAPI (video)</h3>
                <p className="text-sm text-purple-700">
                  Image-to-video generation uses your own MuAPI API key, added in the same
                  API Keys settings page.
                </p>
              </div>
            </div>
          </div>

          {/* API Setup Section */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Zap className="w-6 h-6 text-purple-600 mr-2" />
              Setting Up the OpenAI API
            </h2>
            
            <div className="mb-6 space-y-4">
              <p className="text-gray-700">
                PersonalizedImages is bring-your-own-key. Add your own OpenAI key in Settings → API Keys
                and every request is sent straight to OpenAI with your credentials.
              </p>
              
              <ol className="list-decimal pl-5 space-y-4 text-gray-700">
                <li>
                  <strong>Create an OpenAI Account:</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    Visit <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">the OpenAI platform</a> and sign in.
                  </p>
                </li>
                
                <li>
                  <strong>Generate an API Key:</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    In the OpenAI dashboard, navigate to API keys and create a new secret key. It starts with sk-.
                  </p>
                </li>
                
                <li>
                  <strong>Add the key in API Key Settings:</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    Open Settings → API Keys, paste the key into the OpenAI section and save. The stored key is
                    shown masked only, for example <code className="bg-gray-100 px-1 py-0.5 rounded">sk-…abcd</code>.
                  </p>
                </li>
                
                <li>
                  <strong>Video needs MuAPI:</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    Add your own MuAPI key in the same page to enable image-to-video generation.
                  </p>
                </li>
              </ol>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="font-bold mb-2 text-yellow-800 flex items-center">
                <Zap className="w-5 h-5 mr-1 text-yellow-600" />
                Important Notes
              </h3>
              <ul className="list-disc pl-5 text-sm text-yellow-700">
                <li className="mb-2">
                  Your key is sent only to OpenAI from your browser or through the authenticated edge function.
                </li>
                <li className="mb-2">
                  OpenAI bills your account for the requests you make. Rate limits and quotas follow your plan.
                </li>
                <li>
                  Missing key errors tell you to add a key in Settings → API Keys - there is no shared key fallback.
                </li>
              </ul>
            </div>
          </div>

          {/* Implementation Examples Section */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Cpu className="w-6 h-6 text-purple-600 mr-2" />
              Using OpenAI in Your Project
            </h2>

            <h3 className="text-lg font-semibold mt-8 mb-3">Text-to-Image Generation</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`// Generate an image from a text prompt with GPT Image 2.5 (BYOK)
async function generateImage(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${apiKey}\`
    },
    body: JSON.stringify({
      model: 'gpt-image-2.5-sunburst',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'medium',
      output_format: 'png'
    })
  });

  if (!response.ok) {
    throw new Error(\`OpenAI API error: \${response.status}\`);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('Image provider returned no image data');
  }
  return \`data:image/png;base64,\${b64}\`;
}`}
            </pre>

            <h3 className="text-lg font-semibold mt-8 mb-3">Image-to-Image Transformation</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`// Edit an existing image with GPT Image 2.5 (BYOK)
async function editImage(imageUrl, prompt, apiKey) {
  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${apiKey}\`
    },
    body: JSON.stringify({
      model: 'gpt-image-2.5-sunburst',
      images: [{ image_url: imageUrl }],
      prompt,
      n: 1,
      size: '1024x1024',
      output_format: 'png'
    })
  });

  if (!response.ok) {
    throw new Error(\`OpenAI API error: \${response.status}\`);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('Image provider returned no image data');
  }
  return \`data:image/png;base64,\${b64}\`;
}`}
            </pre>

            <h3 className="text-lg font-semibold mt-8 mb-3">Image Analysis</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`// Analyze an image with the Responses API (BYOK)
async function analyzeImage(imageUrl, prompt = "Describe this image in detail", apiKey) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${apiKey}\`
    },
    body: JSON.stringify({
      model: 'gpt-5-mini',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            { type: 'input_image', image_url: imageUrl }
          ]
        }
      ],
      max_output_tokens: 1024
    })
  });

  if (!response.ok) {
    throw new Error(\`OpenAI API error: \${response.status}\`);
  }

  const data = await response.json();
  return (data.output || [])
    .flatMap((item) => item.content || [])
    .filter((part) => part.type === 'output_text')
    .map((part) => part.text || '')
    .join('')
    .trim();
}`}
            </pre>
          </div>
          
          {/* Feature Implementation Section */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <LayoutGrid className="w-6 h-6 text-purple-600 mr-2" />
              Key Features Implemented with OpenAI
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="ml-3 font-semibold">Image Generation</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Create high-quality images from text descriptions using GPT Image 2.5. Perfect for generating custom visuals based on user input.
                </p>
                <div className="text-xs font-medium text-gray-500 flex items-center">
                  <Zap className="w-3 h-3 mr-1 text-purple-500" />
                  Uses gpt-image-2.5-sunburst
                </div>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Camera className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="ml-3 font-semibold">Reference-Based Generation</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Transform uploaded images into new styles or modifications while preserving key elements of the original image.
                </p>
                <div className="text-xs font-medium text-gray-500 flex items-center">
                  <Zap className="w-3 h-3 mr-1 text-purple-500" />
                  Uses the GPT Image 2.5 edits endpoint
                </div>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Cpu className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="ml-3 font-semibold">Image Analysis</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Analyze images to understand content, extract features, and provide detailed descriptions of visual elements.
                </p>
                <div className="text-xs font-medium text-gray-500 flex items-center">
                  <Zap className="w-3 h-3 mr-1 text-purple-500" />
                  Uses the Responses API
                </div>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="ml-3 font-semibold">Creative Content Generation</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Generate creative descriptions, prompt recommendations, and personalized content using advanced language models.
                </p>
                <div className="text-xs font-medium text-gray-500 flex items-center">
                  <Zap className="w-3 h-3 mr-1 text-purple-500" />
                  Uses the Responses API
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
              <h3 className="font-bold mb-2 text-green-800 flex items-center">
                <Sparkles className="w-5 h-5 mr-1 text-green-600" />
                Best Practices for OpenAI Integration
              </h3>
              <ul className="list-disc pl-5 text-sm text-green-700">
                <li className="mb-2">
                  Always check for API key availability before making API calls
                </li>
                <li className="mb-2">
                  Implement proper error handling with descriptive error messages
                </li>
                <li className="mb-2">
                  Use appropriate model versions based on the specific task
                </li>
                <li className="mb-2">
                  Implement retry logic for transient API errors
                </li>
                <li>
                  Consider using edge functions for sensitive API calls to keep API keys secure
                </li>
              </ul>
            </div>
          </div>

          {/* Troubleshooting Section */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Cpu className="w-6 h-6 text-purple-600 mr-2" />
              Troubleshooting & FAQs
            </h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-bold mb-2">API Keys Not Working</h3>
                <p className="text-gray-700 text-sm">
                  Make sure you have added your own OpenAI key in Settings → API Keys. Keys are shown masked
                  and are sent only to OpenAI.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-bold mb-2">Image Generation Fails</h3>
                <p className="text-gray-700 text-sm">
                  Ensure your prompt does not violate content policies. Try simplifying your prompt or being more specific.
                  Some models have limitations on certain types of content generation.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-bold mb-2">Unexpected Image Results</h3>
                <p className="text-gray-700 text-sm">
                  Refine your prompts to be more detailed and specific. Different models may interpret prompts differently.
                  Try adjusting parameters like style or aspect ratio for better results.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-bold mb-2">Edge Functions vs. Direct API Calls</h3>
                <p className="text-gray-700 text-sm">
                  Edge functions read your key from the x-user-api-key header and call OpenAI on your behalf.
                  Direct calls from the client are used when you supply a key. There is no shared platform key
                  fallback in either path.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Rate Limiting and Quotas</h3>
                <p className="text-gray-700 text-sm">
                  OpenAI rate limits and quotas vary by account tier. Monitor your usage in the OpenAI
                  dashboard and implement appropriate rate limiting in your application to avoid
                  unexpected service interruptions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiDocs;