import React from 'react';
import { motion } from 'framer-motion';
import { Video, Zap, ArrowRight, Play, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VideoIntegrationBannerProps {
  className?: string;
  onTryNow?: () => void;
}

const VideoIntegrationBanner: React.FC<VideoIntegrationBannerProps> = ({ 
  className = '',
  onTryNow
}) => {
  return (
    <motion.div 
      className={`bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 shadow-lg overflow-hidden relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div 
          className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full"
          animate={{ 
            y: [0, 10, 0],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />
        
        <motion.div 
          className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2"
          animate={{ 
            rotate: [0, 360],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <svg width="300" height="300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="0.5" strokeDasharray="1 3" />
          </svg>
        </motion.div>
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        <div className="md:w-2/3">
          <motion.div 
            className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Zap className="w-4 h-4 mr-1.5" />
            New Premium Feature
          </motion.div>
          
          <motion.h3 
            className="text-2xl md:text-3xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Transform Images into Videos
          </motion.h3>
          
          <motion.p 
            className="text-white/90 mb-6 max-w-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Convert any AI-generated image into an eye-catching video with professional motion effects. 
            Videos get 48% more engagement than static images on social media. Just $1 per download.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={onTryNow}
              className="px-5 py-2.5 bg-white text-indigo-700 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Try Now
            </button>
            
            <Link
              to="/editor"
              className="px-5 py-2.5 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center"
            >
              Learn More
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        </div>
        
        <motion.div 
          className="md:w-1/3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-white" />
            </div>
            
            <h4 className="text-white font-bold text-lg mb-2">Premium Video Features</h4>
            
            <ul className="text-white/80 text-sm space-y-2 text-left mb-4">
              <li className="flex items-start">
                <div className="bg-white/20 p-1 rounded-full mr-2 mt-0.5">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span>5 professional motion effects</span>
              </li>
              <li className="flex items-start">
                <div className="bg-white/20 p-1 rounded-full mr-2 mt-0.5">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span>HD quality (720p/1080p)</span>
              </li>
              <li className="flex items-start">
                <div className="bg-white/20 p-1 rounded-full mr-2 mt-0.5">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span>Optional background music</span>
              </li>
            </ul>
            
            <div className="flex items-center justify-center text-white font-bold text-2xl mb-2">
              <DollarSign className="w-5 h-5 mr-1" />
              <span>1</span>
              <span className="text-sm font-normal ml-1">per download</span>
            </div>
            
            <p className="text-white/70 text-xs">No subscription required</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VideoIntegrationBanner;