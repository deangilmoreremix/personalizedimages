import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Box, Camera, Download, Sparkles, Zap, Upload, Image as ImageIcon, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActionFigureCarousel } from './ActionFigureCarousel';

const ActionFigureShowcase: React.FC = () => {
  const [activeStyle, setActiveStyle] = useState(0);

  // Action figure style examples with personalization
  const styles = [
    {
      id: 'collectible-card',
      name: 'Personalized AI Collectible Card',
      description: 'Trading card with your name, personalized stats and custom holographic design',
      image: 'https://images.pexels.com/photos/6615294/pexels-photo-6615294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'boxed-toy',
      name: 'Personalized Boxed Toy',
      description: 'Ultra-detailed action figure in collector\'s packaging featuring your name and company',
      image: 'https://images.pexels.com/photos/12211/pexels-photo-12211.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'turntable',
      name: 'Personalized 3D Character',
      description: '360° view of a fully articulated action figure customized with your details',
      image: 'https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      color: 'from-teal-500 to-emerald-600'
    },
    {
      id: 'game-character',
      name: 'Personalized Game Character',
      description: 'Fighting game character select screen featuring personalized fighters with your name',
      image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      color: 'from-red-500 to-orange-600'
    },
    {
      id: 'vinyl-toy',
      name: 'Personalized Vinyl Figure',
      description: 'Cute vinyl figure with your name, custom details and personalized accessories',
      image: 'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'superhero',
      name: 'Personalized Superhero Pack',
      description: 'Superhero action figure with your name, custom powers and personalized backstory',
      image: 'https://images.pexels.com/photos/8346904/pexels-photo-8346904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      color: 'from-amber-500 to-yellow-600'
    }
  ];

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
                <img 
                  src={style.image} 
                  alt={style.name} 
                  className="w-full h-auto rounded-xl shadow-lg"
                />
                
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
              <h3 className="text-2xl font-bold">Create Personalized Action Figures</h3>
              <p className="text-gray-600">
                Create highly personalized, custom action figures for your marketing campaigns. 
                Choose from 30+ premium styles to transform your customers into collectible toys, 
                board game characters, or trading cards featuring their name and personal details.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-full text-primary-600 mt-1 mr-4">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Personalized Reference Images</h4>
                    <p className="text-sm text-gray-600">Upload your customers' photos to create personalized action figures that truly capture their likeness and personal details.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-full text-primary-600 mt-1 mr-4">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">30+ Personalized Styles</h4>
                    <p className="text-sm text-gray-600">Choose from boxed toys, collectible cards, vinyl figures, game characters, superhero figures, all featuring your customer's name and details.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-full text-primary-600 mt-1 mr-4">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Personalized AI Generation</h4>
                    <p className="text-sm text-gray-600">Our advanced AI creates personalized action figures with your customer's name, company, and personal details for truly individualized experiences.</p>
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
          <h3 className="text-lg font-medium mb-4">Popular Personalized Action Figure Styles (30+ Options)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              {
                label: "AI Collectible Card",
                image: "https://images.pexels.com/photos/6615294/pexels-photo-6615294.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                label: "Boxed Toy Mockup",
                image: "https://images.pexels.com/photos/12211/pexels-photo-12211.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                label: "3D Character",
                image: "https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                label: "Game Character",
                image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                label: "Vinyl Figure",
                image: "https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                label: "Superhero Pack",
                image: "https://images.pexels.com/photos/8346904/pexels-photo-8346904.jpeg?auto=compress&cs=tinysrgb&w=600"
              }
            ].map((style, index) => (
              <motion.div
                key={`gallery-${index}`}
                whileHover={{ y: -5, scale: 1.02 }}
                className="rounded-lg overflow-hidden shadow border border-gray-200"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={style.image}
                    alt={style.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-white p-2 text-center">
                  <p className="text-xs font-medium truncate">{style.label}</p>
                </div>
              </motion.div>
            ))}
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
              
              <h3 className="text-2xl font-bold">Upload Reference Images For Personalization</h3>
              
              <p className="text-gray-700">
                Take personalization to the next level by uploading reference images. Our AI will 
                use them as inspiration to generate action figures, Ghibli-style scenes, memes, 
                and other content personalized with your customer's name, company, and details.
              </p>
              
              <div className="pt-2">
                <Link to="/editor" className="btn btn-primary flex items-center inline-flex">
                  Try Personalized Image-to-Image <ArrowRight className="ml-2 w-4 h-4" />
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