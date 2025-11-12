import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useDrag } from 'react-dnd';

interface Token {
  key: string;
  value: string;
  category: string;
}

interface TokenPersonalizationBarProps {
  tokens: Record<string, string>;
  onTokenClick?: (token: string) => void;
  className?: string;
  collapsible?: boolean;
}

const TokenChip: React.FC<{ token: Token; onClick?: () => void }> = ({ token, onClick }) => {
  const [copied, setCopied] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TOKEN',
    item: { tokenDisplay: `[${token.key}]`, tokenValue: token.value },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`[${token.key}]`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      ref={drag}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="group relative inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg cursor-move hover:border-indigo-300 transition-all"
    >
      <Tag className="w-3 h-3 text-indigo-600" />
      <div className="flex flex-col">
        <span className="text-xs font-mono font-medium text-indigo-900">[{token.key}]</span>
        {token.value && (
          <span className="text-xs text-indigo-600 truncate max-w-[100px]">{token.value}</span>
        )}
      </div>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-indigo-100 rounded"
        title="Copy token"
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-600" />
        ) : (
          <Copy className="w-3 h-3 text-indigo-600" />
        )}
      </button>
    </motion.div>
  );
};

export const TokenPersonalizationBar: React.FC<TokenPersonalizationBarProps> = ({
  tokens,
  onTokenClick,
  className = '',
  collapsible = true
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const tokenList: Token[] = Object.entries(tokens).map(([key, value]) => ({
    key,
    value,
    category: getCategoryForToken(key)
  }));

  const groupedTokens = tokenList.reduce((acc, token) => {
    if (!acc[token.category]) {
      acc[token.category] = [];
    }
    acc[token.category].push(token);
    return acc;
  }, {} as Record<string, Token[]>);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 flex items-center justify-between border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-gray-900 text-sm">Personalization Tokens</h3>
          <span className="text-xs text-gray-500">
            ({tokenList.length} available)
          </span>
        </div>
        {collapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-indigo-100 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-indigo-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        )}
      </div>

      {/* Token Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {Object.entries(groupedTokens).map(([category, tokens]) => (
                <div key={category}>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    {category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tokens.map((token) => (
                      <TokenChip
                        key={token.key}
                        token={token}
                        onClick={() => onTokenClick?.(`[${token.key}]`)}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Helper Text */}
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="font-medium mb-1">How to use:</p>
                <ul className="space-y-1 list-disc pl-4">
                  <li>Drag tokens into text fields for automatic personalization</li>
                  <li>Click to copy token syntax</li>
                  <li>Tokens will be replaced with actual values during generation</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getCategoryForToken(key: string): string {
  const categoryMap: Record<string, string> = {
    FIRSTNAME: 'Basic Info',
    LASTNAME: 'Basic Info',
    EMAIL: 'Contact',
    PHONE: 'Contact',
    COMPANY: 'Business',
    JOBTITLE: 'Business',
    WEBSITE: 'Business',
    CITY: 'Location',
    STATE: 'Location',
    COUNTRY: 'Location',
    DATE: 'Dates',
    TIME: 'Dates'
  };

  return categoryMap[key] || 'Custom';
}

export default TokenPersonalizationBar;
