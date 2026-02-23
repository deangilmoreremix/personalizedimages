/**
 * Email System Integration Module
 * Handles integration with various email service providers (ESP) for personalized image delivery
 * Supports merge tags from Gmail, Outlook, Mailchimp, SendGrid, and other ESPs
 */

import { resolveTokens, TokenResolutionOptions, validateTokens } from './tokenResolver';
import { PERSONALIZATION_TOKENS } from '../types/personalization';

// Email Service Provider configurations
export const EMAIL_PROVIDERS = {
  gmail: {
    name: 'Gmail',
    mergeTagFormat: '{{TOKEN}}',
    imageTagFormat: '<img src="{IMAGE_URL}" alt="{ALT_TEXT}">',
    supportedTokens: ['FIRSTNAME', 'LASTNAME', 'EMAIL', 'COMPANY'] as string[]
  },
  outlook: {
    name: 'Outlook',
    mergeTagFormat: '{{TOKEN}}',
    imageTagFormat: '<img src="{IMAGE_URL}" alt="{ALT_TEXT}">',
    supportedTokens: ['FIRSTNAME', 'LASTNAME', 'EMAIL', 'COMPANY', 'JOBTITLE'] as string[]
  },
  mailchimp: {
    name: 'Mailchimp',
    mergeTagFormat: '*|TOKEN|*',
    imageTagFormat: '<img src="*|IMAGE_URL|*" alt="*|ALT_TEXT|*">',
    supportedTokens: ['FNAME', 'LNAME', 'EMAIL', 'COMPANY', 'MMERGE1', 'MMERGE2'] as string[]
  },
  sendgrid: {
    name: 'SendGrid',
    mergeTagFormat: '{{TOKEN}}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}">',
    supportedTokens: ['first_name', 'last_name', 'email', 'company'] as string[]
  },
  klaviyo: {
    name: 'Klaviyo',
    mergeTagFormat: '{{ person|lookup:"TOKEN" }}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}">',
    supportedTokens: ['first_name', 'last_name', 'email', 'company', 'custom_properties'] as string[]
  },
  hubspot: {
    name: 'HubSpot',
    mergeTagFormat: '{{contact.TOKEN}}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}">',
    supportedTokens: ['firstname', 'lastname', 'email', 'company'] as string[]
  },
  activecampaign: {
    name: 'ActiveCampaign',
    mergeTagFormat: '%TOKEN%',
    imageTagFormat: '<img src="%IMAGE_URL%" alt="%ALT_TEXT%">',
    supportedTokens: ['FIRSTNAME', 'LASTNAME', 'EMAIL', 'COMPANY'] as string[]
  },
  constantcontact: {
    name: 'Constant Contact',
    mergeTagFormat: '[TOKEN]',
    imageTagFormat: '<img src="[IMAGE_URL]" alt="[ALT_TEXT]">',
    supportedTokens: ['First Name', 'Last Name', 'Email', 'Company Name'] as string[]
  }
} as const;

export type EmailProvider = keyof typeof EMAIL_PROVIDERS;

export interface EmailIntegrationOptions {
  provider: EmailProvider;
  recipientData: Record<string, string>;
  imageUrl: string;
  altText?: string;
  customTokens?: Record<string, string>;
  fallbackValues?: Record<string, string>;
}

export interface EmailIntegrationResult {
  personalizedImageUrl: string;
  emailContent: string;
  resolvedTokens: string[];
  missingTokens: string[];
  warnings: string[];
  providerConfig: typeof EMAIL_PROVIDERS[EmailProvider];
}

/**
 * Generate personalized image URL for email integration
 */
export function generatePersonalizedImageUrl(
  baseImageUrl: string,
  recipientData: Record<string, string>,
  provider: EmailProvider = 'gmail'
): string {
  const config = EMAIL_PROVIDERS[provider];

  let url: URL;
  try {
    url = new URL(baseImageUrl, window.location.origin);
  } catch {
    return baseImageUrl;
  }

  Object.entries(recipientData).forEach(([key, value]) => {
    if (config.supportedTokens.includes(key) || key.startsWith('custom_')) {
      url.searchParams.set(key.toLowerCase(), value);
    }
  });

  return url.toString();
}

/**
 * Convert personalization tokens to ESP merge tags
 */
export function convertToESPMergeTags(
  content: string,
  provider: EmailProvider,
  tokenMapping?: Record<string, string>
): string {
  const config = EMAIL_PROVIDERS[provider];
  let convertedContent = content;

  // Default token mapping (our tokens to ESP tokens)
  const defaultMapping: Record<string, string> = {
    'FIRSTNAME': 'first_name',
    'LASTNAME': 'last_name',
    'EMAIL': 'email',
    'COMPANY': 'company',
    'JOBTITLE': 'job_title',
    'PHONE': 'phone',
    'CITY': 'city',
    'STATE': 'state',
    'COUNTRY': 'country'
  };

  const mapping = { ...defaultMapping, ...tokenMapping };

  // Replace our token format with ESP merge tags
  Object.entries(mapping).forEach(([ourToken, espToken]) => {
    const ourPattern = new RegExp(`\\[${ourToken}\\]`, 'g');
    let espTag: string;

    switch (provider) {
      case 'mailchimp':
        espTag = `*|${espToken}|*`;
        break;
      case 'klaviyo':
        espTag = `{{ person|lookup:"${espToken}" }}`;
        break;
      case 'hubspot':
        espTag = `{{contact.${espToken}}}`;
        break;
      case 'activecampaign':
        espTag = `%${espToken}%`;
        break;
      case 'constantcontact':
        espTag = `[${espToken}]`;
        break;
      default: // gmail, outlook, sendgrid
        espTag = `{{${espToken}}}`;
    }

    convertedContent = convertedContent.replace(ourPattern, espTag);
  });

  return convertedContent;
}

/**
 * Integrate personalized image into email content
 */
export function integratePersonalizedImage(
  emailContent: string,
  options: EmailIntegrationOptions
): EmailIntegrationResult {
  const { provider, recipientData, imageUrl, altText = 'Personalized Image', customTokens = {}, fallbackValues = {} } = options;
  const config = EMAIL_PROVIDERS[provider];

  // Generate personalized image URL
  const personalizedImageUrl = generatePersonalizedImageUrl(imageUrl, recipientData, provider);

  // Create image tag with ESP merge tags
  let imageTag = config.imageTagFormat
    .replace('{IMAGE_URL}', personalizedImageUrl)
    .replace('{ALT_TEXT}', altText);

  // Convert any personalization tokens in alt text
  if (altText.includes('[')) {
    imageTag = convertToESPMergeTags(imageTag, provider);
  }

  // Resolve tokens in email content
  const tokenResolution = resolveTokens(
    emailContent,
    { ...recipientData, ...customTokens },
    {
      contentType: 'email',
      fallbackValues,
      preserveUnresolved: true
    }
  );

  // Convert resolved content to ESP format
  const espContent = convertToESPMergeTags(tokenResolution.resolvedContent, provider);

  // Insert personalized image into email content
  const finalContent = espContent.replace('[PERSONALIZED_IMAGE]', imageTag);

  return {
    personalizedImageUrl,
    emailContent: finalContent,
    resolvedTokens: tokenResolution.resolvedTokens,
    missingTokens: tokenResolution.missingTokens,
    warnings: tokenResolution.warnings,
    providerConfig: config
  };
}

/**
 * Generate email template with personalized image placeholder
 */
