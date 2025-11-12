/**
 * Email HTML Generator Component
 * Provides UI for generating HTML emails with ESP integration
 */

import React, { useState } from 'react';
import { Mail, Code, Copy, Download, CheckSquare, AlertCircle, Settings } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

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

const Alert: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`rounded-md border border-yellow-200 bg-yellow-50 p-4 ${className}`}>
    {children}
  </div>
);

const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm text-yellow-800">{children}</div>
);

interface EmailHtmlGeneratorProps {
  imageUrl: string | null;
  tokens: Record<string, string>;
  personalizationTokens: any[];
  onHtmlGenerated?: (html: string) => void;
}

export const EmailHtmlGenerator: React.FC<EmailHtmlGeneratorProps> = ({
  imageUrl,
  tokens,
  personalizationTokens,
  onHtmlGenerated
}) => {
  const [activeTab, setActiveTab] = useState('settings');
  const [showColorPicker, setShowColorPicker] = useState<string | false>(false);

  // Email settings state
  const [emailSettings, setEmailSettings] = useState({
    subject: 'Special offer just for you!',
    linkText: 'View Special Offer',
    linkUrl: 'https://example.com/special-offer',
    template: 'centered' as 'centered' | 'leftAligned' | 'announcement',
    width: 600,
    height: 400,
    bgColor: '#f9fafb',
    textColor: '#111827',
    accentColor: '#4f46e5',
    responsive: true
  });

  const [selectedProvider, setSelectedProvider] = useState('gmail');
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateEmailSettings = (updates: Partial<typeof emailSettings>) => {
    setEmailSettings(prev => ({ ...prev, ...updates }));
  };

  const generateEmailHtml = async () => {
    if (!imageUrl) {
      alert('Please generate an image first');
      return;
    }

    setIsGenerating(true);
    try {
      // Render personalized image with tokens
      const personalizedImageUrl = await renderTokensOnImage(personalizationTokens, imageUrl);

      // Generate HTML template
      const html = generateEmailTemplate(personalizedImageUrl);

      setGeneratedHtml(html);
      if (onHtmlGenerated) {
        onHtmlGenerated(html);
      }
    } catch (error) {
      console.error('Failed to generate email HTML:', error);
      alert('Failed to generate email HTML');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTokensOnImage = (tokens: any[], imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
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
            let displayText = token.value;
            Object.entries(tokens).forEach(([key, value]) => {
              displayText = displayText.replace(new RegExp(`\\[${key}\\]`, 'gi'), value || `[${key}]`);
            });

            ctx.font = `${token.fontSize || 24}px ${token.fontFamily || 'Arial'}`;
            ctx.fillStyle = token.color || '#ffffff';
            ctx.globalAlpha = token.opacity || 1;
            ctx.textAlign = 'center';

            const x = (token.x / 100) * canvas.width;
            const y = (token.y / 100) * canvas.height;

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeText(displayText, x, y);
            ctx.fillText(displayText, x, y);

            ctx.globalAlpha = 1;
          }
        });

        const personalizedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(personalizedImageUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageSrc;
    });
  };

  const generateEmailTemplate = (personalizedImageUrl: string): string => {
    let tokenizedSubject = emailSettings.subject;
    let tokenizedLinkText = emailSettings.linkText;

    Object.entries(tokens).forEach(([key, value]) => {
      const sanitizedValue = value.replace(/[<>]/g, '');
      tokenizedSubject = tokenizedSubject.replace(new RegExp(`\\[${key}\\]`, 'gi'), sanitizedValue);
      tokenizedLinkText = tokenizedLinkText.replace(new RegExp(`\\[${key}\\]`, 'gi'), sanitizedValue);
    });

    let htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tokenizedSubject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${emailSettings.bgColor}; color: ${emailSettings.textColor}; }
    .container { max-width: ${emailSettings.width}px; margin: 0 auto; padding: 20px; }
    img { max-width: 100%; height: auto; }
    .btn { display: inline-block; padding: 10px 20px; background-color: ${emailSettings.accentColor}; color: white; text-decoration: none; border-radius: 4px; }
    ${emailSettings.responsive ? `@media only screen and (max-width: 480px) {
      .container { padding: 10px; }
      .mobile-padding { padding: 0 10px; }
    }` : ''}
  </style>
