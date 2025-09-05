import React, { useEffect } from 'react';
import { EnhancedActionFigureGenerator } from '../../components/EnhancedActionFigureGenerator';
import { ActionFigureShowcase } from '../../components/ActionFigureShowcase';
import { ActionFigureCarousel } from '../../components/ActionFigureCarousel';
import { HowItWorks } from '../../components/HowItWorks';
import { FAQ } from '../../components/FAQ';
import { CTASection } from '../../components/CTASection';
import { motion, useAnimation } from 'framer-motion';
import { Box, ArrowRight, Sparkles, Zap, PenTool as Tool, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';

// Animated icon component
const AnimatedIcon = ({ children, delay = 0, className = "" }) => (
  <motion.div
    className={`text-primary-500 ${className}`}
    initial={{ opacity: 0, scale: 0.5, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ 
      delay: delay,
      duration: 0.5,
      type: "spring",
      stiffness: 300,
      damping: 15
    }}
  >
    {children}
  </motion.div>
);

// Floating animation component
const FloatingElement = ({ children, delay = 0, duration = 4, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.5 }}
  >
    <motion.div
      animate={{ 
        y: [0, -15, 0],
        rotate: [0, 5, 0, -3, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay: delay
      }}
    >
      {children}
    </motion.div>
  </motion.div>
);

const ActionFigurePage = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingElement delay={0.5} className="absolute top-20 left-[10%]">
            <Box className="h-12 w-12 text-primary-300/30" />
          </FloatingElement>
          <FloatingElement delay={1.2} duration={5} className="absolute top-40 right-[15%]">
            <Sparkles className="h-16 w-16 text-secondary-300/20" />
          </FloatingElement>
          <FloatingElement delay={2.3} duration={6} className="absolute bottom-40 left-[20%]">
            <Star className="h-10 w-10 text-accent-300/20" />
          </FloatingElement>
          <FloatingElement delay={1.8} duration={7} className="absolute bottom-60 right-[25%]">
            <Tool className="h-14 w-14 text-primary-200/20" />
          </FloatingElement>
          
          {/* Background shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full filter blur-3xl opacity-30 transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-50 rounded-full filter blur-3xl opacity-30 transform -translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center mb-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 relative"
          >
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              PREMIUM FEATURE
            </span>
            <AnimatedIcon delay={0.8} className="absolute -right-16 top-0">
              <Zap className="h-8 w-8" />
            </AnimatedIcon>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Create Custom Action Figures
          </motion.h1>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '120px' }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6 rounded-full"
          ></motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}  
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Transform any person into a collectible action figure with professional packaging, 
            accessories, and personalized details. Perfect for creative marketing campaigns 
            and standout social media content.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-16 relative overflow-hidden"
        >
          {/* Decorative shine effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary-100/20 to-transparent"
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

          <EnhancedActionFigureGenerator
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
          ref={ref}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.3
              }
            }
          }}
          initial="hidden"
          animate={controls}
        >
          <HowItWorks 
            title="How To Create Your Custom Action Figure" 
            steps={[
              { title: "Choose Your Style", description: "Select from 12+ action figure styles including classic blister packs, collector editions, trading cards and more." },
              { title: "Personalize Your Figure", description: "Enter the name, company, and job title of the person you want to transform into an action figure." },
              { title: "Add a Reference Image", description: "Upload a photo to help our AI create a more recognizable action figure (optional but recommended)." },
              { title: "Generate & Download", description: "Let our AI create your custom action figure and download the high-quality image for use anywhere." }
            ]} 
          />
        </motion.div>
        
        {/* Feature Details Section */}
        <div className="my-16 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16"
          >
            <div>
              <div className="flex items-center mb-4">
                <div className="p-2 bg-primary-100 rounded-lg mr-4 relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-primary-200/0 via-primary-200/30 to-primary-200/0"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  />
                  <Box className="w-6 h-6 text-primary-600 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold">Professional Packaging</h3>
              </div>
              
              <p className="text-gray-700 mb-4">
                Every action figure comes boxed in its custom packaging, with colors matched to brand identity 
                and professional toy-style design elements.
              </p>
              
              <motion.ul
                className="space-y-2"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {[
                  "Custom branded color schemes",
                  "Multiple packaging styles (blister packs, collector boxes, trading cards)",
                  "Professional product photography look",
                  "Authentic toy design details"
                ].map((item, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start"
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 mr-2 mt-0.5 flex-shrink-0"
                    >
                      ✓
                    </motion.div>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="rounded-xl overflow-hidden shadow-lg"
            >
              <img 
                src="https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Action Figure Packaging Example" 
                className="w-full h-auto"
              />
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16"
          >
            <div className="order-2 md:order-1">
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="rounded-xl overflow-hidden shadow-lg"
              >
                <img 
                  src="https://images.pexels.com/photos/7241628/pexels-photo-7241628.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Action Figure Accessories Example" 
                  className="w-full h-auto"
                />
              </motion.div>
            </div>
            
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-secondary-100 rounded-lg mr-4 relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-secondary-200/0 via-secondary-200/30 to-secondary-200/0"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  />
                  <Sparkles className="w-6 h-6 text-secondary-600 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold">Personalized Accessories</h3>
              </div>
              
              <p className="text-gray-700 mb-4">
                Each action figure comes with accessories that reflect the person's role, company, 
                and personality, making each creation uniquely relevant.
              </p>
              
              <motion.ul 
                className="space-y-2"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.2
                    }
                  }
                }}
              >
                {[
                  "Industry-specific tools and props",
                  "Company-branded miniature items",
                  "Customizable accessory selection",
                  "Accurate scale and authentic toy details"
                ].map((item, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start"
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.2, rotate: -10 }}
                      className="w-5 h-5 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-700 mr-2 mt-0.5 flex-shrink-0"
                    >
                      ✓
                    </motion.div>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        </div>
        
        {/* Style Gallery */}
        <div className="mb-16 relative">
          <motion.div 
            className="absolute -top-10 -right-10 text-accent-500/20 transform rotate-12"
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
            <Sparkles className="w-32 h-32" />
          </motion.div>

          <div className="text-center mb-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold mb-4"
            >
              Choose From 12+ Premium Styles
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              From classic blister packs to collector's editions, digital characters to vinyl figurines,
              we have styles to match every brand and personality.
            </motion.p>
          </div>
          
          <ActionFigureCarousel className="mb-8 max-w-4xl mx-auto" />
          
          <motion.div 
            className="text-center"
            whileInView={{ opacity: [0, 1], y: [20, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/editor" className="btn btn-primary inline-flex items-center px-8">
              Try All Styles <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>
        </div>
        
        {/* Use Cases */}
        <motion.div 
          className="mb-16 bg-white rounded-xl shadow-sm p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="absolute -top-10 -left-10 text-primary-200/20 transform -rotate-12"
            animate={{ 
              rotate: [-12, -5, -12],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              repeatType: "mirror"
            }}
          >
            <Box className="w-32 h-32" />
          </motion.div>

          <div className="text-center mb-8 relative z-10">
            <h2 className="text-3xl font-bold mb-4">Creative Marketing Applications</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Action figures create memorable, share-worthy personalized content that stands out in any campaign.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {[
              {
                title: "Team Introductions",
                description: "Introduce new team members with their own action figure for a memorable first impression.",
                icon: <Zap />
              },
              {
                title: "Executive Spotlights",
                description: "Feature leadership as limited edition collectibles for company announcements.",
                icon: <Star />
              },
              {
                title: "Client Appreciation",
                description: "Send personalized action figure images to clients to show appreciation.",
                icon: <Sparkles />
              },
              {
                title: "Event Promotion",
                description: "Create special edition figures for speakers and presenters at company events.",
                icon: <Box />
              }
            ].map((useCase, index) => (
              <motion.div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md relative overflow-hidden"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <motion.div
                  className="absolute -right-3 -bottom-3 text-primary-100/40"
                  whileHover={{ 
                    rotate: 15,
                    scale: 1.2
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {useCase.icon}
                </motion.div>
                <h3 className="font-bold text-xl mb-2">{useCase.title}</h3>
                <p className="text-gray-600 relative z-10">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <FAQ
          title="Frequently Asked Questions"
          faqs={[
            {
              question: "How accurate will the action figure resemble the person?",
              answer: "When you provide a reference image, our AI will create a stylized action figure that captures key recognizable elements while adapting to the toy aesthetic. The result will be recognizable but stylized in authentic toy fashion."
            },
            {
              question: "Can I customize the packaging colors and design?",
              answer: "Yes! You can specify custom colors for the packaging, and each template has a different packaging style. We can automatically generate colors that match your company branding by entering your company name."
            },
            {
              question: "What can I use these action figure images for?",
              answer: "These images are perfect for social media posts, email marketing, company announcements, team pages, event promotion, and any creative marketing materials. They create highly engaging, personalized content."
            },
            {
              question: "Which AI model gives the best results?",
              answer: "Each model has different strengths. Gemini AI provides excellent detail and creativity, DALL-E 3 offers precise control, and Ideogram excels at realistic packaging details. We recommend trying all three to see which works best for your specific needs."
            }
          ]}
        />
        
        <CTASection
          title="Ready to Create Custom Action Figures?"
          description="Start transforming your team members, clients, and stakeholders into memorable collectibles today."
          buttonText="Start Creating Now"
          buttonLink="/editor"
        />
      </div>
    </div>
  );
};

export default ActionFigurePage;