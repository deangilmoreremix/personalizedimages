import React, { useState, useEffect } from 'react';
import { WrestlingActionFigureGenerator } from '../../components/WrestlingActionFigureGenerator';
import { HowItWorks } from '../../components/HowItWorks';
import { FAQ } from '../../components/FAQ';
import { CTASection } from '../../components/CTASection';
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Box, ArrowRight, Trophy, Star, Medal, Bolt, Sparkles, Flame, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FloatingShape } from '../../components/FloatingElements';

// Animated feature card component
const FeatureCard = ({ title, description, icon, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { delay: 0.1 * index, duration: 0.5 }
      });
    }
  }, [controls, inView, index]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      whileHover={{ 
        y: -10,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      transition={{ duration: 0.2 }}
      className="bg-white p-6 rounded-lg shadow-md relative overflow-hidden"
    >
      <motion.div 
        className="absolute -right-10 -bottom-10 text-red-100 opacity-30 transform rotate-12"
        animate={{ 
          rotate: [12, 0, 12],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: "mirror"
        }}
      >
        {icon}
      </motion.div>
      
      <div className="relative z-10">
        <div className="mb-4 p-2 bg-red-100 rounded-full w-12 h-12 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-bold text-xl mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

// Floating animation component
const FloatingElement = ({ children, delay = 0, duration = 6, className = "", x = 10, y = 15 }) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.3 }}
    transition={{ delay, duration: 0.5 }}
  >
    <motion.div
      animate={{
        y: [`-${y}px`, `${y}px`, `-${y}px`],
        x: [`-${x}px`, `${x}px`, `-${x}px`],
        rotate: [0, 5, 0, -5, 0],
      }}
      transition={{
        repeat: Infinity,
        repeatType: "mirror",
        duration,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  </motion.div>
);

// Animated list item component
const AnimatedListItem = ({ children, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
  return (
    <motion.li 
      ref={ref}
      className="flex items-start"
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ delay: 0.2 + (index * 0.1) }}
    >
      <motion.div 
        className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-700 mr-2 mt-0.5 flex-shrink-0"
        whileHover={{ scale: 1.2, backgroundColor: "#fee2e2" }}
      >
        ✓
      </motion.div>
      <span>{children}</span>
    </motion.li>
  );
};

