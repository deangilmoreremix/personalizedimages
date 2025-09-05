import React from 'react';
import { motion, useViewportScroll, useTransform } from 'framer-motion';
import { Image, ArrowRight, Upload, Sparkles, Camera, Box, Zap, MessageSquare, Shield, Code, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FloatingShape } from './FloatingElements';

const FeatureShowcase: React.FC = () => {
  // Scroll-based animations
  const { scrollYProgress } = useViewportScroll();
  const y = useTransform(scrollYProgress, [0.4, 0.6], [50, 0]);
  const opacity = useTransform(scrollYProgress, [0.4, 0.6], [0.6, 1]);

  const features = [
    {
      title: "Reference Image Upload",
      description: "Upload your own photos as the starting point for AI-generated content that matches your style.",
      icon: <Upload className="w-6 h-6 text-primary-500" />,
      image: "https://images.pexels.com/photos/4050299/pexels-photo-4050299.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      color: "from-primary-500 to-primary-700",
      delay: 0.1
    },
    {
      title: "Studio Ghibli Generator",
      description: "Create beautiful personalized scenes inspired by the magical world of Hayao Miyazaki.",
      icon: <Sparkles className="w-6 h-6 text-secondary-500" />,
      image: "https://images.pexels.com/photos/844297/pexels-photo-844297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      color: "from-secondary-500 to-secondary-700",
      delay: 0.2
    },
    {
      title: "Expanded Action Figure Styles",
      description: "Choose from 30 professionally designed action figure styles to create custom toys for your audience.",
      icon: <Box className="w-6 h-6 text-accent-500" />,
      image: "https://images.pexels.com/photos/12211/pexels-photo-12211.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      color: "from-accent-500 to-accent-700",
      delay: 0.3
    },
    {
      title: "AI-Enhanced Meme Creator",
      description: "Take your meme marketing to the next level with AI enhancements and personalization.",
      icon: <MessageSquare className="w-6 h-6 text-green-500" />,
      image: "https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      color: "from-green-500 to-green-700",
      delay: 0.4
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="section bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/370799/pexels-photo-370799.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] opacity-[0.02] bg-center bg-cover"></div>
      
      {/* Floating shapes background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingShape 
          shape="blob" 
          size="200px" 
          color="rgba(99, 102, 241, 0.03)" 
          x={30} y={20} 
          duration={20}
          className="top-10 right-10" 
        />
        
        <FloatingShape 
          shape="circle" 
          size="150px" 
          color="rgba(168, 85, 247, 0.03)" 
          x={25} y={30} delay={2} 
          duration={15}
          className="bottom-20 left-20" 
        />
        
        <FloatingShape 
          shape="triangle" 
          size="100px" 
          color="rgba(249, 115, 22, 0.03)" 
          x={15} y={25} delay={5} 
          duration={18}
          className="top-1/3 left-1/4" 
        />
      </div>
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-3 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
          >
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              NEW FEATURES
            </motion.span>
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 gradient-text-accent"
          >
            Introducing Our Latest AI-Powered Tools
          </motion.h2>
          
          <motion.div 
            initial={{ width: '0%' }}
            whileInView={{ width: '120px' }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6 rounded-full"
          ></motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Create amazing personalized content with our new image-to-image capabilities and expanded token system.
          </motion.p>
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              custom={index}
              className="feature-card card-3d overflow-hidden"
              whileHover={{ 
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-64 overflow-hidden rounded-t-xl">
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-90 mix-blend-multiply`}
                  whileHover={{
                    opacity: 0.75,
                    transition: { duration: 0.3 }
                  }}
                />
                
                <motion.img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover mix-blend-overlay"
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.5 }
                  }}
                />
                
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 flex items-end p-6"
                  initial={{ opacity: 0.9 }}
                  whileHover={{ opacity: 1 }}
                >
                  <div className="card-3d-content">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: feature.delay + 0.3, type: "spring" }}
                      className="bg-white p-3 rounded-full inline-block mb-3"
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-xl font-bold mb-1 text-white">{feature.title}</h3>
                  </div>
                </motion.div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Link
                  to="/editor"
                  className="text-primary-600 hover:text-primary-700 font-medium flex items-center group"
                >
                  Try it now 
                  <motion.div
                    className="ml-1"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ y, opacity }}
          className="glass-panel p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2 gradient-text">Extended Personalization Tokens</h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our expanded personalization system now includes more token types for deeper customization of your content.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { 
                title: "Security & Privacy", 
                description: "Your data stays protected with enterprise-grade security and comprehensive privacy controls",
                icon: <Shield className="w-5 h-5 text-red-500" />,
                color: "bg-red-50 text-red-800 border-red-100",
                animation: {
                  rotate: [-3, 3, -3],
                  y: [0, -5, 0]
                }
              },
              { 
                title: "Advanced Integrations", 
                description: "Connect with your existing tools through our powerful API and native integrations",
                icon: <Code className="w-5 h-5 text-blue-500" />,
                color: "bg-blue-50 text-blue-800 border-blue-100",
                animation: {
                  x: [-3, 3, -3],
                  y: [-2, 2, -2]
                }
              },
              { 
                title: "Creative Tools", 
                description: "Access professional-grade design tools and templates for stunning visuals",
                icon: <Palette className="w-5 h-5 text-purple-500" />,
                color: "bg-purple-50 text-purple-800 border-purple-100",
                animation: {
                  rotate: [3, -3, 3],
                  scale: [1, 1.05, 1]
                }
              },
              { 
                title: "Real-time Generation", 
                description: "Create personalized content on-the-fly with our high-performance AI models",
                icon: <Zap className="w-5 h-5 text-amber-500" />,
                color: "bg-amber-50 text-amber-800 border-amber-100",
                animation: {
                  y: [-4, 4, -4],
                  scale: [1, 1.03, 1]
                }
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className={`rounded-xl p-5 border hover:shadow-xl transition-all ${item.color}`}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <motion.div 
                  className="bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-4"
                  animate={item.animation}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 3 + index,
                    repeatDelay: 1
                  }}
                >
                  {item.icon}
                </motion.div>
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p className="text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/editor" className="btn btn-primary inline-flex items-center">
              <Zap className="mr-2 w-4 h-4" />
              Try New Features
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureShowcase;