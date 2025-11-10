/**
 * ESP Manager Panel Component
 * Comprehensive UI for managing Email Service Provider integrations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Mail,
  Settings,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Zap,
  Shield,
  Database,
  Webhook
} from 'lucide-react';

import { espManager, ESP_DATABASE, ESPName } from '../utils/espManager';
import { EMAIL_SERVICE_PROVIDERS } from '../utils/emailIntegration';

interface ESPManagerPanelProps {
  onESPConfigured?: (espName: string, config: any) => void;
}

export const ESPManagerPanel: React.FC<ESPManagerPanelProps> = ({
  onESPConfigured
}) => {
  const [selectedESP, setSelectedESP] = useState<ESPName | ''>('');
  const [connectedESPs, setConnectedESPs] = useState<Set<string>>(new Set());
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [testTemplate, setTestTemplate] = useState(`Hello [FIRSTNAME],

Here's your personalized image:

[PERSONALIZED_IMAGE]

Best regards,
Your Company`);
  const [testRecipient, setTestRecipient] = useState({
    FIRSTNAME: 'John',
    LASTNAME: 'Doe',
    EMAIL: 'john.doe@example.com',
    COMPANY: 'Acme Corp'
  });
  const [testImageUrl, setTestImageUrl] = useState('https://via.placeholder.com/600x400?text=Personalized+Image');
  const [testResults, setTestResults] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const availableESPs = espManager.listESPs();
  const selectedESPConfig = selectedESP ? espManager.getESP(selectedESP) : null;

  // Load connected ESPs on mount
  useEffect(() => {
    // In a real implementation, this would check stored connections
    const mockConnected = new Set(['gmail', 'outlook']);
    setConnectedESPs(mockConnected);
  }, []);

  const handleConnectESP = async () => {
    if (!selectedESP || !selectedESPConfig) return;

    setIsConnecting(true);
    try {
      const success = await espManager.connectESP(selectedESP, credentials);
      if (success) {
        setConnectedESPs(prev => new Set([...prev, selectedESP]));
        if (onESPConfigured) {
          onESPConfigured(selectedESP, { credentials, config: selectedESPConfig });
        }
        alert(`${selectedESPConfig.displayName} connected successfully!`);
      }
    } catch (error) {
      alert(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestESP = () => {
    if (!selectedESP) return;

    try {
      const result = espManager.generatePersonalizedContent(
        testTemplate,
        testRecipient,
        selectedESP,
        testImageUrl,
        { altText: 'Test Personalized Image' }
      );

      const validation = espManager.validateESPCompatibility(testTemplate, selectedESP);

      setTestResults({
        ...result,
        validation
      });
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : 'Test failed'
      });
    }
  };

  const handleDownloadGuide = () => {
    if (!selectedESP) return;

    try {
      const guide = espManager.generateSetupGuide(selectedESP);
      const blob = new Blob([guide], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedESP}-setup-guide.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Failed to generate guide: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const updateCredentials = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const updateRecipient = (field: string, value: string) => {
    setTestRecipient(prev => ({ ...prev, [field]: value }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'marketing': return <Mail className="w-4 h-4" />;
      case 'transactional': return <Zap className="w-4 h-4" />;
      case 'crm': return <Database className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'marketing': return 'bg-blue-100 text-blue-800';
      case 'transactional': return 'bg-green-100 text-green-800';
      case 'crm': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            ESP Manager - Email Service Provider Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="configure">Configure</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
              <TabsTrigger value="manage">Manage</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Connected ESPs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connected ESPs</CardTitle>
                </CardHeader>
                <CardContent>
                  {connectedESPs.size > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from(connectedESPs).map(espName => {
                        const config = espManager.getESP(espName);
                        if (!config) return null;

                        return (
                          <Card key={espName} className="border-green-200 bg-green-50">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(config.category)}
                                  <span className="font-medium">{config.displayName}</span>
                                </div>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                              <Badge className={`mt-2 ${getCategoryColor(config.category)}`}>
                                {config.category}
                              </Badge>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No ESPs connected yet. Go to the Configure tab to get started.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Available ESPs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available ESPs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableESPs.map(esp => (
                      <Card key={esp.name} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(esp.category)}
                              <span className="font-medium">{esp.displayName}</span>
                            </div>
                            {connectedESPs.has(esp.name) && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>

                          <Badge className={`mb-2 ${getCategoryColor(esp.category)}`}>
                            {esp.category}
                          </Badge>

                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Merge Tags: {esp.features.mergeTags ? '✓' : '✗'}</div>
                            <div>API Integration: {esp.features.apiIntegration ? '✓' : '✗'}</div>
                            <div>Templates: {esp.features.templates ? '✓' : '✗'}</div>
                          </div>

                          <Button
                            className="w-full mt-3"
                            variant={connectedESPs.has(esp.name) ? "outline" : "default"}
                            onClick={() => setSelectedESP(esp.name as ESPName)}
                          >
                            {connectedESPs.has(esp.name) ? 'Manage' : 'Configure'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configure" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ESP Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select ESP</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="esp-select">Email Service Provider</Label>
                      <Select value={selectedESP} onValueChange={(value: string) => setSelectedESP(value as ESPName)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an ESP..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableESPs.map(esp => (
                            <SelectItem key={esp.name} value={esp.name}>
                              {esp.displayName} ({esp.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedESPConfig && (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Merge Tag Format</Label>
                          <code className="block p-2 bg-gray-100 rounded text-sm">
                            {selectedESPConfig.mergeTagFormat}
                          </code>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Features</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(selectedESPConfig.features).map(([feature, enabled]) => (
                              <Badge key={feature} variant={enabled ? "default" : "secondary"} className="text-xs">
                                {feature}: {enabled ? '✓' : '✗'}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {selectedESPConfig.limits && (
                          <div>
                            <Label className="text-sm font-medium">Limits</Label>
                            <div className="text-sm text-gray-600 mt-1">
                              {Object.entries(selectedESPConfig.limits).map(([limit, value]) => (
                                <div key={limit}>{limit}: {value}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Authentication */}
                {selectedESPConfig && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Auth Type</Label>
                        <Badge variant="outline" className="ml-2">
                          {selectedESPConfig.authentication?.type || 'Not specified'}
                        </Badge>
                      </div>

                      {selectedESPConfig.authentication?.requiredFields?.map(field => (
                        <div key={field}>
                          <Label htmlFor={field} className="capitalize">
                            {field.replace(/_/g, ' ')}
                          </Label>
                          <Input
                            id={field}
                            type={field.includes('key') || field.includes('token') ? 'password' : 'text'}
                            value={credentials[field] || ''}
                            onChange={(e) => updateCredentials(field, e.target.value)}
                            placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                          />
                        </div>
                      ))}

                      <Button
                        onClick={handleConnectESP}
                        disabled={isConnecting || !selectedESPConfig.authentication?.requiredFields?.every(field => credentials[field])}
                        className="w-full"
                      >
                        {isConnecting ? 'Connecting...' : 'Connect ESP'}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleDownloadGuide}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Setup Guide
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Test Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="test-template">Email Template</Label>
                      <Textarea
                        id="test-template"
                        value={testTemplate}
                        onChange={(e) => setTestTemplate(e.target.value)}
                        rows={6}
                        placeholder="Enter your email template with [TOKEN] placeholders"
                      />
                    </div>

                    <div>
                      <Label htmlFor="test-image">Image URL</Label>
                      <Input
                        id="test-image"
                        value={testImageUrl}
                        onChange={(e) => setTestImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(testRecipient).map(([key, value]) => (
                        <div key={key}>
                          <Label htmlFor={`recipient-${key}`} className="text-xs">{key}</Label>
                          <Input
                            id={`recipient-${key}`}
                            value={value}
                            onChange={(e) => updateRecipient(key, e.target.value)}
                            placeholder={`Enter ${key.toLowerCase()}`}
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={handleTestESP}
                      disabled={!selectedESP || !connectedESPs.has(selectedESP)}
                      className="w-full"
                    >
                      Test ESP Integration
                    </Button>
                  </CardContent>
                </Card>

                {/* Test Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Test Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testResults ? (
                      <div className="space-y-4">
                        {testResults.error ? (
                          <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                              {testResults.error}
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <>
                            {/* Validation Results */}
                            {testResults.validation && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Compatibility Check</Label>
                                <Alert className={testResults.validation.isCompatible ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                                  {testResults.validation.isCompatible ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                  )}
                                  <AlertDescription>
                                    {testResults.validation.isCompatible ? (
                                      <span className="text-green-800">Template is compatible!</span>
                                    ) : (
                                      <div className="text-yellow-800">
                                        <div>Compatibility issues:</div>
                                        <ul className="list-disc list-inside mt-1">
                                          {testResults.validation.recommendations.map((rec: string, index: number) => (
                                            <li key={index} className="text-sm">{rec}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </AlertDescription>
                                </Alert>
                              </div>
                            )}

                            {/* Generated Content */}
                            <div>
                              <Label className="text-sm font-medium">Generated Email Content</Label>
                              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border mt-2 max-h-60 overflow-y-auto">
                                {testResults.emailContent}
                              </pre>
                            </div>

                            {/* Image URL */}
                            {testResults.personalizedImageUrl && (
                              <div>
                                <Label className="text-sm font-medium">Personalized Image URL</Label>
                                <code className="block text-xs bg-gray-100 p-2 rounded break-all mt-1">
                                  {testResults.personalizedImageUrl}
                                </code>
                              </div>
                            )}

                            {/* Token Resolution */}
                            <div>
                              <Label className="text-sm font-medium">Resolved Tokens</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {testResults.resolvedTokens.map((token: string) => (
                                  <Badge key={token} variant="default" className="text-xs">
                                    ✓ {token}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Warnings */}
                            {testResults.warnings?.length > 0 && (
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  <ul className="list-disc list-inside">
                                    {testResults.warnings.map((warning: string, index: number) => (
                                      <li key={index} className="text-sm">{warning}</li>
                                    ))}
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        Configure an ESP and click "Test ESP Integration" to see results.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="manage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manage Connected ESPs</CardTitle>
                </CardHeader>
                <CardContent>
                  {connectedESPs.size > 0 ? (
                    <div className="space-y-4">
                      {Array.from(connectedESPs).map(espName => {
                        const config = espManager.getESP(espName);
                        if (!config) return null;

                        return (
                          <Card key={espName} className="border-green-200">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {getCategoryIcon(config.category)}
                                  <div>
                                    <h3 className="font-medium">{config.displayName}</h3>
                                    <p className="text-sm text-gray-600">{config.category} ESP</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-green-100 text-green-800">
                                    Connected
                                  </Badge>
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Disconnect
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No ESPs connected. Go to the Configure tab to connect your first ESP.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ESPManagerPanel;