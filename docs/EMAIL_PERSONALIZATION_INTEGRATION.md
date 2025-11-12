# Email Personalization Integration Guide

## Overview

The Email Personalization feature has been integrated across all image generation modules, transforming standalone email functionality into a seamless enhancement available in every generator. This integration allows users to create email-ready personalized images directly within their chosen image generation workflow.

## Architecture

### Core Components

#### `useEmailPersonalization` Hook
```typescript
const emailPersonalization = useEmailPersonalization({
  imageUrl: generatedImage,
  tokens: userTokens,
  generatorType: 'action-figure', // Specific to each generator
  onEmailImageGenerated: callback
});
```

**Features:**
- Manages email personalization state
- Handles template selection and customization
- Integrates with ESP providers
- Generates HTML email templates

#### `EmailPersonalizationToggle` Component
A simple toggle button that activates email personalization mode.

#### `EmailPersonalizationPanel` Component
Full-featured email editor panel with:
- Template selection (Centered, Left-aligned, Announcement)
- Email subject and CTA customization
- Color theming
- ESP compatibility validation
- HTML generation and export

### Generator-Specific Configurations

Each image generator has tailored email configurations:

```typescript
// src/config/generatorEmailConfigs.ts
export const generatorEmailConfigs = {
  'gif': {
    defaultTemplate: 'centered',
    recommendedSubject: 'Check out this animated message!',
    supportedTokens: ['FIRSTNAME', 'LASTNAME']
  },
  'action-figure': {
    defaultTemplate: 'leftAligned',
    recommendedSubject: 'Your custom action figure is ready!',
    supportedTokens: ['FIRSTNAME', 'COMPANY', 'JOBTITLE']
  },
  // ... other generators
};
```

## Integration Pattern

### Step 1: Import Components
```typescript
import { useEmailPersonalization } from '../hooks/useEmailPersonalization';
import EmailPersonalizationToggle from '../components/EmailPersonalizationToggle';
import EmailPersonalizationPanel from '../components/EmailPersonalizationPanel';
```

### Step 2: Initialize Hook
```typescript
const emailPersonalization = useEmailPersonalization({
  imageUrl: generatedImage,
  tokens: tokens,
  generatorType: 'your-generator-type'
});
```

### Step 3: Add Toggle Button
```typescript
<EmailPersonalizationToggle
  isActive={emailPersonalization.isActive}
  onToggle={emailPersonalization.toggle}
/>
```

### Step 4: Add Panel (Conditional)
```typescript
{emailPersonalization.isActive && (
  <EmailPersonalizationPanel
    imageUrl={generatedImage}
    personalizationTokens={[]} // Usually empty for image generators
    template={emailPersonalization.template}
    subject={emailPersonalization.subject}
    linkText={emailPersonalization.linkText}
    linkUrl={emailPersonalization.linkUrl}
    bgColor={emailPersonalization.bgColor}
    textColor={emailPersonalization.textColor}
    accentColor={emailPersonalization.accentColor}
    width={emailPersonalization.width}
    imageHeight={emailPersonalization.imageHeight}
    generatedHtml={emailPersonalization.generatedHtml}
    isGenerating={emailPersonalization.isGenerating}
    error={emailPersonalization.error}
    recommendedTokens={emailPersonalization.recommendedTokens}
    onAddToken={() => {}} // Not used in image generators
    onRemoveToken={() => {}}
    onUpdateToken={() => {}}
    onUpdateSettings={emailPersonalization.updateSettings}
    onGenerate={emailPersonalization.generateEmailImage}
    onCopyHtml={emailPersonalization.copyHtmlToClipboard}
    onDownloadHtml={emailPersonalization.downloadHtml}
  />
)}
```

## Integrated Generators

### 1. Animated GIF (`GifEditor.tsx`)
- **Special Features**: Animation compatibility, reduced file size recommendations
- **Use Case**: Email newsletters with animated content
- **Default Template**: Centered layout

### 2. AI Accelerated Action Figure (`EnhancedActionFigureGenerator.tsx`)
- **Special Features**: Corporate branding, professional layouts
- **Use Case**: Business promotional materials, employee communications
- **Default Template**: Left-aligned layout

### 3. Music Star Figure (`MusicStarActionFigureGenerator.tsx`)
- **Special Features**: Entertainment branding, fan engagement themes
- **Use Case**: Music promotions, fan communications
- **Default Template**: Announcement layout

### 4. TV Show Figure (`TVShowActionFigureGenerator.tsx`)
- **Special Features**: Entertainment theming, nostalgic layouts
- **Use Case**: TV show promotions, fan engagement
- **Default Template**: Centered layout

### 5. Wrestling Figure (`WrestlingActionFigureGenerator.tsx`)
- **Special Features**: Sports entertainment branding
- **Use Case**: Wrestling promotions, fan communications
- **Default Template**: Announcement layout

### 6. Meme Generator (`MemeGenerator.tsx`)
- **Special Features**: Viral content optimization, social sharing
- **Use Case**: Social media campaigns, viral marketing
- **Default Template**: Centered layout

