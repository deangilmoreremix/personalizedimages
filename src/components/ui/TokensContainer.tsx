import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Info } from 'lucide-react';
import DraggableToken from '../DraggableToken';
import { PERSONALIZATION_TOKENS, getTokensByCategory, TokenCategory } from '../../types/personalization';

interface TokensContainerProps {
  tokens: Record<string, string>;
  onClose?: () => void;
  showHeader?: boolean;
  className?: string;
}

const TokensContainer: React.FC<TokensContainerProps> = ({
  tokens,
  onClose,
  showHeader = true,
  className = ''
}) => {
  // Get implemented tokens by category
  const tokensByCategory = getTokensByCategory();
  
  // Filter only implemented tokens
  const implementedCategories = Object.entries(tokensByCategory)
    .filter(([_, categoryTokens]) => categoryTokens.some(token => token.isImplemented))
    .map(([category]) => category as TokenCategory);
    
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {showHeader && (
        <motion.div 
          className="p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <motion.div 
              initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-primary-600 mr-2"
            >
              <Layers className="w-4 h-4" />
            </motion.div>
            <h3 className="font-medium text-gray-800">Personalization Tokens</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">Drag and drop tokens into text fields</p>
        </motion.div>
      )}
      
      <motion.div 
        className="p-3 max-h-[300px] overflow-y-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-2 gap-2 mb-4"
          variants={container}
        >
          {Object.entries(tokens)
            .filter(([key]) => PERSONALIZATION_TOKENS.some(token => token.key === key && token.isImplemented))
            .map(([key, value]) => (
              <motion.div 
                key={key}
                variants={item}
                className="flex flex-col"
              >
                <DraggableToken
                  tokenKey={key}
                  tokenValue={value}
                  size="md"
                  variant="default"
                />
                <motion.div 
                  className="text-xs text-gray-500 mt-1 truncate pl-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {value || 'Not set'}
                </motion.div>
              </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="flex items-start bg-blue-50 p-2 rounded-lg text-xs text-blue-700"
          variants={item}
        >
          <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 mr-1.5 flex-shrink-0" />
          <p>Drag tokens into any text field to insert personalized content</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TokensContainer;