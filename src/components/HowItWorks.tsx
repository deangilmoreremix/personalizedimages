import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, Facebook, Linkedin, TrendingUp, UserPlus, MousePointer, Zap, Award, Globe, Gift, Clock, Shield, Upload, Image, Sparkles, ArrowRight, Check, Star, Lightbulb, Camera, TrendingDown, Play, Wand2 } from 'lucide-react';

interface HowItWorksStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  example: string;
}

interface HowItWorksProps {
  title?: string;
  steps?: HowItWorksStep[];
}

const steps = [
  {
    id: 1,
    icon: <Image className="h-8 w-8 text-white" />,
    title: 'Add your personalization content',
    description: 'Upload your image or reference for AI generation with personalization tokens.',
    example: 'image_blank.jpg',
  },
  {
    id: 2,
    icon: <Sparkles className="h-8 w-8 text-white" />,
    title: 'Insert personalization tokens',
    description: 'Add dynamic tokens like [FIRSTNAME], [COMPANY], and [LOCATION] that will be replaced with your customer data.',
    example: 'Hello_placeholder.jpg',
  },
  {
    id: 3,
    icon: <Zap className="h-8 w-8 text-white" />,
    title: 'Watch personalization magic happen',
    description: 'Our AI personalizes the content for each recipient, creating a unique 1:1 experience that drives 985% higher engagement.',
    example: 'Hello_Firstname.jpg',
  },
];

const logos = [
  { id: 1, name: 'Shopify' },
  { id: 2, name: 'Adobe' },
  { id: 3, name: 'Microsoft' },
  { id: 4, name: 'Slack' },
  { id: 5, name: 'Salesforce' },
];

const additionalFeatures = [
  {
    icon: <Upload className="h-6 w-6 text-white" />,
    title: "Personalized Reference Images",
    description: "Use your own images as reference for AI-powered personalized generation",
    bgClass: "from-green-500 to-green-600",
  },
  {
    icon: <Image className="h-6 w-6 text-white" />,
    title: "Personalized Studio Ghibli Style",
    description: "Create whimsical Ghibli-inspired scenes with customer personalization",
    bgClass: "from-blue-500 to-blue-600",
  },
  {
    icon: <Wand2 className="h-6 w-6 text-white" />,
    title: "Enhanced Personalized Memes",
    description: "AI-powered meme creation with custom personalization for each customer",
    bgClass: "from-purple-500 to-purple-600",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-white" />,
    title: "Extended Personalization Tokens",
    description: "Over 40+ personalization tokens for customized 1:1 experiences",
    bgClass: "from-pink-500 to-pink-600",
  },
];

