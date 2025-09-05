import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { 
  PERSONALIZATION_TOKENS, 
  getTokensByCategory,
  formatTokenForDisplay,
  TokenCategory
} from '../types/personalization';
import DraggableToken from './DraggableToken';

interface TokensPanelProps {
  tokens: Record<string, string>;
  onCopyToken?: (tokenText: string) => void;
  showOnlyImplemented?: boolean;
  className?: string;
  onClose?: () => void;
}

// Category labels for display
const CATEGORY_LABELS: Record<TokenCategory, string> = {
  basic: 'Basic Information',
  location: 'Location',
  company: 'Company Information',
  social: 'Social Media',
  dates: 'Dates & Timing',
  engagement: 'Customer Engagement',
  campaign: 'Campaign',
  communication: 'Communication',
  dynamic: 'Dynamic / Calculated'
};

const TokensPanel: React.FC<TokensPanelProps> = ({ 
  tokens, 
  onCopyToken,
  showOnlyImplemented = true,
  className = '',
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    basic: true // Open basic category by default
  });
  
  // Get tokens by category
  const tokensByCategory = getTokensByCategory();
  
  // Toggle a category's expanded state
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Handle copy token to clipboard
  const handleCopyToken = (token: string) => {
    if (onCopyToken) {
      onCopyToken(token);
    } else {
      navigator.clipboard.writeText(token);
    }
  };
  
  // Filter tokens based on search term
  const filterTokens = () => {
    const results: Record<TokenCategory, typeof PERSONALIZATION_TOKENS> = {
      basic: [],
      location: [],
      company: [],
      social: [],
      dates: [],
      engagement: [],
      campaign: [],
      communication: [],
      dynamic: []
    };
    
    if (!searchTerm) {
      // Return all tokens or only implemented ones
      Object.entries(tokensByCategory).forEach(([category, categoryTokens]) => {
        results[category as TokenCategory] = showOnlyImplemented 
          ? categoryTokens.filter(token => token.isImplemented)
          : categoryTokens;
      });
    } else {
      // Filter based on search term
      PERSONALIZATION_TOKENS.forEach(token => {
        if (
          (token.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (!showOnlyImplemented || token.isImplemented)
        ) {
          results[token.category].push(token);
        }
      });
    }
    
    return results;
  };
  
  const filteredTokens = filterTokens();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2
      }
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-100 ${className}`}>
      <motion.div 
        className="p-3 border-b border-gray-100"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Personalization Tokens</h3>
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
              aria-label="Close tokens panel"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>
      
      <motion.div 
        className="p-3 border-b border-gray-100"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tokens..."
            className="w-full pl-8 pr-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
          />
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {searchTerm && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </motion.button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Drag tokens directly into text fields or click to copy
        </p>
      </motion.div>
      
      <motion.div 
        className="max-h-[300px] overflow-y-auto p-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {Object.entries(filteredTokens).map(([category, categoryTokens]) => {
          // Skip categories with no tokens
          if (categoryTokens.length === 0) return null;
          
          return (
            <motion.div
              key={category}
              variants={itemVariants}
              className="mb-2"
            >
              <motion.div 
                className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                  expandedCategories[category] 
                    ? 'bg-purple-50 text-purple-700' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => toggleCategory(category)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="font-medium text-sm">{CATEGORY_LABELS[category as TokenCategory]}</div>
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: expandedCategories[category] ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </motion.div>
              </motion.div>
              
              <AnimatePresence initial={false}>
                {expandedCategories[category] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 space-y-1 pl-2 overflow-hidden"
                  >
                    {categoryTokens.map(token => (
                      <motion.div 
                        key={token.key} 
                        className={`p-2 rounded hover:bg-gray-50 ${
                          !token.isImplemented ? 'opacity-60' : ''
                        }`}
                        variants={itemVariants}
                        whileHover={{ y: -1, backgroundColor: 'rgba(237, 233, 254, 0.5)' }}
                      >
                        {token.isImplemented ? (
                          <div className="flex-1">
                            <DraggableToken
                              tokenKey={token.key}
                              tokenValue={tokens[token.key] || ''}
                              onCopy={onCopyToken}
                              showValue={true}
                              variant="default"
                            />
                            <div className="text-xs text-gray-500 mt-1 ml-1">
                              {token.description}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-mono text-sm text-gray-400">[{token.key}]</span>
                              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Coming Soon</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {token.description}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
      
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-600 flex items-start">
        <Info className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-purple-600" />
        <div>
          {showOnlyImplemented ? (
            <>
              <p>These tokens will be replaced with your customer data in the final output.</p>
              <p className="mt-1">Use them in your content by typing or <span className="font-medium text-purple-700">dragging tokens</span> directly into text fields.</p>
            </>
          ) : (
            <>
              <p>Only implemented tokens will be replaced with customer data.</p>
              <p className="mt-1">"Coming Soon" tokens are planned for future implementation.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokensPanel;