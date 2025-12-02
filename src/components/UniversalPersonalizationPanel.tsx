/**
 * Universal Personalization Panel Component
 * Comprehensive interface for personalizing content across all mediums
 * Supports SMS, Email, Social Media, AI Prompts, and more
 */

import React, { useState, useEffect, useCallback } from 'react';
import { resolveTokens, validateTokens } from '../utils/tokenResolver';
import { PERSONALIZATION_TOKENS } from '../types/personalization';
import { espManager } from '../utils/espManager';

// Content Types
export type ContentType =
  | 'sms' | 'mms' | 'email' | 'social-facebook' | 'social-twitter'
  | 'social-instagram' | 'social-linkedin' | 'website' | 'print'
  | 'prompt-ai' | 'marketing-copy' | 'advertising' | 'newsletter';

// Recipient Data Interface
export interface RecipientData {
  id: string;
  [key: string]: string | number | boolean;
}

// Personalization Template
export interface PersonalizationTemplate {
  id: string;
  name: string;
  contentType: ContentType;
  content: string;
  tokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Component Props
interface UniversalPersonalizationPanelProps {
  onContentGenerated?: (content: string, type: ContentType) => void;
  onTemplateSaved?: (template: PersonalizationTemplate) => void;
  onClose?: () => void;
  initialContent?: string;
  initialContentType?: ContentType;
}

// Content Type Configurations
const CONTENT_TYPE_CONFIGS: Record<ContentType, {
  name: string;
  icon: string;
  maxLength?: number;
  supportsRichText: boolean;
  supportsImages: boolean;
  supportsLinks: boolean;
  validationRules: string[];
}> = {
  sms: {
    name: 'SMS Text Message',
    icon: '📱',
    maxLength: 160,
    supportsRichText: false,
    supportsImages: false,
    supportsLinks: true,
    validationRules: ['Max 160 characters', 'No rich formatting', 'Supports basic links']
  },
  mms: {
    name: 'MMS Message',
    icon: '📸',
    maxLength: 1600,
    supportsRichText: true,
    supportsImages: true,
    supportsLinks: true,
    validationRules: ['Max 1600 characters', 'Supports images', 'Rich text formatting']
  },
  email: {
    name: 'Email',
    icon: '📧',
    supportsRichText: true,
    supportsImages: true,
    supportsLinks: true,
    validationRules: ['HTML support', 'Image embedding', 'Link support', 'ESP merge tags']
  },
  'social-facebook': {
    name: 'Facebook Post',
    icon: '👥',
    maxLength: 63206,
    supportsRichText: true,
    supportsImages: true,
    supportsLinks: true,
    validationRules: ['Max 63,206 characters', 'Image support', 'Link previews']
  },
  'social-twitter': {
    name: 'Twitter/X Post',
    icon: '🐦',
    maxLength: 280,
    supportsRichText: false,
    supportsImages: true,
    supportsLinks: true,
    validationRules: ['Max 280 characters', 'Image/video support', 'Link shortening']
  },
  'social-instagram': {
    name: 'Instagram Post',
    icon: '📷',
    maxLength: 2200,
    supportsRichText: false,
    supportsImages: true,
    supportsLinks: false,
    validationRules: ['Max 2,200 characters', 'Image/video required', 'No links in caption']
  },
  'social-linkedin': {
    name: 'LinkedIn Post',
    icon: '💼',
    maxLength: 3000,
    supportsRichText: true,
    supportsImages: true,
    supportsLinks: true,
    validationRules: ['Max 3,000 characters', 'Professional tone', 'Link support']
  },
  website: {
    name: 'Website Content',
    icon: '🌐',
    supportsRichText: true,
    supportsImages: true,
    supportsLinks: true,
    validationRules: ['SEO optimized', 'Accessibility compliant', 'Mobile responsive']
  },
  print: {
    name: 'Print Material',
    icon: '📰',
    supportsRichText: true,
    supportsImages: true,
    supportsLinks: false,
    validationRules: ['Print-safe colors', 'High resolution images', 'Readable fonts']
  },
  'prompt-ai': {
    name: 'AI Prompt',
    icon: '🤖',
    supportsRichText: false,
    supportsImages: false,
    supportsLinks: false,
    validationRules: ['Clear instructions', 'Specific details', 'Context provided']
  },
  'marketing-copy': {
    name: 'Marketing Copy',
    icon: '📝',
    supportsRichText: true,
    supportsImages: false,
    supportsLinks: true,
    validationRules: ['Compelling headlines', 'Call-to-action', 'Brand voice']
  },
  advertising: {
    name: 'Advertising Copy',
    icon: '📢',
    maxLength: 125,
    supportsRichText: false,
    supportsImages: false,
    supportsLinks: false,
    validationRules: ['Max 125 characters', 'Urgency language', 'Benefit-focused']
  },
  newsletter: {
    name: 'Newsletter',
    icon: '📬',
    supportsRichText: true,
    supportsImages: true,
    supportsLinks: true,
    validationRules: ['Engaging content', 'Value-driven', 'Mobile optimized']
  }
};

// Simple UI Components (inline to avoid import issues)
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>{children}</div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm';
  disabled?: boolean;
}> = ({ children, onClick, className = '', variant = 'default', size = 'default', disabled = false }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200'
  };
  const sizeClasses = size === 'sm' ? 'h-8 px-3 text-sm' : 'h-10 px-4 py-2';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input: React.FC<{
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}> = ({ id, value, onChange, placeholder, className = '', type = 'text' }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const Label: React.FC<{
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}> = ({ children, htmlFor, className = '' }) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none text-gray-700 ${className}`}
  >
    {children}
  </label>
);

const Select: React.FC<{
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}> = ({ children, value, onValueChange }) => (
  <div className="relative">
    {children}
  </div>
);

const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <button
    type="button"
    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {children}
    <span className="ml-2">▼</span>
  </button>
);

const SelectValue: React.FC = () => null;

const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
    {children}
  </div>
);

const SelectItem: React.FC<{
  children: React.ReactNode;
  value: string;
  onClick?: () => void;
}> = ({ children, value, onClick }) => (
  <div
    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
    onClick={onClick}
  >
    {children}
  </div>
);

const Textarea: React.FC<{
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
}> = ({ id, value, onChange, rows = 3, placeholder, className = '' }) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    rows={rows}
    placeholder={placeholder}
    className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'success';
  className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800'
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Tabs: React.FC<{
  children: React.ReactNode;
  defaultValue: string;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

const TabsList: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
    {children}
  </div>
);

const TabsTrigger: React.FC<{
  children: React.ReactNode;
  value: string;
  className?: string;
}> = ({ children, value, className = '' }) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm ${className}`}
  >
    {children}
  </button>
);

