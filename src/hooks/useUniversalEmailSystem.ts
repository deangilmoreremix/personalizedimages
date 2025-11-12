/**
 * Universal Email System Hook
 * Provides HTML email generation and ESP integration from EmailImageEditor to all generators
 */

import React, { useState, useCallback } from 'react';
import { sanitizeHtml, sanitizeTokenValue } from '../utils/validation';
import { EMAIL_SERVICE_PROVIDERS, EmailProvider, integratePersonalizedImage } from '../utils/emailIntegration';

export type EmailTemplate = 'centered' | 'leftAligned' | 'announcement';

export interface EmailSettings {
  subject: string;
  linkText: string;
  linkUrl: string;
  template: EmailTemplate;
  width: number;
  height: number;
  bgColor: string;
  textColor: string;
  accentColor: string;
  responsive: boolean;
}

export interface HtmlGeneration {
  generate: (settings: EmailSettings) => string;
  templates: EmailTemplate[];
  preview: (template: EmailTemplate) => React.ReactNode;
  copyToClipboard: () => Promise<void>;
  download: () => void;
  generatedHtml: string;
  isGenerating: boolean;
}

export interface EspIntegration {
  providers: EmailProvider[];
  selected: EmailProvider;
  setSelected: (provider: EmailProvider) => void;
  convertLink: (url: string) => string;
  convertMergeTags: (content: string) => string;
  validateCompatibility: () => {
    isCompatible: boolean;
    supportedTokens: string[];
    unsupportedTokens: string[];
    recommendations: string[];
  };
  providerConfig: typeof EMAIL_SERVICE_PROVIDERS[EmailProvider];
}

export interface CanvasRendering {
  renderTokensOnImage: (tokens: any[], image: HTMLImageElement) => Promise<string>;
  downloadPersonalizedImage: () => Promise<void>;
  previewPersonalizedImage: () => Promise<string>;
  isRendering: boolean;
}

export interface EmailPreview {
  show: boolean;
  size: 'desktop' | 'mobile';
  html: string;
  toggle: () => void;
  copyHtml: () => Promise<void>;
  downloadHtml: () => void;
  copiedToClipboard: boolean;
}

export interface UseUniversalEmailSystemOptions {
  imageUrl: string | null;
  tokens: Record<string, string>;
  personalizationTokens: any[];
}

