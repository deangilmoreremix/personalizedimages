import React, { useState, useEffect, useRef } from 'react';
import { Table as Tabs, X, MinusIcon, Move, Maximize2, Pin } from 'lucide-react';
import TokensContainer from './ui/TokensContainer';
import { createDefaultTokenValues } from '../types/personalization';
import { useDraggable } from '../hooks/useDraggable';
import { motion, AnimatePresence } from 'framer-motion';

interface DraggableContentPanelProps {
  tokens?: Record<string, string>;
  className?: string;
  onClose?: () => void;
}

const DraggableContentPanel: React.FC<DraggableContentPanelProps> = ({
  tokens = createDefaultTokenValues(),
  className = '',
  onClose
}) => {
  const [minimized, setMinimized] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [showDragHelp, setShowDragHelp] = useState(true);
  
  const { position, isDragging, ref, onMouseDown } = useDraggable({
    initialPosition: { x: 20, y: 100 }
  });
  
  // Ensure the panel is visible within viewport
  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      
      // If panel is outside viewport, adjust position
      if (rect.right > window.innerWidth) {
        const adjust = rect.right - window.innerWidth + 20; // 20px buffer
        position.x -= adjust;
      }
      
      if (rect.bottom > window.innerHeight) {
        const adjust = rect.bottom - window.innerHeight + 20;
        position.y -= adjust;
      }
      
      if (rect.left < 0) {
        position.x = 20; // 20px from left
      }
      
      if (rect.top < 0) {
        position.y = 20; // 20px from top
      }
    }
    
    // Hide drag help after 5 seconds
    const timeout = setTimeout(() => {
      setShowDragHelp(false);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Header variants
  const headerVariants = {
    rest: {
      backgroundColor: "rgba(249, 250, 251, 1)"
    },
    dragging: {
      backgroundColor: "rgba(237, 233, 254, 1)",
      transition: { duration: 0.2 }
    }
  };
  
  // Panel variants
  const panelVariants = {
    minimized: { 
      height: '40px',
      width: '180px',
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    expanded: { 
      height: 'auto',
      width: '280px',
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };
  
  return (
    <>
      <motion.div 
        ref={ref as React.RefObject<HTMLDivElement>}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: 1,
          ...(!pinned ? { 
            position: 'fixed',
            top: position.y, 
            left: position.x,
          } : {}),
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
        }}
        transition={{ duration: 0.3 }}
        className={`bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50 ${className}`}
        style={{
          position: pinned ? 'relative' : 'fixed',
          top: !pinned ? position.y : undefined, 
          left: !pinned ? position.x : undefined,
          cursor: isDragging ? 'grabbing' : 'auto',
          width: minimized ? '180px' : '280px'
        }}
      >
        <motion.div 
          className="bg-gradient-to-r from-purple-50 to-indigo-50 p-2 border-b border-purple-100 flex justify-between items-center cursor-grab active:cursor-grabbing"
          onMouseDown={!pinned ? onMouseDown : undefined}
          variants={headerVariants}
          animate={isDragging ? "dragging" : "rest"}
        >
          <motion.div 
            className="text-sm font-medium flex items-center text-purple-800"
            animate={{ x: isDragging ? 3 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Move className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
            <span>Personalization</span>
          </motion.div>
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.5)" }}
              whileTap={{ scale: 0.9 }}
              className="p-1 hover:bg-white/50 rounded-full text-purple-600"
              onClick={() => setPinned(!pinned)}
              title={pinned ? "Unpin panel" : "Pin panel"}
            >
              <Pin className={`w-3.5 h-3.5 ${pinned ? 'fill-purple-600' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.5)" }}
              whileTap={{ scale: 0.9 }}
              className="p-1 hover:bg-white/50 rounded-full text-purple-600"
              onClick={() => setMinimized(!minimized)}
              title={minimized ? "Expand panel" : "Minimize panel"}
            >
              {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <MinusIcon className="w-3.5 h-3.5" />}
            </motion.button>
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1 hover:bg-white/50 rounded-full text-purple-600"
                title="Close panel"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </motion.div>

        <AnimatePresence initial={false}>
          {!minimized && (
            <motion.div
              initial="minimized"
              animate="expanded"
              exit="minimized"
              variants={panelVariants}
              className="overflow-hidden"
            >
              <TokensContainer 
                tokens={tokens}
                showHeader={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Drag hint animation */}
      <AnimatePresence>
        {showDragHelp && !pinned && (
          <motion.div 
            className="fixed z-50 pointer-events-none"
            style={{ top: position.y + 50, left: position.x + 200 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-purple-50 p-2 rounded-lg border border-purple-100 text-purple-700 text-xs font-medium shadow-lg max-w-[180px]"
              animate={{ 
                y: [0, -5, 0],
                boxShadow: [
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)", 
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: 2,
                repeatType: "reverse"
              }}
            >
              <p>Drag tokens into text fields for personalization</p>
              <motion.div
                className="w-6 h-6 mt-1 ml-2"
                animate={{
                  x: [-5, 5, -5],
                  y: [-5, 5, -5],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: 3
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DraggableContentPanel;