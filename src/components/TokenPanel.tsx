import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Settings,
  X,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  Star,
  User,
  Building,
  Sparkles,
  Palette,
  Type,
  Eye,
  EyeOff
} from 'lucide-react';
import { DraggableToken, TokenData, createTokenTemplates } from './ui/DraggableToken';
import { DESIGN_SYSTEM, getButtonClasses, getAlertClasses, commonStyles } from './ui/design-system';

interface TokenPanelProps {
  tokens: Record<string, string>;
  onTokensChange: (tokens: Record<string, string>) => void;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const TokenPanel: React.FC<TokenPanelProps> = ({
  tokens,
  onTokensChange,
  onClose,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddToken, setShowAddToken] = useState(false);
  const [newTokenKey, setNewTokenKey] = useState('');
  const [newTokenValue, setNewTokenValue] = useState('');
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());

  // Generate token templates with current values
  const tokenTemplates = useMemo(() => createTokenTemplates(tokens), [tokens]);

  // Filter tokens based on search and category
  const filteredTokens = useMemo(() => {
    return tokenTemplates.filter(token => {
      const matchesSearch = searchQuery === '' ||
        token.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || token.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [tokenTemplates, searchQuery, selectedCategory]);

  const categories = [
    { id: 'all', name: 'All Tokens', icon: Star, count: tokenTemplates.length },
    { id: 'user', name: 'User Info', icon: User, count: tokenTemplates.filter(t => t.category === 'user').length },
    { id: 'brand', name: 'Brand', icon: Building, count: tokenTemplates.filter(t => t.category === 'brand').length },
    { id: 'dynamic', name: 'Dynamic', icon: Sparkles, count: tokenTemplates.filter(t => t.category === 'dynamic').length },
    { id: 'style', name: 'Styles', icon: Palette, count: tokenTemplates.filter(t => t.category === 'style').length },
    { id: 'filter', name: 'Filters', icon: Filter, count: tokenTemplates.filter(t => t.category === 'filter').length },
    { id: 'text', name: 'Text', icon: Type, count: tokenTemplates.filter(t => t.category === 'text').length }
  ];

  const handleTokenSelect = (token: TokenData) => {
    setSelectedTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(token.id)) {
        newSet.delete(token.id);
      } else {
        newSet.add(token.id);
      }
      return newSet;
    });
  };

  const handleAddCustomToken = () => {
    if (newTokenKey && newTokenValue) {
      const updatedTokens = { ...tokens, [newTokenKey]: newTokenValue };
      onTokensChange(updatedTokens);
      setNewTokenKey('');
      setNewTokenValue('');
      setShowAddToken(false);
    }
  };

  const handleUpdateToken = (key: string, value: string) => {
    const updatedTokens = { ...tokens, [key]: value };
    onTokensChange(updatedTokens);
  };

  const handleDeleteToken = (key: string) => {
    const updatedTokens = { ...tokens };
    delete updatedTokens[key];
    onTokensChange(updatedTokens);
  };

  const handleBatchDelete = () => {
    const updatedTokens = { ...tokens };
    selectedTokens.forEach(tokenId => {
      const token = tokenTemplates.find(t => t.id === tokenId);
      if (token) {
        delete updatedTokens[token.key];
      }
    });
    onTokensChange(updatedTokens);
    setSelectedTokens(new Set());
  };

  if (isCollapsed) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-medium text-gray-900 dark:text-white">Tokens</span>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
              {tokenTemplates.length}
            </span>
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Personalization Tokens
            </h3>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
              {tokenTemplates.length} available
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggleCollapse}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              title="Collapse panel"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{category.name}</span>
                  <span className="text-xs opacity-75">({category.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Batch Actions */}
        {selectedTokens.size > 0 && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-800 dark:text-red-200">
                {selectedTokens.size} token{selectedTokens.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleBatchDelete}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Token Grid/List */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {filteredTokens.length === 0 ? (
          <div className="text-center py-8">
            <Palette className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tokens found
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery ? 'Try adjusting your search terms.' : 'Add some tokens to get started.'}
            </p>
            <button
              onClick={() => setShowAddToken(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add Custom Token
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3'
              : 'space-y-3'
          }>
            {filteredTokens.map((token) => (
              <div key={token.id} className={viewMode === 'list' ? 'flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg' : ''}>
                <DraggableToken
                  token={token}
                  onTokenSelect={handleTokenSelect}
                  isSelected={selectedTokens.has(token.id)}
                  size={viewMode === 'grid' ? 'md' : 'sm'}
                />
                {viewMode === 'list' && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {token.displayName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {token.key}: {token.value}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleUpdateToken(token.key, prompt('Edit token value:', token.value) || token.value)}
                          className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          title="Edit token"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteToken(token.key)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete token"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with Add Token */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {showAddToken ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Token Key
              </label>
              <input
                type="text"
                value={newTokenKey}
                onChange={(e) => setNewTokenKey(e.target.value)}
                placeholder="e.g., CUSTOM_FIELD"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Token Value
              </label>
              <input
                type="text"
                value={newTokenValue}
                onChange={(e) => setNewTokenValue(e.target.value)}
                placeholder="e.g., Custom Value"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleAddCustomToken}
                disabled={!newTokenKey || !newTokenValue}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Token
              </button>
              <button
                onClick={() => setShowAddToken(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddToken(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Token</span>
          </button>
        )}
      </div>

      {/* Drag Instruction */}
      <div className="px-4 pb-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 Drag tokens onto images to apply personalization effects
        </div>
      </div>
    </div>
  );
};

export default TokenPanel;