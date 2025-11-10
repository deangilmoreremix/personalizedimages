import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Box, Camera, Download, Sparkles, Zap, Upload, Image as ImageIcon, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActionFigureCarousel } from './ActionFigureCarousel';
import { generateActionFigure } from '../utils/api';

const ActionFigureShowcase: React.FC = () => {
  const [activeStyle, setActiveStyle] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Action figure style examples with personalization - showing actual app features
  const styles = [
    {
      id: 'editor-interface',
      name: 'AI Creative Studio Editor',
      description: 'Professional interface with drag-and-drop tokens, real-time personalization, and AI-powered content generation',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&crop=center',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'tokens-panel',
      name: 'Personalization Tokens Panel',
      description: 'Manage dynamic content tokens for personalized experiences. Add customer data and drag tokens into content.',
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop&crop=center',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'supabase-integration',
      name: 'Supabase Backend Dashboard',
      description: 'Real-time database with edge functions, user authentication, and secure API endpoints for content delivery',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
      color: 'from-teal-500 to-emerald-600'
    },
    {
      id: 'pwa-features',
      name: 'PWA Installation & Offline',
      description: 'Progressive Web App with service worker caching, offline support, and native app installation capabilities',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&crop=center',
      color: 'from-red-500 to-orange-600'
    },
    {
      id: 'email-editor',
      name: 'Email Template Editor',
      description: 'Visual email editor with drag-and-drop personalization tokens and real-time preview for marketing campaigns',
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop&crop=center',
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'feature-gallery',
      name: 'AI Feature Gallery',
      description: 'Browse and select from 30+ AI-powered content generation features including memes, action figures, and animations',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
      color: 'from-amber-500 to-yellow-600'
    }
  ];

  // Generate real images for showcase on component mount
  useEffect(() => {
    const generateShowcaseImages = async () => {
      for (const style of styles) {
        if (!generatedImages[style.id]) {
          setLoadingStates(prev => ({ ...prev, [style.id]: true }));
          try {
            const imageUrl = await generateActionFigure(
              `${style.name}: ${style.description}`,
              'openai'
            );
            setGeneratedImages(prev => ({ ...prev, [style.id]: imageUrl }));
          } catch (error) {
            console.warn(`Failed to generate image for ${style.id}:`, error);
            // Keep the original Pexels image as fallback
            setGeneratedImages(prev => ({ ...prev, [style.id]: style.image }));
          } finally {
            setLoadingStates(prev => ({ ...prev, [style.id]: false }));
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
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4"
          >
            PERSONALIZED ACTION FIGURES
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Custom Personalized Action Figures</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transform your customers into collectible action figures with 30+ premium styles. 
            Add their name, company, and personal details for a truly personalized experience.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative"
          >
            {styles.map((style, index) => (
              <motion.div
                key={style.id}
                className={`rounded-xl overflow-hidden ${index === activeStyle ? 'block' : 'hidden'}`}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {loadingStates[style.id] ? (
                  <div className="w-full h-96 bg-gray-100 rounded-xl shadow-lg flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary-500" />
                      <p className="text-sm text-gray-600">Generating AI image...</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={generatedImages[style.id] || style.image}
                    alt={style.name}
                    className="w-full h-auto rounded-xl shadow-lg"
                    onError={(e) => {
                      // Fallback to original image if generated image fails to load
                      const target = e.target as HTMLImageElement;
                      if (target.src !== style.image) {
                        target.src = style.image;
                      }
                    }}
                  />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 flex flex-col justify-end p-6">
                  <h3 className="text-white text-2xl font-bold mb-2">{style.name}</h3>
                  <p className="text-white/80">{style.description}</p>
                  
                  <div className="mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-primary inline-flex items-center"
                      onClick={() => setActiveStyle((activeStyle + 1) % styles.length)}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Next Personalized Style
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Style indicator dots */}
            <div className="flex justify-center mt-4 space-x-2">
              {styles.map((style, index) => (
                <button
                  key={`indicator-${style.id}`}
                  className={`w-3 h-3 rounded-full ${index === activeStyle ? 'bg-primary-500' : 'bg-gray-300'}`}
                  onClick={() => setActiveStyle(index)}
                  aria-label={`View ${style.name}`}
                />
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">AI Creative Studio Features</h3>
              <p className="text-gray-600">
                Experience our comprehensive AI-powered content creation platform with drag-and-drop personalization,
                real-time token replacement, and 30+ AI generation features including memes, action figures,
                Ghibli-style art, and video conversion.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-full text-primary-600 mt-1 mr-4">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Token-Based Personalization</h4>
                    <p className="text-sm text-gray-600">Use dynamic tokens like [FIRSTNAME], [COMPANY], and [EMAIL] for real-time content personalization across all features.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-full text-primary-600 mt-1 mr-4">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Supabase Edge Functions</h4>
                    <p className="text-sm text-gray-600">Serverless functions handle AI processing, content generation, and real-time personalization with global deployment.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-full text-primary-600 mt-1 mr-4">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">PWA Offline Support</h4>
                    <p className="text-sm text-gray-600">Service worker caching enables offline functionality with background sync for seamless content generation.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex">
              <Link to="/editor" className="btn btn-primary flex items-center">
                Create Your Personalized Action Figure <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Style Gallery */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">AI Creative Studio Feature Gallery (30+ Options)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              {
                label: "AI Image Gen",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop&crop=center"
              },
              {
                label: "Action Figures",
                image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=100&h=100&fit=crop&crop=center"
              },
              {
                label: "Ghibli Style",
                image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&h=100&fit=crop&crop=center"
              },
              {
                label: "AI Memes",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=100&fit=crop&crop=center"
              },
              {
                label: "Email Editor",
                image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=100&h=100&fit=crop&crop=center"
              },
              {
                label: "Video Convert",
                image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&h=100&fit=crop&crop=center"
              }
            ].map((style, index) => {
              const styleId = `gallery-${index}`;
              return (
                <motion.div
                  key={styleId}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="rounded-lg overflow-hidden shadow border border-gray-200"
                >
                  <div className="aspect-square overflow-hidden">
                    {loadingStates[styleId] ? (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                      </div>
                    ) : (
                      <img
                        src={generatedImages[styleId] || style.image}
                        alt={style.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== style.image) {
                            target.src = style.image;
                          }
                        }}
                      />
                    )}
                  </div>
                  <div className="bg-white p-2 text-center">
                    <p className="text-xs font-medium truncate">{style.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-4 text-center">
            <Link 
              to="/editor" 
              className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center"
            >
              View all 30+ personalized styles in the editor <ArrowRight className="ml-1 w-3 h-3" />
            </Link>
          </div>
        </div>
        
        {/* Reference Upload Feature */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6 shadow-md"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="md:w-1/2 space-y-4">
              <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                <motion.span
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "mirror"
                  }}
                >
                  PERSONALIZED IMAGE-TO-IMAGE
                </motion.span>
              </div>
              
              <h3 className="text-2xl font-bold">Token-Based Personalization System</h3>

              <p className="text-gray-700">
                Our advanced personalization system uses dynamic tokens for real-time content replacement.
                Drag and drop tokens like [FIRSTNAME], [COMPANY], and [EMAIL] into any content editor
                for instant personalization across all AI generation features.
              </p>
              
              <div className="pt-2">
                <Link to="/editor" className="btn btn-primary flex items-center inline-flex">
                  Try AI Creative Studio <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative rounded-lg overflow-hidden shadow-md">
                    <img 
                      src="https://images.pexels.com/photos/3220360/pexels-photo-3220360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                      alt="Reference" 
                      className="w-full h-full object-cover aspect-square"
                    />
                    <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-800">
                      Original Reference
                    </div>
                  </div>
                  
                  <div className="relative rounded-lg overflow-hidden shadow-md">
                    <img 
                      src="https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                      alt="Personalized result" 
                      className="w-full h-full object-cover aspect-square"
                    />
                    <div className="absolute bottom-2 left-2 bg-primary-500/80 text-white backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                      Personalized Result
                    </div>
                  </div>
                </div>
                
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3"
                >
                  <div className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium">Personalized Image Upload</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ActionFigureShowcase;

export { ActionFigureShowcase }