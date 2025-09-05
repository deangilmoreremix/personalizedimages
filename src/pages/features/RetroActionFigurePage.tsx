import React from 'react';
import { RetroActionFigureGenerator } from '../../components/RetroActionFigureGenerator';
import { HowItWorks } from '../../components/HowItWorks';
import { FAQ } from '../../components/FAQ';
import { CTASection } from '../../components/CTASection';
import { motion } from 'framer-motion';
import { Box, ArrowRight, Tv, Gamepad } from 'lucide-react';
import { Link } from 'react-router-dom';

const RetroActionFigurePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              NOSTALGIC COLLECTION
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            80s & 90s Retro Action Figures
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}  
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Create nostalgic action figures inspired by your favorite 80s and 90s cartoons, 
            complete with authentic packaging, accessories, and that classic toy store feel.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-16"
        >
          <RetroActionFigureGenerator
            tokens={{ 
              'FIRSTNAME': 'Sarah', 
              'LASTNAME': 'Johnson', 
              'COMPANY': 'TechVision', 
              'EMAIL': 'sarah@techvision.com'
            }}
            onImageGenerated={() => {}}
          />
        </motion.div>
        
        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <HowItWorks 
            title="How To Create Your Retro Action Figure" 
            steps={[
              { title: "Choose Your Character", description: "Select from 30 nostalgic characters from your favorite 80s and 90s cartoons and TV shows." },
              { title: "Customize Your Figure", description: "Add accessories, select poses, and customize packaging to create the perfect retro collectible." },
              { title: "Add a Reference Image", description: "Upload a photo to help our AI create a more personalized action figure (optional but recommended)." },
              { title: "Generate & Download", description: "Let our AI create your custom retro action figure and download the high-quality image for use anywhere." }
            ]} 
          />
        </motion.div>
        
        {/* Feature Details Section */}
        <div className="my-16 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16"
          >
            <div>
              <div className="flex items-center mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg mr-4">
                  <Tv className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold">Nostalgic Characters</h3>
              </div>
              
              <p className="text-gray-700 mb-4">
                Choose from 30 iconic characters from the golden age of cartoons and TV shows, 
                each with their signature style, accessories, and authentic packaging designs.
              </p>
              
              <ul className="space-y-2">
                {[
                  "Superhero figures like Batman and X-Men",
                  "Cartoon classics like DuckTales and TMNT",
                  "Sci-fi favorites like Transformers and ReBoot",
                  "Fantasy characters like He-Man and Thundercats"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 mr-2 mt-0.5 flex-shrink-0">
                      ✓
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Retro Action Figure Example" 
                className="w-full h-auto"
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16"
          >
            <div className="order-2 md:order-1 rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.pexels.com/photos/12211/pexels-photo-12211.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Retro Packaging Example" 
                className="w-full h-auto"
              />
            </div>
            
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <Box className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">Authentic Packaging</h3>
              </div>
              
              <p className="text-gray-700 mb-4">
                Each retro figure comes with era-appropriate packaging that perfectly captures the 
                nostalgic feel of 80s and 90s toy design, from blister packs to window boxes.
              </p>
              
              <ul className="space-y-2">
                {[
                  "Classic blister card packaging with character art",
                  "Window boxes with dioramas and backdrops",
                  "Collector's edition packaging with special features",
                  "Authentic toy branding and graphic design elements"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mr-2 mt-0.5 flex-shrink-0">
                      ✓
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
        
        {/* Character Gallery */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Featured Characters</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From superheroes to cartoon classics, our collection spans the most beloved 
              characters from the golden age of action figures.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                name: "Ninja Turtle",
                image: "https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                name: "Superhero",
                image: "https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                name: "Cartoon Classic",
                image: "https://images.pexels.com/photos/12211/pexels-photo-12211.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                name: "Fantasy Warrior",
                image: "https://images.pexels.com/photos/8345972/pexels-photo-8345972.jpeg?auto=compress&cs=tinysrgb&w=600"
              }
            ].map((character, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="rounded-xl overflow-hidden shadow-md"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 bg-white text-center">
                  <h3 className="font-bold">{character.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/editor" className="btn btn-primary inline-flex items-center px-8 bg-indigo-600 hover:bg-indigo-700">
              Explore All Characters <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
        
        {/* Use Cases */}
        <div className="mb-16 bg-gray-50 rounded-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Nostalgic Marketing Applications</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Retro action figures tap into powerful nostalgia that resonates with audiences who grew up in the 80s and 90s.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Nostalgia Marketing",
                description: "Create retro-themed campaigns that connect with audiences through childhood memories."
              },
              {
                title: "Social Media Engagement",
                description: "Generate shareable nostalgic content that drives engagement and conversations."
              },
              {
                title: "Themed Events",
                description: "Promote 80s/90s themed events with custom retro action figure imagery."
              },
              {
                title: "Product Launches",
                description: "Give modern products a nostalgic twist with retro action figure styling."
              },
              {
                title: "Content Creation",
                description: "Create unique visual content for blogs, videos, and social media about retro pop culture."
              },
              {
                title: "Personalized Gifts",
                description: "Create custom retro action figure images as unique personalized gifts."
              }
            ].map((useCase, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-xl mb-2">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <FAQ
          title="Frequently Asked Questions"
          faqs={[
            {
              question: "How accurate will the retro action figure look compared to the original characters?",
              answer: "Our AI creates stylized action figure interpretations that capture the essence and key visual elements of the original characters while adapting them to the classic action figure aesthetic of the 80s and 90s. The result will be recognizable but with that authentic toy store feel."
            },
            {
              question: "Can I customize the packaging and accessories?",
              answer: "Yes! Each character comes with suggested accessories and packaging styles that match their era and style, but you can customize these elements to create your perfect retro collectible."
            },
            {
              question: "What can I use these retro action figure images for?",
              answer: "These images are perfect for social media posts, nostalgia marketing campaigns, retro-themed events, content creation about 80s/90s pop culture, and any creative marketing that wants to tap into nostalgia."
            },
            {
              question: "Can I request a character that's not in your list?",
              answer: "While our interface offers 30 iconic characters from the 80s and 90s, you can use the custom prompt field to describe any character not on our list. For best results, include details about their signature look, show, and era."
            }
          ]}
        />
        
        <CTASection
          title="Ready to Create Retro Action Figures?"
          description="Transform your favorite 80s and 90s characters into nostalgic collectibles with our AI-powered generator."
          buttonText="Start Creating Now"
          buttonLink="/editor"
        />
      </div>
    </div>
  );
};

export default RetroActionFigurePage;