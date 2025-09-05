import React from 'react';
import { TVShowActionFigureGenerator } from '../../components/TVShowActionFigureGenerator';
import { HowItWorks } from '../../components/HowItWorks';
import { FAQ } from '../../components/FAQ';
import { CTASection } from '../../components/CTASection';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Tv, ArrowRight, Film, MonitorPlay, Clapperboard, Camera, Popcorn, Award, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FloatingShape } from '../../components/FloatingElements';

const TVShowActionFigurePage = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -20]);

  // Floating icons for background animation
  const floatingIcons = [
    { icon: <Tv className="text-blue-400" />, x: 15, y: 20, size: 'w-8 h-8', delay: 0 },
    { icon: <Clapperboard className="text-cyan-400" />, x: 25, y: 15, size: 'w-10 h-10', delay: 1.5 },
    { icon: <Popcorn className="text-yellow-400" />, x: 10, y: 25, size: 'w-6 h-6', delay: 0.8 },
    { icon: <Camera className="text-blue-400" />, x: 20, y: 10, size: 'w-9 h-9', delay: 2.2 },
    { icon: <MonitorPlay className="text-blue-300" />, x: 15, y: 15, size: 'w-12 h-12', delay: 1.2 },
    { icon: <Award className="text-gold-300" />, x: 20, y: 20, size: 'w-7 h-7', delay: 0.5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float animation-delay-2000"></div>
        
        {/* Floating shapes */}
        <FloatingShape 
          shape="blob" 
          size="120px" 
          color="rgba(59, 130, 246, 0.1)" 
          x={15} y={20} 
          duration={7}
          className="top-1/4 right-1/4" 
        />
        
        <FloatingShape 
          shape="circle" 
          size="150px" 
          color="rgba(6, 182, 212, 0.1)" 
          x={20} y={15} 
          delay={1.5} 
          duration={8}
          className="bottom-1/3 left-1/5" 
        />
        
        {/* Floating icons */}
        {floatingIcons.map((item, i) => (
          <motion.div
            key={i}
            className={`absolute ${item.size} opacity-20`}
            style={{
              top: `${10 + (i * 15)}%`,
              left: `${5 + (i * 15)}%`,
            }}
            animate={{
              y: [0, -item.y, 0],
              x: [0, item.x, 0],
              rotate: [0, i % 2 === 0 ? 10 : -10, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 3 + i,
              delay: item.delay,
              ease: "easeInOut"
            }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              NEW FEATURE
            </span>
          </motion.div>
          
          <motion.div style={{ opacity, y }}>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              TV Show Action Figures
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}  
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Transform beloved TV characters into nostalgic action figures with authentic packaging, 
              iconic accessories, and signature poses. Perfect for fans and marketing campaigns.
            </motion.p>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-16 relative overflow-hidden"
        >
          {/* Decorative elements for the card */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full opacity-50 mix-blend-multiply"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-100 rounded-full opacity-50 mix-blend-multiply"></div>
          
          <TVShowActionFigureGenerator
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
            title="How To Create Your TV Show Action Figure" 
            steps={[
              { title: "Choose Your TV Character", description: "Select from beloved characters from iconic sitcoms, dramas, and TV shows from the 80s, 90s, and beyond." },
              { title: "Customize Your Figure", description: "Add show-specific accessories, select signature poses, and customize packaging to create the perfect TV collectible." },
              { title: "Add a Reference Image", description: "Upload a photo to help our AI create a more recognizable TV character (optional but recommended)." },
              { title: "Generate & Download", description: "Let our AI create your custom TV show action figure and download the high-quality image for use anywhere." }
            ]} 
          />
        </motion.div>
        
        {/* Feature Details Section */}
        <div className="my-16 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16"
          >
            <div>
              <div className="flex items-center mb-4">
                <motion.div 
                  className="p-2 bg-blue-100 rounded-lg mr-4"
                  whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Tv className="w-6 h-6 text-blue-600" />
                </motion.div>
                <h3 className="text-2xl font-bold">Iconic TV Characters</h3>
              </div>
              
              <p className="text-gray-700 mb-4">
                Choose from a diverse collection of beloved TV characters spanning multiple decades 
                and genres, from sitcom legends to dramatic heroes.
              </p>
              
              <ul className="space-y-2">
                {[
                  "Sitcom favorites like the Friends cast",
                  "Sci-fi classics like The X-Files agents",
                  "90s teen icons from shows like Saved by the Bell",
                  "Drama characters from popular series"
                ].map((item, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (index * 0.1) }}
                  >
                    <motion.div 
                      className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mr-2 mt-0.5 flex-shrink-0"
                      whileHover={{ scale: 1.2, backgroundColor: "#bfdbfe" }}
                    >
                      ✓
                    </motion.div>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <motion.div 
              className="rounded-xl overflow-hidden shadow-lg relative"
              whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src="https://images.pexels.com/photos/3183132/pexels-photo-3183132.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="TV Show Action Figure Example" 
                className="w-full h-auto"
              />
              <motion.div 
                className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <span className="text-xs font-medium text-blue-700 flex items-center">
                  <Tv className="w-3 h-3 mr-1" />
                  TV Character
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16"
          >
            <div className="order-2 md:order-1 rounded-xl overflow-hidden shadow-lg relative">
              <motion.img 
                src="https://images.pexels.com/photos/3945673/pexels-photo-3945673.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="TV Show Props and Packaging Example" 
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
                <span className="text-xs font-medium text-cyan-700 flex items-center">
                  <Film className="w-3 h-3 mr-1" />
                  Show Authentic
                </span>
              </motion.div>
            </div>
            
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-4">
                <motion.div 
                  className="p-2 bg-cyan-100 rounded-lg mr-4"
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Film className="w-6 h-6 text-cyan-600" />
                </motion.div>
                <h3 className="text-2xl font-bold">Show-Authentic Elements</h3>
              </div>
              
              <p className="text-gray-700 mb-4">
                Every TV character action figure comes with show-specific accessories, memorable props, 
                and packaging that references iconic sets and moments from the series.
              </p>
              
              <ul className="space-y-2">
                {[
                  "Signature props from famous episodes",
                  "Set-inspired packaging and backgrounds",
                  "Character-specific catchphrases and quotes",
                  "Era-appropriate design elements from each show"
                ].map((item, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (index * 0.1) }}
                  >
                    <motion.div 
                      className="w-5 h-5 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 mr-2 mt-0.5 flex-shrink-0"
                      whileHover={{ scale: 1.2, backgroundColor: "#a5f3fc" }}
                    >
                      ✓
                    </motion.div>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
        
        {/* Character Gallery */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Featured TV Characters
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              From classic sitcom favorites to sci-fi icons, our collection spans the 
              most memorable characters across television history.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                name: "Sitcom Icon",
                image: "https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                name: "FBI Agent",
                image: "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                name: "90s Teen Star",
                image: "https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                name: "Comedy Character",
                image: "https://images.pexels.com/photos/7232780/pexels-photo-7232780.jpeg?auto=compress&cs=tinysrgb&w=600"
              }
            ].map((character, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                className="rounded-xl overflow-hidden shadow-md relative group"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-3 bg-white text-center relative">
                  <h3 className="font-bold">{character.name}</h3>
                  <motion.div 
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + (index * 0.1) }}
                  >
                    <Tv className="w-3 h-3" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/editor" className="btn btn-primary inline-flex items-center px-8 bg-blue-600 hover:bg-blue-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Explore All TV Characters 
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.5 }}
                  className="ml-2"
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Use Cases */}
        <div className="mb-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Creative Marketing Applications
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              TV show action figures create unique opportunities for fan engagement, content marketing, and promotional campaigns.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "TV Show Promotions",
                description: "Create custom action figures for new seasons, finales, or special episode promotions.",
                icon: <Tv className="w-6 h-6 text-blue-500" />
              },
              {
                title: "Fan Tributes",
                description: "Generate personalized action figures of fans with their favorite TV characters for social media campaigns.",
                icon: <Star className="w-6 h-6 text-cyan-500" />
              },
              {
                title: "Streaming Service Marketing",
                description: "Promote streaming catalogs by highlighting iconic characters from different shows.",
                icon: <MonitorPlay className="w-6 h-6 text-blue-500" />
              },
              {
                title: "TV Reunion Campaigns",
                description: "Create nostalgic campaigns for show reunions or anniversaries with character collections.",
                icon: <Clapperboard className="w-6 h-6 text-cyan-500" />
              },
              {
                title: "Content Creator Collaborations",
                description: "Partner with TV reviewers and content creators for unique promotional materials.",
                icon: <Camera className="w-6 h-6 text-blue-500" />
              },
              {
                title: "TV-Themed Events",
                description: "Generate custom imagery for TV show themed parties, conventions, or viewing events.",
                icon: <Zap className="w-6 h-6 text-cyan-500" />
              }
            ].map((useCase, index) => (
              <motion.div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-bl-full -z-10 opacity-50"></div>
                <div className="mb-4 p-2 bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center">
                  {useCase.icon}
                </div>
                <h3 className="font-bold text-xl mb-2">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        <FAQ
          title="Frequently Asked Questions"
          faqs={[
            {
              question: "How accurate will the TV show action figure resemble the actual character?",
              answer: "Our AI creates stylized action figure interpretations that capture the essence and distinctive features of TV characters while adapting them to toy aesthetics. The results will be recognizable to fans of the show but presented in classic action figure style with nostalgic packaging."
            },
            {
              question: "Can I customize the packaging and accessories?",
              answer: "Yes! Each TV character comes with suggested show-specific accessories and packaging that references the series, but you can customize these elements to create your perfect collectible or highlight specific episodes and moments."
            },
            {
              question: "What can I use these TV show action figure images for?",
              answer: "These images are perfect for social media posts, fan sites, TV review blogs, streaming promotions, show anniversary campaigns, and any creative marketing related to television content. They create engaging, nostalgic content that resonates with fans."
            },
            {
              question: "Can I request a TV character that's not in your list?",
              answer: "While our interface offers a selection of iconic TV characters, you can use the custom prompt field to describe any TV character not on our list. For best results, include details about their signature look, show elements, and era."
            }
          ]}
        />
        
        <CTASection
          title="Ready to Create TV Show Action Figures?"
          description="Transform your favorite television characters into collectible action figures with our AI-powered generator."
          buttonText="Start Creating Now"
          buttonLink="/editor"
        />
      </div>
    </div>
  );
};

export default TVShowActionFigurePage;