const TabsContent: React.FC<{
  children: React.ReactNode;
  value: string;
  className?: string;
}> = ({ children, value, className = '' }) => (
  <div className={`mt-6 ${className}`}>{children}</div>
);

export const UniversalPersonalizationPanel: React.FC<UniversalPersonalizationPanelProps> = ({
  onContentGenerated,
  onTemplateSaved,
  onClose,
  initialContent = '',
  initialContentType = 'email'
}) => {
  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };
  // State Management
  const [contentType, setContentType] = useState<ContentType>(initialContentType);
  const [content, setContent] = useState(initialContent);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [recipientData, setRecipientData] = useState<RecipientData[]>([
    {
      id: 'sample-1',
      FIRSTNAME: 'John',
      LASTNAME: 'Doe',
      EMAIL: 'john.doe@example.com',
      COMPANY: 'Acme Corp',
      PHONE: '+1-555-0123',
      CITY: 'New York',
      STATE: 'NY'
    }
  ]);
  const [previewRecipient, setPreviewRecipient] = useState<string>('sample-1');
  const [templates, setTemplates] = useState<PersonalizationTemplate[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const config = CONTENT_TYPE_CONFIGS[contentType];

  // Token Categories
  const tokenCategories = {
    basic: PERSONALIZATION_TOKENS.filter(t => t.category === 'basic'),
    location: PERSONALIZATION_TOKENS.filter(t => t.category === 'location'),
    company: PERSONALIZATION_TOKENS.filter(t => t.category === 'company'),
    social: PERSONALIZATION_TOKENS.filter(t => t.category === 'social'),
    dates: PERSONALIZATION_TOKENS.filter(t => t.category === 'dates'),
    custom: PERSONALIZATION_TOKENS.filter(t => t.category === 'custom')
  };

  // Generate personalized content
  const generatePersonalizedContent = useCallback(async () => {
    if (!content.trim()) return;

    setIsGenerating(true);
    try {
      const selectedRecipient = recipientData.find(r => r.id === previewRecipient);
      if (!selectedRecipient) return;

      let personalizedContent = content;

      // Resolve tokens
      const tokenResolution = resolveTokens(
        content,
        selectedRecipient as Record<string, string>,
        { contentType: 'email', preserveUnresolved: false }
      );

      personalizedContent = tokenResolution.resolvedContent;

      // Apply content-type specific formatting
      if (contentType.startsWith('social-')) {
        // Social media formatting
        personalizedContent = formatForSocialMedia(personalizedContent, contentType);
      } else if (contentType === 'sms') {
        // SMS formatting (remove HTML, limit length)
        personalizedContent = personalizedContent.replace(/<[^>]*>/g, '').substring(0, 160);
      } else if (contentType === 'email') {
        // Email formatting - could integrate with ESP manager
        personalizedContent = await formatForEmail(personalizedContent);
      }

      if (onContentGenerated) {
        onContentGenerated(personalizedContent, contentType);
      }

      return personalizedContent;
    } catch (error) {
      console.error('Error generating personalized content:', error);
      setValidationErrors(['Failed to generate personalized content']);
    } finally {
      setIsGenerating(false);
    }
  }, [content, contentType, previewRecipient, recipientData, onContentGenerated]);

  // Format content for social media
  const formatForSocialMedia = (content: string, type: ContentType): string => {
    let formatted = content;

    switch (type) {
      case 'social-twitter':
        // Twitter-specific formatting
        formatted = formatted.replace(/\n/g, ' ').substring(0, 280);
        break;
      case 'social-instagram':
        // Instagram caption formatting
        formatted = formatted.replace(/https?:\/\/[^\s]+/g, '').substring(0, 2200);
        break;
      case 'social-facebook':
        // Facebook formatting
        formatted = formatted.substring(0, 63206);
        break;
      case 'social-linkedin':
        // LinkedIn professional formatting
        formatted = formatted.substring(0, 3000);
        break;
    }

    return formatted;
  };

  // Format content for email (integrate with ESP manager)
  const formatForEmail = async (content: string): Promise<string> => {
    try {
      // Use ESP manager for email formatting if available
      const result = espManager.generatePersonalizedContent(
        content,
        (recipientData.find(r => r.id === previewRecipient) || {}) as Record<string, string>,
        'gmail' // Default to Gmail, could be configurable
      );
      return result.emailContent;
    } catch {
      // Fallback to basic HTML formatting
      return content.replace(/\n/g, '<br>');
    }
  };

  // Insert token at cursor position
  const insertToken = (token: string) => {
    const tokenPlaceholder = `[${token}]`;
    setContent(prev => prev + tokenPlaceholder);

    if (!selectedTokens.includes(token)) {
      setSelectedTokens(prev => [...prev, token]);
    }
  };

  // Save template
  const saveTemplate = () => {
    const template: PersonalizationTemplate = {
      id: `template-${Date.now()}`,
      name: `Template ${templates.length + 1}`,
      contentType,
      content,
      tokens: selectedTokens,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTemplates(prev => [...prev, template]);

    if (onTemplateSaved) {
      onTemplateSaved(template);
    }
  };

  // Load template
  const loadTemplate = (template: PersonalizationTemplate) => {
    setContentType(template.contentType);
    setContent(template.content);
    setSelectedTokens(template.tokens);
  };

  // Validate content
  const validateContent = () => {
    const errors: string[] = [];

    if (!content.trim()) {
      errors.push('Content cannot be empty');
    }

    if (config.maxLength && content.length > config.maxLength) {
      errors.push(`Content exceeds maximum length of ${config.maxLength} characters`);
    }

    // Check for unresolved tokens
    const unresolvedTokens = content.match(/\[[^\]]+\]/g) || [];
    if (unresolvedTokens.length > 0) {
      const availableTokens = PERSONALIZATION_TOKENS.map(t => t.key);
      const invalidTokens = unresolvedTokens.filter(token =>
        !availableTokens.includes(token.slice(1, -1))
      );
      if (invalidTokens.length > 0) {
        errors.push(`Invalid tokens found: ${invalidTokens.join(', ')}`);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Get preview content
  const getPreviewContent = () => {
    const selectedRecipient = recipientData.find(r => r.id === previewRecipient);
    if (!selectedRecipient) return content;

    try {
      const tokenResolution = resolveTokens(
        content,
        selectedRecipient as Record<string, string>,
        { contentType: 'email', preserveUnresolved: false }
      );
      return tokenResolution.resolvedContent;
    } catch {
      return content;
    }
  };

  // Effect to validate on content/type change
  useEffect(() => {
    validateContent();
  }, [content, contentType]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto" onClick={handleBackdropClick}>
      <div className="w-full max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 hover:text-gray-800 transition-colors"
          aria-label="Close panel"
        >
          ✕
        </button>

        <div className="p-6 space-y-6">
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            Universal Personalization Panel
            <span className="text-sm text-gray-500 ml-auto">💡 Hover for help</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="editor">Content Editor</TabsTrigger>
              <TabsTrigger value="tokens">Token Library</TabsTrigger>
              <TabsTrigger value="recipients">Recipients</TabsTrigger>
              <TabsTrigger value="preview">Preview & Export</TabsTrigger>
            </TabsList>

            {/* Content Editor Tab */}
            <TabsContent value="editor" className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 mt-0.5">💡</div>
                  <div className="text-sm text-blue-800">
                    <strong>How to use:</strong> Write your content and insert personalization tokens like [FIRSTNAME] or [EMAIL].
                    Switch to the "Token Library" tab to browse available tokens, then click them to insert.
                    Select a recipient from the "Recipients" tab to preview how your content will look.
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Content Type & Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Content Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="content-type">Content Type</Label>
                      <Select value={contentType} onValueChange={(value: string) => setContentType(value as ContentType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CONTENT_TYPE_CONFIGS).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.icon} {config.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Content Features</Label>
                      <div className="flex flex-wrap gap-1">
                        {config.supportsRichText && <Badge variant="success">Rich Text</Badge>}
                        {config.supportsImages && <Badge variant="success">Images</Badge>}
                        {config.supportsLinks && <Badge variant="success">Links</Badge>}
                        {config.maxLength && <Badge variant="secondary">Max: {config.maxLength}</Badge>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Validation Rules</Label>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {config.validationRules.map((rule, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveTemplate} variant="outline" size="sm">
                        Save Template
                      </Button>
                      {templates.length > 0 && (
                        <Select onValueChange={(value) => {
                          const template = templates.find(t => t.id === value);
                          if (template) loadTemplate(template);
                        }}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Load Template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name} ({template.contentType})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Content Editor */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Content Editor
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{content.length}</span>
                        {config.maxLength && <span>/ {config.maxLength}</span>}
                        {config.maxLength && content.length > config.maxLength && (
                          <Badge variant="destructive">Over Limit</Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={12}
                      placeholder={`Enter your ${config.name.toLowerCase()} content here. Use [TOKEN] placeholders for personalization.`}
                      className="font-mono text-sm"
                    />

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-red-600">Validation Errors</Label>
                        <div className="space-y-1">
                          {validationErrors.map((error, index) => (
                            <div key={index} className="text-sm text-red-600 flex items-center gap-2">
                              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                              {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selected Tokens */}
                    {selectedTokens.length > 0 && (
                      <div className="space-y-2">
                        <Label>Selected Tokens</Label>
                        <div className="flex flex-wrap gap-1">
                          {selectedTokens.map(token => (
                            <Badge key={token} variant="default" className="cursor-pointer"
                                   onClick={() => insertToken(token)}>
                              [{token}]
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Token Library Tab */}
            <TabsContent value="tokens" className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-green-600 mt-0.5">🎯</div>
                  <div className="text-sm text-green-800">
                    <strong>Token Library:</strong> Click any token button below to insert it into your content.
                    Tokens like [FIRSTNAME] will be replaced with actual recipient data when sent.
                    Use the Recipients tab to see how they look with real data.
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(tokenCategories).map(([category, tokens]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-lg capitalize">{category} Tokens</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {tokens.map(token => (
                          <Button
                            key={token.key}
                            variant={selectedTokens.includes(token.key) ? "default" : "outline"}
                            size="sm"
                            onClick={() => insertToken(token.key)}
                            className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
                          >
                            <div>
                              <div className="font-medium">[{token.key}]</div>
                              <div className="text-xs opacity-75">{token.description}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Recipients Tab */}
            <TabsContent value="recipients" className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-purple-600 mt-0.5">👥</div>
                  <div className="text-sm text-purple-800">
                    <strong>Recipients:</strong> Click on any recipient card to preview how your personalized content will look for that person.
                    Use this to test different scenarios and ensure your tokens work correctly with real data.
                  </div>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recipient Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Import CSV
                    </Button>
                    <Button variant="outline" size="sm">
                      Add Recipient
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {recipientData.map(recipient => (
                      <Card key={recipient.id} className={`cursor-pointer transition-colors ${
                        previewRecipient === recipient.id ? 'ring-2 ring-blue-500' : ''
                      }`} onClick={() => setPreviewRecipient(recipient.id)}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div><strong>Name:</strong> {recipient.FIRSTNAME} {recipient.LASTNAME}</div>
                            <div><strong>Email:</strong> {recipient.EMAIL}</div>
                            <div><strong>Company:</strong> {recipient.COMPANY}</div>
                            <div><strong>City:</strong> {recipient.CITY}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview & Export Tab */}
            <TabsContent value="preview" className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-orange-600 mt-0.5">👁️</div>
                  <div className="text-sm text-orange-800">
                    <strong>Preview & Export:</strong> Select a recipient to see exactly how your personalized content will look.
                    Click "Generate Final Content" to process the personalization. Use export options to download results.
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Preview Recipient</Label>
                      <Select value={previewRecipient} onValueChange={setPreviewRecipient}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {recipientData.map(recipient => (
                            <SelectItem key={recipient.id} value={recipient.id}>
                              {recipient.FIRSTNAME} {recipient.LASTNAME} ({recipient.EMAIL})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Personalized Content</Label>
                      <div className="min-h-[200px] p-4 bg-gray-50 rounded border whitespace-pre-wrap text-sm">
                        {getPreviewContent()}
                      </div>
                    </div>

                    <Button
                      onClick={generatePersonalizedContent}
                      disabled={isGenerating || validationErrors.length > 0}
                      className="w-full"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Final Content'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Export Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Export Format</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">CSV</Button>
                        <Button variant="outline" size="sm">JSON</Button>
                        <Button variant="outline" size="sm">HTML</Button>
                        <Button variant="outline" size="sm">Text</Button>
                      </div>
                    </div>

                    {contentType === 'email' && (
                      <div className="space-y-2">
                        <Label>Email Service Provider</Label>
                        <Select defaultValue="gmail">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gmail">Gmail</SelectItem>
                            <SelectItem value="outlook">Outlook</SelectItem>
                            <SelectItem value="mailchimp">Mailchimp</SelectItem>
                            <SelectItem value="sendgrid">SendGrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Batch Processing</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Process All Recipients
                        </Button>
                        <Button variant="outline" size="sm">
                          Download Results
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Integration Status</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="success">Ready to Export</Badge>
                        <span className="text-sm text-gray-600">
                          {recipientData.length} recipients configured
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};

export default UniversalPersonalizationPanel;