import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Play, Download, RefreshCw, Zap, Settings, Sparkles, DollarSign, Check, X, Info, Clock, Film, Clapperboard, Wand2, Shapes } from 'lucide-react';
import { VideoConversionOptions, VideoConversionResult, VideoEffect } from '../types/VideoTypes';
import { convertImageToVideo, checkVideoProcessingStatus, getVideoConversionResult, getVideoPresets, createPaymentIntent } from '../utils/videoApi';
import ReactPlayer from 'react-player';
import NanoBananaModal from './shared/nano-banana/NanoBananaModal';
import TokenPalette from './shared/tokens/TokenPalette';

interface VideoConverterProps {
  imageUrl: string | null;
  onVideoGenerated?: (videoUrl: string) => void;
  className?: string;
}

const VideoConverter: React.FC<VideoConverterProps> = ({ 
  imageUrl, 
  onVideoGenerated,
  className = ''
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<VideoConversionResult | null>(null);
  const [conversionOptions, setConversionOptions] = useState<VideoConversionOptions>({
    duration: 3,
    effect: 'zoom',
    resolution: '720p',
    includeAudio: false,
    outputFormat: 'mp4',
    quality: 'high'
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [selectedPreset, setSelectedPreset] = useState<string>('zoom');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Nano Banana editing
  const [showNanoBanana, setShowNanoBanana] = useState(false);
  const [showTokenPalette, setShowTokenPalette] = useState(false);
  
  const presets = getVideoPresets();
  
  // Effect to check processing status
  useEffect(() => {
    let statusInterval: number | undefined;
    
    if (isConverting && conversionResult?.id && conversionResult.status === 'processing') {
      statusInterval = window.setInterval(async () => {
        try {
          const status = await checkVideoProcessingStatus(conversionResult.id);
          setProcessingProgress(status.progress);
          setProcessingMessage(status.message || 'Processing your video...');
          
          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(statusInterval);
            
            // Get the final result
            const result = await getVideoConversionResult(conversionResult.id);
            setConversionResult(result);
            setIsConverting(false);
            
            if (result.videoUrl && onVideoGenerated) {
              onVideoGenerated(result.videoUrl);
            }
          }
        } catch (error) {
          console.error('Error checking video status:', error);
        }
      }, 2000);
    }
    
    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [isConverting, conversionResult, onVideoGenerated]);
  
  // Select a preset
  const handleSelectPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setConversionOptions({
        ...preset.options,
        effect: preset.options.effect as VideoEffect,
        outputFormat: preset.options.outputFormat as 'mp4' | 'webm' | 'gif',
        quality: preset.options.quality as 'high' | 'low' | 'medium'
      });
      setSelectedPreset(presetId);
    }
  };
  
  // Handle conversion
  const handleConvertToVideo = async () => {
    if (!imageUrl) return;
    
    try {
      setIsConverting(true);
      setProcessingProgress(0);
      setProcessingMessage('Initializing video conversion...');
      
      const result = await convertImageToVideo(imageUrl, conversionOptions);
      setConversionResult(result);
      
      // Start checking status
      setProcessingMessage('Processing your video...');
    } catch (error) {
      console.error('Error converting image to video:', error);
      setIsConverting(false);
    }
  };
  
  // Handle payment
  const handlePayment = async () => {
    if (!conversionResult?.id) return;
    
    try {
      setPaymentStatus('processing');
      
      // In a real implementation, this would integrate with Stripe
      const { clientSecret } = await createPaymentIntent(conversionResult.id);
      
      // Simulate payment success after a delay
      setTimeout(() => {
        // Update the conversion result with payment completed
        setConversionResult({
          ...conversionResult,
          paymentStatus: 'completed',
          downloadUrl: conversionResult.videoUrl
        });
        
        setPaymentStatus('success');
        setShowPaymentModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentStatus('error');
    }
  };
  
  // Effects options
  const effectOptions: { value: VideoEffect; label: string }[] = [
    { value: 'zoom', label: 'Zoom' },
    { value: 'pan', label: 'Pan' },
    { value: 'fade', label: 'Fade' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'pulse', label: 'Pulse' },
    { value: 'float', label: 'Float' },
    { value: 'parallax', label: 'Parallax' },
    { value: 'ken-burns', label: 'Ken Burns' },
    { value: 'glitch', label: 'Glitch' },
    { value: 'pixelate', label: 'Pixelate' },
    { value: 'blur', label: 'Blur' },
    { value: 'none', label: 'None' }
  ];
  
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center">
          <Video className="h-6 w-6 text-indigo-500 mr-2" />
          Convert to Video ($1 per download)
        </h3>
        <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
          New Feature
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animation Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  className={`p-3 rounded-lg border text-left transition ${
                    selectedPreset === preset.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => handleSelectPreset(preset.id)}
                >
                  <div className="font-medium text-sm mb-1">{preset.name}</div>
                  <div className="text-xs text-gray-500">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Duration */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Duration
              </label>
              <span className="text-sm text-gray-500">{conversionOptions.duration}s</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={conversionOptions.duration}
              onChange={(e) => setConversionOptions({
                ...conversionOptions,
                duration: parseInt(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* Advanced Options Toggle */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-xs text-gray-600 hover:text-indigo-600 flex items-center"
            >
              <Settings className="w-3 h-3 mr-1" />
              {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
            </button>
          </div>
          
          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effect
                </label>
                <select
                  value={conversionOptions.effect}
                  onChange={(e) => setConversionOptions({
                    ...conversionOptions,
                    effect: e.target.value as VideoEffect
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {effectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution
                </label>
                <select
                  value={conversionOptions.resolution}
                  onChange={(e) => setConversionOptions({
                    ...conversionOptions,
                    resolution: e.target.value
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeAudio"
                  checked={conversionOptions.includeAudio}
                  onChange={(e) => setConversionOptions({
                    ...conversionOptions,
                    includeAudio: e.target.checked
                  })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="includeAudio" className="ml-2 block text-sm text-gray-700">
                  Include background music
                </label>
              </div>
              
              <div className="p-3 bg-indigo-50 rounded-lg text-xs text-indigo-700">
                <p className="font-medium">Video Conversion Tips:</p>
                <ul className="mt-1 space-y-1 list-disc pl-4">
                  <li>Longer videos (5-10s) work best with Ken Burns or Parallax effects</li>
                  <li>For social media, 3-5 second videos with Zoom or Pan are ideal</li>
                  <li>Adding background music can increase engagement by 40%</li>
                  <li>Higher resolution videos look better but have larger file sizes</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Convert Button */}
          <button
            onClick={handleConvertToVideo}
            disabled={!imageUrl || isConverting}
            className="btn btn-primary w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700"
          >
            {isConverting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Converting to Video...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Convert to Video
              </>
            )}
          </button>
          
          {/* Processing Status */}
          {isConverting && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Film className="w-4 h-4 text-indigo-600 mr-2" />
                  <span className="font-medium text-indigo-700">{processingMessage}</span>
                </div>
                <span className="text-sm text-indigo-600">{processingProgress}%</span>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-4">
          {/* Video Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minHeight: "300px" }}>
            {conversionResult?.videoUrl ? (
              <div className="w-full h-full">
                <ReactPlayer
                  url={conversionResult.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing
                  loop
                  config={{
                    file: {
                      attributes: {
                        controlsList: 'nodownload'
                      }
                    }
                  }}
                />
              </div>
            ) : imageUrl ? (
              <div className="text-center p-6">
                <Clapperboard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your video will appear here</p>
                <p className="text-sm text-gray-400 mt-2">Convert your image to see the preview</p>
              </div>
            ) : (
              <div className="text-center p-6">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No image selected</p>
                <p className="text-sm text-gray-400 mt-2">Select an image to convert to video</p>
              </div>
            )}
          </div>
          
          {/* Download Button */}
          {conversionResult?.status === 'completed' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {conversionResult.paymentStatus === 'completed' ? (
                  <a
                    href={conversionResult.downloadUrl}
                    download="video.mp4"
                    className="btn btn-primary flex-1 flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </a>
                ) : (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="btn btn-primary flex-1 flex items-center justify-center"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Purchase Download ($1)
                  </button>
                )}

                <button
                  onClick={() => window.open(conversionResult.previewUrl)}
                  className="btn btn-outline flex-1 flex items-center justify-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  View Full Size
                </button>
              </div>

              {/* Advanced Editing Options */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setShowNanoBanana(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Wand2 className="w-4 h-4" />
                  Nano Banana AI Edit
                </button>
                <button
                  onClick={() => setShowTokenPalette(!showTokenPalette)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Shapes className="w-4 h-4" />
                  {showTokenPalette ? 'Hide' : 'Show'} Tokens
                </button>
              </div>
            </div>
          )}
          
          {/* Video Info */}
          {conversionResult?.status === 'completed' && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-medium text-indigo-700 flex items-center mb-2">
                <Sparkles className="w-4 h-4 mr-1" />
                Video Details
              </h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  Duration: <span className="font-medium ml-1">{conversionResult.duration}s</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  Effect: <span className="font-medium ml-1">{conversionOptions.effect}</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  Resolution: <span className="font-medium ml-1">{conversionOptions.resolution}</span>
                </li>
                {conversionOptions.includeAudio && (
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    Background Music: <span className="font-medium ml-1">Included</span>
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {/* Info Box */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-700 mb-1">Why Convert to Video?</h4>
                <p className="text-sm text-blue-600">
                  Videos get 48% more engagement than static images on social media. 
                  Convert your AI-generated images to eye-catching videos with professional motion effects.
                </p>
                <ul className="mt-2 text-xs text-blue-600 space-y-1">
                  <li className="flex items-center">
                    <Check className="w-3 h-3 mr-1 text-blue-500" />
                    <span>Increase engagement by up to 48%</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-3 h-3 mr-1 text-blue-500" />
                    <span>Perfect for social media and email marketing</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-3 h-3 mr-1 text-blue-500" />
                    <span>Professional motion effects in seconds</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-1">Purchase Video Download</h3>
                <p className="text-gray-600">
                  Your video is ready! Pay $1.00 to download the full video without watermark.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Video conversion</span>
                  <span className="font-medium">$1.00</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Processing fee</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>$1.00</span>
                </div>
              </div>
              
              <button
                onClick={handlePayment}
                disabled={paymentStatus === 'processing'}
                className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                {paymentStatus === 'processing' ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : paymentStatus === 'success' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Payment Successful
                  </>
                ) : paymentStatus === 'error' ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Payment Failed
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Pay $1.00
                  </>
                )}
              </button>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
              
              <div className="mt-6 text-xs text-gray-500 flex items-center justify-center">
                <Lock className="w-3 h-3 mr-1" />
                Secure payment powered by Stripe
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nano Banana AI Editor */}
      {showNanoBanana && imageUrl && (
        <NanoBananaModal
          imageUrl={imageUrl}
          onSave={(editedImageUrl) => {
            // For video converter, we might want to convert the edited image back to video
            console.log('Edited image saved:', editedImageUrl);
            setShowNanoBanana(false);
          }}
          onClose={() => setShowNanoBanana(false)}
          moduleType="video"
          tokens={{}} // Video converter doesn't use tokens the same way
        />
      )}

      {/* Token Palette Panel */}
      {showTokenPalette && (
        <div className="mt-6">
          <TokenPalette
            tokens={{}} // Video converter doesn't use tokens the same way
            onTokenUpdate={(key, value) => {
              console.log('Token updated:', key, value);
            }}
            onTokenAdd={(token) => {
              console.log('Token added:', token);
            }}
            onTokenDelete={(key) => {
              console.log('Token deleted:', key);
            }}
            onTokenInsert={(tokenKey) => {
              console.log('Token inserted:', tokenKey);
            }}
          />
        </div>
      )}
    </div>
  );
};

// Lock icon component
const Lock = ({ className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

export default VideoConverter;