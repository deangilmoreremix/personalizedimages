import React, { useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { Copy, TagIcon, TagIcon as DragIcon } from 'lucide-react';
import { ItemTypes, TokenDragItem } from '../types/DragTypes';
import { formatTokenForDisplay } from '../types/personalization';
import classNames from 'classnames';
import { useTouchDrag } from '../hooks/useTouchDrag';
import { getEmptyImage } from 'react-dnd-html5-backend';

interface DraggableTokenProps {
  tokenKey: string;
  tokenValue: string;
  onCopy?: (token: string) => void;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

/**
 * A draggable token component that can be moved around and dropped into droppable areas
 */
const DraggableToken: React.FC<DraggableTokenProps> = ({
  tokenKey,
  tokenValue,
  onCopy,
  showValue = false,
  size = 'md',
  variant = 'default'
}) => {
  const tokenDisplay = formatTokenForDisplay(tokenKey);
  const [copyActive, setCopyActive] = useState(false);
  const tokenRef = useRef<HTMLDivElement>(null);
  const [animateGlow, setAnimateGlow] = useState(false);
  
  // Set up drag source with react-dnd
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.TOKEN,
    item: { 
      type: ItemTypes.TOKEN,
      tokenKey,
      tokenValue,
      tokenDisplay
    } as TokenDragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (item, monitor) => {
      // When the drag ends and it was successful, animate the token
      if (monitor.didDrop()) {
        setAnimateGlow(true);
        setTimeout(() => setAnimateGlow(false), 1500);
      }
    }
  }), [tokenKey, tokenValue, tokenDisplay]);
  
  // Use empty image for preview
  React.useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);
  
  // Set up touch drag for mobile devices
  const { isDragging: isTouchDragging, handleTouchStart } = useTouchDrag({
    onDragStart: () => {
      // Create a visual clone for touch dragging
      if (tokenRef.current) {
        const rect = tokenRef.current.getBoundingClientRect();
        const clone = tokenRef.current.cloneNode(true) as HTMLDivElement;
        clone.style.position = 'fixed';
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.zIndex = '9999';
        clone.style.pointerEvents = 'none';
        clone.style.opacity = '0.8';
        clone.style.transform = 'scale(1.05)';
        document.body.appendChild(clone);
        
        // Store a reference to remove it later
        const cleanup = () => {
          document.body.removeChild(clone);
          document.removeEventListener('touchend', cleanup);
        };
        document.addEventListener('touchend', cleanup);
      }
    }
  });
  
  // Determine size classes
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-sm py-1 px-2',
    lg: 'text-base py-1.5 px-3'
  }[size];
  
  // Determine variant classes
  const variantClasses = {
    default: 'bg-purple-100 text-purple-700 border border-purple-200',
    outline: 'bg-white text-purple-700 border border-purple-300',
    ghost: 'text-purple-700 hover:bg-purple-50 border border-transparent'
  }[variant];
  
  // Handle token copying
  const handleCopyToken = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (onCopy) {
      onCopy(tokenDisplay);
    } else {
      navigator.clipboard.writeText(tokenDisplay);
      
      // Show copied animation
      setCopyActive(true);
      setTimeout(() => setCopyActive(false), 1500);
    }
  };

  // Animation variants
  const glowAnimation = {
    glow: {
      boxShadow: [
        "0 0 0 rgba(139, 92, 246, 0)",
        "0 0 8px rgba(139, 92, 246, 0.6)",
        "0 0 0 rgba(139, 92, 246, 0)"
      ],
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5
      }
    }
  };
  
  return (
    <motion.div 
      ref={(node) => {
        drag(node);
        tokenRef.current = node;
      }}
      className={classNames(
        `inline-flex items-center rounded-md ${sizeClasses} ${variantClasses}`,
        'cursor-grab active:cursor-grabbing transition-all duration-150 select-none relative',
        isDragging ? 'opacity-50' : 'opacity-100'
      )}
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      animate={animateGlow ? "glow" : undefined}
      variants={glowAnimation}
      onTouchStart={handleTouchStart}
      style={{ touchAction: 'none' }}
    >
      {/* Ripple effect for successful drops */}
      {animateGlow && (
        <motion.span 
          className="absolute inset-0 rounded-md bg-purple-400"
          initial={{ opacity: 0.3, scale: 1 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.8 }}
        />
      )}
      
      {/* Drag indicator */}
      <motion.div
        className="mr-1.5 text-purple-500 cursor-grab"
        whileHover={{ rotate: [-5, 5, -5, 0], transition: { duration: 0.5 } }}
      >
        <DragIcon className="w-3.5 h-3.5" />
      </motion.div>
      
      {/* Token text */}
      <span className="font-mono">{tokenDisplay}</span>
      
      {/* Token value (optional) */}
      {showValue && (
        <span className="ml-1 text-xs text-purple-500 opacity-75 max-w-[100px] truncate">
          = {tokenValue || 'empty'}
        </span>
      )}
      
      {/* Copy button */}
      <motion.button
        onClick={handleCopyToken}
        className={`ml-1.5 p-0.5 rounded hover:bg-purple-200 transition-colors ${copyActive ? 'text-green-600' : 'text-purple-400 hover:text-purple-600'}`}
        title="Copy token"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <Copy className="w-3 h-3" />
      </motion.button>
      
      {/* Success animation */}
      {copyActive && (
        <motion.div 
          className="absolute left-0 right-0 -bottom-5 text-xs text-green-600 font-medium text-center"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
        >
          Copied!
        </motion.div>
      )}
    </motion.div>
  );
};

export default DraggableToken;