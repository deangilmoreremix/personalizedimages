import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Building2, MapPin, Calendar, Mail, Phone,
  ChevronDown, ChevronUp, Edit2, Check, X, Plus, Folder
} from 'lucide-react';
import { PERSONALIZATION_TOKENS, getTokensByCategory, TokenCategory } from '../../types/personalization';

interface LeftSidebarProps {
  tokens: Record<string, string>;
  onTokensUpdate: (tokens: Record<string, string>) => void;
  onPromptSelect: (prompt: string) => void;
}

const categoryIcons: Record<TokenCategory, any> = {
  basic: User,
  location: MapPin,
  company: Building2,
  social: Mail,
  dates: Calendar,
  engagement: User,
  campaign: Mail,
  communication: Mail,
  dynamic: Calendar
};

const categoryColors: Record<TokenCategory, string> = {
  basic: 'bg-blue-100 text-blue-700',
  location: 'bg-green-100 text-green-700',
  company: 'bg-purple-100 text-purple-700',
  social: 'bg-pink-100 text-pink-700',
  dates: 'bg-orange-100 text-orange-700',
  engagement: 'bg-teal-100 text-teal-700',
  campaign: 'bg-indigo-100 text-indigo-700',
  communication: 'bg-cyan-100 text-cyan-700',
  dynamic: 'bg-amber-100 text-amber-700'
};

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  tokens,
  onTokensUpdate,
  onPromptSelect
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<TokenCategory>>(
    new Set(['basic', 'company'])
  );
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeTokenKey, setActiveTokenKey] = useState<string | null>(null);

  const tokensByCategory = getTokensByCategory();
  const implementedTokens = PERSONALIZATION_TOKENS.filter(t => t.isImplemented);

  const toggleCategory = (category: TokenCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleTokenClick = (key: string) => {
    setActiveTokenKey(key);
    // Trigger a custom event that other components can listen to
    window.dispatchEvent(new CustomEvent('tokenClicked', {
      detail: { key, value: tokens[key], display: `[${key}]` }
    }));

    // Visual feedback
    setTimeout(() => setActiveTokenKey(null), 300);
  };

  const handleStartEdit = (key: string) => {
    setEditingToken(key);
    setEditValue(tokens[key] || '');
  };

  const handleSaveEdit = () => {
    if (editingToken) {
      onTokensUpdate({ ...tokens, [editingToken]: editValue });
      setEditingToken(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingToken(null);
    setEditValue('');
  };

  const getCategoryLabel = (category: TokenCategory): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-teal-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Personalization Tokens</h2>
        <p className="text-xs text-gray-600">Click to insert into your prompt</p>
      </div>

      {/* Token Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {Object.entries(tokensByCategory).map(([category, categoryTokens]) => {
          const implementedInCategory = categoryTokens.filter(t => t.isImplemented);
          if (implementedInCategory.length === 0) return null;

          const isExpanded = expandedCategories.has(category as TokenCategory);
          const Icon = categoryIcons[category as TokenCategory];
          const colorClass = categoryColors[category as TokenCategory];

          return (
            <div key={category} className="rounded-lg border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category as TokenCategory)}
                className="w-full flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${colorClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {getCategoryLabel(category as TokenCategory)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({implementedInCategory.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Tokens List */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="bg-white"
                >
                  <div className="p-2 space-y-1.5">
                    {implementedInCategory.map(token => (
                      <div
                        key={token.key}
                        className={`group relative rounded-md border transition-all ${
                          activeTokenKey === token.key
                            ? 'border-blue-400 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {editingToken === token.key ? (
                          // Edit Mode
                          <div className="p-2 space-y-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={handleSaveEdit}
                                className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors flex items-center justify-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Display Mode
                          <div
                            onClick={() => handleTokenClick(token.key)}
                            className="p-2 cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    [{token.key}]
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {tokens[token.key] || token.displayName}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {token.displayName}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(token.key);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
                              >
                                <Edit2 className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 space-y-2">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Plus className="w-4 h-4" />
          New Token Profile
        </button>
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Folder className="w-4 h-4" />
          Saved Prompts
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;
