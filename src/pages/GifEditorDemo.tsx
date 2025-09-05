import React, { useState } from 'react';
import GifEditor from '../components/GifEditor';

const GifEditorDemo: React.FC = () => {
  // Sample personalization tokens for testing
  const [tokens, setTokens] = useState({
    'FIRSTNAME': 'Sarah',
    'LASTNAME': 'Johnson',
    'COMPANY': 'Acme Inc',
    'EMAIL': 'sarah@example.com'
  });
  
  // Handle when a GIF is generated
  const handleGifGenerated = (gifUrl: string) => {
    console.log('GIF generated successfully!', gifUrl);
    // You could save the URL or display it elsewhere
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Animated GIF Personalization Editor</h1>
            <p className="text-gray-600">
              Create dynamic, personalized GIFs for your marketing campaigns
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* The GifEditor component with test tokens */}
            <GifEditor 
              tokens={tokens}
              onGifGenerated={handleGifGenerated}
            />
          </div>
          
          <div className="mt-8 bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">How to Use the GIF Editor</h2>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <strong>Add Frames:</strong> Upload images or click "Add New Frame" to create blank frames for your animation
              </li>
              <li>
                <strong>Add Text Tokens:</strong> Click "Add Text Token" to insert personalized text elements onto each frame
              </li>
              <li>
                <strong>Customize:</strong> Adjust text properties, frame durations, and animation settings
              </li>
              <li>
                <strong>Preview:</strong> Use play/pause to preview your animation before generating the final GIF
              </li>
              <li>
                <strong>Generate:</strong> Click "Generate GIF" to create your personalized animated GIF
              </li>
              <li>
                <strong>Email Optimization:</strong> Use the email-safe settings for better compatibility with email clients
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GifEditorDemo;