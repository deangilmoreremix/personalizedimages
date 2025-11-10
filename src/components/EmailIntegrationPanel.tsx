/**
 * Email Integration Panel Component
 * Provides UI for integrating personalized images with various email service providers
 */

import React, { useState, useEffect } from 'react';

// Simple UI components for demonstration
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
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm';
}> = ({ children, onClick, className = '', variant = 'default', size = 'default' }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variantClasses = variant === 'outline'
    ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
    : 'bg-blue-600 text-white hover:bg-blue-700';
  const sizeClasses = size === 'sm' ? 'h-8 px-3 text-sm' : 'h-10 px-4 py-2';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      onClick={onClick}
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
}> = ({ id, value, onChange, placeholder, className = '' }) => (
  <input
    id={id}
    type="text"
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
  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
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
  variant?: 'default' | 'secondary' | 'destructive';
  className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

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
import { Copy, Download, Mail, Settings, CheckCircle, AlertCircle } from 'lucide-react';

import {
  EMAIL_SERVICE_PROVIDERS,
  EmailProvider,
  integratePersonalizedImage,
  generateESPSetupGuide,
  validateESPCompatibility,
  EmailIntegrationOptions,
  EmailIntegrationResult
} from '../utils/emailIntegration';

interface EmailIntegrationPanelProps {
  imageUrl: string;
  altText?: string;
  onIntegrationComplete?: (result: EmailIntegrationResult) => void;
}

export const EmailIntegrationPanel: React.FC<EmailIntegrationPanelProps> = ({
  imageUrl,
  altText = 'Personalized Image',
  onIntegrationComplete
}) => {
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider>('gmail');
  const [emailTemplate, setEmailTemplate] = useState(`Hello [FIRSTNAME],

Here's your personalized image:

[PERSONALIZED_IMAGE]

Best regards,
Your Company`);
  const [recipientData, setRecipientData] = useState<Record<string, string>>({
    FIRSTNAME: 'John',
    LASTNAME: 'Doe',
    EMAIL: 'john.doe@example.com',
    COMPANY: 'Acme Corp'
  });
  const [integrationResult, setIntegrationResult] = useState<EmailIntegrationResult | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const provider = EMAIL_SERVICE_PROVIDERS[selectedProvider];

  // Validate compatibility when template or provider changes
  useEffect(() => {
    const validation = validateESPCompatibility(emailTemplate, selectedProvider);
    setValidationResult(validation);
  }, [emailTemplate, selectedProvider]);

  const handleIntegration = () => {
    const options: EmailIntegrationOptions = {
      provider: selectedProvider,
      recipientData,
      imageUrl,
      altText
    };

    const result = integratePersonalizedImage(emailTemplate, options);
    setIntegrationResult(result);

    if (onIntegrationComplete) {
      onIntegrationComplete(result);
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownloadGuide = () => {
    const guide = generateESPSetupGuide(selectedProvider);
    const blob = new Blob([guide], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProvider}-integration-guide.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateRecipientData = (key: string, value: string) => {
    setRecipientData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Service Provider Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="integration" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="integration">Integration</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="setup">Setup Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="integration" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Provider Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Email Provider</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="provider">Select Email Service Provider</Label>
                      <Select value={selectedProvider} onValueChange={(value: string) => setSelectedProvider(value as EmailProvider)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(EMAIL_SERVICE_PROVIDERS).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Merge Tag Format</Label>
                      <code className="block p-2 bg-gray-100 rounded text-sm">
                        {provider.mergeTagFormat}
                      </code>
                    </div>

                    <div className="space-y-2">
                      <Label>Supported Tokens</Label>
                      <div className="flex flex-wrap gap-1">
                        {provider.supportedTokens.map(token => (
                          <Badge key={token} variant="secondary" className="text-xs">
                            {token}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recipient Data */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Test Recipient Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(recipientData).map(([key, value]) => (
                      <div key={key}>
                        <Label htmlFor={key}>{key}</Label>
                        <Input
                          id={key}
                          value={value}
                          onChange={(e) => updateRecipientData(key, e.target.value)}
                          placeholder={`Enter ${key.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Email Template */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Email Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template">Template Content</Label>
                    <Textarea
                      id="template"
                      value={emailTemplate}
                      onChange={(e) => setEmailTemplate(e.target.value)}
                      rows={8}
                      placeholder="Enter your email template with [TOKEN] placeholders"
                    />
                  </div>

                  {/* Validation Results */}
                  {validationResult && (
                    <Alert className={validationResult.isCompatible ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                      {validationResult.isCompatible ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      <AlertDescription>
                        {validationResult.isCompatible ? (
                          <span className="text-green-800">
                            Template is compatible with {provider.name}
                          </span>
                        ) : (
                          <div className="text-yellow-800">
                            <div>Compatibility issues found:</div>
                            <ul className="list-disc list-inside mt-1">
                              {validationResult.recommendations.map((rec: string, index: number) => (
                                <li key={index} className="text-sm">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button onClick={handleIntegration} className="w-full">
                    Generate Personalized Email
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              {integrationResult ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Original Template */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Original Template</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded">
                        {emailTemplate}
                      </pre>
                    </CardContent>
                  </Card>

                  {/* Personalized Result */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        Personalized Email
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyToClipboard(integrationResult.emailContent)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {copiedToClipboard ? 'Copied!' : 'Copy'}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Personalized Image URL:</Label>
                        <code className="block text-xs bg-gray-100 p-2 rounded break-all">
                          {integrationResult.personalizedImageUrl}
                        </code>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Email Content:</Label>
                        <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border">
                          {integrationResult.emailContent}
                        </pre>
                      </div>

                      {/* Token Resolution Summary */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Token Resolution:</Label>
                        <div className="flex flex-wrap gap-2">
                          {integrationResult.resolvedTokens.map(token => (
                            <Badge key={token} variant="default" className="text-xs">
                              ✓ {token}
                            </Badge>
                          ))}
                          {integrationResult.missingTokens.map(token => (
                            <Badge key={token} variant="destructive" className="text-xs">
                              ✗ {token}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Warnings */}
                      {integrationResult.warnings.length > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <ul className="list-disc list-inside">
                              {integrationResult.warnings.map((warning, index) => (
                                <li key={index} className="text-sm">{warning}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Mail className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Integration Generated Yet
                    </h3>
                    <p className="text-gray-500">
                      Configure your email provider and template, then click "Generate Personalized Email" to see the results.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="setup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {provider.name} Setup Guide
                    <Button variant="outline" onClick={handleDownloadGuide}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Guide
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <h4>Merge Tag Format</h4>
                    <p>{provider.name} uses: <code>{provider.mergeTagFormat}</code></p>

                    <h4>Supported Tokens</h4>
                    <ul>
                      {provider.supportedTokens.map(token => (
                        <li key={token}><code>{token}</code></li>
                      ))}
                    </ul>

                    <h4>Image Integration</h4>
                    <pre className="bg-gray-100 p-4 rounded text-sm">
                      {provider.imageTagFormat}
                    </pre>

                    <h4>Example Template</h4>
                    <pre className="bg-gray-100 p-4 rounded text-sm">
{`Hello ${provider.mergeTagFormat.replace('TOKEN', 'first_name')},

Here's your personalized image:

${provider.imageTagFormat.replace('{IMAGE_URL}', 'YOUR_IMAGE_URL').replace('{ALT_TEXT}', 'Personalized Image')}

Best regards,
Your Company`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailIntegrationPanel;