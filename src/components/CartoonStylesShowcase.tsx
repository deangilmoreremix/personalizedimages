import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Paintbrush as PaintBrush, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import cartoonThemesConfig from '../data/cartoonThemes';
import { generateCartoonImage } from '../utils/api';

const CartoonStylesShowcase: React.FC = () => {
  // Get a sample of themes to display
  const sampleThemes = cartoonThemesConfig.themes.slice(0, 6);
  
  // Generate real AI images for showcase
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});

  // Generate real cartoon style images on component mount
  useEffect(() => {
    const generateShowcaseImages = async () => {
      const cartoonThemes = cartoonThemesConfig.themes.slice(0, 6);

      for (let i = 0; i < cartoonThemes.length; i++) {
        if (!generatedImages[i]) {
          setLoadingStates(prev => ({ ...prev, [i]: true }));
          try {
            const imageUrl = await generateCartoonImage(
              cartoonThemes[i].prompt,
              'openai',
              undefined,
              cartoonThemes[i].label
            );
            setGeneratedImages(prev => ({ ...prev, [i]: imageUrl }));
          } catch (error) {
            console.warn(`Failed to generate cartoon image for ${cartoonThemes[i].label}:`, error);
            // Keep placeholder if generation fails
          } finally {
            setLoadingStates(prev => ({ ...prev, [i]: false }));
          }
        }
      }
    };

    // Only generate if we have API keys configured
    if (import.meta.env.PROD || import.meta.env.VITE_OPENAI_API_KEY) {
      generateShowcaseImages();
    }
  }, []);
  
  return (
    <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
          >
            NEW STYLE COLLECTION
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mt-3 mb-4"
          >
            Cartoon Style Transformations
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Convert any photo into 20+ popular cartoon and animation styles with our
            AI-powered transformation tools
          </motion.p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {sampleThemes.map((theme, index) => (
            <motion.div
              key={theme.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="aspect-square bg-gray-100 relative">
                {theme.preview ? (
                  <img 
                    src={theme.preview}
                    alt={theme.label} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to generated image or placeholder
                      const target = e.target as HTMLImageElement;
                      if (generatedImages[index]) {
                        target.src = generatedImages[index];
                      } else {
                        target.src = `https://placehold.co/200x200/f5f5f5/a1a1aa?text=${encodeURIComponent(theme.label)}`;
                      }
                    }}
                  />
                ) : loadingStates[index] ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  </div>
                ) : (
                  <img
                    src={generatedImages[index] || `https://placehold.co/200x200/f5f5f5/a1a1aa?text=${encodeURIComponent(theme.label)}`}
                    alt={theme.label}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Overlay with icon */}
                <div className="absolute inset-0 bg-indigo-900/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <PaintBrush className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-1">{theme.label}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {theme.prompt.substring(0, 100)}...
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/editor" className="btn btn-primary inline-flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Try All 20 Cartoon Styles
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          
          <p className="text-sm text-gray-600 mt-4">
            Upload any photo and transform it instantly with our cartoon style filters
          </p>
        </div>
      </div>
    </section>
  );
};

export default CartoonStylesShowcase;