import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, Facebook, Linkedin, TrendingUp, UserPlus, MousePointer, Zap, Award, Globe, Gift, Clock, Shield, Upload, Image, Wand2, Sparkles } from 'lucide-react';
import AnimatedIcons from './AnimatedIcons';
import { FloatingShape } from './FloatingElements';

const benefits = [
  {
    id: 1,
    icon: <Mail className="h-8 w-8 text-white" />,
    title: 'Personalized Marketing Emails',
    description: 'Add personalized images & videos to each marketing email for 9X higher engagement',
    bgColor: 'bg-primary-600',
  },
  {
    id: 2,
    icon: <Facebook className="h-8 w-8 text-white" />,
    title: 'Personalized Facebook Content',
    description: 'Send personalized images in Facebook messages, Groups, and Pages for each recipient.',
    bgColor: 'bg-secondary-600',
  },
  {
    id: 3,
    icon: <Linkedin className="h-8 w-8 text-white" />,
    title: 'Personalized LinkedIn Outreach',
    description: 'Send personalized images in LinkedIn messages to stand out from generic outreach',
    bgColor: 'bg-accent-500',
  },
  {
    id: 4,
    icon: <TrendingUp className="h-8 w-8 text-white" />,
    title: 'Drive Personalized Conversion',
    description: 'Personalized images have been shown to increase click-through rates by up to 985%.',
    bgColor: 'bg-primary-700',
  },
  {
    id: 5,
    icon: <UserPlus className="h-8 w-8 text-white" />,
    title: 'Boost Personalized Opt-Ins',
    description: 'Personalized campaigns have shown up to a 10-fold ROI improvement for big brands.',
    bgColor: 'bg-secondary-700',
  },
  {
    id: 6,
    icon: <MousePointer className="h-8 w-8 text-white" />,
    title: 'Personalized CTAs That Convert',
    description: 'Add clickable personalized call-to-actions inside your images, engaging your customers more.',
    bgColor: 'bg-accent-600',
  },
];

const newFeatures = [
  {
    icon: <Upload className="h-6 w-6 text-white" />,
    title: 'Personalized Reference Upload',
    description: 'Use customer photos as reference for AI-generated personalized content',
    bgColor: 'bg-green-600',
  },
  {
    icon: <Image className="h-6 w-6 text-white" />,
    title: 'Personalized Ghibli Style',
    description: 'Create personalized whimsical Ghibli-inspired scenes for each customer',
    bgColor: 'bg-blue-600',
  },
  {
    icon: <Wand2 className="h-6 w-6 text-white" />,
    title: 'Personalized Meme Generator',
    description: 'AI-powered personalized meme creation with customer data',
    bgColor: 'bg-purple-600',
  },
  {
    icon: <Sparkles className="h-6 w-6 text-white" />,
    title: 'Extended Personalization Tokens',
    description: 'More powerful token system for rich multi-field personalization',
    bgColor: 'bg-pink-600',
  },
];

const Benefits: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.4,
      } 
    },
  };

  return (
    <section id="features" className="section relative">
      <div className="container-custom">
        {/* Interactive background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <AnimatedIcons density="low" />
          
          {/* Additional floating shapes */}
          <FloatingShape 
            shape="circle" 
            size="100px" 
            color="rgba(99, 102, 241, 0.05)" 
            x={15} y={15} 
            className="top-20 right-20" 
          />
          
          <FloatingShape 
            shape="square" 
            size="70px" 
            color="rgba(79, 70, 229, 0.05)" 
            x={20} y={25} 
            className="bottom-40 left-32" 
          />
          
          <FloatingShape 
            shape="blob" 
            size="120px" 
            color="rgba(249, 115, 22, 0.05)" 
            x={25} y={15} 
            className="top-40 left-1/4" 
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6 inline-block"
          >
            <span className="px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              Personalized Customer Engagement
            </span>
          </motion.div>
          
          <h2 className="mb-4">How can you keep each customer's attention?</h2>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100px' }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-1 bg-primary-500 mx-auto mb-6 rounded-full"
          ></motion.div>
          
          <p className="text-xl mb-8 text-gray-600">
            Create unique personalized experiences
          </p>
          <p className="mt-4 text-gray-600">
            Today's customers expect personalized content tailored just for them. VideoRemix lets you deliver individualized images, emails, product recommendations, cart abandonment reminders, special offers, and personalized birthday wishes for every single customer.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8">What does personalization deliver?</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            {[
              'Up to 985% increase in click-through rates',
              'Average 40% boost in customer satisfaction',
              '67% higher purchase probability',
              '72% reduction in cart abandonment',
              '3X higher email open rates',
              'Doubled customer lifetime value'
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
                className="p-4 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 card-3d"
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
            <p className="text-xl font-semibold text-primary-600">
              VideoRemix is an easy-to-use platform for image personalization.
            </p>
            <motion.a 
              href="#signup" 
              className="btn btn-primary mt-6 inline-block"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              Sign up now!
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div 
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {benefits.map((benefit, index) => (
            <motion.div 
              key={benefit.id}
              variants={itemVariants}
              initial="hidden" 
              animate={inView ? "visible" : "hidden"}
              transition={{ delay: index * 0.1 }}
              className="card overflow-hidden hover:-translate-y-1 group"
              whileHover={{ 
                y: -8,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { duration: 0.2 }
              }}
            >
              <div className={`${benefit.bgColor} p-4 -mx-6 -mt-6 mb-6 flex items-center relative overflow-hidden`}>
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  animate={{
                    background: [
                      "radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%)",
                      "radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%)",
                      "radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%)"
                    ]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <div className="bg-white/20 p-2 rounded-lg mr-4">
                  {benefit.icon}
                </div>
                <h3 className="text-white font-bold relative z-10">{benefit.title}</h3>
                
                <motion.div 
                  className="absolute right-0 bottom-0 opacity-10"
                  whileHover={{ rotate: 15 }}
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "mirror"
                  }}
                >
                  {benefit.icon}
                </motion.div>
              </div>
              <motion.p 
                className="text-gray-600"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >{benefit.description}</motion.p>
            </motion.div>
          ))}
        </motion.div>

        {/* New Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <motion.span
              className="inline-block mb-3 px-4 py-1.5 bg-accent-100 text-accent-700 rounded-full text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
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
                NEW PERSONALIZATION FOR 2025
              </motion.span>
            </motion.span>
            <h2 className="mb-3">Enhanced AI Personalization Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              More ways to create uniquely personalized content for each customer
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {newFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="card overflow-hidden hover:-translate-y-1 group"
                whileHover={{ 
                  y: -8,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { duration: 0.2 }
                }}
              >
                <div className={`${feature.bgColor} p-4 -mx-6 -mt-6 mb-6 flex items-center relative overflow-hidden`}>
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                    animate={{
                      background: [
                        "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 50%)",
                        "radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 50%)",
                        "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 50%)"
                      ]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <div className="bg-white/20 p-2 rounded-lg mr-4 flex items-center justify-center">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "mirror",
                        repeatDelay: 5,
                        duration: 2,
                        delay: index * 0.5
                      }}
                    >
                      {feature.icon}
                    </motion.div>
                  </div>
                  <h3 className="text-white font-bold relative z-10">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-lg text-gray-700 mb-6 max-w-3xl mx-auto">
            Personalizing images with customer names and information captures attention instantly and leads to higher conversions. Human brains process personalized imagery 60,000 times faster than generic text.
          </p>
          <motion.a 
            href="#signup" 
            className="btn btn-outline inline-block"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More About Personalization
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;