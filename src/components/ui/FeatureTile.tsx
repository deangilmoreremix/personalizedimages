import React from 'react';
import { motion } from 'framer-motion';

interface FeatureTileProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
  onClick: () => void;
  isNew?: boolean;
  disabled?: boolean;
  badge?: string;
  category?: string;
}

const FeatureTile: React.FC<FeatureTileProps> = ({
  icon,
  title,
  description,
  color = 'bg-primary-500',
  onClick,
  isNew = false,
  disabled = false,
  badge,
  category
}) => {
  // Calculate lighter version of the color for hover effects
  const bgColorClass = color || 'bg-primary-500';
  
  // Card animations - simpler and more subtle
  const cardVariants = {
    initial: { 
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    },
    hover: { 
      y: -4, 
      boxShadow: "0 12px 20px -5px rgba(0, 0, 0, 0.1)",
      transition: { type: "tween", ease: "easeOut", duration: 0.25 } 
    },
    tap: { 
      y: -2,
      boxShadow: "0 8px 15px -5px rgba(0, 0, 0, 0.1)",
      transition: { type: "tween", duration: 0.15 } 
    }
  };

  // Content animations
  const contentVariants = {
    initial: { y: 0 },
    hover: { y: -2, transition: { duration: 0.2 } }
  };

  // Icon animations - simpler and more elegant
  const iconVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { repeat: 0, duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onClick={!disabled ? onClick : undefined}
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-colors ${
        disabled ? 'opacity-60 pointer-events-none' : 'cursor-pointer hover:border-gray-300'
      } relative`}
    >
      {/* New design with horizontal layout */}
      <div className="flex flex-col h-full">
        <div className="p-5">
          <div className="flex items-start gap-4 mb-3">
            {/* Icon container */}
            <motion.div 
              className={`${bgColorClass} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}
              variants={iconVariants}
            >
              <div className="text-white">
                {icon}
              </div>
            </motion.div>
            
            {/* Text content */}
            <motion.div variants={contentVariants} className="flex-grow">
              <h3 className="font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
            </motion.div>
          </div>
        </div>
        
        {/* Bottom section with badges/tags */}
        <div className="flex items-center justify-between mt-auto pt-2 px-5 pb-4 border-t border-gray-100">
          {/* Category badge */}
          {category && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {category}
            </span>
          )}
          
          {/* Status badges container */}
          <div className="flex gap-2 ml-auto">
            {/* "NEW" badge */}
            {isNew && (
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full flex items-center">
                NEW
              </span>
            )}
            
            {/* Custom badge */}
            {badge && !isNew && (
              <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full flex items-center">
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeatureTile;