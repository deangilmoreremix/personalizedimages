import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, HelpCircle, LayoutGrid, Maximize2, Minimize2, FullscreenIcon, Minus, Copy, Share2, Bookmark, MessageSquare } from 'lucide-react';

interface FeatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  helpText?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const FeatureDialog: React.FC<FeatureDialogProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  helpText,
  children,
  actions
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dialogSize, setDialogSize] = useState({ width: 900, height: 650 });
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const startResizeRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Close dialog on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle resize events
  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const dx = e.clientX - startResizeRef.current.x;
      const dy = e.clientY - startResizeRef.current.y;
      
      const newWidth = Math.max(600, startResizeRef.current.width + dx);
      const newHeight = Math.max(400, startResizeRef.current.height + dy);
      
      setDialogSize({ width: newWidth, height: newHeight });
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    if (dialogRef.current) {
      startResizeRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: dialogRef.current.offsetWidth,
        height: dialogRef.current.offsetHeight
      };
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleFavorite = () => {
    setIsFavorite(prev => !prev);
  };

  if (!isOpen) return null;

  // Main dialog animations
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.2, 
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.2, 
        ease: "easeIn"
      }
    }
  };
  
  const dialogVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.97
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.3, 
        ease: [0.16, 1, 0.3, 1], 
        when: "beforeChildren", 
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.97,
      y: 20,
      transition: { 
        duration: 0.2, 
        ease: "easeIn" 
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        className={`relative z-10 bg-white ${isFullscreen ? 'fixed inset-0' : 'rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden'}`}
        variants={dialogVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={!isFullscreen ? {
          width: dialogSize.width,
          height: dialogSize.height,
          maxWidth: '95vw',
          maxHeight: '90vh'
        } : undefined}
        onClick={e => e.stopPropagation()}
      >
        {/* Glassmorphism gradient header */}
        <div 
          className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50"
        >
          <div className="flex items-center gap-3">
            <motion.button
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            
            <div className="flex items-center">
              {icon && (
                <motion.div 
                  className="mr-3 p-2.5 bg-indigo-100 rounded-full text-indigo-600"
                  initial={{ rotate: -5, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {icon}
                </motion.div>
              )}
              
              <div>
                <motion.h2 
                  className="text-xl md:text-2xl font-bold text-gray-900"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {title}
                </motion.h2>
                
                {helpText && (
                  <motion.p 
                    className="text-sm text-gray-600 mt-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    {helpText}
                  </motion.p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Help button */}
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowHelp(!showHelp);
              }}
              title="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </motion.button>

            {/* Favorite button */}
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 ${isFavorite ? 'text-yellow-500' : 'text-gray-500 hover:text-indigo-600'} hover:bg-gray-100 rounded-full transition-colors`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite();
              }}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Bookmark className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
            </motion.button>

            {/* Share button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShareOptions(!showShareOptions);
                }}
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>

              {/* Share options dropdown */}
              <AnimatePresence>
                {showShareOptions && (
                  <motion.div
                    className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20 w-48"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink();
                        setShowShareOptions(false);
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2 text-gray-500" />
                      {isCopied ? "Copied!" : "Copy link"}
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Implementation for share dialog would go here
                        setShowShareOptions(false);
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2 text-gray-500" />
                      Share via message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fullscreen toggle */}
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </motion.button>

            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              onClick={onClose}
              title="Close dialog"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Dialog Content with scroll */}
        <div className="flex-1 overflow-auto relative" style={isFullscreen ? { height: 'calc(100vh - 130px)' } : { height: 'calc(100% - 130px)' }}>
          {showHelp ? (
            <motion.div
              className="p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                <h3 className="text-lg font-semibold text-indigo-700 mb-3">Using {title}</h3>
                <div className="prose prose-indigo">
                  <p className="text-gray-700">
                    This feature lets you create personalized content using advanced AI. Here's how to get started:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-100 rounded-full mr-2 text-indigo-800 font-medium text-xs">1</span>
                      <span>Enter your prompt or customize the settings on the left panel</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-100 rounded-full mr-2 text-indigo-800 font-medium text-xs">2</span>
                      <span>Add personalization tokens by dragging them from the tokens panel</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-100 rounded-full mr-2 text-indigo-800 font-medium text-xs">3</span>
                      <span>Click the generate button to create your content</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-100 rounded-full mr-2 text-indigo-800 font-medium text-xs">4</span>
                      <span>Download or share your creation using the buttons provided</span>
                    </li>
                  </ul>
                  
                  <h4 className="text-indigo-800 font-semibold mt-5 mb-2">Tips for best results:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>Be specific with your prompts</li>
                    <li>Try different AI models for varied results</li>
                    <li>Add reference images when available</li>
                    <li>Experiment with different settings</li>
                  </ul>
                  
                  <div className="mt-6 bg-white p-4 rounded-lg border border-indigo-100 flex items-start">
                    <HelpCircle className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-700">Need more help? Ask our AI assistant or check out our <a href="#" className="text-indigo-600 hover:text-indigo-800 underline">documentation</a>.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => setShowHelp(false)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Back to {title}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="p-4 md:p-6"
            >
              {children}
            </motion.div>
          )}
          
          {/* Scroll indicator - appears when content is scrollable */}
          <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-t from-white to-transparent"></div>
        </div>

        {/* Dialog Footer with actions */}
        {(actions || true) && (
          <motion.div 
            className="p-4 md:p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 flex items-center">
                <LayoutGrid className="w-4 h-4 mr-1.5" />
                {title} Feature
              </div>
              <div className="flex justify-end gap-3">
                {actions ? (
                  actions
                ) : (
                  <motion.button 
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 1 }}
                    onClick={onClose}
                  >
                    Done
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Resizable corner handle - only shown when not in fullscreen */}
        {!isFullscreen && (
          <div 
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize"
            onMouseDown={startResize}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              className="absolute bottom-2 right-2 text-gray-400"
              fill="currentColor"
            >
              <rect x="0" y="8" width="2" height="2" />
              <rect x="4" y="8" width="2" height="2" />
              <rect x="8" y="8" width="2" height="2" />
              <rect x="4" y="4" width="2" height="2" />
              <rect x="8" y="4" width="2" height="2" />
              <rect x="8" y="0" width="2" height="2" />
            </svg>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FeatureDialog;