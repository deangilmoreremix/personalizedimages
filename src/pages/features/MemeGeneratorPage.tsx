import React, { useEffect } from 'react';
import { MemeGenerator } from '../../components/MemeGenerator';
import { HowItWorks } from '../../components/HowItWorks';
import { FAQ } from '../../components/FAQ';
import { CTASection } from '../../components/CTASection';
import { motion, useAnimation } from 'framer-motion';
import { MessageSquare, Share2, Smile, Award, Laugh, Star, Lightbulb, ImageIcon } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

// Animated floating element for background
const FloatingElement = ({ 
  children, 
  delay = 0, 
  duration = 6, 
  x = 10, 
  y = 10, 
  rotate = 5,
  className = "" 
}) => (
  <motion.div
    className={`pointer-events-none absolute ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.2 }}
    transition={{ delay, duration: 0.5 }}
  >
    <motion.div
      animate={{
        y: [`-${y}px`, `${y}px`, `-${y}px`],
        x: [`-${x}px`, `${x}px`, `-${x}px`],
        rotate: [-rotate, rotate, -rotate],
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

// Staggered Feature Card
const FeatureCard = ({ icon, title, description, index, controls }) => {
  const [ref, inView] = useInView({ 
    triggerOnce: true, 
    threshold: 0.1 
  });
  
  useEffect(() => {
    if (inView) {
      controls.start(i => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: 0.1 * (index || 0)
        }
      }));
    }
  }, [controls, inView, index]);
  
  return (
    <motion.div 
      ref={ref}
      custom={index}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      whileHover={{ 
        y: -10,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl p-6 shadow-md relative overflow-hidden"
    >
      <div className="bg-purple-100 rounded-full w-14 h-14 flex items-center justify-center mb-4 relative">
        <motion.div 
          className="absolute inset-0 bg-purple-200/50 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
        <div className="relative z-10 text-purple-600">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const MemeGeneratorPage = () => {
  const controls = useAnimation();
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  useEffect(() => {
    if (heroInView) {
      controls.start("visible");
    }
  }, [controls, heroInView]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0.2} x={15} y={30} className="top-20 left-[10%]">
          <MessageSquare className="w-24 h-24 text-purple-200" />
        </FloatingElement>
        
        <FloatingElement delay={1.2} x={20} y={15} duration={8} className="top-40 right-[15%]">
          <Laugh className="w-20 h-20 text-pink-200" />
        </FloatingElement>
        
        <FloatingElement delay={0.7} x={30} y={20} duration={7} className="bottom-20 left-[20%]">
          <Star className="w-28 h-28 text-amber-200" />
        </FloatingElement>
        
        <FloatingElement delay={1.8} x={25} y={10} duration={9} className="bottom-40 right-[25%]">
          <Lightbulb className="w-32 h-32 text-blue-200" />
        </FloatingElement>
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl opacity-10 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-300 rounded-full filter blur-3xl opacity-10 transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          ref={heroRef}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="text-center mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="inline-block mb-4"
          >
            <div className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              <motion.span
                animate={{ 
                  scale: [1, 1.05, 1],
                  backgroundColor: [
                    "rgba(243, 232, 255, 1)", // purple-100
                    "rgba(233, 213, 255, 1)", // purple-200
                    "rgba(243, 232, 255, 1)", // purple-100
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "mirror"
                }}
                className="inline-block px-1 rounded"
              >
                NEW & IMPROVED
              </motion.span>
            </div>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            AI-Enhanced Meme Generator
          </motion.h1>
          
          <motion.div 
            variants={itemVariants}
            initial={{ width: 0 }}
            animate={{ width: '120px' }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-6 rounded-full"
          ></motion.div>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Create personalized, attention-grabbing memes for your marketing campaigns, social media,
            or just for fun - with advanced AI capabilities.
          </motion.p>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-xl shadow-lg p-8 mb-16 relative overflow-hidden"
        >
          {/* Animated shine effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-100/20 to-transparent"
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
          
          <MemeGenerator
            tokens={{ FIRSTNAME: 'User', LASTNAME: 'Example', COMPANY: 'Company', EMAIL: 'user@example.com' }}
            onMemeGenerated={() => {}}
          />
        </motion.div>
        
        {/* Features Section */}
        <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-8"
          >
            Advanced Meme Features
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<MessageSquare className="h-6 w-6" />}
              title="Personalized Text"
              description="Add dynamic personalization tokens like [FIRSTNAME] to create memes tailored for each recipient."
              index={0}
              controls={controls}
            />
            
            <FeatureCard 
              icon={<Share2 className="h-6 w-6" />}
              title="Easy Sharing"
              description="Download and share your memes across email campaigns, social media, or messaging apps."
              index={1}
              controls={controls}
            />
            
            <FeatureCard 
              icon={<Smile className="h-6 w-6" />}
              title="Popular Templates"
              description="Choose from trending meme templates or upload your own images for custom memes."
              index={2}
              controls={controls}
            />
            
            <FeatureCard 
              icon={<Award className="h-6 w-6" />}
              title="AI Enhancement"
              description="Use AI to transform standard memes into unique artistic styles or creative variations."
              index={3}
              controls={controls}
            />
          </div>
        </div>
        
        {/* Example Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Meme Examples</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "https://images.pexels.com/photos/7925800/pexels-photo-7925800.jpeg?auto=compress&cs=tinysrgb&w=600",
              "https://images.pexels.com/photos/17452962/pexels-photo-17452962/free-photo-of-woman-smiling-at-camera-behind-potted-palm-plant.jpeg?auto=compress&cs=tinysrgb&w=600",
              "https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=600",
              "https://images.pexels.com/photos/2007647/pexels-photo-2007647.jpeg?auto=compress&cs=tinysrgb&w=600",
              "https://images.pexels.com/photos/2923156/pexels-photo-2923156.jpeg?auto=compress&cs=tinysrgb&w=600",
              "https://images.pexels.com/photos/9821379/pexels-photo-9821379.jpeg?auto=compress&cs=tinysrgb&w=600",
            ].map((src, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -10, scale: 1.03, transition: { duration: 0.2 } }}
                className="overflow-hidden rounded-lg shadow-md group"
              >
                <div className="relative">
                  <img 
                    src={src} 
                    alt={`Meme example ${index+1}`} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 right-2">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <HowItWorks 
          title="How It Works" 
          steps={[
            { title: "Choose a Meme Template", description: "Select from popular templates or upload your own image." },
            { title: "Add Personalized Text", description: "Add text with personalization tokens and customize style." },
            { title: "Enhance with AI", description: "Optionally apply AI enhancement for unique creative styles." },
            { title: "Generate & Share", description: "Create your meme, download it, and share it with your audience." }
          ]} 
        />
        
        <FAQ
          title="Frequently Asked Questions"
          faqs={[
            {
              question: "What makes this meme generator different from others?",
              answer: "Our meme generator includes personalization tokens to create customized memes for each viewer, plus AI enhancement capabilities to transform standard memes into unique artistic styles."
            },
            {
              question: "Can I use these memes for marketing?",
              answer: "Absolutely! Personalized memes are perfect for email marketing, social media campaigns, and customer communications. They capture attention with humor while delivering personalized messages."
            },
            {
              question: "How does the personalization work?",
              answer: "Use tokens like [FIRSTNAME], [COMPANY], etc. in your meme text. When deployed to your marketing systems, these tokens will be replaced with each recipient's information."
            },
            {
              question: "What's the AI enhancement feature?",
              answer: "The AI enhancement takes your meme and applies artistic transformations based on your prompt. You might turn a standard meme into a watercolor painting, comic book style, or add surreal elements while maintaining the meme concept."
            }
          ]}
        />
        
        <CTASection
          title="Ready to Create Engaging Memes?"
          description="Start making personalized, shareable memes that capture attention and drive engagement."
          buttonText="Create Memes Now"
          buttonLink="/editor"
        />
      </div>
    </div>
  );
};

export default MemeGeneratorPage;