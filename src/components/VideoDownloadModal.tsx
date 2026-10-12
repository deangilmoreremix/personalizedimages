import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle, Video } from 'lucide-react';

interface VideoDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  imageUrl: string;
  videoId: string;
  onDownloadComplete?: () => void;
}

const VideoDownloadModal: React.FC<VideoDownloadModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  imageUrl,
  videoId,
  onDownloadComplete
}) => {
  const handleDownload = () => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `video-${videoId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onDownloadComplete) {
      onDownloadComplete();
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center">
              <Video className="w-5 h-5 text-primary-600 mr-2" />
              Download Video
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            {/* Preview */}
            <div className="mb-6">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                <img
                  src={imageUrl}
                  alt="Video preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/30 rounded-full p-3">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Preview of your generated video
              </p>
            </div>

            <div className="mb-4 bg-green-50 text-green-700 p-4 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Your video is ready to download.</span>
            </div>

            <button
              onClick={handleDownload}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Video
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default VideoDownloadModal;
