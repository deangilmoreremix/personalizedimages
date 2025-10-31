import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Upload, Plus, Sparkles, Mail, Copy, CheckSquare, Download } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { isValidImageUrl, sanitizeHtml, sanitizeTokenValue } from '../utils/validation';
import EmailCanvas from './email-editor/EmailCanvas';
import EmailSettings from './email-editor/EmailSettings';
import EmailPreview from './email-editor/EmailPreview';
import TokenManager from './email-editor/TokenManager';
import TokenList from './email-editor/TokenList';

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

const EmailImageEditor: React.FC<EmailImageEditorProps> = React.memo(({ tokens, onImageGenerated }) => {
  const [image, setImage] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [personalizationTokens, setPersonalizationTokens] = useState<PersonalizationToken[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<string | false>(false);
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
  const [error, setError] = useState<string | null>(null);

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
  
  
  const handleImageUpload = (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result && isValidImageUrl(result)) {
          setImage(result);
          setError(null);
        } else {
          setError('Invalid image file');
        }
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };
  
  const addTextToken = useCallback(() => {
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

    setPersonalizationTokens(prev => [...prev, newToken]);
    setActiveToken(newToken.id);
  }, []);

  const removeToken = useCallback((tokenId: string) => {
    setPersonalizationTokens(prev => prev.filter(token => token.id !== tokenId));
    setActiveToken(null);
  }, []);

  const updateTokenPosition = useCallback((tokenId: string, x: number, y: number) => {
    setPersonalizationTokens(prev => prev.map(token =>
      token.id === tokenId ? { ...token, x, y } : token
    ));
  }, []);

  const updateTokenProperty = useCallback((tokenId: string, property: string, value: any) => {
    setPersonalizationTokens(prev => prev.map(token =>
      token.id === tokenId ? { ...token, [property]: value } : token
    ));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, tokenId: string) => {
    setActiveToken(tokenId);
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !activeToken || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    updateTokenPosition(activeToken, x, y);
  }, [isDragging, activeToken, updateTokenPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const selectTemplate = useCallback((templateUrl: string) => {
    setImage(templateUrl);
  }, []);

  const activeTokenData = useMemo(() => {
    if (!activeToken) return null;
    return personalizationTokens.find(token => token.id === activeToken);
  }, [activeToken, personalizationTokens]);
  
  const generateEmailHtml = useCallback(() => {
    if (!image) return;

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

        // Generate and sanitize the HTML output
        generateEmailTemplate(personalizedImageUrl);

        // Optional: provide the image to the parent component
        if (onImageGenerated) {
          onImageGenerated(personalizedImageUrl);
        }
      }
    };

    // Load the image
    img.src = image;
  }, [image, personalizationTokens, tokens, onImageGenerated]);
  
  const generateEmailTemplate = (personalizedImageUrl: string) => {
    // Validate image URL
    if (!isValidImageUrl(personalizedImageUrl)) {
      setError('Invalid image URL generated');
      return;
    }

    // Replace tokens in subject and link text
    let tokenizedSubject = emailSubject;
    let tokenizedLinkText = linkText;

    Object.entries(tokens).forEach(([key, value]) => {
      const sanitizedValue = sanitizeTokenValue(value);
      tokenizedSubject = tokenizedSubject.replace(`[${key.toUpperCase()}]`, sanitizedValue);
      tokenizedLinkText = tokenizedLinkText.replace(`[${key.toUpperCase()}]`, sanitizedValue);
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
          <EmailCanvas
            image={image}
            personalizationTokens={personalizationTokens}
            activeToken={activeToken}
            imageHeight={imageHeight}
            previewSize={previewSize}
            onImageUpload={handleImageUpload}
            onTokenMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onSelectTemplate={selectTemplate}
          />

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

          <EmailPreview
            showEmailPreview={showEmailPreview}
            showHtmlCode={showHtmlCode}
            previewSize={previewSize}
            emailTemplate={emailTemplate}
            tokens={tokens}
            image={image}
            emailSubject={emailSubject}
            linkText={linkText}
            linkUrl={linkUrl}
            emailBgColor={emailBgColor}
            emailTextColor={emailTextColor}
            emailAccentColor={emailAccentColor}
            emailWidth={emailWidth}
            generatedHtml={generatedHtml}
            copiedToClipboard={copiedToClipboard}
            onTogglePreview={() => setShowEmailPreview(!showEmailPreview)}
            onPreviewSizeChange={setPreviewSize}
            onCopyHtml={copyHtmlToClipboard}
            onDownloadHtml={downloadHtml}
          />
        </div>

        {/* Right side - Settings */}
        <div className="w-full lg:w-80 space-y-4">
          <EmailSettings
            emailTemplate={emailTemplate}
            emailSubject={emailSubject}
            linkText={linkText}
            linkUrl={linkUrl}
            emailWidth={emailWidth}
            imageHeight={imageHeight}
            emailBgColor={emailBgColor}
            emailTextColor={emailTextColor}
            emailAccentColor={emailAccentColor}
            showAdvancedOptions={showAdvancedOptions}
            isResponsive={isResponsive}
            showColorPicker={showColorPicker}
            onTemplateChange={setEmailTemplate}
            onSubjectChange={setEmailSubject}
            onLinkTextChange={setLinkText}
            onLinkUrlChange={setLinkUrl}
            onWidthChange={setEmailWidth}
            onImageHeightChange={setImageHeight}
            onBgColorChange={setEmailBgColor}
            onTextColorChange={setEmailTextColor}
            onAccentColorChange={setEmailAccentColor}
            onToggleAdvanced={() => setShowAdvancedOptions(!showAdvancedOptions)}
            onColorPickerToggle={setShowColorPicker}
            onResponsiveToggle={setIsResponsive}
          />

          <TokenManager
            activeToken={activeTokenData || null}
            showColorPicker={showColorPicker}
            onRemoveToken={removeToken}
            onUpdateToken={updateTokenProperty}
            onColorPickerToggle={setShowColorPicker}
            tokens={tokens}
          />

          <TokenList tokens={tokens} />

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
});

EmailImageEditor.displayName = 'EmailImageEditor';

export default EmailImageEditor;