### 7. Studio Ghibli Style (`GhibliImageGenerator.tsx`)
- **Special Features**: Artistic layouts, premium branding
- **Use Case**: Artistic promotions, creative campaigns
- **Default Template**: Left-aligned layout

### 8. Cartoon Styles (`CartoonImageGenerator.tsx`)
- **Special Features**: Fun, playful layouts
- **Use Case**: Youth marketing, creative campaigns
- **Default Template**: Centered layout

## ESP Integration

### Supported Providers
- **Gmail**: `{{TOKEN}}` format
- **Outlook**: `{{TOKEN}}` format
- **Mailchimp**: `*|TOKEN|*` format
- **SendGrid**: `{{TOKEN}}` format
- **Klaviyo**: `{{ person|lookup:"TOKEN" }}` format
- **HubSpot**: `{{contact.TOKEN}}` format
- **ActiveCampaign**: `%TOKEN%` format
- **Constant Contact**: `[TOKEN]` format

### Automatic Conversion
The system automatically converts personalization tokens to the appropriate ESP format based on the selected provider.

## Email Templates

### Available Templates

#### Centered Layout
- **Best for**: General announcements, product showcases
- **Layout**: Image centered, text below, CTA button
- **Use case**: Newsletters, product launches

#### Left-Aligned Layout
- **Best for**: Detailed content, storytelling
- **Layout**: Image left, text right, CTA button
- **Use case**: Educational content, detailed promotions

#### Announcement Layout
- **Best for**: Important notifications, special events
- **Layout**: Highlighted announcement box, image below
- **Use case**: Event promotions, important updates

## Token System

### Supported Tokens
- `FIRSTNAME` - Recipient's first name
- `LASTNAME` - Recipient's last name
- `EMAIL` - Recipient's email address
- `COMPANY` - Company name
- `JOBTITLE` - Job title
- Custom tokens via ESP merge tags

### Token Resolution
Tokens are automatically replaced with actual values or fallback to placeholder text.

## HTML Generation

### Features
- **Email-Client Compatible**: Uses table-based layouts for maximum compatibility
- **Responsive Design**: Mobile-optimized with media queries
- **Inline Styles**: All CSS inlined for email client support
- **ALT Text**: Automatic alt text generation for accessibility

### Export Options
- **Copy to Clipboard**: Direct HTML copying for ESP integration
- **Download HTML**: Save as .html file for manual use
- **Preview Mode**: Live preview of generated email

## Best Practices

### Email Compatibility
1. **Keep images under 200KB** for fast loading
2. **Use web-safe fonts** (Arial, Helvetica, Times New Roman)
3. **Test across email clients** (Gmail, Outlook, Apple Mail)
4. **Include ALT text** for all images
5. **Use responsive design** for mobile compatibility

### Content Guidelines
1. **Clear subject lines** that encourage opens
2. **Compelling CTAs** with action-oriented text
3. **Brand-consistent colors** matching your identity
4. **Personalization tokens** for better engagement

### Performance Optimization
1. **Lazy loading** of email components
2. **Efficient re-rendering** with React.memo
3. **Web Worker processing** for image manipulation
4. **Minimal bundle impact** with code splitting

## Migration Notes

### From Standalone Email Editor
- **Removed**: Standalone `EmailImageEditor` component
- **Removed**: 'email' feature from navigation
- **Added**: Email functionality to all image generators
- **Preserved**: All email personalization logic and ESP integrations

### Backward Compatibility
- Existing email templates remain functional
- ESP configurations unchanged
- Token resolution logic preserved

## Future Enhancements

### Planned Features
- **A/B Testing**: Multiple template variations
- **Analytics Integration**: Email performance tracking
- **Template Marketplace**: User-created templates
- **Advanced Personalization**: Dynamic content blocks
- **Multi-language Support**: Localized email templates

### Technical Improvements
- **Component Testing**: Comprehensive test coverage
- **Performance Monitoring**: Email generation metrics
- **Error Recovery**: Improved error handling and user feedback
- **Accessibility**: WCAG compliance improvements

## Troubleshooting

### Common Issues

#### Email Not Rendering Properly
- **Check**: HTML validation in email testing tools
- **Verify**: All styles are inline (not external CSS)
- **Test**: In multiple email clients

#### Tokens Not Resolving
- **Check**: Token format matches ESP requirements
- **Verify**: Token values are provided correctly
- **Test**: With sample data before sending

#### Images Not Loading
- **Check**: Image URLs are publicly accessible
- **Verify**: File size is under email limits
- **Test**: Direct URL access in browser

### Support Resources
- **Documentation**: This integration guide
- **Code Examples**: Component implementations
- **ESP Guides**: Provider-specific setup instructions
- **Testing Tools**: Email testing service recommendations

## Conclusion

The email personalization integration transforms every image generator into a complete email marketing solution. Users can now create, personalize, and deploy email-ready images without leaving their creative workflow, significantly enhancing the platform's value proposition for marketing and communication use cases.