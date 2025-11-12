/**
 * Email Personalization Panel Component
 * Provides a comprehensive interface for email personalization
 */

import React, { useState } from 'react';
import { Mail, Copy, Download, Settings, Eye, EyeOff, Sparkles, Trash } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { EMAIL_PROVIDERS, EmailProvider } from '../utils/emailIntegration';

interface EmailPersonalizationPanelProps {
  imageUrl: string | null;
  personalizationTokens: Array<{
    id: string;
    type: 'text';
    value: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    opacity: number;
    fontFamily: string;
  }>;
  selectedProvider: EmailProvider;
  template: 'centered' | 'leftAligned' | 'announcement';
  subject: string;
  linkText: string;
  linkUrl: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  width: number;
  imageHeight: number;
  generatedHtml: string;
  isGenerating: boolean;
  error: string | null;
  recommendedTokens: Record<string, string>;
  tokenValidation?: {
    validTokens: string[];
    invalidTokens: string[];
    providerName: string;
    supportedTokens: string[];
  };
  onAddToken: () => void;
  onRemoveToken: (tokenId: string) => void;
  onUpdateToken: (tokenId: string, property: string, value: any) => void;
  onUpdateSettings: (updates: any) => void;
  onGenerate: () => void;
  onCopyHtml: () => void;
  onDownloadHtml: () => void;
}

const EmailPersonalizationPanel: React.FC<EmailPersonalizationPanelProps> = ({
  imageUrl,
  personalizationTokens,
  selectedProvider,
  template,
  subject,
  linkText,
  linkUrl,
  bgColor,
  textColor,
  accentColor,
  width,
  imageHeight,
  generatedHtml,
  isGenerating,
  error,
  recommendedTokens,
  tokenValidation,
  onAddToken,
  onRemoveToken,
  onUpdateToken,
  onUpdateSettings,
  onGenerate,
  onCopyHtml,
  onDownloadHtml
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<string | false>(false);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Email Personalization</h3>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Hide' : 'Preview'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Token Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Personalization Tokens</h4>
            <button
              onClick={onAddToken}
              className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              <Sparkles className="w-3 h-3" />
              Add Token
            </button>
          </div>

          {/* Recommended Tokens */}
          {Object.keys(recommendedTokens).length > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-700 mb-2">Recommended tokens for this content:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(recommendedTokens).map(([key, value]) => (
                  <span key={key} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    [{key}]: {value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Token List */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {personalizationTokens.map(token => (
              <div key={token.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    value={token.value}
                    onChange={(e) => onUpdateToken(token.id, 'value', e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="Token text (e.g., [FIRSTNAME])"
                  />
                </div>
                <input
                  type="color"
                  value={token.color}
                  onChange={(e) => onUpdateToken(token.id, 'color', e.target.value)}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <input
                  type="range"
                  min="10"
                  max="72"
                  value={token.fontSize}
                  onChange={(e) => onUpdateToken(token.id, 'fontSize', Number(e.target.value))}
                  className="w-16"
                />
                <span className="text-xs text-gray-500 w-8">{token.fontSize}px</span>
                <button
                  onClick={() => onRemoveToken(token.id)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Email Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Email Settings</h4>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
            >
              <Settings className="w-3 h-3" />
              {showAdvanced ? 'Basic' : 'Advanced'}
            </button>
          </div>

          {/* ESP Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Service Provider
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => onUpdateSettings({ selectedProvider: e.target.value as EmailProvider })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(EMAIL_PROVIDERS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose your ESP for proper merge tag formatting
            </p>
          </div>

          {/* Token Validation */}
          {tokenValidation && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">
                Token Compatibility ({tokenValidation.providerName})
              </div>

              {tokenValidation.validTokens.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-700 mb-2">✅ Compatible tokens:</div>
                  <div className="flex flex-wrap gap-1">
                    {tokenValidation.validTokens.map(token => (
                      <span key={token} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tokenValidation.invalidTokens.length > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-yellow-700 mb-2">⚠️ Incompatible tokens (will use fallback):</div>
                  <div className="flex flex-wrap gap-1">
                    {tokenValidation.invalidTokens.map(token => (
                      <span key={token} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                        {token}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-yellow-600 mt-2">
                    Consider using: {tokenValidation.supportedTokens.slice(0, 3).join(', ')}
                    {tokenValidation.supportedTokens.length > 3 && '...'}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Style
              </label>
              <select
                value={template}
                onChange={(e) => onUpdateSettings({ template: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="centered">Centered</option>
                <option value="leftAligned">Left Aligned</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => onUpdateSettings({ subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call to Action Text
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => onUpdateSettings({ linkText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Button text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call to Action URL
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => onUpdateSettings({ linkUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Width (px)
                  </label>
                  <input
                    type="number"
                    min="300"
                    max="800"
                    value={width}
                    onChange={(e) => onUpdateSettings({ width: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Height (px)
                  </label>
                  <input
                    type="number"
                    min="200"
                    max="800"
                    value={imageHeight}
                    onChange={(e) => onUpdateSettings({ imageHeight: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Color Pickers */}
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border cursor-pointer"
                        style={{ backgroundColor: bgColor }}
                        onClick={() => setShowColorPicker(showColorPicker === 'bg' ? false : 'bg')}
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => onUpdateSettings({ bgColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border cursor-pointer"
                        style={{ backgroundColor: textColor }}
                        onClick={() => setShowColorPicker(showColorPicker === 'text' ? false : 'text')}
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => onUpdateSettings({ textColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border cursor-pointer"
                        style={{ backgroundColor: accentColor }}
                        onClick={() => setShowColorPicker(showColorPicker === 'accent' ? false : 'accent')}
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => onUpdateSettings({ accentColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Picker Modal */}
                {showColorPicker && (
                  <div className="relative">
                    <div className="absolute z-10 mt-2">
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowColorPicker(false)}
                      />
                      <div className="relative bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
                        {showColorPicker === 'bg' && (
                          <HexColorPicker
                            color={bgColor}
                            onChange={(color) => onUpdateSettings({ bgColor: color })}
                          />
                        )}
                        {showColorPicker === 'text' && (
                          <HexColorPicker
                            color={textColor}
                            onChange={(color) => onUpdateSettings({ textColor: color })}
                          />
                        )}
                        {showColorPicker === 'accent' && (
                          <HexColorPicker
                            color={accentColor}
                            onChange={(color) => onUpdateSettings({ accentColor: color })}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {personalizationTokens.length} token{personalizationTokens.length !== 1 ? 's' : ''} configured
          </div>
          <button
            onClick={onGenerate}
            disabled={!imageUrl || isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate Email Image'}
          </button>
        </div>

        {/* Generated Content Actions */}
        {generatedHtml && (
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onCopyHtml}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy HTML
            </button>
            <button
              onClick={onDownloadHtml}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download HTML
            </button>
          </div>
        )}
      </div>

      {/* Preview Section */}
      {showPreview && generatedHtml && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Email Preview</h4>
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            <iframe
              srcDoc={generatedHtml}
              className="w-full h-96 border-0"
              title="Email Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailPersonalizationPanel;