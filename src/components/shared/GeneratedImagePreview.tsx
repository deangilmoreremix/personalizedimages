import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ImageIcon,
  Wand2,
  Palette,
  MessageSquare,
  Save,
  Share2,
  Maximize2
} from 'lucide-react';

interface GeneratedImagePreviewProps {
  imageUrl: string | null;
  isGenerating: boolean;
  onDownload?: () => void;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onSemanticMask?: () => void;
  onConversationalRefine?: () => void;
  onSave?: () => void;
  generatorType?: string;
  className?: string;
}

export const GeneratedImagePreview: React.FC<GeneratedImagePreviewProps> = ({
  imageUrl,
  isGenerating,
  onDownload,
  onRegenerate,
  onEdit,
  onSemanticMask,
  onConversationalRefine,
  onSave,
  generatorType = 'image',
  className = ''
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preview Container */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden"
           style={{ minHeight: '400px' }}>

        {imageUrl && !isGenerating ? (
          <>
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
              transition={{ duration: 0.3 }}
              src={imageUrl}
              alt="Generated image"
              className="w-full h-full object-contain cursor-zoom-in"
              onClick={() => setShowFullscreen(true)}
            />

            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors"
                title={isZoomed ? "Zoom out" : "Zoom in"}
              >
                {isZoomed ? (
                  <ZoomOut className="w-4 h-4 text-gray-700" />
                ) : (
                  <ZoomIn className="w-4 h-4 text-gray-700" />
                )}
              </button>
              <button
                onClick={() => setShowFullscreen(true)}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </>
        ) : isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="w-12 h-12 text-indigo-500" />
            </motion.div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-center p-6">
            <div>
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Your {generatorType} will appear here</p>
              <p className="text-gray-400 text-sm mt-2">Configure options and click Generate</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {imageUrl && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-3">
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
            {onSave && (
              <button
                onClick={onSave}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            )}
          </div>

          {/* Editing Tools */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Edit & Refine</p>
            <div className="grid grid-cols-2 gap-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Quick Edit
                </button>
              )}
              {onSemanticMask && (
                <button
                  onClick={onSemanticMask}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
                >
                  <Palette className="w-3.5 h-3.5" />
                  Masking
                </button>
              )}
              {onConversationalRefine && (
                <button
                  onClick={onConversationalRefine}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors col-span-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Conversational Refinement
                </button>
              )}
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors col-span-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {showFullscreen && imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowFullscreen(false)}
          >
            <img
              src={imageUrl}
              alt="Generated image fullscreen"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GeneratedImagePreview;
