import React, { useState, useCallback } from 'react';
import { User, X, Check, Sparkles } from 'lucide-react';

interface PersonalizationToken {
  key: string;
  value: string;
  category: 'user' | 'brand' | 'dynamic';
  label: string;
  placeholder?: string;
}

interface PersonalizationPanelProps {
  tokens: Record<string, string>;
  onTokensChange: (tokens: Record<string, string>) => void;
  mode?: 'basic' | 'action-figure' | 'advanced';
  onModeChange?: (mode: 'basic' | 'action-figure' | 'advanced') => void;
  showPreview?: boolean;
  previewPrompt?: string;
  className?: string;
}

const PersonalizationPanel: React.FC<PersonalizationPanelProps> = ({
  tokens,
  onTokensChange,
  mode = 'basic',
  onModeChange,
  showPreview = false,
  previewPrompt = '',
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const updateToken = useCallback((key: string, value: string) => {
    onTokensChange({ ...tokens, [key]: value });
  }, [tokens, onTokensChange]);

  const getContextualTokens = useCallback(() => {
    const baseTokens = [
      { key: 'FIRSTNAME', value: tokens.FIRSTNAME || '', label: 'First Name', placeholder: 'John' },
      { key: 'LASTNAME', value: tokens.LASTNAME || '', label: 'Last Name', placeholder: 'Doe' },
      { key: 'COMPANY', value: tokens.COMPANY || '', label: 'Company', placeholder: 'Acme Corp' },
      { key: 'EMAIL', value: tokens.EMAIL || '', label: 'Email', placeholder: 'john@acme.com' }
    ];

    if (mode === 'action-figure') {
      return [
        ...baseTokens,
        { key: 'CHARACTER_NAME', value: tokens.CHARACTER_NAME || '', label: 'Character Name', placeholder: 'Max Thunder' },
        { key: 'STYLE', value: tokens.STYLE || 'heroic', label: 'Style', placeholder: 'heroic' },
        { key: 'POSE', value: tokens.POSE || 'action', label: 'Pose', placeholder: 'power-pose' },
        { key: 'ENVIRONMENT', value: tokens.ENVIRONMENT || 'urban', label: 'Environment', placeholder: 'urban' }
      ];
    }

    if (mode === 'advanced') {
      return [
        ...baseTokens,
        { key: 'BRAND_COLOR', value: tokens.BRAND_COLOR || '#3B82F6', label: 'Brand Color', placeholder: '#3B82F6' },
        { key: 'FONT_STYLE', value: tokens.FONT_STYLE || 'modern', label: 'Font Style', placeholder: 'modern' },
        { key: 'TONE', value: tokens.TONE || 'professional', label: 'Tone', placeholder: 'professional' }
      ];
    }

    return baseTokens;
  }, [tokens, mode]);

  const contextualTokens = getContextualTokens();

  if (isCollapsed) {
    return (
      <div className={`bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
              Personalization Active
            </span>
            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs rounded-full capitalize">
              {mode}
            </span>
          </div>
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <User className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Personalization Studio
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onModeChange?.('basic')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  mode === 'basic'
                    ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => onModeChange?.('action-figure')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  mode === 'action-figure'
                    ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Action Figure
              </button>
              <button
                onClick={() => onModeChange?.('advanced')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  mode === 'advanced'
                    ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Advanced
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Collapse panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {mode === 'action-figure' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Character Identity */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Character Identity
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Character Name
                    </label>
                    <input
                      type="text"
                      value={tokens.CHARACTER_NAME || ''}
                      onChange={(e) => updateToken('CHARACTER_NAME', e.target.value)}
                      placeholder="e.g., Max Thunder, Luna Star"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Hero/Villain Style
                    </label>
                    <select
                      value={tokens.STYLE || 'heroic'}
                      onChange={(e) => updateToken('STYLE', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="heroic">Heroic (Powerful, noble)</option>
                      <option value="mysterious">Mysterious (Enigmatic, stealthy)</option>
                      <option value="tech">Tech-Savvy (Gadgets, futuristic)</option>
                      <option value="brutal">Brutal (Tough, intimidating)</option>
                      <option value="agile">Agile (Fast, acrobatic)</option>
                      <option value="wise">Wise (Mentor, magical)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action & Environment */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Action & Environment
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Action Pose
                    </label>
                    <select
                      value={tokens.POSE || 'action'}
                      onChange={(e) => updateToken('POSE', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="power-pose">Power Pose (Confident stance)</option>
                      <option value="combat-ready">Combat Ready (Fighting position)</option>
                      <option value="flying">Flying (Dynamic motion)</option>
                      <option value="stealth">Stealth (Sneaking, hiding)</option>
                      <option value="victory">Victory (Celebrating win)</option>
                      <option value="intense">Intense Focus (Concentrating)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Environment
                    </label>
                    <select
                      value={tokens.ENVIRONMENT || 'urban'}
                      onChange={(e) => updateToken('ENVIRONMENT', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="urban">Urban Cityscape</option>
                      <option value="sci-fi">Sci-Fi Space Station</option>
                      <option value="fantasy">Fantasy Landscape</option>
                      <option value="post-apocalyptic">Post-Apocalyptic Ruins</option>
                      <option value="underwater">Underwater Scene</option>
                      <option value="mountain">Mountain Peak</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Preview */}
            {showPreview && previewPrompt && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Live Prompt Preview</h4>
                <div className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Create an action figure of <strong>{tokens.CHARACTER_NAME || 'Character'}</strong> in a{' '}
                    <strong>{tokens.STYLE || 'heroic'}</strong> style, striking a{' '}
                    <strong>{(tokens.POSE || 'action').replace('-', ' ')}</strong> pose in a{' '}
                    <strong>{tokens.ENVIRONMENT || 'urban'}</strong> environment. {previewPrompt}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : mode === 'advanced' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {contextualTokens.map((token) => (
                <div key={token.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {token.label}
                  </label>
                  {token.key === 'BRAND_COLOR' ? (
                    <input
                      type="color"
                      value={token.value}
                      onChange={(e) => updateToken(token.key, e.target.value)}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                  ) : token.key === 'FONT_STYLE' ? (
                    <select
                      value={token.value}
                      onChange={(e) => updateToken(token.key, e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="bold">Bold</option>
                      <option value="elegant">Elegant</option>
                    </select>
                  ) : token.key === 'TONE' ? (
                    <select
                      value={token.value}
                      onChange={(e) => updateToken(token.key, e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="fun">Fun</option>
                      <option value="serious">Serious</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={token.value}
                      onChange={(e) => updateToken(token.key, e.target.value)}
                      placeholder={token.placeholder}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Basic Mode */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contextualTokens.map((token) => (
                <div key={token.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {token.label}
                  </label>
                  <input
                    type="text"
                    value={token.value}
                    onChange={(e) => updateToken(token.key, e.target.value)}
                    placeholder={token.placeholder}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>How to use tokens:</strong> Use tokens like <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">[FIRSTNAME]</code> in your prompts.
                  They will be automatically replaced with your personalized values.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalizationPanel;