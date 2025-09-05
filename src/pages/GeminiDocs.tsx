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
              Gemini AI Integration Guide
            </h1>
            <p className="text-xl text-gray-600">
              Complete documentation for implementing Google's Gemini AI in your VideoRemix application
            </p>
          </motion.div>

          {/* Overview Section */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Book className="w-6 h-6 text-purple-600 mr-2" />
              Gemini AI Overview
            </h2>
            
            <p className="mb-6 text-gray-700">
              Gemini is Google's most capable AI model family, designed for multimodal reasoning across text, images, video, and code. 
              Our application uses several Gemini models to power different AI features:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-bold mb-2 text-purple-800">Gemini 1.5 Flash</h3>
                <p className="text-sm text-purple-700">
                  Ultra-fast model for generating images and handling image-to-image transformations.
                  Great for real-time interactions and quick image generations.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-bold mb-2 text-purple-800">Gemini 1.5 Pro Vision</h3>
                <p className="text-sm text-purple-700">
                  Advanced vision understanding model that can analyze images in detail.
                  Powers our image analysis features and comprehension capabilities.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-bold mb-2 text-purple-800">Gemini 1.5 Pro</h3>
                <p className="text-sm text-purple-700">
                  Powerful model for generating text and handling complex reasoning tasks.
                  Used for generating descriptions, prompt recommendations, and creative content.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-bold mb-2 text-purple-800">Imagen (via Gemini)</h3>
                <p className="text-sm text-purple-700">
                  Google's specialized image generation technology, accessible through Gemini.
                  Creates high-quality images from text descriptions with precise control.
                </p>
              </div>
            </div>
          </div>

          {/* API Setup Section */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Zap className="w-6 h-6 text-purple-600 mr-2" />
              Setting Up Gemini API
            </h2>
            
            <div className="mb-6 space-y-4">
              <p className="text-gray-700">
                To use the Gemini API in your application, you need an API key from Google AI Studio. 
                Follow these steps to get your API key and properly configure your application:
              </p>
              
              <ol className="list-decimal pl-5 space-y-4 text-gray-700">
                <li>
                  <strong>Create a Google AI Studio Account:</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    Visit <a href="https://makersuite.google.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Google AI Studio</a> and sign in with your Google account.
                  </p>
                </li>
                
                <li>
                  <strong>Generate an API Key:</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    In the Google AI Studio dashboard, navigate to the API keys section and create a new API key.
                  </p>
                </li>
                
                <li>
                  <strong>Add API Key to Environment Variables:</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    Create a <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code> file in your project root (copy from <code className="bg-gray-100 px-1 py-0.5 rounded">.env.example</code>) and add your Gemini API key:
                  </p>
                  <pre className="bg-gray-100 p-3 rounded-md text-sm mt-2 overflow-auto text-gray-800">
                    VITE_GEMINI_API_KEY=your_gemini_api_key_here
                  </pre>
                </li>
                
                <li>
                  <strong>Configure Supabase Edge Functions (Optional):</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    If using Supabase Edge Functions, add your API key to Supabase secrets:
                  </p>
                  <pre className="bg-gray-100 p-3 rounded-md text-sm mt-2 overflow-auto text-gray-800">
                    supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
                  </pre>
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
                  Never commit your API keys to version control. Use environment variables.
                </li>
                <li className="mb-2">
                  Gemini API is currently free for most usage tiers, but quotas apply.
                </li>
                <li>
                  For production use, consider implementing rate limiting and usage tracking.
                </li>
              </ul>
            </div>
          </div>

          {/* Implementation Examples Section */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Cpu className="w-6 h-6 text-purple-600 mr-2" />
              Using Gemini in Your Project
            </h2>

            <h3 className="text-lg font-semibold mt-8 mb-3">Text-to-Image Generation</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`// Generate an image from a text prompt using Gemini
async function generateImage(prompt) {
  // Initialize the Gemini client
  const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
  
  // Use the Gemini Flash model for image generation
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  
  // Generate content with image output
  const result = await model.generateContent({
    contents: [{ text: prompt }],
    generationConfig: {
      responseMediaType: "IMAGE"
    }
  });
  
  // Extract the image from the response
  const response = await result.response;
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
      return \`data:\${part.inlineData.mimeType};base64,\${part.inlineData.data}\`;
    }
  }
  
  throw new Error('No image found in the response');
}`}
            </pre>

            <h3 className="text-lg font-semibold mt-8 mb-3">Image-to-Image Transformation</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`// Transform an existing image using Gemini
async function transformImage(imageUrl, prompt) {
  // Initialize the Gemini client
  const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
  
  // Fetch the image
  const response = await fetch(imageUrl);
  const imageBlob = await response.blob();
  
  // Convert to base64
  const base64Data = await blobToBase64(imageBlob);
  
  // Use Gemini Flash for image transformation
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  
  // Generate content based on the image and prompt
  const result = await model.generateContent({
    contents: [
      { text: prompt },
      { inlineData: { data: base64Data, mimeType: imageBlob.type } }
    ],
    generationConfig: {
      responseMediaType: "IMAGE"
    }
  });
  
  // Extract the transformed image from the response
  const genResponse = await result.response;
  for (const part of genResponse.candidates[0].content.parts) {
    if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
      return \`data:\${part.inlineData.mimeType};base64,\${part.inlineData.data}\`;
    }
  }
  
  throw new Error('No image found in the response');
}`}
            </pre>

            <h3 className="text-lg font-semibold mt-8 mb-3">Image Analysis</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`// Analyze an image using Gemini Vision
async function analyzeImage(imageUrl, prompt = "Describe this image in detail") {
  // Initialize the Gemini client
  const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
  
  // Fetch the image
  const response = await fetch(imageUrl);
  const imageBlob = await response.blob();
  
  // Convert to base64
  const base64Data = await blobToBase64(imageBlob);
  
  // Use Gemini Pro Vision for image analysis
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision-latest' });
  
  // Generate content based on the image and prompt
  const result = await model.generateContent({
    contents: [
      { text: prompt },
      { inlineData: { data: base64Data, mimeType: imageBlob.type } }
    ]
  });
  
  // Return the analysis text
  const analysisResponse = await result.response;
  return analysisResponse.text();
}`}
            </pre>
          </div>
          
          {/* Feature Implementation Section */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <LayoutGrid className="w-6 h-6 text-purple-600 mr-2" />
              Key Features Implemented with Gemini
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
                  Create high-quality images from text descriptions using Gemini Flash models. Perfect for generating custom visuals based on user input.
                </p>
                <div className="text-xs font-medium text-gray-500 flex items-center">
                  <Zap className="w-3 h-3 mr-1 text-purple-500" />
                  Uses gemini-1.5-flash-latest
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
                  Uses image-to-image capabilities
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
                  Uses gemini-1.5-pro-vision-latest
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
                  Uses gemini-1.5-pro-latest
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
              <h3 className="font-bold mb-2 text-green-800 flex items-center">
                <Sparkles className="w-5 h-5 mr-1 text-green-600" />
                Best Practices for Gemini Integration
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
                  Make sure you have created a proper Gemini API key and added it to your environment variables.
                  Check that the API key has the necessary permissions and has not exceeded quota limits.
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
                  Edge functions provide better security by keeping API keys server-side but may have more latency.
                  Direct API calls from the client are faster but require exposing API keys (use with caution).
                  Our implementation attempts edge functions first, then falls back to direct calls if needed.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Rate Limiting and Quotas</h3>
                <p className="text-gray-700 text-sm">
                  Gemini API has quota limits which vary based on your account tier. Monitor your usage
                  through the Google AI Studio dashboard and implement appropriate rate limiting in your application
                  to avoid unexpected service interruptions.
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