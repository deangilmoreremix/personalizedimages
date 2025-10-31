import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Info } from 'lucide-react';
import {
  PERSONALIZATION_TOKENS,
  getTokensByCategory,
  formatTokenForDisplay,
  TokenCategory
} from '../types/personalization';
import { sanitizeTokenValue } from '../utils/validation';
import { copyToClipboard } from '../utils/clipboard';
import DraggableToken from '../components/DraggableToken';

interface TokensPanelProps {
  tokens: Record<string, string>;
  onUpdateTokens?: (key: string, value: string) => void;
  showOnlyImplemented?: boolean;
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
  onUpdateTokens,
  showOnlyImplemented = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    basic: true // Open basic category by default
  });
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  // Get tokens by category
  const tokensByCategory = getTokensByCategory();
  
  // Toggle a category's expanded state
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Start editing a token's value
  const startEditingToken = (key: string, currentValue: string) => {
    setEditingToken(key);
    setEditValue(currentValue || '');
  };
  
  // Save token value
  const saveTokenValue = () => {
    if (editingToken && onUpdateTokens) {
      onUpdateTokens(editingToken, sanitizeTokenValue(editValue));
    }
    setEditingToken(null);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingToken(null);
  };
  
  // Handle copy token to clipboard
  const handleCopyToken = async (token: string) => {
    await copyToClipboard(token);
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
  
  return (
    <div className="min-h-screen pt-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Personalization Tokens</h1>
          <p className="text-gray-600 mb-6">
            Customize and manage your personalization tokens. These tokens can be used in your content to create personalized experiences.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Left sidebar - categories */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                <h2 className="font-medium mb-3 text-gray-700">Categories</h2>
                <ul className="space-y-1">
                  {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
                    const count = filteredTokens[category as TokenCategory].length;
                    if (count === 0) return null;
                    
                    return (
                      <li key={category}>
                        <button
                          onClick={() => toggleCategory(category)}
                          className={`w-full text-left py-2 px-3 rounded-md text-sm flex justify-between items-center ${
                            expandedCategories[category] 
                              ? 'bg-primary-50 text-primary-700' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <span>{label}</span>
                          <span className="flex items-center">
                            <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5 mr-1">
                              {count}
                            </span>
                            {expandedCategories[category] ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            
            {/* Main content - token list */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search tokens..."
                      className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="p-4">
                  {Object.entries(filteredTokens).map(([category, categoryTokens]) => {
                    if (categoryTokens.length === 0) return null;
                    
                    return (
                      <div key={category} className="mb-6">
                        {expandedCategories[category] && (
                          <>
                            <div className="bg-gray-50 p-3 rounded-md mb-2">
                              <h3 className="font-medium text-gray-700">{CATEGORY_LABELS[category as TokenCategory]}</h3>
                            </div>
                            
                            <div className="space-y-3">
                              {categoryTokens.map(token => (
                                <div 
                                  key={token.key}
                                  className="bg-white border border-gray-100 rounded-md p-4 hover:border-gray-300 transition-colors shadow-sm"
                                >
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="flex items-center mb-1">
                                        <DraggableToken
                                          tokenKey={token.key}
                                          tokenValue={tokens[token.key] || ''}
                                          onCopy={() => handleCopyToken(formatTokenForDisplay(token.key))}
                                          size="lg"
                                        />
                                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                          {token.isImplemented ? 'Active' : 'Coming Soon'}
                                        </span>
                                      </div>
                                      <p className="text-gray-600 text-sm">{token.description}</p>
                                    </div>
                                    
                                    {token.isImplemented && onUpdateTokens && (
                                      <div>
                                        <button
                                          onClick={() => startEditingToken(token.key, tokens[token.key] || '')}
                                          className="text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                                        >
                                          Edit Value
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Current Value Display */}
                                  {token.isImplemented && editingToken !== token.key && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Current Value:</span>
                                        <span className="text-sm font-medium">{tokens[token.key] || 'Not set'}</span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Editing Interface */}
                                  {token.isImplemented && editingToken === token.key && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                      <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                          <label className="block text-xs text-gray-500 mb-1">Edit Value:</label>
                                          <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-full px-3 py-1 text-sm border rounded-md focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
                                          />
                                        </div>
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={saveTokenValue}
                                            className="px-2 py-1 bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-md text-xs"
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={cancelEditing}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-xs"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-700 mb-1">Working with Personalization Tokens</h3>
                    <p className="text-blue-600 text-sm">
                      Drag and drop tokens directly into content editors or copy them to use in your text.
                      Each token will automatically be replaced with its corresponding value when your content is viewed by customers.
                    </p>
                    <ul className="mt-2 text-sm text-blue-600 list-disc pl-5 space-y-1">
                      <li>Format: <code className="bg-blue-100 px-1 rounded">[TOKEN_NAME]</code></li>
                      <li>For example: <code className="bg-blue-100 px-1 rounded">[FIRSTNAME]</code> will be replaced with the recipient's first name</li>
                      <li>Case-insensitive: <code className="bg-blue-100 px-1 rounded">[firstname]</code> works the same as <code className="bg-blue-100 px-1 rounded">[FIRSTNAME]</code></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokensPanel;