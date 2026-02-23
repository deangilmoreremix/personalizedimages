import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Loader, AlertCircle } from 'lucide-react';
import VideoDownloadModal from './VideoDownloadModal';
import { useAuth } from '../auth/AuthContext';

interface VideoGenerationButtonProps {
  imageUrl: string;
  prompt?: string;
  className?: string;
  onVideoGenerated?: (videoUrl: string) => void;
}

const VideoGenerationButton: React.FC<VideoGenerationButtonProps> = ({
  imageUrl,
  prompt = '',
  className = '',
  onVideoGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [videoId, setVideoId] = useState<string>('');
  const { user } = useAuth();

  const handleGenerateVideo = async () => {
    if (!imageUrl) {
      setError('Please generate an image first');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      // Generate a unique ID for this video
      const generatedVideoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setVideoId(generatedVideoId);
      
      // In a production environment, this would make an API call to generate the video
      // For this demo, we'll simulate video generation with a sample video
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use a placeholder video for demonstration
      const demoVideoUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      
      setVideoUrl(demoVideoUrl);
      
      if (onVideoGenerated) {
        onVideoGenerated(demoVideoUrl);
      }
      
      // Show download modal
      setShowDownloadModal(true);
    } catch (err) {
      console.error('Error generating video:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={handleGenerateVideo}
        disabled={isGenerating || !imageUrl}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center justify-center px-4 py-2 rounded-lg ${
          isGenerating 
            ? 'bg-gray-300 cursor-not-allowed' 
            : !imageUrl 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
        } ${className}`}
      >
        {isGenerating ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Generating Video...
          </>
        ) : (
          <>
            <Video className="w-4 h-4 mr-2" />
            Create Video ($1)
          </>
        )}
      </motion.button>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      
      {/* Video Download Modal */}
      <VideoDownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        videoUrl={videoUrl || ''}
        imageUrl={imageUrl}
        videoId={videoId}
        onDownloadComplete={() => {
          setShowDownloadModal(false);
        }}
      />
    </>
  );
};

export default VideoGenerationButton;