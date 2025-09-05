import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Zap, Box } from 'lucide-react';

interface CarouselProps {
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

const ActionFigureCarousel: React.FC<CarouselProps> = ({ 
  autoPlay = true, 
  interval = 5000,
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  // Sample action figure styles with personalized examples
  const styles = [
    {
      name: "Personalized AI Collectible Card",
      description: "Trading card with holographic design & personalized character stats",
      image: "https://images.pexels.com/photos/6615294/pexels-photo-6615294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      preview: "https://images.pexels.com/photos/6615294/pexels-photo-6615294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      name: "Personalized Boxed Toy Mockup",
      description: "Ultra-detailed action figure in collector's packaging with your name",
      image: "https://images.pexels.com/photos/12211/pexels-photo-12211.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      preview: "https://images.pexels.com/photos/12211/pexels-photo-12211.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      name: "Personalized 3D Character",
      description: "360° view of a fully personalized action figure with your details",
      image: "https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      preview: "https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      name: "Personalized Game Character",
      description: "Custom fighter selection screen with your name and personalized stats",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      preview: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      name: "Personalized Vinyl Figure",
      description: "Custom vinyl figure with your name and unique personalized features",
      image: "https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      preview: "https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      name: "Personalized Mecha Figure",
      description: "Customized robotic action figure with your name on the display base",
      image: "https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      preview: "https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      name: "Personalized Fashion Doll",
      description: "Custom fashion doll with your name on the packaging and accessories",
      image: "https://images.pexels.com/photos/17023172/pexels-photo-17023172/free-photo-of-a-barbie-toy-on-a-sofa.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      preview: "https://images.pexels.com/photos/17023172/pexels-photo-17023172/free-photo-of-a-barbie-toy-on-a-sofa.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      name: "Personalized Superhero Pack",
      description: "Custom superhero action figure with your name on the collectible box",
      image: "https://images.pexels.com/photos/8346904/pexels-photo-8346904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      preview: "https://images.pexels.com/photos/8346904/pexels-photo-8346904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      name: "Personalized Brand Mascot",
      description: "Custom brand mascot figure featuring your company name and logo",
      image: "https://images.pexels.com/photos/6498998/pexels-photo-6498998.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      preview: "https://images.pexels.com/photos/6498998/pexels-photo-6498998.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      name: "Personalized Character Box",
      description: "Custom character with your name integrated into the design and packaging",
      image: "https://images.pexels.com/photos/6601811/pexels-photo-6601811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      preview: "https://images.pexels.com/photos/6601811/pexels-photo-6601811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      name: "Personalized Prize Toy",
      description: "Custom prize figure with your name and personalized story card",
      image: "https://images.pexels.com/photos/1670044/pexels-photo-1670044.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      preview: "https://images.pexels.com/photos/1670044/pexels-photo-1670044.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    {
      name: "Personalized Retro Game Box",
      description: "Custom video game character box featuring your name as the hero",
      image: "https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      preview: "https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    }
  ];

  useEffect(() => {
    let timer: number | undefined;
    
    if (autoPlay && !isHovering) {
      timer = window.setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % styles.length);
      }, interval);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoPlay, interval, styles.length, isHovering]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? styles.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % styles.length
    );
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-10"></div>
            <img 
              src={styles[currentIndex].image} 
              alt={styles[currentIndex].name}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute left-0 bottom-0 p-6 z-20 text-white"
            >
              <h3 className="text-xl md:text-2xl font-bold flex items-center mb-1">
                {styles[currentIndex].name}
                <motion.div 
                  className="ml-2" 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </motion.div>
              </h3>
              <p className="text-sm md:text-base text-white/80">{styles[currentIndex].description}</p>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "40%" }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-1 bg-primary-500 mt-3 rounded-full"
              ></motion.div>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center z-20"
            >
              <Box className="w-4 h-4 text-primary-600 mr-1" />
              <span className="text-xs font-medium text-primary-700">Personalized Action Figure</span>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button 
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <button 
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleNext}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {styles.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === index 
                ? "bg-white w-4" 
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ActionFigureCarousel;
export { ActionFigureCarousel };