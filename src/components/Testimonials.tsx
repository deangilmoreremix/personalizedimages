import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Quote, ChevronLeft, ChevronRight, Star, MessageSquare, ThumbsUp } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Charles Edgerton',
    role: 'Marketing Consultant',
    quote: 'Charles Edgerton closed a $100k deal with VideoRemix as the cornerstone to the marketing package he created for his client.',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 5
  },
  {
    id: 2,
    name: 'Mike Larouche',
    role: 'Agency Owner',
    quote: 'Mike Larouche created virtual marketing agencies with a recurring deal of $2000 per month on the first try using VideoRemix.',
    image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 5
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    role: 'Internet Marketer',
    quote: 'A fascinating account of a phenomenal Internet marketer with 24 years experience. She changed her approach to video marketing, and thanks to VideoRemix, she was able to reach and surpass her monthly revenue target of $3000.',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4
  },
  {
    id: 4,
    name: 'David Chen',
    role: 'E-commerce Director',
    quote: 'The personalized product videos we created with VideoRemix increased our conversion rate by 43%. Our customers love seeing their names on the product demos!',
    image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 5
  },
  {
    id: 5,
    name: 'Emily Rodriguez',
    role: 'Social Media Strategist',
    quote: 'VideoRemix transformed how we approach client content. We now create personalized social campaigns that deliver 3x more engagement than our previous content.',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 5
  }
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const testimonialVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };
  
  const [direction, setDirection] = useState(0);

  return (
    <section id="testimonials" className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-700"></div>
      
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10" style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      }}></div>
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-4"
          >
            SUCCESS STORIES
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 text-white"
          >
            What Are Marketers & Entrepreneurs Saying?
          </motion.h2>
          
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: '120px' }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-1 bg-white/30 mx-auto mb-6 rounded-full"
          ></motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-white/80 max-w-3xl mx-auto"
          >
            Discover how VideoRemix is helping businesses achieve incredible results.
          </motion.p>
        </div>

        <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          {/* Slider controls */}
          <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 z-10 flex justify-between px-4">
            <button 
              onClick={() => {
                setDirection(-1);
                prevTestimonial();
              }}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => {
                setDirection(1);
                nextTestimonial();
              }}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* Main testimonial slider */}
          <div className="overflow-hidden">
            <div className="flex justify-center">
              <motion.div 
                key={currentIndex}
                custom={direction}
                variants={testimonialVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="max-w-4xl"
              >
                <div className="relative z-10 p-1">
                  <div className="rounded-2xl overflow-hidden bg-white/10 backdrop-blur-lg p-10 text-white">
                    {/* Testimonial content */}
                    <div className="grid md:grid-cols-3 gap-8 items-center">
                      {/* Image side */}
                      <div className="md:col-span-1 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 shadow-lg mb-4">
                          <img 
                            src={testimonials[currentIndex].image} 
                            alt={testimonials[currentIndex].name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="text-center">
                          <h3 className="font-bold text-xl">{testimonials[currentIndex].name}</h3>
                          <p className="text-white/70 mb-3">{testimonials[currentIndex].role}</p>
                          
                          <div className="flex justify-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < testimonials[currentIndex].rating ? 'text-yellow-400' : 'text-white/30'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Quote side */}
                      <div className="md:col-span-2 relative">
                        <Quote className="absolute top-0 left-0 w-12 h-12 text-white/20 -translate-x-1/3 -translate-y-1/3" />
                        <p className="text-lg mb-6">"{testimonials[currentIndex].quote}"</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-white/60 text-sm">
                            <MessageSquare className="mr-1 w-4 h-4" /> Verified review
                          </div>
                          
                          <div className="flex items-center space-x-2 text-white/60 text-sm">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Recommended</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Testimonial indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentIndex === index ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
        
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 p-6 bg-white/10 backdrop-blur-sm rounded-2xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: '985%', label: 'Conversion Boost' },
              { number: '15M+', label: 'Images Generated' },
              { number: '9,800+', label: 'Active Users' },
              { number: '99.9%', label: 'Uptime' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="relative p-4"
              >
                {/* Decorative background */}
                <div className="absolute inset-0 bg-white/5 rounded-lg transform rotate-3"></div>
                <div className="relative">
                  <div className="text-3xl font-bold text-white">{stat.number}</div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;