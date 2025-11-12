/**
 * Email Personalization Hook
 * Provides email-ready image functionality for all image generators
 */

import { useState, useCallback, useMemo } from 'react';
import { GeneratorType, getGeneratorEmailConfig, getRecommendedTokens } from '../config/generatorEmailConfigs';
import { generatePersonalizedImageWithWorker } from '../utils/canvasWorker';
import { sanitizeTokenValue } from '../utils/validation';
import {
  EMAIL_PROVIDERS,
  EmailProvider,
  convertToESPMergeTags,
  validateESPCompatibility,
  generateESPSetupGuide
} from '../utils/emailIntegration';

export interface UseEmailPersonalizationOptions {
  imageUrl: string | null;
  tokens: Record<string, string>;
  generatorType?: GeneratorType;
  onEmailImageGenerated?: (emailImageUrl: string, html: string) => void;
}

export interface EmailPersonalizationState {
  isActive: boolean;
  isGenerating: boolean;
  emailImageUrl: string | null;
  generatedHtml: string;
  error: string | null;
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
}

export const useEmailPersonalization = (options: UseEmailPersonalizationOptions) => {
  const { imageUrl, tokens, generatorType = 'ai-image', onEmailImageGenerated } = options;

  const [state, setState] = useState<EmailPersonalizationState>({
    isActive: false,
    isGenerating: false,
    emailImageUrl: null,
    generatedHtml: '',
    error: null,
    selectedProvider: 'gmail',
    template: getGeneratorEmailConfig(generatorType).defaultTemplate,
    subject: 'Special offer just for you!',
    linkText: 'View Special Offer',
    linkUrl: 'https://example.com/special-offer',
    bgColor: '#f9fafb',
    textColor: '#111827',
    accentColor: '#4f46e5',
    width: 600,
    imageHeight: 400,
    personalizationTokens: []
  });

  // Get recommended tokens for this generator
  const recommendedTokens = useMemo(() => {
    return getRecommendedTokens(generatorType, tokens);
  }, [generatorType, tokens]);

  // Validate tokens for selected ESP
  const tokenValidation = useMemo(() => {
    const availableTokens = Object.keys(tokens);
    const provider = EMAIL_PROVIDERS[state.selectedProvider];

    const validTokens = availableTokens.filter(token =>
      provider.supportedTokens.includes(token.toLowerCase()) ||
      provider.supportedTokens.includes(token) ||
      token.startsWith('custom_')
    );

    const invalidTokens = availableTokens.filter(token =>
      !validTokens.includes(token)
    );

    return {
      validTokens,
      invalidTokens,
      providerName: provider.name,
      supportedTokens: provider.supportedTokens
    };
  }, [state.selectedProvider, tokens]);

  // Toggle email personalization mode
  const toggle = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: !prev.isActive,
      error: null
    }));
  }, []);

  // Update personalization tokens
  const updateTokens = useCallback((newTokens: typeof state.personalizationTokens) => {
    setState(prev => ({
      ...prev,
      personalizationTokens: newTokens
    }));
  }, []);

  // Add a text token
  const addTextToken = useCallback(() => {
    const newToken = {
      id: `token-${Date.now()}`,
      type: 'text' as const,
      value: '[FIRSTNAME]',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#ffffff',
      opacity: 1,
      fontFamily: 'Arial'
    };

    setState(prev => ({
      ...prev,
      personalizationTokens: [...prev.personalizationTokens, newToken]
    }));
  }, []);

  // Remove a token
  const removeToken = useCallback((tokenId: string) => {
    setState(prev => ({
      ...prev,
      personalizationTokens: prev.personalizationTokens.filter(t => t.id !== tokenId)
    }));
  }, []);

  // Update token properties
  const updateToken = useCallback((tokenId: string, property: string, value: any) => {
    setState(prev => ({
      ...prev,
      personalizationTokens: prev.personalizationTokens.map(token =>
        token.id === tokenId ? { ...token, [property]: value } : token
      )
    }));
  }, []);

  // Update template settings
  const updateSettings = useCallback((updates: Partial<EmailPersonalizationState>) => {
    setState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Generate personalized email image and HTML
  const generateEmailImage = useCallback(async () => {
    if (!imageUrl) {
      setState(prev => ({ ...prev, error: 'No image available for personalization' }));
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      // Generate personalized image
      const personalizedImageUrl = await generatePersonalizedImageWithWorker(
        imageUrl,
        tokens,
        state.personalizationTokens
      );

      // Generate HTML email template
      const html = generateEmailHtml(personalizedImageUrl);

      setState(prev => ({
        ...prev,
        emailImageUrl: personalizedImageUrl,
        generatedHtml: html,
        isGenerating: false
      }));

      // Notify parent component
      if (onEmailImageGenerated) {
        onEmailImageGenerated(personalizedImageUrl, html);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate email image',
        isGenerating: false
      }));
    }
  }, [imageUrl, tokens, state.personalizationTokens, onEmailImageGenerated]);

  // Generate HTML email template
  const generateEmailHtml = useCallback((personalizedImageUrl: string): string => {
    const provider = EMAIL_PROVIDERS[state.selectedProvider];

    // Replace tokens in subject and content with ESP merge tags
    let subject = state.subject;
    let linkText = state.linkText;

    // Create token mapping for ESP conversion
    const tokenMapping: Record<string, string> = {};
    Object.keys(tokens).forEach(key => {
      tokenMapping[key] = key.toLowerCase();
    });

    // Convert to ESP merge tags
    subject = convertToESPMergeTags(subject, state.selectedProvider, tokenMapping);
    linkText = convertToESPMergeTags(linkText, state.selectedProvider, tokenMapping);

    // Get ESP-specific image tag
    const imageTag = provider.imageTagFormat
      .replace('{IMAGE_URL}', personalizedImageUrl)
      .replace('{ALT_TEXT}', 'Personalized Image');

    // Base HTML template
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${state.bgColor}; color: ${state.textColor}; }
    .container { max-width: ${state.width}px; margin: 0 auto; padding: 20px; }
    img { max-width: 100%; height: auto; }
    .btn { display: inline-block; padding: 10px 20px; background-color: ${state.accentColor}; color: white; text-decoration: none; border-radius: 4px; }
    @media only screen and (max-width: 480px) {
      .container { padding: 10px; }
      .mobile-padding { padding: 0 10px; }
    }
  </style>
</head>
<body>
  <div class="container">`;

    // Template-specific content with ESP merge tags
    if (state.template === 'centered') {
      const firstNameTag = convertToESPMergeTags('[FIRSTNAME]', state.selectedProvider, tokenMapping) || 'Valued Customer';
      html += `
    <div style="text-align: center; padding: 20px;">
      <h1 style="color: ${state.textColor};">Special Offer For ${firstNameTag}</h1>
      <p>We have a personalized offer just for you!</p>
      <div style="margin: 20px 0;">
        ${imageTag}
      </div>
      <div style="margin-top: 20px;">
        <a href="${state.linkUrl}" class="btn">${linkText}</a>
      </div>
    </div>`;
    } else if (state.template === 'leftAligned') {
      const firstNameTag = convertToESPMergeTags('[FIRSTNAME]', state.selectedProvider, tokenMapping) || 'there';
      html += `
    <div style="padding: 20px;">
      <h1 style="color: ${state.textColor};">Hey ${firstNameTag}!</h1>
      <p>Check out this special offer we've created just for you.</p>
      <div style="margin: 20px 0; display: flex; flex-wrap: wrap;">
        <div style="width: 100%; max-width: 300px; margin-right: 20px; margin-bottom: 20px;">
          ${imageTag}
        </div>
        <div style="flex: 1; min-width: 200px;">
          <h2 style="color: ${state.textColor};">Limited Time Offer</h2>
          <p>This exclusive offer is only available for a limited time. Take advantage before it expires!</p>
          <div style="margin-top: 20px;">
            <a href="${state.linkUrl}" class="btn">${linkText}</a>
          </div>
        </div>
      </div>
    </div>`;
    } else if (state.template === 'announcement') {
      const firstNameTag = convertToESPMergeTags('[FIRSTNAME]', state.selectedProvider, tokenMapping) || 'our valued customer';
      html += `
    <div style="padding: 20px; text-align: center;">
      <div style="background-color: ${state.accentColor}10; padding: 20px; border-radius: 8px;">
        <h1 style="color: ${state.accentColor};">Important Announcement</h1>
        <p style="color: ${state.accentColor};">For ${firstNameTag}</p>
      </div>
      <div style="margin: 20px 0;">
        ${imageTag}
      </div>
      <div style="background-color: #f3f4f6; padding: 20px; margin-top: 20px; border-radius: 8px;">
        <p>Please review this important information</p>
        <div style="margin-top: 15px;">
          <a href="${state.linkUrl}" class="btn" style="font-weight: bold;">${linkText}</a>
        </div>
      </div>
    </div>`;
    }

    // Footer
    html += `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
      <p>© 2025 Your Company. All rights reserved.</p>
      <p>You received this email because you signed up for our newsletter.</p>
      <p><a href="#" style="color: ${state.accentColor};">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

    return html;
  }, [state, tokens]);

  // Copy HTML to clipboard
  const copyHtmlToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.generatedHtml);
      // Could add a toast notification here
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to copy HTML to clipboard' }));
    }
  }, [state.generatedHtml]);

  // Download HTML file
  const downloadHtml = useCallback(() => {
    const element = document.createElement('a');
    const file = new Blob([state.generatedHtml], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = 'personalized-email.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [state.generatedHtml]);

  // Reset state
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      emailImageUrl: null,
      generatedHtml: '',
      error: null,
      personalizationTokens: []
    }));
  }, []);

  return {
    // State
    ...state,
    recommendedTokens,
    tokenValidation,

    // Actions
    toggle,
    updateTokens,
    addTextToken,
    removeToken,
    updateToken,
    updateSettings,
    generateEmailImage,
    copyHtmlToClipboard,
    downloadHtml,
    reset,

    // Computed
    canGenerate: Boolean(imageUrl && !state.isGenerating),
    hasEmailImage: Boolean(state.emailImageUrl),
    config: getGeneratorEmailConfig(generatorType)
  };
};