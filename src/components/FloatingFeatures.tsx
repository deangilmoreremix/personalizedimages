import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Camera, Image as ImageIcon, Box, MessageSquare, Paintbrush, Upload, Music, Tv, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FloatingShape } from './FloatingElements';

const FloatingFeatures: React.FC = () => {
  const features = [
    {
      icon: <Paintbrush className="w-5 h-5 text-indigo-600" />,
      title: "Personalized Cartoon Styles",
      description: "Transform photos into 20+ cartoon styles",
      link: "/features/cartoon-style",
      color: "bg-indigo-500",
      delay: 0.1
    },
    {
      icon: <Box className="w-5 h-5 text-purple-600" />,
      title: "Personalized Action Figures",
      description: "Create personalized action figures",
      link: "/features/action-figures",
      color: "bg-purple-500",
      delay: 0.2
    },
    {
      icon: <Tv className="w-5 h-5 text-blue-600" />,
      title: "Personalized Retro Figures",
      description: "80s & 90s nostalgic action figures",
      link: "/features/retro-action-figures",
      color: "bg-blue-500",
      delay: 0.3
    },
    {
      icon: <Music className="w-5 h-5 text-pink-600" />,
      title: "Personalized Music Stars",
      description: "Turn musicians into action figures",
      link: "/features/music-star-action-figures",
      color: "bg-pink-500",
      delay: 0.4
    },
    {
      icon: <Tv className="w-5 h-5 text-cyan-600" />,
      title: "Personalized TV Characters",
      description: "TV show character action figures",
      link: "/features/tv-show-action-figures",
      color: "bg-cyan-500",
      delay: 0.45
    },
    {
      icon: <Dumbbell className="w-5 h-5 text-red-600" />,
      title: "Personalized Wrestling Figures",
      description: "Wrestling legend action figures",
      link: "/features/wrestling-action-figures",
      color: "bg-red-500", 
      delay: 0.5
    },
    {
      icon: <Sparkles className="w-5 h-5 text-blue-600" />,
      title: "Personalized Ghibli Style",
      description: "Generate magical Ghibli-inspired scenes",
      link: "/features/ghibli-style",
      color: "bg-blue-500",
      delay: 0.55
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-green-600" />,
      title: "Personalized Meme Generator",
      description: "Create personalized, shareable memes",
      link: "/features/meme-generator",
      color: "bg-green-500",
      delay: 0.6
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        delay: delay
      }
    })
  };

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-secondary-100 rounded-full mix-blend-multiply filter blur-xl"></div>
        
        <FloatingShape 
          shape="blob" 
          size="150px" 
          color="rgba(99, 102, 241, 0.05)" 
          x={20} y={20} 
          className="top-10 right-10" 
        />
        
        <FloatingShape 
          shape="circle" 
          size="100px" 
          color="rgba(79, 70, 229, 0.05)" 
          x={15} y={25} 
          className="bottom-20 left-20" 
        />
      </div>

      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center mb-12"
        >
          <motion.span
            animate={{ 
              background: [
                "linear-gradient(to right, #4f46e5, #7c3aed)",
                "linear-gradient(to right, #7c3aed, #ec4899)",
                "linear-gradient(to right, #ec4899, #4f46e5)"
              ]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="bg-clip-text text-transparent"
          >
            Discover Our Personalized AI-Powered Features
          </motion.span>
        </motion.h2>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={feature.delay}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 card-3d"
            >
              <div className={`w-12 h-12 rounded-lg ${feature.color.replace('bg-', 'bg-opacity-10 bg-')} flex items-center justify-center mb-4`}>
                <motion.div
                  animate={{ 
                    rotate: [-5, 5, -5],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                  className="text-current"
                >
                  {feature.icon}
                </motion.div>
              </div>
              
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
              
              <Link 
                to={feature.link} 
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
              >
                Explore {feature.title}
                <motion.div
                  className="ml-1"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-12 text-center"
        >
          <motion.div
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/editor"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md hover:shadow-lg"
            >
              <Zap className="mr-2 h-5 w-5" />
              Try All Features In Our Editor
              <motion.div
                className="ml-2"
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
          </motion.div>
          
          <motion.div
            whileInView={{ 
              opacity: [0, 1],
              y: [10, 0]
            }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <Link to="/editor" className="text-gray-500 hover:text-primary-600 text-sm inline-flex items-center">
              <Camera className="w-4 h-4 mr-1" />
              View all features
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FloatingFeatures;