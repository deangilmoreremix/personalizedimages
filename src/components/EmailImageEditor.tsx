import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Download, Trash, Plus, Sparkles, Mail, Settings, Copy, CheckSquare, Code } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useDropzone } from 'react-dropzone';

interface EmailImageEditorProps {
  tokens: Record<string, string>;
  onImageGenerated?: (imageUrl: string) => void;
}

interface PersonalizationToken {
  id: string;
  type: 'text' | 'image';
  value: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  opacity?: number;
  fontFamily?: string;
  placeholder?: string;
}

const EmailImageEditor: React.FC<EmailImageEditorProps> = ({ tokens, onImageGenerated }) => {
  const [image, setImage] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [personalizationTokens, setPersonalizationTokens] = useState<PersonalizationToken[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [emailTemplate, setEmailTemplate] = useState<string>('centered');
  const [showHtmlCode, setShowHtmlCode] = useState<boolean>(false);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [emailWidth, setEmailWidth] = useState<number>(600);
  const [isResponsive, setIsResponsive] = useState<boolean>(true);
  const [previewSize, setPreviewSize] = useState<'desktop' | 'mobile'>('desktop');
  const [imageHeight, setImageHeight] = useState<number>(400);
  const [emailBgColor, setEmailBgColor] = useState<string>('#f9fafb');
  const [emailTextColor, setEmailTextColor] = useState<string>('#111827');
  const [emailAccentColor, setEmailAccentColor] = useState<string>('#4f46e5');
  const [emailSubject, setEmailSubject] = useState<string>('Special offer just for you!');
  const [linkUrl, setLinkUrl] = useState<string>('https://example.com/special-offer');
  const [linkText, setLinkText] = useState<string>('View Special Offer');
  const [showEmailPreview, setShowEmailPreview] = useState<boolean>(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Sample template images
  const templateImages = [
    'https://images.pexels.com/photos/3184419/pexels-photo-3184419.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/6177645/pexels-photo-6177645.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ];

  useEffect(() => {
    // Initialize with first template
    setImage(templateImages[0]);
  }, []);
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop: (acceptedFiles) => {
      handleImageUpload(acceptedFiles);
    }
  });
  
  const handleImageUpload = (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      opacity: 1,
      fontFamily: 'Arial'
    };
    
    setPersonalizationTokens([...personalizationTokens, newToken]);
    setActiveToken(newToken.id);
  };
  
  const removeToken = (tokenId: string) => {
    setPersonalizationTokens(personalizationTokens.filter(token => token.id !== tokenId));
    setActiveToken(null);
  };
  
  const updateTokenPosition = (tokenId: string, x: number, y: number) => {
    setPersonalizationTokens(personalizationTokens.map(token => 
      token.id === tokenId ? { ...token, x, y } : token
    ));
  };
  
  const updateTokenProperty = (tokenId: string, property: string, value: any) => {
    setPersonalizationTokens(personalizationTokens.map(token => 
      token.id === tokenId ? { ...token, [property]: value } : token
    ));
  };
  
  const handleMouseDown = (e: React.MouseEvent, tokenId: string) => {
    setActiveToken(tokenId);
    setIsDragging(true);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !activeToken || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    updateTokenPosition(activeToken, x, y);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const selectTemplate = (templateUrl: string) => {
    setImage(templateUrl);
  };
  
  const getActiveTokenById = () => {
    if (!activeToken) return null;
    return personalizationTokens.find(token => token.id === activeToken);
  };
  
  const generateEmailHtml = () => {
    if (!image) return '';
    
    // Create a canvas to render the personalized image
    const canvas = document.createElement('canvas');
    const img = new Image();
    
    // Set up image onload handler
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw the background image
        ctx.drawImage(img, 0, 0);
        
        // Draw personalization tokens
        personalizationTokens.forEach(token => {
          if (token.type === 'text') {
            // Replace token with actual value if available
            let displayText = token.value;
            Object.entries(tokens).forEach(([key, value]) => {
              displayText = displayText.replace(`[${key.toUpperCase()}]`, value);
            });
            
            // Set text styles
            ctx.font = `${token.fontSize}px ${token.fontFamily || 'Arial'}`;
            ctx.fillStyle = token.color || '#ffffff';
            ctx.globalAlpha = token.opacity || 1;
            ctx.textAlign = 'center';
            
            // Calculate position
            const x = (token.x / 100) * canvas.width;
            const y = (token.y / 100) * canvas.height;
            
            // Draw text
            ctx.fillText(displayText, x, y);
            ctx.globalAlpha = 1;
          }
        });
        
        // Get the personalized image as data URL
        const personalizedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Generate the HTML email template
        generateEmailTemplate(personalizedImageUrl);
        
        // Optional: provide the image to the parent component
        if (onImageGenerated) {
          onImageGenerated(personalizedImageUrl);
        }
      }
    };
    
    // Load the image
    img.src = image;
  };
  
  const generateEmailTemplate = (personalizedImageUrl: string) => {
    // Replace tokens in subject and link text
    let tokenizedSubject = emailSubject;
    let tokenizedLinkText = linkText;
    
    Object.entries(tokens).forEach(([key, value]) => {
      tokenizedSubject = tokenizedSubject.replace(`[${key.toUpperCase()}]`, value);
      tokenizedLinkText = tokenizedLinkText.replace(`[${key.toUpperCase()}]`, value);
    });
    
    // Base HTML template structure
    let htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tokenizedSubject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${emailBgColor}; color: ${emailTextColor}; }
    .container { max-width: ${emailWidth}px; margin: 0 auto; padding: 20px; }
    img { max-width: 100%; height: auto; }
    .btn { display: inline-block; padding: 10px 20px; background-color: ${emailAccentColor}; color: white; text-decoration: none; border-radius: 4px; }
    ${isResponsive ? `@media only screen and (max-width: 480px) {
      .container { padding: 10px; }
      .mobile-padding { padding: 0 10px; }
    }` : ''}
  </style>
