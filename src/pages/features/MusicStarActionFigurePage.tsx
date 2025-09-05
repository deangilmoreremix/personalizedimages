import React from 'react';
import { MusicStarActionFigureGenerator } from '../../components/MusicStarActionFigureGenerator';
import { HowItWorks } from '../../components/HowItWorks';
import { FAQ } from '../../components/FAQ';
import { CTASection } from '../../components/CTASection';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Music, ArrowRight, Mic, Disc, Headphones, Star, Sparkles, Zap, Cylinder as Vinyl, Radio, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FloatingShape } from '../../components/FloatingElements';

const MusicStarActionFigurePage = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -20]);

  // Floating icons for background animation
  const floatingIcons = [
    { icon: <Music className="text-purple-400" />, x: 15, y: 20, size: 'w-8 h-8', delay: 0 },
    { icon: <Disc className="text-indigo-400" />, x: 25, y: 15, size: 'w-10 h-10', delay: 1.5 },
    { icon: <Star className="text-pink-400" />, x: 10, y: 25, size: 'w-6 h-6', delay: 0.8 },
    { icon: <Headphones className="text-blue-400" />, x: 20, y: 10, size: 'w-9 h-9', delay: 2.2 },
    { icon: <Vinyl className="text-purple-300" />, x: 15, y: 15, size: 'w-12 h-12', delay: 1.2 },
    { icon: <Radio className="text-indigo-300" />, x: 20, y: 20, size: 'w-7 h-7', delay: 0.5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float animation-delay-2000"></div>
        
        {/* Floating shapes */}
        <FloatingShape 
          shape="circle" 
          size="120px" 
          color="rgba(139, 92, 246, 0.1)" 
          x={15} y={20} 
          duration={7}
          className="top-1/4 right-1/4" 
        />
        
        <FloatingShape 
          shape="blob" 
          size="150px" 
          color="rgba(79, 70, 229, 0.1)" 
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
            <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
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
              Music Star Action Figures
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}  
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Transform iconic musicians into collectible action figures with professional packaging, 
              accessories, and personalized details. Perfect for music fans, marketing campaigns, 
              and social media content.
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
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-100 rounded-full opacity-50 mix-blend-multiply"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full opacity-50 mix-blend-multiply"></div>
          
          <MusicStarActionFigureGenerator
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
            title="How To Create Your Music Star Action Figure" 
            steps={[
              { title: "Choose Your Music Icon", description: "Select from 30+ legendary musicians including rock stars, pop icons, hip-hop legends, and more." },
              { title: "Customize Your Figure", description: "Add accessories, select poses, and customize packaging to create the perfect music collectible." },
              { title: "Add a Reference Image", description: "Upload a photo to help our AI create a more personalized action figure (optional but recommended)." },
              { title: "Generate & Download", description: "Let our AI create your custom music star action figure and download the high-quality image for use anywhere." }
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
                  className="p-2 bg-purple-100 rounded-lg mr-4"
                  whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Mic className="w-6 h-6 text-purple-600" />
                </motion.div>
                <h3 className="text-2xl font-bold">Iconic Music Legends</h3>
              </div>
              
              <p className="text-gray-700 mb-4">
                Choose from 30 legendary musicians spanning different genres and eras, each with their 
                signature style, iconic poses, and custom packaging designs.
              </p>
              
              <ul className="space-y-2">
                {[
                  "Rock legends like Freddie Mercury and David Bowie",
                  "Pop icons like Madonna and Michael Jackson",
                  "Hip-hop pioneers like Tupac and Run DMC",
                  "Soul and R&B greats like Aretha Franklin and James Brown"
                ].map((item, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (index * 0.1) }}
                  >
                    <motion.div 
                      className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 mr-2 mt-0.5 flex-shrink-0"
                      whileHover={{ scale: 1.2, backgroundColor: "#c4b5fd" }}
                    >
                      ✓
                    </motion.div>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <motion.div 
              className="rounded-xl overflow-hidden shadow-lg"
              whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src="https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Music Star Action Figure Example" 
                className="w-full h-auto"
              />
              <motion.div 
                className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <span className="text-xs font-medium text-purple-700 flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Music Legend
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
                src="https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Music Accessories Example" 
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
                <span className="text-xs font-medium text-indigo-700 flex items-center">
                  <Vinyl className="w-3 h-3 mr-1" />
                  Authentic Details
                </span>
              </motion.div>
            </div>
            
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-4">
                <motion.div 
                  className="p-2 bg-indigo-100 rounded-lg mr-4"
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Disc className="w-6 h-6 text-indigo-600" />
                </motion.div>
                <h3 className="text-2xl font-bold">Music-Themed Accessories</h3>
              </div>
              
              <p className="text-gray-700 mb-4">
                Each music star comes with genre-appropriate accessories and packaging that reflects 
                their unique style and era, from vinyl records to boom boxes to stage equipment.
              </p>
              
              <ul className="space-y-2">
                {[
                  "Era-specific music equipment and instruments",
                  "Iconic stage props and performance accessories",
                  "Album-inspired packaging and display elements",
                  "Signature outfits and style elements from different eras"
                ].map((item, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (index * 0.1) }}
                  >
                    <motion.div 
                      className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 mr-2 mt-0.5 flex-shrink-0"
                      whileHover={{ scale: 1.2, backgroundColor: "#c7d2fe" }}
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
        
        {/* Music Star Gallery */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Featured Music Stars
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              From rock legends to pop icons, hip-hop pioneers to soul greats, our collection 
              spans the most influential musicians across genres and decades.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                name: "Prince",
                image: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                name: "Madonna",
                image: "https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                name: "Michael Jackson",
                image: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=600"
              },
              {
                name: "David Bowie",
                image: "https://images.pexels.com/photos/1656062/pexels-photo-1656062.jpeg?auto=compress&cs=tinysrgb&w=600"
              }
            ].map((star, index) => (
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
                    src={star.image}
                    alt={star.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-3 bg-white text-center relative">
                  <h3 className="font-bold">{star.name}</h3>
                  <motion.div 
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + (index * 0.1) }}
                  >
                    <Music className="w-3 h-3" />
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
              <Link to="/editor" className="btn btn-primary inline-flex items-center px-8 bg-purple-600 hover:bg-purple-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Explore All Music Stars 
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
        <div className="mb-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 shadow-sm">
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
              Music star action figures create memorable, share-worthy personalized content for music fans and marketing campaigns.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Music Promotions",
                description: "Create custom action figures for album releases, tours, or music events to engage fans.",
                icon: <Award className="w-6 h-6 text-purple-500" />
              },
              {
                title: "Fan Engagement",
                description: "Generate personalized action figures of fans with their favorite musicians for social media campaigns.",
                icon: <Star className="w-6 h-6 text-indigo-500" />
              },
              {
                title: "Music Education",
                description: "Create action figures of music legends to teach about music history and different genres.",
                icon: <Headphones className="w-6 h-6 text-blue-500" />
              },
              {
                title: "Band Merchandise",
                description: "Design virtual action figure concepts for potential band merchandise and collectibles.",
                icon: <Disc className="w-6 h-6 text-pink-500" />
              },
              {
                title: "Music Venue Marketing",
                description: "Create action figures of performers coming to your venue for promotional materials.",
                icon: <Music className="w-6 h-6 text-purple-500" />
              },
              {
                title: "Music Festivals",
                description: "Generate lineup announcements as action figure collections for festival marketing.",
                icon: <Zap className="w-6 h-6 text-indigo-500" />
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
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-bl-full -z-10 opacity-50"></div>
                <div className="mb-4 p-2 bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center">
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
              question: "How accurate will the music star action figure resemble the actual musician?",
              answer: "Our AI creates stylized action figure interpretations of musicians that capture their iconic looks, outfits, and performance styles while adapting them to toy aesthetics. The result will be recognizable but with the classic action figure treatment."
            },
            {
              question: "Can I customize the packaging and accessories?",
              answer: "Yes! Each music star comes with suggested accessories and packaging styles that match their era and genre, but you can customize these elements to create your perfect music collectible."
            },
            {
              question: "What can I use these music star action figure images for?",
              answer: "These images are perfect for social media posts, music blogs, fan sites, event promotions, music education materials, and any creative marketing related to music. They create highly engaging, personalized content for music fans."
            },
            {
              question: "Can I request a musician that's not in your list?",
              answer: "While our interface offers 30 iconic musicians, you can use the custom prompt field to describe any musician not on our list. For best results, include details about their signature look, era, and performance style."
            }
          ]}
        />
        
        <CTASection
          title="Ready to Create Music Star Action Figures?"
          description="Transform legendary musicians into collectible action figures with our AI-powered generator."
          buttonText="Start Creating Now"
          buttonLink="/editor"
        />
      </div>
    </div>
  );
};

export default MusicStarActionFigurePage;