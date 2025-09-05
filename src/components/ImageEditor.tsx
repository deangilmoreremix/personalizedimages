import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Text, Wand2, Download, RefreshCcw, Layers, Trash, Sparkles } from 'lucide-react';
import AIImageGenerator from './AIImageGenerator';

interface PersonalizationToken {
  id: string;
  type: 'text' | 'image';
  value: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  opacity?: number;
  placeholder?: string;
}

const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [tokens, setTokens] = useState<PersonalizationToken[]>([]);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [userName, setUserName] = useState('');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [isAIPanel, setIsAIPanel] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Sample template images
  const templates = [
    'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/3184419/pexels-photo-3184419.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/6177645/pexels-photo-6177645.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ];

  useEffect(() => {
    // Initialize with first template
    setImage(templates[0]);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectTemplate = (templateUrl: string) => {
    setImage(templateUrl);
  };

  const addTextToken = () => {
    const newToken: PersonalizationToken = {
      id: `token-${Date.now()}`,
      type: 'text',
      value: '[FIRSTNAME]',
      placeholder: 'First Name',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#ffffff',
      opacity: 1
    };
    setTokens([...tokens, newToken]);
    setActiveToken(newToken.id);
  };

  const updateTokenPosition = (id: string, x: number, y: number) => {
    setTokens(tokens.map(token => 
      token.id === id ? { ...token, x, y } : token
    ));
  };

  const updateTokenValue = (id: string, value: string) => {
    setTokens(tokens.map(token => 
      token.id === id ? { ...token, value } : token
    ));
  };

  const updateTokenStyle = (id: string, property: string, value: any) => {
    setTokens(tokens.map(token => 
      token.id === id ? { ...token, [property]: value } : token
    ));
  };

  const removeToken = (id: string) => {
    setTokens(tokens.filter(token => token.id !== id));
    setActiveToken(null);
  };

  const handleMouseDown = (e: React.MouseEvent, tokenId: string) => {
    if (previewMode) return;
    
    setActiveToken(tokenId);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !activeToken || !canvasRef.current || previewMode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    updateTokenPosition(activeToken, x, y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const generatePersonalizedImage = () => {
    setPreviewMode(true);
    // In a real implementation, this would call an API to generate the image
    // For now, we'll just show the preview with the user's name
    setPreviewData({
      '[FIRSTNAME]': userName || 'Sarah',
      '[LASTNAME]': 'Smith',
      '[COMPANY]': 'Acme Inc',
      '[EMAIL]': userName ? `${userName.toLowerCase()}@example.com` : 'sarah@example.com'
    });
  };

  const resetEditor = () => {
    setPreviewMode(false);
    setPreviewData({});
  };

  // Function to replace tokens with actual values in preview mode
  const getDisplayValue = (token: PersonalizationToken) => {
    if (!previewMode) return token.value;
    
    let displayValue = token.value;
    Object.entries(previewData).forEach(([placeholder, value]) => {
      displayValue = displayValue.replace(placeholder, value);
    });
    
    return displayValue;
  };

  const handleAIGeneratedImage = (imageUrl: string) => {
    setImage(imageUrl);
    setShowAIGenerator(false);
  };

  const toggleAIGenerator = () => {
    setShowAIGenerator(!showAIGenerator);
    if (!showAIGenerator) {
      setIsAIPanel(true);
    }
  };

  const togglePanel = (panel: 'ai' | 'tokens') => {
    setIsAIPanel(panel === 'ai');
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Canvas */}
        <div className="flex-1">
          <div 
            ref={canvasRef}
            className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4 border-2 border-gray-200"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {image && (
              <img 
                src={image} 
                alt="Canvas" 
                className="w-full h-full object-cover"
              />
            )}
            
            {tokens.map(token => (
              <div
                key={token.id}
                className={`absolute cursor-move ${activeToken === token.id ? 'ring-2 ring-primary-500' : ''} ${previewMode ? 'cursor-default' : ''}`}
                style={{ 
                  left: `${token.x}%`, 
                  top: `${token.y}%`, 
                  transform: 'translate(-50%, -50%)',
                  color: token.color,
                  fontSize: `${token.fontSize}px`,
                  opacity: token.opacity,
                  userSelect: 'none',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                }}
                onMouseDown={(e) => handleMouseDown(e, token.id)}
              >
                {getDisplayValue(token)}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            {templates.map((template, index) => (
              <div 
                key={index}
                className={`relative aspect-video cursor-pointer rounded-md overflow-hidden border-2 ${image === template ? 'border-primary-500' : 'border-gray-200'}`}
                onClick={() => selectTemplate(template)}
              >
                <img src={template} alt={`Template ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <label className="btn btn-outline flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            
            <button 
              className="btn btn-outline flex items-center" 
              onClick={addTextToken}
            >
              <Text className="w-4 h-4 mr-2" />
              Add Text Token
            </button>

            <button 
              className="btn btn-outline flex items-center" 
              onClick={toggleAIGenerator}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Image
            </button>
            
            {!previewMode ? (
              <button 
                className="btn btn-primary flex items-center ml-auto" 
                onClick={generatePersonalizedImage}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Preview
              </button>
            ) : (
              <>
                <button 
                  className="btn btn-outline flex items-center ml-auto" 
                  onClick={resetEditor}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
                <button 
                  className="btn btn-primary flex items-center" 
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Right side - Controls */}
        <div className="w-full lg:w-80 space-y-4">
          {/* Panel tabs */}
          <div className="flex rounded-md overflow-hidden border border-gray-200 mb-2">
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium ${!isAIPanel ? 'bg-primary-50 text-primary-700' : 'bg-white text-gray-700'}`}
              onClick={() => togglePanel('tokens')}
            >
              Personalization
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium ${isAIPanel ? 'bg-primary-50 text-primary-700' : 'bg-white text-gray-700'}`}
              onClick={() => togglePanel('ai')}
            >
              AI Generator
            </button>
          </div>

          {isAIPanel ? (
            <AIImageGenerator
              tokens={previewData}
              onImageGenerated={handleAIGeneratedImage}
            />
          ) : (
            <>
              <div className="card bg-gray-50">
                <h3 className="text-lg font-bold mb-3">Canvas Settings</h3>
                {!previewMode ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preview Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 bg-primary-100 text-primary-700 rounded-lg">
                    Preview Mode Active
                  </div>
                )}
              </div>
              
              {activeToken && !previewMode && (
                <div className="card bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold">Token Settings</h3>
                    <button 
                      className="text-red-500 hover:text-red-700" 
                      onClick={() => removeToken(activeToken)}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {tokens.find(t => t.id === activeToken)?.type === 'text' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Token
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          value={tokens.find(t => t.id === activeToken)?.value || ''}
                          onChange={(e) => updateTokenValue(activeToken, e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Font Size
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="72"
                          value={tokens.find(t => t.id === activeToken)?.fontSize || 24}
                          onChange={(e) => updateTokenStyle(activeToken, 'fontSize', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          type="color"
                          value={tokens.find(t => t.id === activeToken)?.color || '#ffffff'}
                          onChange={(e) => updateTokenStyle(activeToken, 'color', e.target.value)}
                          className="w-full h-8 p-0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opacity
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={tokens.find(t => t.id === activeToken)?.opacity || 1}
                          onChange={(e) => updateTokenStyle(activeToken, 'opacity', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="card bg-gray-50">
                <h3 className="text-lg font-bold mb-3">Tokens</h3>
                <div className="space-y-2">
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <div className="font-medium">[FIRSTNAME]</div>
                    <div className="text-xs text-gray-500">Customer's first name</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <div className="font-medium">[LASTNAME]</div>
                    <div className="text-xs text-gray-500">Customer's last name</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <div className="font-medium">[COMPANY]</div>
                    <div className="text-xs text-gray-500">Customer's company</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <div className="font-medium">[EMAIL]</div>
                    <div className="text-xs text-gray-500">Customer's email</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;