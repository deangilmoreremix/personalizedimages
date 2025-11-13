import React, { useState } from 'react';
import { Tag, Plus, Edit, Trash2, Copy, Search, Filter, X } from 'lucide-react';

export interface Token {
  id: string;
  key: string;
  value: string;
  category: 'personal' | 'branding' | 'content' | 'social' | 'custom';
  description?: string;
  usage?: string[];
}

interface TokenPaletteProps {
  tokens: Record<string, string>;
  onTokenUpdate: (key: string, value: string) => void;
  onTokenAdd: (token: Omit<Token, 'id'>) => void;
  onTokenDelete: (key: string) => void;
  onTokenInsert: (tokenKey: string) => void;
  availableTokens?: Token[];
  className?: string;
}

const TokenPalette: React.FC<TokenPaletteProps> = ({
  tokens,
  onTokenUpdate,
  onTokenAdd,
  onTokenDelete,
  onTokenInsert,
  availableTokens = [],
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingToken, setEditingToken] = useState<string | null>(null);

  // Default token categories
  const defaultTokens: Token[] = [
    { id: '1', key: 'FIRSTNAME', value: tokens.FIRSTNAME || '', category: 'personal', description: 'Recipient first name', usage: ['emails', 'personalization'] },
    { id: '2', key: 'LASTNAME', value: tokens.LASTNAME || '', category: 'personal', description: 'Recipient last name', usage: ['emails', 'forms'] },
    { id: '3', key: 'COMPANY', value: tokens.COMPANY || '', category: 'branding', description: 'Company name', usage: ['emails', 'branding'] },
    { id: '4', key: 'BRAND_COLOR', value: tokens.BRAND_COLOR || '#3B82F6', category: 'branding', description: 'Primary brand color', usage: ['images', 'design'] },
    { id: '5', key: 'LOGO_URL', value: tokens.LOGO_URL || '', category: 'branding', description: 'Company logo URL', usage: ['emails', 'images'] },
    { id: '6', key: 'EVENT_DATE', value: tokens.EVENT_DATE || '', category: 'content', description: 'Event date', usage: ['emails', 'invitations'] },
    { id: '7', key: 'LOCATION', value: tokens.LOCATION || '', category: 'content', description: 'Event location', usage: ['emails', 'maps'] },
    { id: '8', key: 'HANDLE', value: tokens.HANDLE || '', category: 'social', description: 'Social media handle', usage: ['social', 'bios'] },
    { id: '9', key: 'HASHTAGS', value: tokens.HASHTAGS || '', category: 'social', description: 'Social media hashtags', usage: ['social', 'posts'] },
  ];

  const allTokens = [...defaultTokens, ...availableTokens];

  const categories = [
    { id: 'all', name: 'All Tokens', color: 'bg-gray-100 text-gray-800' },
    { id: 'personal', name: 'Personal', color: 'bg-blue-100 text-blue-800' },
    { id: 'branding', name: 'Branding', color: 'bg-purple-100 text-purple-800' },
    { id: 'content', name: 'Content', color: 'bg-green-100 text-green-800' },
    { id: 'social', name: 'Social', color: 'bg-pink-100 text-pink-800' },
    { id: 'custom', name: 'Custom', color: 'bg-orange-100 text-orange-800' },
  ];

  const filteredTokens = allTokens.filter(token => {
    const matchesSearch = token.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         token.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || token.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTokenClick = (token: Token) => {
    onTokenInsert(token.key);
  };

  const handleValueChange = (key: string, value: string) => {
    onTokenUpdate(key, value);
  };

  const handleAddToken = (newToken: Omit<Token, 'id'>) => {
    onTokenAdd(newToken);
    setShowAddForm(false);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Personalization Tokens
          </h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Add new token"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category.id
                  ? category.color
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Token List */}
      <div className="max-h-96 overflow-y-auto p-4">
        {filteredTokens.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No tokens found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTokens.map(token => (
              <div
                key={token.id}
                className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-blue-600">
                        [{token.key}]
                      </code>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        token.category === 'personal' ? 'bg-blue-100 text-blue-800' :
                        token.category === 'branding' ? 'bg-purple-100 text-purple-800' :
                        token.category === 'content' ? 'bg-green-100 text-green-800' :
                        token.category === 'social' ? 'bg-pink-100 text-pink-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {token.category}
                      </span>
                    </div>
                    {token.description && (
                      <p className="text-xs text-gray-600 mb-2">{token.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTokenClick(token)}
                      className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                      title="Insert token"
                    >
                      <Copy className="w-3 h-3 text-blue-600" />
                    </button>
                    <button
                      onClick={() => setEditingToken(token.key)}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Edit token"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onTokenDelete(token.key)}
                      className="p-1.5 hover:bg-red-100 rounded transition-colors"
                      title="Delete token"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Token Value Input */}
                {editingToken === token.key ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={token.value}
                      onChange={(e) => handleValueChange(token.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Enter value for ${token.key}`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingToken(null)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingToken(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-sm text-gray-700 break-all">
                      {token.value || <span className="text-gray-400 italic">No value set</span>}
                    </p>
                  </div>
                )}

                {/* Usage hints */}
                {token.usage && token.usage.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {token.usage.map(usage => (
                      <span
                        key={usage}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {usage}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Token Form */}
      {showAddForm && (
        <div className="border-t p-4">
          <AddTokenForm
            onAdd={handleAddToken}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}
    </div>
  );
};

// Add Token Form Component
interface AddTokenFormProps {
  onAdd: (token: Omit<Token, 'id'>) => void;
  onCancel: () => void;
}

const AddTokenForm: React.FC<AddTokenFormProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    category: 'custom' as Token['category'],
    description: '',
    usage: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.key.trim()) {
      onAdd(formData);
      setFormData({
        key: '',
        value: '',
        category: 'custom',
        description: '',
        usage: []
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Add New Token</h4>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token Key
          </label>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., CUSTOM_FIELD"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Token['category'] }))}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="personal">Personal</option>
            <option value="branding">Branding</option>
            <option value="content">Content</option>
            <option value="social">Social</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Value
        </label>
        <input
          type="text"
          value={formData.value}
          onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Default value for this token"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="What is this token for?"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          Add Token
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TokenPalette;