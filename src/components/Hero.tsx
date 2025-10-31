import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Play, ArrowRight, Sparkles, MousePointer, Mail, BarChart2, Clock, TrendingUp, Users, Upload, Zap, Image, Check, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedIcons from './AnimatedIcons';
import { FloatingShape } from './FloatingElements';

const Hero: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPersonalizedContent, setShowPersonalizedContent] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    setIsInView(true);
    
    // Start the staggered animation sequence
    controls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.3 + (i * 0.1) }
    }));
  }, [controls]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      setShowPersonalizedContent(true);
    } else {
      // If fields are empty, just show personalized content as guest
      setShowPersonalizedContent(true);
    }
  };

  const floatingIcons = [
    { icon: <Sparkles className="text-purple-400" />, delay: 0 },
    { icon: <TrendingUp className="text-indigo-400" />, delay: 0.5 },
    { icon: <Mail className="text-blue-400" />, delay: 1 },
    { icon: <BarChart2 className="text-cyan-400" />, delay: 1.5 },
    { icon: <Users className="text-teal-400" />, delay: 2 },
    { icon: <Clock className="text-green-400" />, delay: 2.5 },
  ];

  return (
    <section className="pt-28 pb-20 md:pt-32 md:pb-24 bg-gradient-to-br from-primary-50/50 to-secondary-50/50 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-accent-200/10 rounded-full mix-blend-multiply filter blur-3xl animate-float animation-delay-3000"></div>
        
        <AnimatedIcons iconType="mixed" density="high" />
        
        {/* Additional floating shapes */}
        <FloatingShape 
          shape="blob" 
          size="120px" 
          color="rgba(125, 100, 255, 0.1)" 
          x={15} y={20} delay={1.2} 
          duration={7}
          className="top-1/4 right-1/4" 
        />
        
        <FloatingShape 
          shape="circle" 
          size="80px" 
          color="rgba(255, 122, 0, 0.1)" 
          x={20} y={15} delay={0.5} 
          duration={8}
          className="bottom-1/3 left-1/5" 
        />
        
        <FloatingShape 
          shape="triangle" 
          size="60px" 
          color="rgba(0, 200, 255, 0.1)" 
          x={15} y={25} delay={2} 
          duration={9}
          className="top-1/3 right-1/5" 
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute -right-16 -top-12 text-accent-500 rotate-12 hidden md:block"
            >
              <MousePointer className="w-8 h-8" />
              <div className="absolute -top-12 -right-8 w-24 border-t-2 border-dashed border-accent-500 rotate-12"></div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute -right-64 top-0 text-sm font-medium"
              >
                Personalize for each user!
              </motion.p>
            </motion.div>

            <motion.span
              className="inline-block mb-3 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Hyper-Personalized Content
            </motion.span>
            
            <h1 className="mb-6 leading-tight">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-primary-600 inline-block mb-2"
              >
                Create 1:1 Personalized Experiences
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="inline-block"
              >
                That Drive {" "}
              </motion.span>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.7 }}
                className="gradient-text relative"
              >
                985% Higher Conversion Rates
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1.4, duration: 0.8 }}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                ></motion.div>
              </motion.span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="text-lg mb-8 text-gray-700"
            >
              Your customers expect personalized content, from images to emails to marketing materials. VideoRemix helps you deliver individualized experiences with AI-powered, token-based personalization that transforms generic content into 1:1 connections.
            </motion.p>

            {!showPersonalizedContent ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="glass-panel p-6 mb-8"
              >
                <h3 className="text-xl mb-4 text-center">
                  Get your personalized content example
                </h3>
                <p className="text-sm text-gray-500 mb-6 text-center">
                  Enter your information below to see how personalization transforms content just for you.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your First Name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <motion.button 
                    type="submit" 
                    className="btn btn-primary w-full flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Create My Personalized Content
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-panel p-6 mb-8"
              >
                <div className="text-center">
                  <motion.h3 
                    className="text-2xl mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Hello, <motion.span 
                      className="gradient-text font-bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >{name || 'there'}!</motion.span>
                  </motion.h3>
                  <motion.p 
                    className="mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Here's your personalized content. Imagine sending this level of personalization to all your customers!
                  </motion.p>
                  <motion.div 
                    className="relative overflow-hidden bg-gradient-to-r from-primary-500 to-secondary-600 p-6 rounded-xl text-white text-center mb-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <motion.div 
                      className="absolute -top-10 -right-10 w-20 h-20 bg-white/20 rounded-full mix-blend-overlay filter blur-xl"
                      animate={{ 
                        x: [0, 20, 0],
                        y: [0, -20, 0],
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 8,
                        ease: "easeInOut"
                      }}
                    ></motion.div>
                    <motion.div 
                      className="absolute -bottom-10 -left-10 w-20 h-20 bg-white/20 rounded-full mix-blend-overlay filter blur-xl"
                      animate={{ 
                        x: [0, -20, 0],
                        y: [0, 20, 0],
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 8,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    ></motion.div>
                    <p className="text-xl font-bold mb-2 relative z-10">Welcome aboard, {name || 'there'}!</p>
                    <p className="relative z-10">We've personalized your entire experience. Each image, template, and creative asset will now include your personal details automatically.</p>
                    <Sparkles className="absolute top-3 right-3 w-5 h-5 text-white/70" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Link 
                      to="/editor" 
                      className="btn btn-primary flex items-center justify-center mx-auto"
                    >
                      Create Your Personalized Content
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )}

            <div className="flex flex-wrap gap-2">
              {[
                { icon: <ShieldCheck className="w-4 h-4" />, text: "Personalized for Every Customer" },
                { icon: <Zap className="w-4 h-4" />, text: "985% Higher Conversion Rates" },
                { icon: <Check className="w-4 h-4" />, text: "No Credit Card Required" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="flex items-center space-x-1.5 text-sm text-gray-600 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full"
                >
                  <motion.span 
                    className="text-primary-600"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatDelay: 3,
                      duration: 1
                    }}
                  >
                    {item.icon}
                  </motion.span>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block relative"
          >
            {/* Animated gradient background */}
            <motion.div 
              className="absolute inset-0 rounded-xl overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <motion.div 
                className="absolute -top-10 -left-10 w-40 h-40 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{ 
                  y: [0, -20, 0],
                  x: [0, 20, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  duration: 8,
                  ease: "easeInOut"
                }}
              />
              
              <motion.div 
                className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{ 
                  y: [0, 20, 0],
                  x: [0, -20, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  duration: 10,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
              
              <motion.div 
                className="absolute top-1/3 -right-10 w-24 h-24 bg-accent-200 rounded-full mix-blend-multiply filter blur-lg opacity-70"
                animate={{ 
                  y: [0, 30, 0],
                  x: [0, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  duration: 12,
                  ease: "easeInOut",
                  delay: 2
                }}
              />
            </motion.div>
            
            {/* New feature highlight */}
            <motion.div
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute -right-8 top-1/3 glass-panel py-2 px-3 rounded-lg shadow-lg z-20 flex items-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatDelay: 2,
                  duration: 1 
                }}
              >
                <Upload className="text-primary-500 w-4 h-4 mr-2" />
              </motion.div>
              <span className="text-xs">Personalized Reference Images</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30, x: -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="absolute -left-10 top-2/3 glass-panel py-2 px-3 rounded-lg shadow-lg z-20 flex items-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatDelay: 3,
                  duration: 1,
                  delay: 0.5
                }}
              >
                <Zap className="text-secondary-500 w-4 h-4 mr-2" />
              </motion.div>
              <span className="text-xs">Personalized AI Generation</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.6 }}
              className="absolute -left-8 bottom-1/4 glass-panel py-2 px-3 rounded-lg shadow-lg z-20 flex items-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatDelay: 4,
                  duration: 1.5,
                  delay: 1
                }}
              >
                <Image className="text-accent-500 w-4 h-4 mr-2" />
              </motion.div>
              <span className="text-xs">Dynamic Personalization Tokens</span>
            </motion.div>
            
            {/* Card stack effect */}
            <motion.div
              initial={{ rotateZ: 10, y: 30, opacity: 0 }}
              animate={{ rotateZ: 6, y: 15, opacity: 0.7 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute right-4 top-8 w-[85%] h-[80%] bg-white/30 backdrop-blur-sm rounded-xl shadow-lg border border-white/40"
            ></motion.div>
            
            <motion.div
              initial={{ rotateZ: -8, y: 20, opacity: 0 }}
              animate={{ rotateZ: -4, y: 8, opacity: 0.8 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute left-4 bottom-8 w-[85%] h-[80%] bg-white/40 backdrop-blur-sm rounded-xl shadow-lg border border-white/40"
            ></motion.div>
            
            {/* Main image */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="relative z-10 responsive-image"
            >
              <motion.div 
                className="absolute -top-6 -left-6 text-accent-500"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.5, type: "spring" }}
              >
                <Sparkles className="w-12 h-12" />
              </motion.div>
              
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Team collaboration with personalized content"
                className="rounded-xl shadow-xl relative z-10"
              />
            </motion.div>

            {/* Floating annotations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="absolute -right-12 top-1/4 glass-panel py-2 px-3 rounded-lg shadow-lg flex items-center z-20 text-sm"
            >
              <TrendingUp className="text-success-500 w-4 h-4 mr-2" />
              <span>+985% CTR</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.6 }}
              className="absolute -left-8 bottom-1/3 glass-panel py-2 px-3 rounded-lg shadow-lg flex items-center z-20 text-sm"
            >
              <Users className="text-primary-500 w-4 h-4 mr-2" />
              <span>Personalized for Each User</span>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="mt-16 max-w-5xl mx-auto text-center"
        >
          <div className="glass-panel p-6">
            <h3 className="text-xl font-semibold mb-2">New for 2025: Hyper-Personalized Content Creation</h3>
            <p className="text-gray-700 mb-4">
              Our AI-powered personalization engine transforms generic content into custom-tailored experiences for each individual customer.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <motion.span
                className="glow-badge px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm"
                whileHover={{ y: -3 }}
                variants={{
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 }
                }}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.1 }}
              >
                1:1 Personalization
              </motion.span>
              <motion.span
                className="glow-badge px-3 py-1.5 bg-secondary-50 text-secondary-600 rounded-full text-sm"
                whileHover={{ y: -3 }}
                variants={{
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 }
                }}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.2 }}
              >
                Dynamic Content Tokens
              </motion.span>
              <motion.span
                className="glow-badge px-3 py-1.5 bg-accent-50 text-accent-600 rounded-full text-sm"
                whileHover={{ y: -3 }}
                variants={{
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 }
                }}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 }}
              >
                985% Higher Engagement
              </motion.span>
              <motion.span
                className="glow-badge px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-sm"
                whileHover={{ y: -3 }}
                variants={{
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 }
                }}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.4 }}
              >
                Multi-Channel Personalization
              </motion.span>
              <motion.span
                className="glow-badge px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-sm"
                whileHover={{ y: -3 }}
                variants={{
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 }
                }}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.5 }}
              >
                AI-Powered Relevance
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;