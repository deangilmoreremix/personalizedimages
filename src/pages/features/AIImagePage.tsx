import React, { useState } from 'react';
import AIImageGenerator from '../../components/AIImageGenerator';
import { createDefaultTokenValues } from '../../types/personalization';

const AIImagePage: React.FC = () => {
  const [tokens] = useState(createDefaultTokenValues());

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">AI Image Generator</h1>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-xl shadow-lg mb-12">
          <p className="text-lg text-center mb-6">
            Transform your ideas into stunning, personalized images. Use tokens like [FIRSTNAME] and [COMPANY] in your prompt.
          </p>
          <AIImageGenerator tokens={tokens} onImageGenerated={() => {}} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <ol className="space-y-4 ml-6 list-decimal">
              <li>Enter a detailed description of the image you want to create</li>
              <li>Customize settings like style, aspect ratio, and details</li>
              <li>Click generate and watch as AI brings your vision to life</li>
              <li>Download your creation in high resolution or share it instantly</li>
            </ol>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Example Prompts</h2>
            <ul className="space-y-3 ml-6 list-disc">
              <li>"A futuristic cityscape with flying cars and neon lights at sunset"</li>
              <li>"A photorealistic portrait of a tiger in a rainforest"</li>
              <li>"A welcome poster for [FIRSTNAME] of [COMPANY], watercolor style"</li>
              <li>"A watercolor illustration of a cozy coffee shop on a rainy day"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIImagePage;
