import React, { useEffect } from 'react';
import { GhibliImageGenerator } from '../../components/GhibliImageGenerator';
import { HowItWorks } from '../../components/HowItWorks';
import { FAQ } from '../../components/FAQ';
import { CTASection } from '../../components/CTASection';
import { useInView } from 'react-intersection-observer';
import { motion, useAnimation } from 'framer-motion';
import { Sparkles, Cloud, Wind, Leaf, Palette, Sun, Bird, Mountain, Umbrella } from 'lucide-react';

// Animated floating element
const FloatingElement = ({ 
  children, 
  delay = 0, 
  duration = 6, 
  x = 10, 
  y = 10, 
  className = "" 
}) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.5 }}
  >
    <motion.div
      animate={{
        y: [`-${y}px`, `${y}px`, `-${y}px`],
        x: [`-${x}px`, `${x}px`, `-${x}px`],
        rotate: [0, x > y ? 5 : -5, 0],
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

const GhibliStylePage = () => {
  const controls = useAnimation();
  const [contentRef, contentInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (contentInView) {
      controls.start('visible');
    }
  }, [controls, contentInView]);

  // Ghibli characteristics
  const characteristics = [
    {
      icon: <Palette className="w-6 h-6 text-blue-500" />,
      title: "Distinctive Art Style",
      description: "Detailed, hand-painted backgrounds with rich textures and vibrant natural environments"
    },
    {
      icon: <Leaf className="w-6 h-6 text-green-500" />,
      title: "Nature Themes",
      description: "Strong environmental themes and beautiful depictions of nature's wonder and power"
    },
    {
      icon: <Cloud className="w-6 h-6 text-purple-500" />,
      title: "Whimsical Elements",
      description: "Magical creatures, flying machines, and fantastical worlds with dreamlike qualities"
    },
    {
      icon: <Wind className="w-6 h-6 text-teal-500" />,
      title: "Emotional Depth",
      description: "Scenes that capture profound emotions and moments of quiet beauty"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingElement delay={0.2} x={15} y={25} className="top-20 left-[10%]">
          <Cloud className="w-20 h-20 text-blue-100" />
        </FloatingElement>
        
        <FloatingElement delay={1.2} x={20} y={15} duration={8} className="top-40 right-[15%]">
          <Bird className="w-14 h-14 text-indigo-100" />
        </FloatingElement>
        
        <FloatingElement delay={0.7} x={10} y={30} duration={7} className="bottom-20 left-[20%]">
          <Leaf className="w-16 h-16 text-green-100" />
        </FloatingElement>
        
        <FloatingElement delay={1.8} x={25} y={10} duration={9} className="bottom-40 right-[25%]">
          <Sun className="w-24 h-24 text-amber-100" />
        </FloatingElement>
        
        <FloatingElement delay={2.3} x={15} y={20} duration={8.5} className="top-[30%] left-[30%]">
          <Mountain className="w-18 h-18 text-purple-100" />
        </FloatingElement>
        
        <FloatingElement delay={1.5} x={20} y={15} duration={7.5} className="top-[60%] right-[5%]">
          <Umbrella className="w-12 h-12 text-pink-100" />
        </FloatingElement>
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-30 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full filter blur-3xl opacity-30 transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.3
              }}
              className="mx-auto mb-6 bg-blue-100 p-4 w-20 h-20 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-blue-600" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Studio Ghibli Style Image Creator
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your ideas into magical, whimsical scenes inspired by the legendary 
              animation studio's distinctive visual style.
            </p>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '120px' }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto my-6 rounded-full"
            ></motion.div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-16 relative overflow-hidden"
        >
          {/* Animated background effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-100/20 to-transparent"
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
          
          <GhibliImageGenerator
            tokens={{ FIRSTNAME: 'User', LASTNAME: 'Example', COMPANY: 'Company', EMAIL: 'user@example.com' }}
            onImageGenerated={() => {}}
          />
        </motion.div>
        
        {/* Characteristics section */}
        <motion.div 
          ref={contentRef}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
          initial="hidden"
          animate={controls}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">The Ghibli Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {characteristics.map((item, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { duration: 0.2 }
                }}
                className="bg-white rounded-xl p-6 shadow-md relative overflow-hidden"
              >
                <motion.div 
                  className="absolute right-0 bottom-0 opacity-5" 
                  animate={{
                    rotate: [0, 10, 0, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  {item.icon}
                </motion.div>
                
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="p-3 bg-blue-50 rounded-full mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Gallery section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Create Magical Scenes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              "https://images.pexels.com/photos/844297/pexels-photo-844297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
              "https://images.pexels.com/photos/15286/pexels-photo-15286.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
              "https://images.pexels.com/photos/36717/amazing-animal-beautiful-beautifull.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            ].map((image, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10, scale: 1.02 }}
                className="rounded-xl overflow-hidden shadow-md"
              >
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  src={image}
                  alt={`Ghibli style example ${index+1}`}
                  className="w-full aspect-video object-cover"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <HowItWorks 
          title="How It Works" 
          steps={[
            { title: "Describe Your Scene", description: "Start by describing the magical scene you want to create." },
            { title: "Choose Settings", description: "Select scene type, weather, time of day, and Ghibli-specific elements." },
            { title: "Add Reference", description: "Optionally upload a reference image for even better results." },
            { title: "Generate", description: "Let our AI create your Ghibli-inspired masterpiece in seconds." }
          ]} 
        />
        
        <FAQ
          title="Frequently Asked Questions"
          faqs={[
            {
              question: "What exactly is 'Studio Ghibli style'?",
              answer: "Studio Ghibli is a renowned Japanese animation studio known for films like 'Spirited Away' and 'My Neighbor Totoro'. Their distinctive visual style features detailed backgrounds, soft colors, whimsical elements, and a connection to nature. Our generator creates images inspired by this iconic aesthetic."
            },
            {
              question: "Can I use reference images?",
              answer: "Yes! Uploading a reference image can help our AI better understand the composition or characters you want to include in your Ghibli-style scene."
            },
            {
              question: "What kinds of scenes work best?",
              answer: "Nature-based scenes tend to work beautifully in Ghibli style - forests, fields, coastal areas, and rural settings. However, our generator can also create magical cityscapes, fantasy locations, and interior scenes."
            },
            {
              question: "How is the Ghibli style different from other cartoon styles?",
              answer: "The Ghibli style is characterized by its painterly quality, attention to environmental detail, soft lighting, and often includes whimsical or magical elements integrated into otherwise realistic scenes. It has a distinctive warmth and 'hand-painted' feel that sets it apart from other animation styles."
            }
          ]}
        />
        
        <CTASection
          title="Create Your Own Ghibli Masterpiece"
          description="Transform your ideas into magical scenes with our Studio Ghibli style generator."
          buttonText="Start Creating Now"
          buttonLink="/editor"
        />
      </div>
    </div>
  );
};

export default GhibliStylePage;