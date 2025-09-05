import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  maxWidth?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  delay = 300,
  className = '',
  maxWidth = '200px'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Position classes for the tooltip
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  // Arrow classes for the tooltip
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent'
  };

  // Animation variants based on position
  const variants = {
    top: {
      hidden: { opacity: 0, y: -5, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1 }
    },
    bottom: {
      hidden: { opacity: 0, y: 5, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1 }
    },
    left: {
      hidden: { opacity: 0, x: -5, scale: 0.95 },
      visible: { opacity: 1, x: 0, scale: 1 }
    },
    right: {
      hidden: { opacity: 0, x: 5, scale: 0.95 },
      visible: { opacity: 1, x: 0, scale: 1 }
    }
  };

  const showTooltip = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setHoverTimeout(timeout as unknown as NodeJS.Timeout);
  };

  const hideTooltip = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsVisible(false);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute z-50 ${positionClasses[position]} pointer-events-none ${className}`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants[position]}
            transition={{ 
              duration: 0.2,
              type: "spring",
              stiffness: 500, 
              damping: 30
            }}
          >
            <div 
              className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded shadow-lg backdrop-blur-sm bg-opacity-90"
              style={{ maxWidth }}
            >
              {content}
            </div>
            <div 
              className={`absolute w-0 h-0 border-4 ${arrowClasses[position]} border-gray-900`}
            ></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;