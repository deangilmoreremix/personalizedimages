import React, { useEffect } from 'react';
import { CartoonImageGenerator } from '../../components/CartoonImageGenerator';
import { HowItWorks } from '../../components/HowItWorks';
import { FAQ } from '../../components/FAQ';
import { CTASection } from '../../components/CTASection';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Paintbrush as PaintBrush, Palette, ArrowRight, Pencil, Film, Tv, Star, Sparkles } from 'lucide-react';
import cartoonThemesConfig from '../../data/cartoonThemes';
import { Link } from 'react-router-dom';

// Floating animation component
const FloatingElement = ({ children, delay = 0, duration = 6, className = "", x = 10, y = 15 }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
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

// Animation for cartoon card hover
const CartoonCard = ({ theme, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -10, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="aspect-square bg-indigo-50 relative overflow-hidden">
        {theme.preview ? (
          <motion.img 
            src={theme.preview} 
            alt={theme.label} 
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-indigo-200 text-4xl font-bold">
            {theme.label.charAt(0)}
          </div>
        )}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 flex items-end justify-center pb-4"
          whileHover={{ opacity: 1 }}
        >
          <span className="text-white font-medium px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm text-sm">
            View Style
          </span>
        </motion.div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-1">{theme.label}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">
          {theme.prompt.substring(0, 80)}...
        </p>
      </div>
    </motion.div>
  );
};

const CartoonStylePage = () => {
  const controls = useAnimation();
  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  useEffect(() => {
    if (featuresInView) {
      controls.start("visible");
    }
  }, [controls, featuresInView]);

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0.2} className="top-20 left-[10%]">
          <PaintBrush className="w-28 h-28 text-indigo-200" />
        </FloatingElement>
        
        <FloatingElement delay={1.2} x={20} y={15} duration={8} className="top-40 right-[15%]">
          <Palette className="w-20 h-20 text-purple-200" />
        </FloatingElement>
        
        <FloatingElement delay={0.7} x={10} y={20} duration={7} className="bottom-40 left-[20%]">
          <Pencil className="w-24 h-24 text-pink-200" />
        </FloatingElement>
        
        <FloatingElement delay={1.8} x={25} y={10} duration={9} className="bottom-20 right-[25%]">
          <Film className="w-32 h-32 text-indigo-200" />
        </FloatingElement>
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full filter blur-3xl opacity-30 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-30 transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative inline-block mb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
              className="bg-indigo-100 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4"
            >
              <PaintBrush className="h-10 w-10 text-indigo-600" />
            </motion.div>
            
            <motion.div 
              className="absolute -top-2 -right-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, 0] }}
              transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
            >
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </motion.div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Transform Images into Cartoon Styles
          </motion.h1>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '120px' }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mb-6 rounded-full"
          ></motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Convert any photo into 20+ cartoon and animation styles with our advanced AI tools.
            Perfect for creative projects, social media, and personalized content.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-16 relative overflow-hidden"
        >
          {/* Animated shine effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-100/20 to-transparent"
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
          
          <CartoonImageGenerator
            tokens={{ FIRSTNAME: 'User', LASTNAME: 'Example', COMPANY: 'Company', EMAIL: 'user@example.com' }}
            onImageGenerated={() => {}}
          />
        </motion.div>
        
        {/* Style Gallery */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Available Cartoon Styles</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {cartoonThemesConfig.themes.slice(0, 8).map((theme, index) => (
              <CartoonCard key={index} theme={theme} index={index} />
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600 mb-4">
              Explore all 20+ cartoon styles in our full editor
            </p>
            <Link 
              to="/editor" 
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              Try The Complete Editor
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
              >
                <ArrowRight className="ml-2 w-4 h-4" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Features section */}
        <motion.div 
          ref={featuresRef}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          initial="hidden"
          animate={controls}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Transform Any Photo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Tv className="w-8 h-8 text-indigo-600" />,
                title: "Classic Cartoons",
                description: "Turn images into classic cartoon styles from your favorite animated shows and movies",
                index: 0
              },
              {
                icon: <Pencil className="w-8 h-8 text-purple-600" />,
                title: "Artistic Styles",
                description: "Apply artistic cartoon styles like hand-drawn, sketched, or watercolor animations",
                index: 1
              },
              {
                icon: <Star className="w-8 h-8 text-pink-600" />,
                title: "Custom Transformations",
                description: "Combine different cartoon styles with custom settings for unique transformations",
                index: 2
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={featureVariants}
                className="bg-white p-6 rounded-xl shadow-md relative overflow-hidden"
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
              >
                <motion.div 
                  className="absolute -bottom-6 -right-6 text-indigo-100 opacity-50 transform rotate-6"
                  animate={{ rotate: [6, 0, 6] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {feature.icon}
                </motion.div>
                
                <div className="relative z-10">
                  <div className="bg-indigo-100 w-14 h-14 flex items-center justify-center rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <HowItWorks 
          title="How It Works" 
          steps={[
            { title: "Upload Your Photo", description: "Start by uploading any photo you want to transform into cartoon style." },
            { title: "Choose a Style", description: "Select from 20+ cartoon styles, from classic animation to modern anime." },
            { title: "Customize", description: "Adjust settings and add personalization elements if desired." },
            { title: "Generate & Download", description: "Let our AI transform your photo, then download or share your cartoon creation." }
          ]} 
        />
        
        <FAQ
          title="Frequently Asked Questions"
          faqs={[
            {
              question: "What types of photos work best for cartoon conversion?",
              answer: "Clear photos with good lighting and distinct features work best. Close-up portraits are ideal, but our AI can handle most image types."
            },
            {
              question: "Can I use these cartoons commercially?",
              answer: "Yes, the cartoons you create are yours to use, including for commercial purposes. Just make sure you have the rights to the original photos you upload."
            },
            {
              question: "How long does it take to generate a cartoon?",
              answer: "Most cartoon transformations are completed in 15-30 seconds, depending on the complexity of the original image and server load."
            },
            {
              question: "Can I customize the cartoon style after generation?",
              answer: "Currently, each style produces a specific result, but you can regenerate with different settings or try multiple styles to find the perfect look."
            }
          ]}
        />
        
        <CTASection
          title="Transform Your Photos Today"
          description="Join thousands of users creating amazing cartoon versions of their photos."
          buttonText="Start Creating Now"
          buttonLink="/editor"
        />
      </div>
    </div>
  );
};

export default CartoonStylePage;