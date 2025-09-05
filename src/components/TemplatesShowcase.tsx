import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Image, Video, Play, ArrowRight, Sparkles, Zap, Camera, FileVideo } from 'lucide-react';
import ActionFigureCarousel from './ActionFigureCarousel';

// Updated modern template images
const imageTemplates = [
  'https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/5858167/pexels-photo-5858167.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
];

const videoTemplates = [
  'https://images.pexels.com/photos/8857185/pexels-photo-8857185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/6224/hands-people-woman-working.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/4050299/pexels-photo-4050299.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
];

const mediaTypes = [
  'Video', 'YouTube', 'Vimeo', 'Audio', 'Clyp.it', 'SoundCloud', 
  'Giphy', 'Images', 'Flickr', 'Youzign', 'Stock Photos', 'Custom Uploads'
];

// Action figure style preview images for the small gallery
const actionFigurePreviewImages = [
  {
    label: "AI Collectible Card",
    image: "https://images.pexels.com/photos/7241628/pexels-photo-7241628.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    label: "Boxed Toy Mockup",
    image: "https://images.pexels.com/photos/12211/pexels-photo-12211.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    label: "3D Turntable Character",
    image: "https://images.pexels.com/photos/2115977/pexels-photo-2115977.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    label: "Stylized Vinyl Toy",
    image: "https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    label: "Superhero Toy Series",
    image: "https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    label: "Food-Themed Fighter",
    image: "https://images.pexels.com/photos/3696150/pexels-photo-3696150.jpeg?auto=compress&cs=tinysrgb&w=600"
  }
];

const TemplatesShowcase: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video');
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const mediaTypeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({ 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: 0.2 + i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
  };

  return (
    <section className="section relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      </div>

      <div className="container-custom relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-6 inline-block"
          >
            <span className="px-4 py-1.5 bg-accent-100 text-accent-700 rounded-full text-sm font-medium">
              Ready-to-use templates
            </span>
          </motion.div>
          
          <h2 className="mb-4">High Converting Done-For-You Templates</h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '100px' }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="h-1 bg-accent-500 mx-auto mb-6 rounded-full"
          ></motion.div>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            50+ templates to impress your prospects. Increase sales by getting to know your clients better 
            and providing them with a personalized experience.
          </p>
        </motion.div>

        {/* Tabs for template types */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-100 p-1 rounded-full inline-flex">
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium flex items-center ${
                activeTab === 'video' 
                  ? 'bg-white shadow-md text-primary-700' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
              onClick={() => setActiveTab('video')}
            >
              <FileVideo className="w-4 h-4 mr-2" />
              Video Templates
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium flex items-center ${
                activeTab === 'image' 
                  ? 'bg-white shadow-md text-primary-700' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
              onClick={() => setActiveTab('image')}
            >
              <Image className="w-4 h-4 mr-2" />
              Image Templates
            </button>
          </div>
        </div>

        <motion.div 
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-10 mb-16"
        >
          <motion.div 
            variants={itemVariants}
            className="card overflow-hidden group"
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
          >
            <div className="grid grid-cols-3 gap-2 aspect-video rounded-lg overflow-hidden mb-6 relative">
              {videoTemplates.map((src, index) => (
                <div key={index} className="relative overflow-hidden">
                  <img 
                    src={src}
                    alt={`Video template ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
                className="absolute left-4 bottom-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center text-xs font-medium text-primary-700"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                50+ Templates
              </motion.div>
            </div>
            
            <h3 className="text-2xl font-bold mb-3 flex items-center">
              Video Personalization Templates
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="ml-2"
              >
                <Zap className="h-5 w-5 text-accent-500" />
              </motion.div>
            </h3>
            <p className="text-gray-600 mb-6">
              Engage your audience with dynamic personalized videos that speak directly to each viewer, 
              increasing engagement and conversion rates.
            </p>
            <a href="#" className="btn btn-outline flex items-center justify-center group-hover:bg-primary-50 transition-colors">
              <Play className="h-5 w-5 mr-2" />
              <span>Check 50+ video personalization templates</span>
              <motion.div
                className="ml-2"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </a>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="card overflow-hidden group"
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
          >
            <div className="grid grid-cols-3 gap-2 aspect-video rounded-lg overflow-hidden mb-6 relative">
              {imageTemplates.map((src, index) => (
                <div key={index} className="relative overflow-hidden">
                  <img 
                    src={src}
                    alt={`Image template ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
                className="absolute left-4 bottom-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center text-xs font-medium text-secondary-700"
              >
                <Camera className="w-3 h-3 mr-1" />
                40+ Templates
              </motion.div>
            </div>
            
            <h3 className="text-2xl font-bold mb-3 flex items-center">
              Image Personalization Templates
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, type: "spring" }}
                className="ml-2"
              >
                <Sparkles className="h-5 w-5 text-secondary-500" />
              </motion.div>
            </h3>
            <p className="text-gray-600 mb-6">
              Create eye-catching personalized images that stand out in crowded inboxes and social feeds,
              driving higher click-through rates.
            </p>
            <a href="#" className="btn btn-outline flex items-center justify-center group-hover:bg-primary-50 transition-colors">
              <Image className="h-5 w-5 mr-2" />
              <span>Check 40+ image personalization templates</span>
              <motion.div
                className="ml-2"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </a>
          </motion.div>
        </motion.div>
        
        {/* Action Figure Styles Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium inline-block mb-4"
            >
              NEW FEATURE
            </motion.span>
            <h3 className="text-2xl font-bold mb-3">Personalized Action Figure Styles</h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Create custom action figures with your clients' names. Choose from 30+ premium styles to delight your audience.
            </p>
          </div>
          
          <div className="group">
            <ActionFigureCarousel className="max-w-4xl mx-auto shadow-xl rounded-2xl overflow-hidden" />
            
            {/* Style Gallery Preview */}
            <div className="mt-8 max-w-4xl mx-auto">
              <h4 className="text-lg font-medium text-center mb-4">Popular Action Figure Styles</h4>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {actionFigurePreviewImages.map((style, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="overflow-hidden rounded-lg shadow-md"
                  >
                    <img 
                      src={style.image}
                      alt={style.label}
                      className="w-full h-28 object-cover"
                    />
                    <div className="bg-white p-2 text-center">
                      <p className="text-xs font-medium truncate">{style.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="text-center mt-6">
              <motion.a
                href="/editor"
                className="btn btn-primary inline-flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Create Your Action Figure
                <ArrowRight className="w-4 h-4 ml-2" />
              </motion.a>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold mb-8">VideoRemix Integrates Wide Range of Media</h3>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {mediaTypes.map((media, index) => (
              <motion.span 
                key={index}
                custom={index}
                variants={mediaTypeVariants}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  backgroundColor: index % 3 === 0 ? "#ddd6fe" : (index % 3 === 1 ? "#e0e7ff" : "#fff7ed"),
                  color: index % 3 === 0 ? "#6d28d9" : (index % 3 === 1 ? "#4338ca" : "#c2410c"),
                }}
                className="px-4 py-2 bg-white rounded-full text-gray-700 shadow-sm border border-gray-200"
              >
                {media}
              </motion.span>
            ))}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-12 max-w-lg mx-auto"
          >
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
              <p className="text-primary-700 font-medium">
                Create once, deploy everywhere. VideoRemix seamlessly integrates with all your favorite platforms.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TemplatesShowcase;