export function generateEmailTemplate(
  baseTemplate: string,
  provider: EmailProvider = 'gmail'
): string {
  const config = EMAIL_PROVIDERS[provider];

  // Replace generic image placeholder with ESP-specific format
  let template = baseTemplate.replace(
    /\[PERSONALIZED_IMAGE\]/g,
    config.imageTagFormat
      .replace('{IMAGE_URL}', '[IMAGE_URL_PLACEHOLDER]')
      .replace('{ALT_TEXT}', '[ALT_TEXT_PLACEHOLDER]')
  );

  // Convert any tokens to ESP format
  template = convertToESPMergeTags(template, provider);

  return template;
}

/**
 * Validate ESP compatibility
 */
export function validateESPCompatibility(
  content: string,
  provider: EmailProvider
): {
  isCompatible: boolean;
  supportedTokens: string[];
  unsupportedTokens: string[];
  recommendations: string[];
} {
  const config = EMAIL_PROVIDERS[provider];
  const validation = validateTokens(content, 'email');

  const supportedTokens = validation.validTokens.filter(token =>
    config.supportedTokens.includes(token) ||
    PERSONALIZATION_TOKENS.some(pt => pt.key === token && pt.isImplemented)
  );

  const unsupportedTokens = validation.validTokens.filter(token =>
    !config.supportedTokens.includes(token) &&
    !PERSONALIZATION_TOKENS.some(pt => pt.key === token && pt.isImplemented)
  );

  const recommendations: string[] = [];

  if (unsupportedTokens.length > 0) {
    recommendations.push(`Consider using these ${provider} supported tokens instead: ${config.supportedTokens.join(', ')}`);
  }

  return {
    isCompatible: unsupportedTokens.length === 0,
    supportedTokens,
    unsupportedTokens,
    recommendations
  };
}

/**
 * Batch process emails for multiple recipients
 */
export function batchProcessEmails(
  emailTemplate: string,
  recipients: Array<{
    email: string;
    data: Record<string, string>;
    imageUrl: string;
  }>,
  provider: EmailProvider = 'gmail'
): EmailIntegrationResult[] {
  return recipients.map(recipient => {
    const options: EmailIntegrationOptions = {
      provider,
      recipientData: recipient.data,
      imageUrl: recipient.imageUrl,
      altText: `Personalized image for ${recipient.data.FIRSTNAME || recipient.email}`
    };

    return integratePersonalizedImage(emailTemplate, options);
  });
}

/**
 * Generate webhook payload for ESP integration
 */
export function generateWebhookPayload(
  result: EmailIntegrationResult,
  recipientEmail: string,
  campaignId?: string
): Record<string, any> {
  return {
    email: recipientEmail,
    campaign_id: campaignId,
    personalized_image_url: result.personalizedImageUrl,
    email_content: result.emailContent,
    resolved_tokens: result.resolvedTokens,
    missing_tokens: result.missingTokens,
    warnings: result.warnings,
    provider: result.providerConfig.name,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create ESP-specific documentation
 */
export function generateESPSetupGuide(provider: EmailProvider): string {
  const config = EMAIL_PROVIDERS[provider];

  return `
# ${config.name} Integration Guide

## Merge Tag Format
${config.name} uses the following merge tag format: \`${config.mergeTagFormat}\`

## Supported Tokens
${config.supportedTokens.map(token => `- \`${token}\``).join('\n')}

## Image Integration
Use this format for personalized images:
\`\`\`html
${config.imageTagFormat}
\`\`\`

## Setup Steps
1. Upload your personalized images to a publicly accessible URL
2. Use the merge tags above in your email templates
3. Replace [PERSONALIZED_IMAGE] placeholder with the image tag format
4. Test with sample data before sending to your full list

## Example Template
\`\`\`html
Hello ${config.mergeTagFormat.replace('TOKEN', 'first_name')},

Here's your personalized image:

${config.imageTagFormat.replace('{IMAGE_URL}', 'YOUR_IMAGE_URL').replace('{ALT_TEXT}', 'Personalized Image')}

Best regards,
Your Company
\`\`\`
`;
}

export {
  EMAIL_PROVIDERS as EMAIL_SERVICE_PROVIDERS
};