</head>
<body>
  <div class="container">\n`;

    if (emailSettings.template === 'centered') {
      htmlTemplate += `    <div style="text-align: center; padding: 20px;">
      <h1 style="color: ${emailSettings.textColor};">Special Offer For ${tokens['FIRSTNAME'] || 'You'}</h1>
      <p>We have a personalized offer just for you!</p>
      <div style="margin: 20px 0;">
        <img src="${personalizedImageUrl}" alt="Personalized Offer" width="${emailSettings.width}" style="display: block; margin: 0 auto;">
      </div>
      <div style="margin-top: 20px;">
        <a href="${emailSettings.linkUrl}" class="btn">${tokenizedLinkText}</a>
      </div>
    </div>\n`;
    } else if (emailSettings.template === 'leftAligned') {
      htmlTemplate += `    <div style="padding: 20px;">
      <h1 style="color: ${emailSettings.textColor};">Hey ${tokens['FIRSTNAME'] || 'there'}!</h1>
      <p>Check out this special offer we've created just for you.</p>
      <div style="margin: 20px 0; display: flex; flex-wrap: wrap;">
        <div style="width: 100%; max-width: 300px; margin-right: 20px; margin-bottom: 20px;">
          <img src="${personalizedImageUrl}" alt="Personalized Offer" width="100%">
        </div>
        <div style="flex: 1; min-width: 200px;">
          <h2 style="color: ${emailSettings.textColor};">Limited Time Offer</h2>
          <p>This exclusive offer is only available for a limited time. Take advantage before it expires!</p>
          <div style="margin-top: 20px;">
            <a href="${emailSettings.linkUrl}" class="btn">${tokenizedLinkText}</a>
          </div>
        </div>
      </div>
    </div>\n`;
    } else if (emailSettings.template === 'announcement') {
      htmlTemplate += `    <div style="padding: 20px; text-align: center;">
      <div style="background-color: ${emailSettings.accentColor}10; padding: 20px; border-radius: 8px;">
        <h1 style="color: ${emailSettings.accentColor};">Important Announcement</h1>
        <p style="color: ${emailSettings.accentColor};">For ${tokens['FIRSTNAME'] || 'our valued customer'}</p>
      </div>
      <div style="margin: 20px 0;">
        <img src="${personalizedImageUrl}" alt="Personalized Announcement" width="${emailSettings.width}" style="display: block; margin: 0 auto;">
      </div>
      <div style="background-color: #f3f4f6; padding: 20px; margin-top: 20px; border-radius: 8px;">
        <p>Please review this important information</p>
        <div style="margin-top: 15px;">
          <a href="${emailSettings.linkUrl}" class="btn" style="font-weight: bold;">${tokenizedLinkText}</a>
        </div>
      </div>
    </div>\n`;
    }

    htmlTemplate += `    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
      <p>© 2025 Your Company. All rights reserved.</p>
      <p>You received this email because you signed up for our newsletter.</p>
      <p><a href="#" style="color: ${emailSettings.accentColor};">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

    return htmlTemplate;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadHtml = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedHtml], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = 'personalized-email.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email HTML Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="esp">ESP Integration</TabsTrigger>
            <TabsTrigger value="preview">Preview & Export</TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={emailSettings.subject}
                    onChange={(e) => updateEmailSettings({ subject: e.target.value })}
                    placeholder="Enter email subject line"
                  />
                </div>

                <div>
                  <Label htmlFor="linkText">Call to Action Text</Label>
                  <Input
                    id="linkText"
                    value={emailSettings.linkText}
                    onChange={(e) => updateEmailSettings({ linkText: e.target.value })}
                    placeholder="Button text"
                  />
                </div>

                <div>
                  <Label htmlFor="linkUrl">Call to Action URL</Label>
                  <Input
                    id="linkUrl"
                    value={emailSettings.linkUrl}
                    onChange={(e) => updateEmailSettings({ linkUrl: e.target.value })}
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>

                <div>
                  <Label htmlFor="template">Email Template</Label>
                  <Select
                    value={emailSettings.template}
                    onValueChange={(value) => updateEmailSettings({ template: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="centered">Centered Layout</SelectItem>
                      <SelectItem value="leftAligned">Left Aligned Layout</SelectItem>
                      <SelectItem value="announcement">Announcement Layout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="width">Email Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={emailSettings.width.toString()}
                    onChange={(e) => updateEmailSettings({ width: Number(e.target.value) })}
                    min="300"
                    max="800"
                  />
                </div>

                {/* Color Pickers */}
                <div className="space-y-3">
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-8 h-8 rounded border cursor-pointer"
                        style={{ backgroundColor: emailSettings.bgColor }}
                        onClick={() => setShowColorPicker('bg')}
                      />
                      <Input
                        value={emailSettings.bgColor}
                        onChange={(e) => updateEmailSettings({ bgColor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-8 h-8 rounded border cursor-pointer"
                        style={{ backgroundColor: emailSettings.textColor }}
                        onClick={() => setShowColorPicker('text')}
                      />
                      <Input
                        value={emailSettings.textColor}
                        onChange={(e) => updateEmailSettings({ textColor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Accent Color</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-8 h-8 rounded border cursor-pointer"
                        style={{ backgroundColor: emailSettings.accentColor }}
                        onClick={() => setShowColorPicker('accent')}
                      />
                      <Input
                        value={emailSettings.accentColor}
                        onChange={(e) => updateEmailSettings({ accentColor: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="responsive"
                    checked={emailSettings.responsive}
                    onChange={(e) => updateEmailSettings({ responsive: e.target.checked })}
                  />
                  <Label htmlFor="responsive">Enable responsive design</Label>
                </div>
              </div>
            </div>

            {/* Color Picker Modal */}
            {showColorPicker && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Choose Color</h3>
                    <button onClick={() => setShowColorPicker(false)}>✕</button>
                  </div>
                  <HexColorPicker
                    color={
                      showColorPicker === 'bg' ? emailSettings.bgColor :
                      showColorPicker === 'text' ? emailSettings.textColor :
                      emailSettings.accentColor
                    }
                    onChange={(color) => {
                      if (showColorPicker === 'bg') updateEmailSettings({ bgColor: color });
                      else if (showColorPicker === 'text') updateEmailSettings({ textColor: color });
                      else updateEmailSettings({ accentColor: color });
                    }}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* ESP Integration Tab */}
          <TabsContent value="esp" className="space-y-6">
            <div>
              <Label htmlFor="provider">Email Service Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="outlook">Outlook</SelectItem>
                  <SelectItem value="mailchimp">Mailchimp</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="klaviyo">Klaviyo</SelectItem>
                  <SelectItem value="hubspot">HubSpot</SelectItem>
                  <SelectItem value="activecampaign">ActiveCampaign</SelectItem>
                  <SelectItem value="constantcontact">Constant Contact</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your email will be automatically formatted with {selectedProvider} merge tags for personalization.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Preview & Export Tab */}
          <TabsContent value="preview" className="space-y-6">
            <div className="flex gap-2">
              <Button
                onClick={generateEmailHtml}
                disabled={!imageUrl || isGenerating}
                className="flex-1"
              >
                {isGenerating ? 'Generating...' : 'Generate Email HTML'}
              </Button>
            </div>

            {generatedHtml && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                  >
                    {copiedToClipboard ? (
                      <>
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy HTML
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={downloadHtml}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download HTML
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 border-b border-gray-200 p-2 flex justify-between items-center">
                    <div className="text-sm font-medium flex items-center">
                      <Code className="w-4 h-4 mr-1" />
                      Generated HTML
                    </div>
                  </div>
                  <div className="overflow-auto max-h-[300px] p-2 bg-gray-900 text-gray-100">
                    <pre className="text-xs whitespace-pre-wrap"><code>{generatedHtml}</code></pre>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EmailHtmlGenerator;