const WrestlingActionFigurePage = () => {
  const controls = useAnimation();
  const [headerRef, headerInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const { scrollYProgress } = useScroll();
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);
  const titleY = useTransform(scrollYProgress, [0, 0.1], [0, -20]);
  
  // Gallery carousel logic
  const [activeIndex, setActiveIndex] = useState(0);
  const wrestlerImages = [
    {
      name: "Hulk Hogan",
      image: "https://images.pexels.com/photos/2752499/pexels-photo-2752499.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      name: "Stone Cold",
      image: "https://images.pexels.com/photos/981844/pexels-photo-981844.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      name: "Undertaker",
      image: "https://images.pexels.com/photos/1308468/pexels-photo-1308468.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      name: "John Cena",
      image: "https://images.pexels.com/photos/6918526/pexels-photo-6918526.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];
  
  // Advance carousel every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % wrestlerImages.length);
    }, 3000);
    
    return () => clearInterval(timer);
  }, [wrestlerImages.length]);
  
  useEffect(() => {
    if (headerInView) {
      controls.start("visible");
    }
  }, [controls, headerInView]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingElement delay={0.2} x={15} y={25} className="top-20 left-[10%]">
          <Trophy className="w-24 h-24 text-red-200" />
        </FloatingElement>
        
        <FloatingElement delay={1.2} x={20} y={15} duration={8} className="top-40 right-[15%]">
          <Dumbbell className="w-20 h-20 text-orange-200" />
        </FloatingElement>
        
        <FloatingElement delay={0.7} x={10} y={30} duration={7} className="bottom-20 left-[20%]">
          <Medal className="w-16 h-16 text-yellow-200" />
        </FloatingElement>
        
        <FloatingElement delay={1.8} x={25} y={10} duration={9} className="bottom-40 right-[25%]">
          <Flame className="w-36 h-36 text-red-200" />
        </FloatingElement>
        
        {/* Background shapes */}
        <FloatingShape 
          shape="blob" 
          size="180px" 
          color="rgba(239, 68, 68, 0.1)" 
          x={15} y={25} 
          duration={7}
          className="top-1/4 right-1/3" 
        />
        
        <FloatingShape 
          shape="circle" 
          size="150px" 
          color="rgba(249, 115, 22, 0.05)" 
          x={20} y={15} 
          delay={1.5} 
          duration={8}
          className="bottom-1/3 left-1/5" 
        />
        
        <FloatingShape 
          shape="square" 
          size="100px" 
          color="rgba(234, 88, 12, 0.1)" 
          x={15} y={20} 
          delay={2} 
          duration={6.5}
          className="top-2/3 right-1/4" 
        />
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full filter blur-3xl opacity-30 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-100 rounded-full filter blur-3xl opacity-30 transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          ref={headerRef}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <motion.div
            variants={itemVariants}
            className="mb-4"
          >
            <span className="inline-block px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              <motion.span
                animate={{ 
                  scale: [1, 1.05, 1],
                  backgroundColor: [
                    "rgba(254, 226, 226, 1)", // red-100
                    "rgba(254, 202, 202, 1)", // red-200
                    "rgba(254, 226, 226, 1)", // red-100
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "mirror"
                }}
                className="inline-block px-1 rounded"
              >
                NEW FEATURE
              </motion.span>
            </span>
          </motion.div>
          
          <motion.div style={{ opacity: titleOpacity, y: titleY }}>
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              Wrestling Legend Action Figures
            </motion.h1>
            
            <motion.div 
              variants={itemVariants}
              initial={{ width: 0 }}
              animate={{ width: '120px' }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto mb-6 rounded-full"
            ></motion.div>
            
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Transform the biggest names in professional wrestling into collectible action figures 
              with authentic packaging, signature accessories, and iconic poses.
            </motion.p>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-16 relative overflow-hidden"
        >
          {/* Animated shine effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-100/20 to-transparent"
            animate={{ 
              x: ['-100%', '100%'],
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              repeatType: "loop",
              ease: "linear",
              delay: 2
            }}
          />
          
          <WrestlingActionFigureGenerator
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
            title="How To Create Your Wrestling Action Figure" 
            steps={[
              { title: "Choose Your Wrestling Legend", description: "Select from iconic wrestling superstars spanning different eras, from 80s classics to modern-day legends." },
              { title: "Customize Your Figure", description: "Add signature accessories, select iconic poses, and customize packaging to create the perfect wrestling collectible." },
              { title: "Add a Reference Image", description: "Upload a photo to help our AI create a more personalized action figure (optional but recommended)." },
              { title: "Generate & Download", description: "Let our AI create your custom wrestling action figure and download the high-quality image for use anywhere." }
            ]} 
          />
        </motion.div>
        
        {/* Feature Details Section */}
        <div className="my-16 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16"
          >
            <div>
              <div className="flex items-center mb-4">
                <motion.div 
                  className="p-2 bg-red-100 rounded-lg mr-4"
                  whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Box className="w-6 h-6 text-red-600" />
                </motion.div>
                <h3 className="text-2xl font-bold">Iconic Wrestling Legends</h3>
              </div>
              
              <p className="text-gray-700 mb-4">
                Choose from legendary wrestling superstars spanning multiple eras, each with their 
                signature style, iconic poses, and authentic packaging designs.
              </p>
              
              <ul className="space-y-2">
                {[
                  "Golden Era icons like Hulk Hogan and Andre the Giant",
                  "Attitude Era stars like Stone Cold and The Rock",
                  "Modern legends like John Cena and Brock Lesnar",
                  "Technical masters, high-flyers, and powerhouses"
                ].map((item, index) => (
                  <AnimatedListItem key={index} index={index}>
                    {item}
                  </AnimatedListItem>
                ))}
              </ul>
            </div>
            
            <motion.div 
              className="rounded-xl overflow-hidden shadow-lg"
              whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <img 
                src="https://images.pexels.com/photos/1277410/pexels-photo-1277410.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Wrestling Action Figure Example" 
                className="w-full h-auto"
              />
              <motion.div 
                className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <span className="text-xs font-medium text-red-700 flex items-center">
                  <Trophy className="w-3 h-3 mr-1" />
                  Wrestling Legend
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16"
          >
            <div className="order-2 md:order-1">
              <motion.div 
                className="rounded-xl overflow-hidden shadow-lg relative"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <motion.img 
                  src="https://images.pexels.com/photos/1646113/pexels-photo-1646113.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Wrestling Accessories Example" 
                  className="w-full h-auto"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div 
                  className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <span className="text-xs font-medium text-orange-700 flex items-center">
                    <Bolt className="w-3 h-3 mr-1" />
                    Authentic Accessories
                  </span>
                </motion.div>
              </motion.div>
            </div>
            
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-4">
                <motion.div 
                  className="p-2 bg-orange-100 rounded-lg mr-4"
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Box className="w-6 h-6 text-orange-600" />
                </motion.div>
                <h3 className="text-2xl font-bold">Signature Accessories</h3>
              </div>
              
              <p className="text-gray-700 mb-4">
                Each wrestling figure comes with character-specific accessories, entrance gear, 
                and authentic packaging that pays homage to different wrestling eras.
              </p>
              
              <ul className="space-y-2">
                {[
                  "Championship belts from various promotions",
                  "Signature weapons like steel chairs and sledgehammers",
                  "Entrance gear and iconic props",
                  "Era-appropriate packaging and display elements"
                ].map((item, index) => (
                  <AnimatedListItem key={index} index={index}>
                    {item}
                  </AnimatedListItem>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
        
        {/* Wrestling Legend Gallery */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Featured Wrestling Legends</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From technical masters to high-flyers, powerhouses to charismatic showmen, 
              our collection spans the most iconic wrestlers in history.
            </p>
          </div>
          
          <div className="relative overflow-hidden">
            <motion.div 
              className="flex items-center justify-center"
              animate={{
                x: activeIndex === 0 ? [0, 0] : [-activeIndex * 100 + '%', -activeIndex * 100 + '%']
              }}
              transition={{ duration: 0.5 }}
            >
              {wrestlerImages.map((wrestler, index) => (
                <div 
                  key={index} 
                  className="min-w-full px-4 flex justify-center"
                >
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="rounded-xl overflow-hidden shadow-lg w-full max-w-md"
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={wrestler.image}
                        alt={wrestler.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                        <div className="p-6 w-full">
                          <h3 className="text-2xl font-bold text-white">{wrestler.name}</h3>
                          <div className="flex mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </motion.div>
            
            {/* Carousel indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {wrestlerImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeIndex === index ? 'bg-red-500 w-6' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show wrestler ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link 
              to="/editor" 
              className="btn btn-primary inline-flex items-center px-8 bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explore All Wrestling Legends 
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.5 }}
                className="ml-2"
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Use Cases */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-8 shadow-sm"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Marketing Applications</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Wrestling action figures create exciting opportunities for fan engagement, content creation, and promotional campaigns.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Wrestling Event Promotion",
                description: "Create custom action figures to promote upcoming events, PPVs, or special matches.",
                icon: <Trophy className="w-8 h-8 text-red-500" />
              },
              {
                title: "Fan Engagement",
                description: "Generate personalized action figures of fans with their favorite wrestlers for social media campaigns.",
                icon: <Star className="w-8 h-8 text-orange-500" />
              },
              {
                title: "Merchandise Concepts",
                description: "Develop visual concepts for potential wrestling merchandise and collectibles.",
                icon: <Box className="w-8 h-8 text-red-500" />
              },
              {
                title: "Anniversary Celebrations",
                description: "Create nostalgic content for wrestling anniversaries, retirements, or hall of fame inductions.",
                icon: <Medal className="w-8 h-8 text-orange-500" />
              },
              {
                title: "Content Creation",
                description: "Generate unique visuals for wrestling podcasts, blogs, and YouTube channels.",
                icon: <Bolt className="w-8 h-8 text-red-500" />
              },
              {
                title: "Themed Events",
                description: "Create custom imagery for wrestling watch parties, conventions, or fantasy booking scenarios.",
                icon: <Flame className="w-8 h-8 text-orange-500" />
              }
            ].map((useCase, index) => (
              <FeatureCard
                key={index}
                title={useCase.title}
                description={useCase.description}
                icon={useCase.icon}
                index={index}
              />
            ))}
          </div>
        </motion.div>
        
        <FAQ
          title="Frequently Asked Questions"
          faqs={[
            {
              question: "How accurate will the wrestling action figure resemble the actual wrestler?",
              answer: "Our AI creates stylized action figure interpretations that capture the iconic look, attire, and poses of legendary wrestlers while adapting them to classic toy aesthetics. The result will be recognizable to wrestling fans but presented in authentic action figure style with nostalgic packaging."
            },
            {
              question: "Can I customize the packaging and accessories?",
              answer: "Yes! Each wrestling legend comes with suggested era-appropriate accessories and packaging that matches their character, but you can customize these elements to create your perfect wrestling collectible or focus on specific matches and moments."
            },
            {
              question: "What can I use these wrestling action figure images for?",
              answer: "These images are perfect for social media posts, wrestling fan sites, event promotions, fantasy match concepts, wrestling podcasts, and any creative marketing related to professional wrestling. They create engaging, nostalgia-driven content that resonates with wrestling fans."
            },
            {
              question: "Can I request a wrestler that's not in your list?",
              answer: "While our interface offers a selection of iconic wrestling legends, you can use the custom prompt field to describe any wrestler not on our list. For best results, include details about their signature look, finishing moves, entrance gear, and era."
            }
          ]}
        />
        
        <CTASection
          title="Ready to Create Wrestling Action Figures?"
          description="Transform legendary wrestlers into collectible action figures with our AI-powered generator."
          buttonText="Start Creating Now"
          buttonLink="/editor"
        />
      </div>
    </div>
  );
};

export default WrestlingActionFigurePage;