export const useUniversalEmailSystem = ({
  imageUrl,
  tokens,
  personalizationTokens
}: UseUniversalEmailSystemOptions) => {
  // Email Settings
  const [settings, setSettings] = useState<EmailSettings>({
    subject: 'Special offer just for you!',
    linkText: 'View Special Offer',
    linkUrl: 'https://example.com/special-offer',
    template: 'centered',
    width: 600,
    height: 400,
    bgColor: '#f9fafb',
    textColor: '#111827',
    accentColor: '#4f46e5',
    responsive: true
  });

  // ESP Integration
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider>('gmail');

  // HTML Generation
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [isGeneratingHtml, setIsGeneratingHtml] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Preview
  const [showPreview, setShowPreview] = useState(false);
  const [previewSize, setPreviewSize] = useState<'desktop' | 'mobile'>('desktop');

  // Canvas Rendering
  const [isRendering, setIsRendering] = useState(false);

  // Update settings
  const updateSettings = useCallback((updates: Partial<EmailSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // HTML Email Generation (from EmailImageEditor)
  const generateEmailHtml = useCallback(async (): Promise<string> => {
    if (!imageUrl) {
      throw new Error('No image URL provided');
    }

    setIsGeneratingHtml(true);
    try {
      // First render personalized image with tokens
      const personalizedImageUrl = await renderTokensOnImage(personalizationTokens, imageUrl);

      // Generate HTML template
      const html = generateEmailTemplate(personalizedImageUrl, settings, tokens);

      setGeneratedHtml(html);
      return html;
    } catch (error) {
      console.error('Failed to generate email HTML:', error);
      throw error;
    } finally {
      setIsGeneratingHtml(false);
    }
  }, [imageUrl, personalizationTokens, settings, tokens]);

  // Generate email template (from EmailImageEditor.generateEmailTemplate)
  const generateEmailTemplate = useCallback((
    personalizedImageUrl: string,
    settings: EmailSettings,
    tokens: Record<string, string>
  ): string => {
    // Validate image URL
    if (!personalizedImageUrl) {
      throw new Error('Invalid image URL generated');
    }

    // Replace tokens in subject and link text
    let tokenizedSubject = settings.subject;
    let tokenizedLinkText = settings.linkText;

    Object.entries(tokens).forEach(([key, value]) => {
      const sanitizedValue = sanitizeTokenValue(value);
      tokenizedSubject = tokenizedSubject.replace(new RegExp(`\\[${key}\\]`, 'gi'), sanitizedValue);
      tokenizedLinkText = tokenizedLinkText.replace(new RegExp(`\\[${key}\\]`, 'gi'), sanitizedValue);
    });

    // Base HTML template structure
    let htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tokenizedSubject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${settings.bgColor}; color: ${settings.textColor}; }
    .container { max-width: ${settings.width}px; margin: 0 auto; padding: 20px; }
    img { max-width: 100%; height: auto; }
    .btn { display: inline-block; padding: 10px 20px; background-color: ${settings.accentColor}; color: white; text-decoration: none; border-radius: 4px; }
    ${settings.responsive ? `@media only screen and (max-width: 480px) {
      .container { padding: 10px; }
      .mobile-padding { padding: 0 10px; }
    }` : ''}
  </style>
</head>
<body>
  <div class="container">\n`;

    // Add specific template content
    if (settings.template === 'centered') {
      htmlTemplate += `    <div style="text-align: center; padding: 20px;">
      <h1 style="color: ${settings.textColor};">Special Offer For ${tokens['FIRSTNAME'] || 'You'}</h1>
      <p>We have a personalized offer just for you!</p>
      <div style="margin: 20px 0;">
        <img src="${personalizedImageUrl}" alt="Personalized Offer" width="${settings.width}" style="display: block; margin: 0 auto;">
      </div>
      <div style="margin-top: 20px;">
        <a href="${settings.linkUrl}" class="btn">${tokenizedLinkText}</a>
      </div>
    </div>\n`;
    } else if (settings.template === 'leftAligned') {
      htmlTemplate += `    <div style="padding: 20px;">
      <h1 style="color: ${settings.textColor};">Hey ${tokens['FIRSTNAME'] || 'there'}!</h1>
      <p>Check out this special offer we've created just for you.</p>
      <div style="margin: 20px 0; display: flex; flex-wrap: wrap;">
        <div style="width: 100%; max-width: 300px; margin-right: 20px; margin-bottom: 20px;">
          <img src="${personalizedImageUrl}" alt="Personalized Offer" width="100%">
        </div>
        <div style="flex: 1; min-width: 200px;">
          <h2 style="color: ${settings.textColor};">Limited Time Offer</h2>
          <p>This exclusive offer is only available for a limited time. Take advantage before it expires!</p>
          <div style="margin-top: 20px;">
            <a href="${settings.linkUrl}" class="btn">${tokenizedLinkText}</a>
          </div>
        </div>
      </div>
    </div>\n`;
    } else if (settings.template === 'announcement') {
      htmlTemplate += `    <div style="padding: 20px; text-align: center;">
      <div style="background-color: ${settings.accentColor}10; padding: 20px; border-radius: 8px;">
        <h1 style="color: ${settings.accentColor};">Important Announcement</h1>
        <p style="color: ${settings.accentColor};">For ${tokens['FIRSTNAME'] || 'our valued customer'}</p>
      </div>
      <div style="margin: 20px 0;">
        <img src="${personalizedImageUrl}" alt="Personalized Announcement" width="${settings.width}" style="display: block; margin: 0 auto;">
      </div>
      <div style="background-color: #f3f4f6; padding: 20px; margin-top: 20px; border-radius: 8px;">
        <p>Please review this important information</p>
        <div style="margin-top: 15px;">
          <a href="${settings.linkUrl}" class="btn" style="font-weight: bold;">${tokenizedLinkText}</a>
        </div>
      </div>
    </div>\n`;
    }

    // Add footer
    htmlTemplate += `    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
      <p>© 2025 Your Company. All rights reserved.</p>
      <p>You received this email because you signed up for our newsletter.</p>
      <p><a href="#" style="color: ${settings.accentColor};">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

    return htmlTemplate;
  }, []);

  // ESP Integration functions
  const convertLink = useCallback((url: string): string => {
    const provider = EMAIL_SERVICE_PROVIDERS[selectedProvider];
    // Convert to ESP merge tag format
    return url.replace(/\{([^}]+)\}/g, (match, token) => {
      switch (selectedProvider) {
        case 'mailchimp': return `*|${token}|*`;
        case 'klaviyo': return `{{ person|lookup:"${token}" }}`;
        case 'hubspot': return `{{contact.${token}}}`;
        case 'activecampaign': return `%${token}%`;
        case 'constantcontact': return `[${token}]`;
        default: return `{{${token}}}`; // gmail, outlook, sendgrid
      }
    });
  }, [selectedProvider]);

  const convertMergeTags = useCallback((content: string): string => {
    // Convert our token format to ESP merge tags
    let converted = content;
    Object.entries(tokens).forEach(([key, value]) => {
      const tokenPattern = new RegExp(`\\[${key}\\]`, 'gi');
      let espTag: string;

      switch (selectedProvider) {
        case 'mailchimp':
          espTag = `*|${key.toLowerCase()}|*`;
          break;
        case 'klaviyo':
          espTag = `{{ person|lookup:"${key.toLowerCase()}" }}`;
          break;
        case 'hubspot':
          espTag = `{{contact.${key.toLowerCase()}}}`;
          break;
        case 'activecampaign':
          espTag = `%${key.toLowerCase()}%`;
          break;
        case 'constantcontact':
          espTag = `[${key.toLowerCase()}]`;
          break;
        default: // gmail, outlook, sendgrid
          espTag = `{{${key.toLowerCase()}}}`;
      }

      converted = converted.replace(tokenPattern, espTag);
    });

    return converted;
  }, [selectedProvider, tokens]);

  const validateCompatibility = useCallback(() => {
    const provider = EMAIL_SERVICE_PROVIDERS[selectedProvider];
    const supportedTokens = provider.supportedTokens;

    const validTokens = Object.keys(tokens).filter(token =>
      supportedTokens.includes(token) ||
      supportedTokens.some(supported =>
        supported.toLowerCase() === token.toLowerCase()
      )
    );

    const unsupportedTokens = Object.keys(tokens).filter(token =>
      !validTokens.includes(token)
    );

    const recommendations = unsupportedTokens.length > 0
      ? [`Consider using these ${provider.name} supported tokens instead: ${supportedTokens.join(', ')}`]
      : [];

    return {
      isCompatible: unsupportedTokens.length === 0,
      supportedTokens: validTokens,
      unsupportedTokens,
      recommendations
    };
  }, [selectedProvider, tokens]);

  // Canvas-based token rendering (from EmailImageEditor)
  const renderTokensOnImage = useCallback(async (
    tokens: any[],
    imageSrc: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      setIsRendering(true);

      const canvas = document.createElement('canvas');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw the background image
        ctx.drawImage(img, 0, 0);

        // Draw personalization tokens
        tokens.forEach(token => {
          if (token.type === 'text') {
            // Replace token with actual value if available
            let displayText = token.value;
            Object.entries(tokens).forEach(([key, value]) => {
              displayText = displayText.replace(new RegExp(`\\[${key}\\]`, 'gi'), value || `[${key}]`);
            });

            // Set text styles
            ctx.font = `${token.fontSize || 24}px ${token.fontFamily || 'Arial'}`;
            ctx.fillStyle = token.color || '#ffffff';
            ctx.globalAlpha = token.opacity || 1;
            ctx.textAlign = 'center';

            // Calculate position
            const x = (token.x / 100) * canvas.width;
            const y = (token.y / 100) * canvas.height;

            // Draw text with shadow for better visibility
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeText(displayText, x, y);
            ctx.fillText(displayText, x, y);

            ctx.globalAlpha = 1;
          }
        });

        // Get the personalized image as data URL
        const personalizedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
        setIsRendering(false);
        resolve(personalizedImageUrl);
      };

      img.onerror = () => {
        setIsRendering(false);
        reject(new Error('Failed to load image'));
      };

      img.src = imageSrc;
    });
  }, []);

  // Preview functions
  const copyHtmlToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [generatedHtml]);

  const downloadHtml = useCallback(() => {
    const element = document.createElement('a');
    const file = new Blob([generatedHtml], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = 'personalized-email.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [generatedHtml]);

  // Template preview
  const previewTemplate = useCallback((template: EmailTemplate): React.ReactNode => {
    // Return a preview component for the template
    return React.createElement('div', {
      className: 'email-template-preview',
      style: {
        backgroundColor: settings.bgColor,
        color: settings.textColor,
        padding: '20px',
        borderRadius: '8px',
        maxWidth: settings.responsive ? '100%' : `${settings.width}px`
      }
    }, `Preview of ${template} template`);
  }, [settings]);

  return {
    // HTML Email Generation
    htmlGeneration: {
      generate: generateEmailHtml,
      templates: ['centered', 'leftAligned', 'announcement'] as EmailTemplate[],
      preview: previewTemplate,
      copyToClipboard: copyHtmlToClipboard,
      download: downloadHtml,
      generatedHtml,
      isGenerating: isGeneratingHtml
    },

    // ESP Integration
    espIntegration: {
      providers: Object.keys(EMAIL_SERVICE_PROVIDERS) as EmailProvider[],
      selected: selectedProvider,
      setSelected: setSelectedProvider,
      convertLink,
      convertMergeTags,
      validateCompatibility,
      providerConfig: EMAIL_SERVICE_PROVIDERS[selectedProvider]
    },

    // Email Settings
    settings: {
      ...settings,
      updateSettings
    },

    // Canvas-based Token Rendering
    canvasRendering: {
      renderTokensOnImage,
      downloadPersonalizedImage: async () => {
        if (!imageUrl) return;
        const personalizedUrl = await renderTokensOnImage(personalizationTokens, imageUrl);
        const link = document.createElement('a');
        link.href = personalizedUrl;
        link.download = 'personalized-image.jpg';
        link.click();
      },
      previewPersonalizedImage: async () => {
        if (!imageUrl) return '';
        return await renderTokensOnImage(personalizationTokens, imageUrl);
      },
      isRendering
    },

    // Email Preview
    preview: {
      show: showPreview,
      size: previewSize,
      html: generatedHtml,
      toggle: () => setShowPreview(!showPreview),
      copyHtml: copyHtmlToClipboard,
      downloadHtml: downloadHtml,
      copiedToClipboard
    }
  };
};