import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, Square, Clock, RefreshCw, Download, Trash, Plus, Minus, Layers, Mail, Settings, Sparkles, Image as ImageIcon, Zap } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useDropzone } from 'react-dropzone';
import gifshot from 'gifshot';
import { FontSelector } from './ui/FontSelector';

interface GifEditorProps {
  tokens: Record<string, string>;
  onGifGenerated?: (gifUrl: string) => void;
}

interface Frame {
  id: string;
  imageUrl: string;
  duration: number; // in ms
  tokens: PersonalizationToken[];
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

const DEFAULT_FRAME_DURATION = 500; // 500ms

const GifEditor: React.FC<GifEditorProps> = ({ tokens, onGifGenerated }) => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gifWidth, setGifWidth] = useState<number>(400);
  const [gifHeight, setGifHeight] = useState<number>(400);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedGif, setGeneratedGif] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isEmailOptimized, setIsEmailOptimized] = useState<boolean>(true);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [fileSize, setFileSize] = useState<number>(0);
  const [emailPreviewMode, setEmailPreviewMode] = useState<boolean>(false);
  const [emailTemplateType, setEmailTemplateType] = useState<string>('centered');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [showFrameSettings, setShowFrameSettings] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  
  const activeFrame = frames[activeFrameIndex];

  // Initialize with an empty frame
  useEffect(() => {
    if (frames.length === 0) {
      addNewFrame();
    }
  }, []);
  
  // Handle animation playback
  useEffect(() => {
    if (isPlaying && frames.length > 1) {
      let startTime: number;
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        
        if (timestamp - lastRenderTimeRef.current >= frames[activeFrameIndex].duration) {
          lastRenderTimeRef.current = timestamp;
          setActiveFrameIndex((prevIndex) => (prevIndex + 1) % frames.length);
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isPlaying, frames, activeFrameIndex]);
  
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
      const newFrames = [...frames];
      
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          
          // If no frames, add as first frame, otherwise append
          if (newFrames.length === 0) {
            newFrames.push({
              id: `frame-${Date.now()}`,
              imageUrl,
              duration: DEFAULT_FRAME_DURATION,
              tokens: []
            });
          } else if (activeFrameIndex >= 0) {
            // Insert after current frame
            newFrames.splice(activeFrameIndex + 1, 0, {
              id: `frame-${Date.now()}`,
              imageUrl,
              duration: DEFAULT_FRAME_DURATION,
              tokens: []
            });
            setActiveFrameIndex(activeFrameIndex + 1);
          } else {
            // Append to end
            newFrames.push({
              id: `frame-${Date.now()}`,
              imageUrl,
              duration: DEFAULT_FRAME_DURATION,
              tokens: []
            });
            setActiveFrameIndex(newFrames.length - 1);
          }
          
          setFrames(newFrames);
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const addNewFrame = () => {
    // Add empty placeholder frame
    const newFrames = [...frames];
    const newFrame: Frame = {
      id: `frame-${Date.now()}`,
      imageUrl: 'https://placehold.co/400x400/e2e8f0/a1a1aa?text=Drop+Image+Here',
      duration: DEFAULT_FRAME_DURATION,
      tokens: []
    };
    
    if (activeFrameIndex >= 0) {
      // Insert after current frame
      newFrames.splice(activeFrameIndex + 1, 0, newFrame);
      setActiveFrameIndex(activeFrameIndex + 1);
    } else {
      // Append to end
      newFrames.push(newFrame);
      setActiveFrameIndex(newFrames.length - 1);
    }
    
    setFrames(newFrames);
  };
  
  const removeFrame = (index: number) => {
    if (frames.length <= 1) return; // Keep at least one frame
    
    const newFrames = [...frames];
    newFrames.splice(index, 1);
    setFrames(newFrames);
    
    // Adjust activeFrameIndex if needed
    if (index <= activeFrameIndex) {
      setActiveFrameIndex(Math.max(0, activeFrameIndex - 1));
    }
  };
  
  const updateFrameDuration = (index: number, duration: number) => {
    const newFrames = [...frames];
    newFrames[index].duration = duration;
    setFrames(newFrames);
  };
  
  const addTextToken = () => {
    if (!activeFrame) return;
    
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
      fontFamily: 'Impact'
    };
    
    const newFrames = [...frames];
    newFrames[activeFrameIndex].tokens.push(newToken);
    setFrames(newFrames);
    setActiveToken(newToken.id);
  };
  
  const removeToken = (tokenId: string) => {
    if (!activeFrame) return;
    
    const newFrames = [...frames];
    newFrames[activeFrameIndex].tokens = newFrames[activeFrameIndex].tokens.filter(
      token => token.id !== tokenId
    );
    setFrames(newFrames);
    setActiveToken(null);
  };
  
  const updateTokenPosition = (tokenId: string, x: number, y: number) => {
    if (!activeFrame) return;
    
    const newFrames = [...frames];
    const tokenIndex = newFrames[activeFrameIndex].tokens.findIndex(t => t.id === tokenId);
    
    if (tokenIndex >= 0) {
      newFrames[activeFrameIndex].tokens[tokenIndex].x = x;
      newFrames[activeFrameIndex].tokens[tokenIndex].y = y;
      setFrames(newFrames);
    }
  };
  
  const updateTokenProperty = (tokenId: string, property: string, value: any) => {
    if (!activeFrame) return;
    
    const newFrames = [...frames];
    const tokenIndex = newFrames[activeFrameIndex].tokens.findIndex(t => t.id === tokenId);
    
    if (tokenIndex >= 0) {
      newFrames[activeFrameIndex].tokens[tokenIndex] = {
        ...newFrames[activeFrameIndex].tokens[tokenIndex],
        [property]: value
      };
      setFrames(newFrames);
    }
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
  
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  const generateGif = () => {
    if (frames.length === 0) return;
    
    setIsGenerating(true);
    
    // Prepare frames for gifshot
    const gifFrames = frames.map(frame => {
      // Create a temporary canvas to draw frame with tokens
      const canvas = document.createElement('canvas');
      canvas.width = gifWidth;
      canvas.height = gifHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return { src: frame.imageUrl, delay: frame.duration / 10 }; // gifshot uses centiseconds
      
      // Load the frame image
      const img = new Image();
      // Set crossOrigin to 'anonymous' to prevent canvas from being tainted
      img.crossOrigin = 'anonymous';
      img.src = frame.imageUrl;
      
      // Return a promise that resolves when the image is loaded and drawn
      return new Promise<{ src: string, delay: number }>((resolve) => {
        img.onload = () => {
          // Draw the background image
          ctx.drawImage(img, 0, 0, gifWidth, gifHeight);
          
          // Draw each token
          frame.tokens.forEach(token => {
            if (token.type === 'text') {
              // Replace token with actual value if available
              let displayText = token.value;
              Object.entries(tokens).forEach(([key, value]) => {
                displayText = displayText.replace(`[${key.toUpperCase()}]`, value);
              });
              
              ctx.font = `${token.fontSize}px ${token.fontFamily || 'Arial'}`;
              ctx.fillStyle = token.color || '#ffffff';
              ctx.globalAlpha = token.opacity || 1;
              ctx.textAlign = 'center';
              
              const x = (token.x / 100) * gifWidth;
              const y = (token.y / 100) * gifHeight;
              
              ctx.fillText(displayText, x, y);
              ctx.globalAlpha = 1;
            } else if (token.type === 'image') {
              // Handle image tokens here if needed
            }
          });
          
          // Get the data URL from the canvas
          const frameDataUrl = canvas.toDataURL('image/jpeg', isEmailOptimized ? 0.7 : 0.9);
          
          resolve({
            src: frameDataUrl,
            delay: frame.duration / 10 // Convert ms to cs for gifshot
          });
        };
        
        img.onerror = () => {
          // If there's an error loading the image, just use the original
          resolve({
            src: frame.imageUrl,
            delay: frame.duration / 10
          });
        };
      });
    });
    
    // Wait for all frame promises to resolve
    Promise.all(gifFrames).then(processedFrames => {
      // Generate GIF with gifshot
      gifshot.createGIF({
        images: processedFrames.map(f => f.src),
        gifWidth: gifWidth,
        gifHeight: gifHeight,
        interval: processedFrames.map(f => f.delay / 100), // Convert cs to s
        numFrames: frames.length,
        frameDuration: 1, // Let individual frame delays control timing
        sampleInterval: isEmailOptimized ? 12 : 6, // Higher number = smaller file size
        quality: isEmailOptimized ? 5 : 10,
        fontWeight: 'normal',
        fontSize: '16px',
        fontFamily: 'Arial',
        textAlign: 'center',
        textBaseline: 'middle'
      }, function(obj) {
        if (obj.error) {
          console.error('GIF generation error:', obj.error);
          setIsGenerating(false);
          return;
        }
        
        setGeneratedGif(obj.image);
        
        // Calculate approximate file size
        const base64Data = obj.image.split(',')[1];
        const approximateFileSize = Math.round((base64Data.length * 3/4) / 1024); // KB
        setFileSize(approximateFileSize);
        
        if (onGifGenerated) {
          onGifGenerated(obj.image);
        }
        
        setIsGenerating(false);
      });
    });
  };
  
  const downloadGif = () => {
    if (!generatedGif) return;
    
    const downloadLink = document.createElement('a');
    downloadLink.href = generatedGif;
    downloadLink.download = `personalized-animation-${Date.now()}.gif`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  
  const optimizeForEmail = () => {
    setIsEmailOptimized(true);
    // Adjust settings for email optimization
    setGifWidth(Math.min(gifWidth, 600)); // Max width for email
    setGifHeight(Math.min(gifHeight, 600)); // Max height for email
  };
  
  const getActiveTokenById = () => {
    if (!activeToken || !activeFrame) return null;
    return activeFrame.tokens.find(token => token.id === activeToken);
  };
  
  const applyTokenToAllFrames = () => {
    if (!activeToken || !activeFrame) return;
    
    const tokenToApply = activeFrame.tokens.find(t => t.id === activeToken);
    if (!tokenToApply) return;
    
    const newFrames = [...frames];
    
    newFrames.forEach((frame, index) => {
      if (index === activeFrameIndex) return; // Skip current frame
      
      // Check if token with same ID already exists
      const existingTokenIndex = frame.tokens.findIndex(t => t.id === activeToken);
      
      if (existingTokenIndex >= 0) {
        // Update existing token
        frame.tokens[existingTokenIndex] = { ...tokenToApply };
      } else {
        // Add new token
        frame.tokens.push({ ...tokenToApply });
      }
    });
    
    setFrames(newFrames);
  };
  
  const createEmailTemplatePreview = () => {
    if (!generatedGif) return null;
    
    return (
      <div className="p-4 bg-gray-200 rounded-lg overflow-auto max-h-[400px]">
        <div className="bg-white p-4 rounded shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
          {emailTemplateType === 'centered' && (
            <>
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Special Offer For You, {tokens['FIRSTNAME'] || 'Valued Customer'}</h2>
                <p className="text-gray-600">We have a personalized offer just for you!</p>
              </div>
              <div className="text-center mb-4">
                <img src={generatedGif} alt="Personalized animation" style={{ maxWidth: '100%', margin: '0 auto' }} />
              </div>
              <div className="text-center">
                <button className="bg-primary-600 text-white px-4 py-2 rounded">Check It Out</button>
              </div>
            </>
          )}
          
          {emailTemplateType === 'leftAligned' && (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Hey {tokens['FIRSTNAME'] || 'there'}!</h2>
                <p className="text-gray-600">Check out this special offer we've created just for you.</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="md:w-1/2">
                  <img src={generatedGif} alt="Personalized animation" style={{ maxWidth: '100%' }} />
                </div>
                <div className="md:w-1/2">
                  <h3 className="text-lg font-semibold mb-2">Limited Time Offer</h3>
                  <p className="text-gray-700 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam at justo quis urna.</p>
                  <button className="bg-primary-600 text-white px-4 py-2 rounded">Learn More</button>
                </div>
              </div>
            </>
          )}
          
          {emailTemplateType === 'announcement' && (
            <>
              <div className="text-center mb-6 bg-primary-50 p-4 rounded">
                <h2 className="text-2xl font-bold text-primary-700">Important Announcement</h2>
                <p className="text-primary-600">For {tokens['FIRSTNAME'] || 'our valued customer'}</p>
              </div>
              <div className="text-center mb-4">
                <img src={generatedGif} alt="Personalized animation" style={{ maxWidth: '100%', margin: '0 auto' }} />
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <p className="text-gray-700 mb-4">Please review this important information</p>
                <button className="bg-primary-600 text-white px-6 py-2 rounded-lg">View Details</button>
              </div>
            </>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-gray-500 text-xs">
            <p>© 2025 Your Company. All rights reserved.</p>
            <p>You received this email because you signed up for our newsletter.</p>
            <p><a href="#" className="text-primary-600">Unsubscribe</a></p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Animated GIF Personalization Editor</h3>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Canvas and Timeline */}
        <div className="flex-1">
          {/* Canvas */}
          <div
            ref={canvasRef}
            className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4 border-2 border-gray-200"
            style={{ width: '100%', height: `${gifHeight}px`, maxHeight: '400px' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {activeFrame && (
              <img
                src={activeFrame.imageUrl}
                alt={`Frame ${activeFrameIndex + 1}`}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            )}
            
            {activeFrame && activeFrame.tokens.map(token => (
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
            
            {/* Drop zone overlay when no frames */}
            {frames.length === 0 && (
              <div
                {...getRootProps()}
                className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-90 cursor-pointer"
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Drag & drop or click to add frames</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              className="btn btn-outline flex items-center"
              onClick={togglePlayback}
            >
              {isPlaying ? (
                <><Pause className="w-4 h-4 mr-2" />Pause</>
              ) : (
                <><Play className="w-4 h-4 mr-2" />Play</>
              )}
            </button>
            
            <button
              className="btn btn-outline flex items-center"
              onClick={() => setActiveFrameIndex(Math.max(0, activeFrameIndex - 1))}
              disabled={activeFrameIndex <= 0}
            >
              <span className="mr-1">◀</span> Prev
            </button>
            
            <div className="px-2 py-1 bg-gray-100 rounded">
              {activeFrameIndex + 1} / {frames.length}
            </div>
            
            <button
              className="btn btn-outline flex items-center"
              onClick={() => setActiveFrameIndex(Math.min(frames.length - 1, activeFrameIndex + 1))}
              disabled={activeFrameIndex >= frames.length - 1}
            >
              Next <span className="ml-1">▶</span>
            </button>
            
            <div className="ml-auto flex gap-2">
              <button
                className="btn btn-outline flex items-center"
                onClick={addTextToken}
              >
                <Plus className="w-4 h-4 mr-1" /> Text Token
              </button>
              
              <button
                className="btn btn-primary flex items-center"
                onClick={generateGif}
                disabled={isGenerating || frames.length === 0}
              >
                {isGenerating ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Zap className="w-4 h-4 mr-2" /> Generate GIF</>
                )}
              </button>
            </div>
          </div>
          
          {/* Timeline */}
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700">Timeline</h4>
              <button
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
                onClick={() => setShowFrameSettings(!showFrameSettings)}
              >
                <Settings className="w-3 h-3 mr-1" />
                {showFrameSettings ? 'Hide Settings' : 'Show Settings'}
              </button>
            </div>
            
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 mb-3">
              {frames.map((frame, index) => (
                <div
                  key={frame.id}
                  className={`relative aspect-square rounded overflow-hidden border-2 cursor-pointer ${
                    index === activeFrameIndex ? 'border-primary-500' : 'border-gray-300'
                  }`}
                  onClick={() => setActiveFrameIndex(index)}
                >
                  <img
                    src={frame.imageUrl}
                    alt={`Frame ${index + 1}`}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100">
                    <button
                      className="p-1 bg-red-500 rounded-full text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFrame(index);
                      }}
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-center text-white text-xs bg-black bg-opacity-50">
                    {index + 1}
                  </div>
                </div>
              ))}
              
              <div
                {...getRootProps()}
                className="aspect-square rounded border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50"
              >
                <input {...getInputProps()} />
                <Plus className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            {showFrameSettings && activeFrame && (
              <div className="bg-white p-3 rounded border border-gray-200 mb-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Frame Duration (ms)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="5000"
                      step="50"
                      value={activeFrame.duration}
                      onChange={(e) => updateFrameDuration(activeFrameIndex, Number(e.target.value))}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Actions
                    </label>
                    <div className="flex gap-1">
                      <button
                        className="px-2 py-1 bg-gray-100 rounded text-xs flex items-center"
                        onClick={addNewFrame}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Frame
                      </button>
                      
                      <button
                        className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs flex items-center"
                        onClick={() => {
                          // Duplicate current frame
                          const newFrames = [...frames];
                          const newFrame = {...frames[activeFrameIndex], id: `frame-${Date.now()}`};
                          newFrames.splice(activeFrameIndex + 1, 0, newFrame);
                          setFrames(newFrames);
                          setActiveFrameIndex(activeFrameIndex + 1);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Duplicate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <button
                className="text-xs flex items-center text-gray-600 hover:text-gray-800"
                onClick={addNewFrame}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add New Frame
              </button>
              
              <div className="text-xs text-gray-500">
                Total Duration: {frames.reduce((sum, frame) => sum + frame.duration, 0) / 1000}s
              </div>
            </div>
          </div>
          
          {/* Generated GIF Preview */}
          {generatedGif && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">Generated Animation</h4>
                <div className="flex gap-2">
                  <button
                    className="text-xs px-2 py-1 bg-gray-100 rounded flex items-center"
                    onClick={() => setEmailPreviewMode(!emailPreviewMode)}
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    {emailPreviewMode ? 'Hide' : 'Show'} Email Preview
                  </button>
                  
                  <button
                    className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded flex items-center"
                    onClick={downloadGif}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download ({fileSize} KB)
                  </button>
                </div>
              </div>
              
              {!emailPreviewMode ? (
                <div className="flex justify-center">
                  <img
                    src={generatedGif}
                    alt="Generated GIF"
                    className="max-w-full max-h-[300px] rounded"
                  />
                </div>
              ) : (
                createEmailTemplatePreview()
              )}
              
              {emailPreviewMode && (
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    className={`text-xs px-2 py-1 rounded ${emailTemplateType === 'centered' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100'}`}
                    onClick={() => setEmailTemplateType('centered')}
                  >
                    Centered Template
                  </button>
                  <button
                    className={`text-xs px-2 py-1 rounded ${emailTemplateType === 'leftAligned' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100'}`}
                    onClick={() => setEmailTemplateType('leftAligned')}
                  >
                    Left Aligned
                  </button>
                  <button
                    className={`text-xs px-2 py-1 rounded ${emailTemplateType === 'announcement' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100'}`}
                    onClick={() => setEmailTemplateType('announcement')}
                  >
                    Announcement
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Right side - Settings */}
        <div className="w-full lg:w-80 space-y-4">
          {/* GIF Settings */}
          <div className="card bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Animation Settings</h4>
              <button
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                <Settings className="w-3 h-3 mr-1" />
                {showAdvancedSettings ? 'Basic' : 'Advanced'}
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="1200"
                    step="10"
                    value={gifWidth}
                    onChange={(e) => setGifWidth(Number(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="1200"
                    step="10"
                    value={gifHeight}
                    onChange={(e) => setGifHeight(Number(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
              
              {showAdvancedSettings && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Optimization
                    </label>
                    <div className="flex gap-2">
                      <button
                        className={`flex-1 text-xs py-1 rounded ${isEmailOptimized ? 'bg-primary-100 text-primary-700' : 'bg-gray-100'}`}
                        onClick={() => setIsEmailOptimized(true)}
                      >
                        Email-Optimized
                      </button>
                      <button
                        className={`flex-1 text-xs py-1 rounded ${!isEmailOptimized ? 'bg-primary-100 text-primary-700' : 'bg-gray-100'}`}
                        onClick={() => setIsEmailOptimized(false)}
                      >
                        High Quality
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600">
                      {isEmailOptimized ? (
                        <>
                          Email-optimized mode reduces file size for better email compatibility.
                          Expected size: ~{Math.round(frames.length * gifWidth * gifHeight / 25000)} KB.
                        </>
                      ) : (
                        <>
                          High quality mode preserves more detail but results in larger file sizes.
                          Expected size: ~{Math.round(frames.length * gifWidth * gifHeight / 15000)} KB.
                        </>
                      )}
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 rounded p-2">
                    <p className="text-xs text-amber-700">
                      <b>Tip:</b> For email compatibility, keep GIFs under 1MB. Recommended dimensions: 600×400px or smaller.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Token Settings */}
          {activeToken && activeFrame && (
            <div className="card bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Token Settings</h4>
                <div className="flex gap-1">
                  <button
                    className="p-1 text-primary-600 hover:text-primary-800 rounded"
                    onClick={applyTokenToAllFrames}
                    title="Apply this token to all frames"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 text-red-600 hover:text-red-800 rounded"
                    onClick={() => removeToken(activeToken)}
                    title="Remove token"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
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
                    <FontSelector
                      value={getActiveTokenById()?.fontFamily || 'Arial'}
                      onChange={(value) => updateTokenProperty(activeToken, 'fontFamily', value)}
                      className="w-full"
                      size="sm"
                      maxHeight="200px"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded border cursor-pointer"
                        style={{ backgroundColor: getActiveTokenById()?.color || '#ffffff' }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                      ></div>
                      <input
                        type="text"
                        value={getActiveTokenById()?.color || '#ffffff'}
                        onChange={(e) => updateTokenProperty(activeToken, 'color', e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    
                    {showColorPicker && (
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
          
          {/* Email Optimization Tips */}
          <div className="card bg-indigo-50">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-indigo-700 mb-1">Email Optimization Tips</h4>
                <ul className="text-xs text-indigo-700 space-y-1 list-disc pl-4">
                  <li>Keep GIFs under 1MB for broad email client support</li>
                  <li>Avoid using too many frames (8-12 is optimal)</li>
                  <li>Use dimensions under a 600x400 for best viewing experience</li>
                  <li>Include a static fallback image for Outlook</li>
                  <li>Consider using 2 or 3 frames for minimal file size</li>
                </ul>
                <button
                  className="mt-2 text-xs py-1 px-2 bg-indigo-100 text-indigo-700 rounded"
                  onClick={optimizeForEmail}
                >
                  Apply Email-Safe Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GifEditor;
;