const HowItWorks: React.FC<HowItWorksProps> = ({ 
  title = "How to personalize content for each customer",
  steps = []
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [headerRef, headerInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const arrowVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: { opacity: 1, pathLength: 1, transition: { duration: 1.5, ease: "easeInOut", delay: 0.5 } }
  };

  const logoVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: 0.3 + i * 0.1,
        duration: 0.4,
      }
    }),
  };

  const iconElements = [
    <Zap key="zap" className="text-primary-400 w-6 h-6" />,
    <Award key="award" className="text-secondary-400 w-6 h-6" />,
    <Globe key="globe" className="text-accent-400 w-6 h-6" />,
    <Gift key="gift" className="text-green-400 w-6 h-6" />,
    <Clock key="clock" className="text-amber-400 w-6 h-6" />,
    <Shield key="shield" className="text-blue-400 w-6 h-6" />,
  ];

  // Use provided steps or default steps
  const displaySteps = steps.length > 0 ? 
    steps.map((step, index) => ({
      id: index + 1,
      icon: <Zap className="h-8 w-8 text-white" />,
      title: step.title,
      description: step.description,
      example: `step_${index + 1}.jpg`
    })) : 
    steps;

  return (
    <section id="how-it-works" className="section relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.pexels.com/photos/919278/pexels-photo-919278.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-[0.025] mix-blend-overlay"></div>
      
      {/* Floating icons in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {iconElements.map((icon, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={floatingIconVariants}
            animate="animate"
            className="absolute opacity-20"
            style={{
              top: `${10 + (i * 15)}%`,
              left: `${5 + (i * 15)}%`,
            }}
          >
            {icon}
          </motion.div>
        ))}
        {iconElements.map((icon, i) => (
          <motion.div
            key={i + 6}
            custom={i}
            variants={floatingIconVariants}
            animate="animate"
            className="absolute opacity-20"
            style={{
              top: `${5 + (i * 15)}%`,
              right: `${10 + (i * 12)}%`,
            }}
          >
            {icon}
          </motion.div>
        ))}
      </div>

      <div className="container-custom relative z-10">
        <motion.div 
          ref={headerRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={headerInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6 inline-block"
          >
            <span className="px-4 py-1.5 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium glow-badge">
              Personalization Made Easy
            </span>
          </motion.div>
          
          <h2 className="mb-4">{title}</h2>
          
          <motion.div
            initial={{ width: 0 }}
            animate={headerInView ? { width: '120px' } : { width: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6 rounded-full"
          ></motion.div>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create personalized experiences in three simple steps:
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8">What do you need to implement personalization?</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            {[
              'Should be convenient to use',
              'Work with your existing campaigns',
              'Work on SMS, Facebook, Linkedin, Email, and CRM',
              'Connect to your tools & apps',
              'No additional steps to implement',
              'Should be scaled-down and affordable'
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#ffffff"
                }}
                className="p-4 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 card-3d"
              >
                <motion.p 
                  className="text-gray-700"
                  animate={{ 
                    scale: [1, 1.02, 1],
                    opacity: [0.9, 1, 0.9]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatDelay: 5,
                    duration: 1.5,
                    delay: index * 0.5
                  }}
                >{item}</motion.p>
              </motion.div>
            ))}
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-xl font-semibold gradient-text">
              VideoRemix is an easy-to-use platform for personalized image creation.
            </p>
            <motion.a 
              href="#signup" 
              className="btn btn-primary mt-6 inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center">
                <span>Sign up now!</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </span>
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div 
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="relative"
        >
          {/* Connection lines between steps (visible on md and above) */}
          <svg className="absolute top-24 left-0 w-full h-20 hidden md:block">
            <motion.path
              d="M150 40 L440 40"
              stroke="url(#gradient1)"
              strokeWidth="3"
              strokeDasharray="6,6"
              fill="none"
              variants={arrowVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            />
            <motion.path
              d="M440 40 L730 40"
              stroke="url(#gradient2)"
              strokeWidth="3"
              strokeDasharray="6,6"
              fill="none"
              variants={arrowVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            />
            <motion.path
              d="M433 40 L445 30 L445 50 Z"
              fill="#8b5cf6"
              variants={arrowVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            />
            <motion.path
              d="M723 40 L735 30 L735 50 Z"
              fill="#4f46e5"
              variants={arrowVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            />
            
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6d28d9" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6d28d9" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="grid md:grid-cols-3 gap-8">
            {displaySteps.length > 0 ? (
              displaySteps.map((step, index) => (
                <motion.div 
                  key={step.id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="feature-card flex flex-col items-center text-center relative group"
                >
                  {/* Step number */}
                  <motion.div 
                    className="absolute -top-6 -right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold shadow-lg z-10"
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : { scale: 0 }}
                    transition={{ delay: 0.3 + index * 0.2, type: "spring", stiffness: 200 }}
                  >
                    {step.id}
                  </motion.div>
                  
                  {/* Icon with animated gradient */}
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-5 relative overflow-hidden group-hover:scale-110 transition-transform shadow-md"
                    initial={{ rotate: -5 }}
                    animate={{ rotate: 0 }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-primary-200/30 via-primary-100/10 to-primary-200/30"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    ></motion.div>
                    <div className="relative z-10">
                      {step.icon}
                    </div>
                  </motion.div>
                  
                  <h3 className="text-xl font-bold mb-3">Step {step.id}. {step.title}</h3>
                  <p className="text-gray-600 mb-6">{step.description}</p>
                  <div className="mt-auto bg-gray-100/80 p-4 rounded-lg w-full">
                    <motion.div 
                      className="bg-white p-4 rounded-lg border border-gray-200 group-hover:shadow-lg transition-shadow"
                      whileHover={{ y: -3 }}
                    >
                      {step.id === 1 && (
                        <motion.div 
                          className="h-14 bg-gray-50 rounded flex items-center justify-center text-gray-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 + index * 0.2 }}
                        >
                          <div className="flex gap-2 items-center">
                            <div>Original Content</div>
                            <div>or</div>
                            <div className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs flex items-center">
                              <Upload className="w-3 h-3 mr-1" />
                              Reference Image
                            </div>
                          </div>
                          <motion.div 
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            animate={{ rotate: [0, 10, 0] }}
                            transition={{ repeat: Infinity, repeatDelay: 1, duration: 0.5 }}
                          >
                            <Camera className="w-4 h-4 text-primary-400" />
                          </motion.div>
                        </motion.div>
                      )}
                      
                      {step.id === 2 && (
                        <motion.div 
                          className="h-14 bg-gray-50 rounded flex items-center justify-center text-gray-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 + index * 0.2 }}
                        >
                          Hello, <motion.span
                            className="px-2 mx-1 bg-primary-100 text-primary-700 rounded border border-primary-200"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, repeatDelay: 1, duration: 0.5 }}
                          >[FIRSTNAME]</motion.span>
                          <motion.span
                            className="px-2 mx-1 bg-secondary-100 text-secondary-700 rounded border border-secondary-200 text-xs"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, repeatDelay: 1, duration: 1 }}
                          >
                            +40 Personalization Tokens
                          </motion.span>
                        </motion.div>
                      )}
                      
                      {step.id === 3 && (
                        <motion.div 
                          className="h-14 bg-gradient-to-r from-primary-50 to-secondary-50 rounded flex items-center justify-center text-primary-700 font-medium"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 + index * 0.2 }}
                        >
                          <motion.span
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, repeatDelay: 1, duration: 0.5 }}
                          >
                            Hello, <span className="font-bold">Sarah!</span>
                          </motion.span>
                          <motion.div 
                            className="ml-2"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.5 }}
                          >
                            <Sparkles className="w-4 h-4 text-primary-500" />
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))
            ) : (
              // Use the default steps if none are provided
              steps.map((step, index) => (
                <motion.div 
                  key={step.id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="feature-card flex flex-col items-center text-center relative group"
                >
                  {/* Step number */}
                  <motion.div 
                    className="absolute -top-6 -right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold shadow-lg z-10"
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : { scale: 0 }}
                    transition={{ delay: 0.3 + index * 0.2, type: "spring", stiffness: 200 }}
                  >
                    {step.id}
                  </motion.div>
                  
                  {/* Icon with animated gradient */}
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-5 relative overflow-hidden group-hover:scale-110 transition-transform shadow-md"
                    initial={{ rotate: -5 }}
                    animate={{ rotate: 0 }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-primary-200/30 via-primary-100/10 to-primary-200/30"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    ></motion.div>
                    <div className="relative z-10">
                      {step.icon}
                    </div>
                  </motion.div>
                  
                  <h3 className="text-xl font-bold mb-3">Step {step.id}. {step.title}</h3>
                  <p className="text-gray-600 mb-6">{step.description}</p>
                  <div className="mt-auto bg-gray-100/80 p-4 rounded-lg w-full">
                    <motion.div 
                      className="bg-white p-4 rounded-lg border border-gray-200 group-hover:shadow-lg transition-shadow"
                      whileHover={{ y: -3 }}
                    >
                      {step.id === 1 && (
                        <motion.div 
                          className="h-14 bg-gray-50 rounded flex items-center justify-center text-gray-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 + index * 0.2 }}
                        >
                          <div className="flex gap-2 items-center">
                            <div>Original Content</div>
                            <div>or</div>
                            <div className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs flex items-center">
                              <Upload className="w-3 h-3 mr-1" />
                              Reference Image
                            </div>
                          </div>
                          <motion.div 
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            animate={{ rotate: [0, 10, 0] }}
                            transition={{ repeat: Infinity, repeatDelay: 1, duration: 0.5 }}
                          >
                            <Camera className="w-4 h-4 text-primary-400" />
                          </motion.div>
                        </motion.div>
                      )}
                      
                      {step.id === 2 && (
                        <motion.div 
                          className="h-14 bg-gray-50 rounded flex items-center justify-center text-gray-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 + index * 0.2 }}
                        >
                          Hello, <motion.span
                            className="px-2 mx-1 bg-primary-100 text-primary-700 rounded border border-primary-200"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, repeatDelay: 1, duration: 0.5 }}
                          >[FIRSTNAME]</motion.span>
                          <motion.span
                            className="px-2 mx-1 bg-secondary-100 text-secondary-700 rounded border border-secondary-200 text-xs"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, repeatDelay: 1, duration: 1 }}
                          >
                            +40 More Tokens
                          </motion.span>
                        </motion.div>
                      )}
                      
                      {step.id === 3 && (
                        <motion.div 
                          className="h-14 bg-gradient-to-r from-primary-50 to-secondary-50 rounded flex items-center justify-center text-primary-700 font-medium"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 + index * 0.2 }}
                        >
                          <motion.span
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, repeatDelay: 1, duration: 0.5 }}
                          >
                            Hello, <span className="font-bold">Sarah!</span>
                          </motion.span>
                          <motion.div 
                            className="ml-2"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.5 }}
                          >
                            <Sparkles className="w-4 h-4 text-primary-500" />
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* New Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-20 mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8 gradient-text">
            New Personalization Features for 2025
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-3d relative overflow-hidden group"
              >
                <div className={`p-6 rounded-xl bg-gradient-to-br ${feature.bgClass} h-full`}>
                  {/* Animated background particles */}
                  <div className="absolute inset-0 overflow-hidden opacity-30">
                    <motion.div 
                      className="absolute h-6 w-6 rounded-full bg-white/20 top-[10%] left-[20%]"
                      animate={{ 
                        y: [0, 20, 0], 
                        opacity: [0.2, 0.4, 0.2] 
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                    />
                    <motion.div 
                      className="absolute h-8 w-8 rounded-full bg-white/20 top-[60%] left-[70%]"
                      animate={{ 
                        y: [0, -30, 0], 
                        opacity: [0.1, 0.3, 0.1] 
                      }}
                      transition={{ 
                        duration: 5,
                        repeat: Infinity,
                        delay: index * 0.7
                      }}
                    />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="bg-white/20 p-3 rounded-lg inline-flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h4 className="text-white text-lg font-bold mb-2">{feature.title}</h4>
                    <p className="text-white/90 text-sm">{feature.description}</p>
                    
                    <div className="absolute bottom-3 right-3">
                      <motion.div 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="bg-white/30 backdrop-blur-sm rounded-full p-2">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>  
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mt-20"
        >
          <div className="mb-8">
            <p className="text-xl font-medium gradient-text inline-block">
              VideoRemix is used by 1000's of teams to drive personalized conversions
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {logos.map((logo, i) => (
              <motion.div
                key={logo.id}
                custom={i}
                variants={logoVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -8, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="glass-panel p-6 min-w-40 flex flex-col items-center gap-2"
              >
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-accent-500" />
                  <div className="font-bold text-gray-700">{logo.name}</div>
                </div>
                <div className="mt-1 text-xs text-gray-500 flex items-center">
                  <Check className="w-3 h-3 text-green-500 mr-1" /> Personalization Powered
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="glass-panel p-6 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-8 h-8 text-primary-600" />
              </div>
              
              <div className="text-left">
                <h4 className="text-lg font-bold mb-1">Personalize in Minutes</h4>
                <p className="text-gray-600 mb-3">Our intuitive platform makes it easy to create your first personalized campaign without any special skills.</p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="inline-block"
                >
                  <a href="#signup" className="btn btn-primary flex items-center">
                    <Play className="mr-2 w-4 h-4" />
                    Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Animation variants for floating icons
const floatingIconVariants = {
  animate: (i: number) => ({
    y: [0, -10, 0],
    transition: {
      delay: i * 0.3,
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  }),
};

export default HowItWorks;
export { HowItWorks };