</head>
<body>
  <div class="container">\n`;
  
    // Add specific template content
    if (emailTemplate === 'centered') {
      htmlTemplate += `    <div style="text-align: center; padding: 20px;">
      <h1 style="color: ${emailTextColor};">Special Offer For ${tokens['FIRSTNAME'] || 'You'}</h1>
      <p>We have a personalized offer just for you!</p>
      <div style="margin: 20px 0;">
        <img src="${personalizedImageUrl}" alt="Personalized Offer" width="${emailWidth}" style="display: block; margin: 0 auto;">
      </div>
      <div style="margin-top: 20px;">
        <a href="${linkUrl}" class="btn">${tokenizedLinkText}</a>
      </div>
    </div>\n`;
    } else if (emailTemplate === 'leftAligned') {
      htmlTemplate += `    <div style="padding: 20px;">
      <h1 style="color: ${emailTextColor};">Hey ${tokens['FIRSTNAME'] || 'there'}!</h1>
      <p>Check out this special offer we've created just for you.</p>
      <div style="margin: 20px 0; display: flex; flex-wrap: wrap;">
        <div style="width: 100%; max-width: 300px; margin-right: 20px; margin-bottom: 20px;">
          <img src="${personalizedImageUrl}" alt="Personalized Offer" width="100%">
        </div>
        <div style="flex: 1; min-width: 200px;">
          <h2 style="color: ${emailTextColor};">Limited Time Offer</h2>
          <p>This exclusive offer is only available for a limited time. Take advantage before it expires!</p>
          <div style="margin-top: 20px;">
            <a href="${linkUrl}" class="btn">${tokenizedLinkText}</a>
          </div>
        </div>
      </div>
    </div>\n`;
    } else if (emailTemplate === 'announcement') {
      htmlTemplate += `    <div style="padding: 20px; text-align: center;">
      <div style="background-color: ${emailAccentColor}10; padding: 20px; border-radius: 8px;">
        <h1 style="color: ${emailAccentColor};">Important Announcement</h1>
        <p style="color: ${emailAccentColor};">For ${tokens['FIRSTNAME'] || 'our valued customer'}</p>
      </div>
      <div style="margin: 20px 0;">
        <img src="${personalizedImageUrl}" alt="Personalized Announcement" width="${emailWidth}" style="display: block; margin: 0 auto;">
      </div>
      <div style="background-color: #f3f4f6; padding: 20px; margin-top: 20px; border-radius: 8px;">
        <p>Please review this important information</p>
        <div style="margin-top: 15px;">
          <a href="${linkUrl}" class="btn" style="font-weight: bold;">${tokenizedLinkText}</a>
        </div>
      </div>
    </div>\n`;
    }
    
    // Add footer
    htmlTemplate += `    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
      <p>© 2025 Your Company. All rights reserved.</p>
      <p>You received this email because you signed up for our newsletter.</p>
      <p><a href="#" style="color: ${emailAccentColor};">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
    
    setGeneratedHtml(htmlTemplate);
    setShowHtmlCode(true);
  };
  
  const copyHtmlToClipboard = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };
  
  const downloadHtml = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedHtml], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = 'personalized-email.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Email-Ready Image Editor</h3>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Canvas */}
        <div className="flex-1">
          {/* Canvas */}
          <div
            ref={canvasRef}
            className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 border-2 border-gray-200"
            style={{ 
              height: `${imageHeight}px`, 
              maxWidth: previewSize === 'mobile' ? '375px' : '100%',
              margin: previewSize === 'mobile' ? '0 auto' : undefined
            }}
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
            
            {personalizationTokens.map(token => (
              <div
                key={token.id}
                className={`absolute cursor-move ${activeToken === token.id ? 'ring-2 ring-primary-500' : ''}`}
                style={{
                  left: `${token.x}%`,
                  top: `${token.y}%`,
                  transform: 'translate(-50%, -50%)',
                  color: token.color,
                  fontSize: `${token.fontSize}px`,
                  fontFamily: token.fontFamily || 'Arial',
                  opacity: token.opacity,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                  userSelect: 'none',
                  zIndex: 10
                }}
                onMouseDown={(e) => handleMouseDown(e, token.id)}
              >
                {token.value}
              </div>
            ))}
            
            {/* Drop zone overlay when no image */}
            {!image && (
              <div
                {...getRootProps()}
                className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-90 cursor-pointer"
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Drag & drop or click to add image</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Image templates */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {templateImages.map((templateUrl, index) => (
              <div
                key={index}
                className={`relative aspect-video cursor-pointer rounded-md overflow-hidden border-2 ${
                  image === templateUrl ? 'border-primary-500' : 'border-gray-200'
                }`}
                onClick={() => selectTemplate(templateUrl)}
              >
                <img
                  src={templateUrl}
                  alt={`Template ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <label className="btn btn-outline flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleImageUpload([e.target.files[0]]);
                  }
                }}
                className="hidden"
              />
            </label>
            
            <button
              className="btn btn-outline flex items-center"
              onClick={addTextToken}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Text Token
            </button>
            
            <div className="flex gap-2 ml-auto">
              <button
                className="btn btn-outline flex items-center"
                onClick={() => setShowEmailPreview(!showEmailPreview)}
              >
                <Mail className="w-4 h-4 mr-2" />
                {showEmailPreview ? 'Hide' : 'Show'} Email Preview
              </button>
              
              <button
                className="btn btn-primary flex items-center"
                onClick={generateEmailHtml}
                disabled={!image}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Email HTML
              </button>
            </div>
          </div>
          
          {/* Preview Size Toggle */}
          {(showEmailPreview || showHtmlCode) && (
            <div className="mb-4 flex justify-end">
              <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
                <button
                  className={`px-3 py-1 text-xs ${
                    previewSize === 'desktop' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700'
                  }`}
                  onClick={() => setPreviewSize('desktop')}
                >
                  Desktop
                </button>
                <button
                  className={`px-3 py-1 text-xs ${
                    previewSize === 'mobile' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700'
                  }`}
                  onClick={() => setPreviewSize('mobile')}
                >
                  Mobile
                </button>
              </div>
            </div>
          )}
          
          {/* Email Preview */}
          {showEmailPreview && (
            <div
              className="mt-4 border border-gray-200 rounded-lg overflow-hidden"
              style={{ 
                maxWidth: previewSize === 'mobile' ? '375px' : '100%',
                margin: previewSize === 'mobile' ? '0 auto' : undefined
              }}
            >
              <div className="bg-gray-100 border-b border-gray-200 p-2 flex justify-between items-center">
                <div className="text-sm font-medium">Email Preview</div>
                <div className="text-xs text-gray-500">
                  {previewSize === 'mobile' ? 'Mobile View (375px)' : 'Desktop View'}
                </div>
              </div>
              
              <div className="p-2" style={{ backgroundColor: emailBgColor }}>
                <div
                  className="mx-auto p-4"
                  style={{ maxWidth: `${emailWidth}px` }}
                >
                  {emailTemplate === 'centered' && (
                    <div className="text-center">
                      <h2 className="text-xl font-bold" style={{ color: emailTextColor }}>
                        Special Offer For {tokens['FIRSTNAME'] || 'You'}
                      </h2>
                      <p className="text-gray-600 mb-4">
                        We have a personalized offer just for you!
                      </p>
                      
                      <div className="mb-4">
                        {image && (
                          <img
                            src={image}
                            alt="Personalized offer"
                            className="max-w-full rounded"
                          />
                        )}
                      </div>
                      
                      <button
                        className="px-4 py-2 rounded"
                        style={{ backgroundColor: emailAccentColor, color: 'white' }}
                      >
                        {linkText}
                      </button>
                    </div>
                  )}
                  
                  {emailTemplate === 'leftAligned' && (
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: emailTextColor }}>
                        Hey {tokens['FIRSTNAME'] || 'there'}!
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Check out this special offer we've created just for you.
                      </p>
                      
                      <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="md:w-1/2">
                          {image && (
                            <img
                              src={image}
                              alt="Personalized offer"
                              className="max-w-full rounded"
                            />
                          )}
                        </div>
                        <div className="md:w-1/2">
                          <h3 className="text-lg font-semibold mb-2" style={{ color: emailTextColor }}>
                            Limited Time Offer
                          </h3>
                          <p className="text-gray-600 mb-4">
                            This exclusive offer is only available for a limited time. Take advantage before it expires!
                          </p>
                          <button
                            className="px-4 py-2 rounded"
                            style={{ backgroundColor: emailAccentColor, color: 'white' }}
                          >
                            {linkText}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {emailTemplate === 'announcement' && (
                    <div className="text-center">
                      <div
                        className="p-4 rounded-lg mb-4"
                        style={{ backgroundColor: `${emailAccentColor}10` }}
                      >
                        <h2
                          className="text-xl font-bold"
                          style={{ color: emailAccentColor }}
                        >
                          Important Announcement
                        </h2>
                        <p style={{ color: emailAccentColor }}>
                          For {tokens['FIRSTNAME'] || 'our valued customer'}
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        {image && (
                          <img
                            src={image}
                            alt="Personalized announcement"
                            className="max-w-full rounded"
                          />
                        )}
                      </div>
                      
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-700 mb-3">
                          Please review this important information
                        </p>
                        <button
                          className="px-4 py-2 rounded font-semibold"
                          style={{ backgroundColor: emailAccentColor, color: 'white' }}
                        >
                          {linkText}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8 pt-4 border-t border-gray-200 text-center text-gray-500 text-xs">
                    <p>© 2025 Your Company. All rights reserved.</p>
                    <p>You received this email because you signed up for our newsletter.</p>
                    <p>
                      <a href="#" style={{ color: emailAccentColor }}>
                        Unsubscribe
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Generated HTML Code */}
          {showHtmlCode && (
            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 border-b border-gray-200 p-2 flex justify-between items-center">
                <div className="text-sm font-medium flex items-center">
                  <Code className="w-4 h-4 mr-1" />
                  Generated HTML
                </div>
                <div className="flex gap-2">
                  <button
                    className={`text-xs px-2 py-1 rounded flex items-center ${
                      copiedToClipboard ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={copyHtmlToClipboard}
                  >
                    {copiedToClipboard ? (
                      <>
                        <CheckSquare className="w-3 h-3 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy HTML
                      </>
                    )}
                  </button>
                  
                  <button
                    className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded flex items-center"
                    onClick={downloadHtml}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download HTML
                  </button>
                </div>
              </div>
              
              <div className="overflow-auto max-h-[300px] p-2 bg-gray-900 text-gray-100">
                <pre className="text-xs whitespace-pre-wrap"><code>{generatedHtml}</code></pre>
              </div>
            </div>
          )}
        </div>
        
        {/* Right side - Settings */}
        <div className="w-full lg:w-80 space-y-4">
          {/* Email Settings */}
          <div className="card bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Email Settings</h4>
              <button
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                <Settings className="w-3 h-3 mr-1" />
                {showAdvancedOptions ? 'Basic' : 'Advanced'}
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Template Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={`p-2 border rounded text-center text-xs ${
                      emailTemplate === 'centered' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200'
                    }`}
                    onClick={() => setEmailTemplate('centered')}
                  >
                    Centered
                  </button>
                  <button
                    className={`p-2 border rounded text-center text-xs ${
                      emailTemplate === 'leftAligned' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200'
                    }`}
                    onClick={() => setEmailTemplate('leftAligned')}
                  >
                    Left Aligned
                  </button>
                  <button
                    className={`p-2 border rounded text-center text-xs ${
                      emailTemplate === 'announcement' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200'
                    }`}
                    onClick={() => setEmailTemplate('announcement')}
                  >
                    Announcement
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject line"
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Call to Action
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Button text"
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
              
              {showAdvancedOptions && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email Width (px)
                    </label>
                    <input
                      type="number"
                      min="300"
                      max="800"
                      step="10"
                      value={emailWidth}
                      onChange={(e) => setEmailWidth(Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 600px (standard for email)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Image Height (px)
                    </label>
                    <input
                      type="number"
                      min="200"
                      max="800"
                      step="10"
                      value={imageHeight}
                      onChange={(e) => setImageHeight(Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Background
                      </label>
                      <div className="flex">
                        <div
                          className="w-8 h-8 rounded-l border-l border-t border-b border-gray-300 cursor-pointer"
                          style={{ backgroundColor: emailBgColor }}
                          onClick={() => setShowColorPicker(showColorPicker === 'bg' ? false : 'bg')}
                        ></div>
                        <input
                          type="text"
                          value={emailBgColor}
                          onChange={(e) => setEmailBgColor(e.target.value)}
                          className="flex-1 rounded-r border py-1 px-2 text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="w-1/2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Text Color
                      </label>
                      <div className="flex">
                        <div
                          className="w-8 h-8 rounded-l border-l border-t border-b border-gray-300 cursor-pointer"
                          style={{ backgroundColor: emailTextColor }}
                          onClick={() => setShowColorPicker(showColorPicker === 'text' ? false : 'text')}
                        ></div>
                        <input
                          type="text"
                          value={emailTextColor}
                          onChange={(e) => setEmailTextColor(e.target.value)}
                          className="flex-1 rounded-r border py-1 px-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Accent Color
                    </label>
                    <div className="flex">
                      <div
                        className="w-8 h-8 rounded-l border-l border-t border-b border-gray-300 cursor-pointer"
                        style={{ backgroundColor: emailAccentColor }}
                        onClick={() => setShowColorPicker(showColorPicker === 'accent' ? false : 'accent')}
                      ></div>
                      <input
                        type="text"
                        value={emailAccentColor}
                        onChange={(e) => setEmailAccentColor(e.target.value)}
                        className="flex-1 rounded-r border py-1 px-2 text-sm"
                      />
                    </div>
                  </div>
                  
                  {showColorPicker && (
                    <div className="mt-2 relative">
                      <div className="absolute z-10">
                        <div 
                          className="fixed inset-0" 
                          onClick={() => setShowColorPicker(false)}
                        ></div>
                        {showColorPicker === 'bg' && (
                          <HexColorPicker
                            color={emailBgColor}
                            onChange={setEmailBgColor}
                          />
                        )}
                        {showColorPicker === 'text' && (
                          <HexColorPicker
                            color={emailTextColor}
                            onChange={setEmailTextColor}
                          />
                        )}
                        {showColorPicker === 'accent' && (
                          <HexColorPicker
                            color={emailAccentColor}
                            onChange={setEmailAccentColor}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="responsiveCheck"
                      checked={isResponsive}
                      onChange={(e) => setIsResponsive(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="responsiveCheck" className="text-xs text-gray-700">
                      Enable responsive design
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Token Settings */}
          {activeToken && (
            <div className="card bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Token Settings</h4>
                <button
                  className="p-1 text-red-600 hover:text-red-800 rounded"
                  onClick={() => removeToken(activeToken)}
                  title="Remove token"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
              
              {getActiveTokenById() && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Token Text
                    </label>
                    <input
                      type="text"
                      value={getActiveTokenById()?.value || ''}
                      onChange={(e) => updateTokenProperty(activeToken, 'value', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use <span className="font-mono">[FIRSTNAME]</span>, <span className="font-mono">[LASTNAME]</span>, etc.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Font Size
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="72"
                      value={getActiveTokenById()?.fontSize || 24}
                      onChange={(e) => updateTokenProperty(activeToken, 'fontSize', Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-center">{getActiveTokenById()?.fontSize}px</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Font Family
                    </label>
                    <select
                      value={getActiveTokenById()?.fontFamily || 'Arial'}
                      onChange={(e) => updateTokenProperty(activeToken, 'fontFamily', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Tahoma">Tahoma</option>
                      <option value="Trebuchet MS">Trebuchet MS</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Stick to web-safe fonts for email compatibility
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded border cursor-pointer"
                        style={{ backgroundColor: getActiveTokenById()?.color || '#ffffff' }}
                        onClick={() => setShowColorPicker(showColorPicker === 'token' ? false : 'token')}
                      ></div>
                      <input
                        type="text"
                        value={getActiveTokenById()?.color || '#ffffff'}
                        onChange={(e) => updateTokenProperty(activeToken, 'color', e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    
                    {showColorPicker === 'token' && (
                      <div className="mt-2 relative">
                        <div className="absolute z-10">
                          <div 
                            className="fixed inset-0" 
                            onClick={() => setShowColorPicker(false)}
                          ></div>
                          <HexColorPicker
                            color={getActiveTokenById()?.color || '#ffffff'}
                            onChange={(color) => updateTokenProperty(activeToken, 'color', color)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Opacity
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={getActiveTokenById()?.opacity || 1}
                      onChange={(e) => updateTokenProperty(activeToken, 'opacity', Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-center">{Math.round((getActiveTokenById()?.opacity || 1) * 100)}%</div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Personalization Tokens */}
          <div className="card bg-gray-50">
            <h4 className="font-medium mb-3">Personalization Tokens</h4>
            <div className="space-y-2">
              <div className="p-2 bg-white rounded border border-gray-200">
                <div className="font-medium">[FIRSTNAME]</div>
                <div className="text-xs text-gray-500">Current value: {tokens['FIRSTNAME'] || 'Not set'}</div>
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <div className="font-medium">[LASTNAME]</div>
                <div className="text-xs text-gray-500">Current value: {tokens['LASTNAME'] || 'Not set'}</div>
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <div className="font-medium">[COMPANY]</div>
                <div className="text-xs text-gray-500">Current value: {tokens['COMPANY'] || 'Not set'}</div>
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <div className="font-medium">[EMAIL]</div>
                <div className="text-xs text-gray-500">Current value: {tokens['EMAIL'] || 'Not set'}</div>
              </div>
            </div>
          </div>
          
          {/* Email Compatibility Tips */}
          <div className="card bg-indigo-50">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-indigo-700 mb-1">Email Compatibility Tips</h4>
                <ul className="text-xs text-indigo-700 space-y-1 list-disc pl-4">
                  <li>Keep image sizes under 200KB for fast loading</li>
                  <li>Use web-safe fonts like Arial, Helvetica, etc.</li>
                  <li>Aim for a maximum width of 600px</li>
                  <li>Include ALT text for images</li>
                  <li>Test your emails in multiple clients</li>
                  <li>Keep HTML code simple (avoid complex CSS)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailImageEditor;