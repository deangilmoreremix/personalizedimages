import React, { createContext, useContext, useState, ReactNode, lazy, Suspense } from 'react';
import FeatureDialog from './FeatureDialog';
import { Image as ImageIcon, Box, MessageSquare, Sparkles, Paintbrush as PaintBrush, Mail, Clock, Music, Tv, Dumbbell, Wand2, Video } from 'lucide-react';

// Lazy load components to improve performance
const ImageEditor = lazy(() => import('../ImageEditor'));
const GifEditor = lazy(() => import('../GifEditor'));
const ActionFigureGenerator = lazy(() => import('../ActionFigureGenerator'));
const MemeGenerator = lazy(() => import('../MemeGenerator'));
const GhibliImageGenerator = lazy(() => import('../GhibliImageGenerator'));
const CartoonImageGenerator = lazy(() => import('../CartoonImageGenerator'));
const MusicStarActionFigureGenerator = lazy(() => import('../MusicStarActionFigureGenerator'));
const TVShowActionFigureGenerator = lazy(() => import('../TVShowActionFigureGenerator'));
const WrestlingActionFigureGenerator = lazy(() => import('../WrestlingActionFigureGenerator'));
const AIImageGenerator = lazy(() => import('../AIImageGenerator'));
const VideoConverter = lazy(() => import('../VideoConverter'));

// Loading component for suspense fallback
const LoadingComponent = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading feature...</p>
    </div>
  </div>
);

// Feature configuration with metadata
interface FeatureConfig {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  category: 'media' | 'character' | 'style';
  helpText?: string;
  isNew?: boolean;
  badge?: string;
}

// Define all available features
export const FEATURES: Record<string, FeatureConfig> = {
  'image': {
    id: 'image',
    title: 'AI Image Generator',
    description: 'Create high-quality AI images from text descriptions',
    icon: <ImageIcon className="w-6 h-6" />,
    category: 'media',
    helpText: 'Create custom images using multiple AI models'
  },
  'gif': {
    id: 'gif',
    title: 'Animated GIF',
    description: 'Create personalized animated GIFs',
    icon: <Clock className="w-6 h-6" />,
    category: 'media',
    helpText: 'Add personalization to animated GIFs'
  },
  'action-figure': {
    id: 'action-figure',
    title: 'Action Figure',
    description: 'Transform photos into custom action figures',
    icon: <Box className="w-6 h-6" />,
    category: 'character',
    helpText: 'Generate professional action figure designs'
  },
  'music-figure': {
    id: 'music-figure',
    title: 'Music Star Figure',
    description: 'Create action figures of legendary musicians',
    icon: <Music className="w-6 h-6" />,
    category: 'character',
    badge: 'POPULAR',
    helpText: 'Turn musicians into collectible action figures'
  },
  'tv-figure': {
    id: 'tv-figure',
    title: 'TV Show Figure',
    description: 'Generate action figures of classic TV characters',
    icon: <Tv className="w-6 h-6" />,
    category: 'character',
    helpText: 'Transform TV characters into action figures'
  },
  'wrestling-figure': {
    id: 'wrestling-figure',
    title: 'Wrestling Figure',
    description: 'Create action figures of wrestling legends',
    icon: <Dumbbell className="w-6 h-6" />,
    category: 'character',
    isNew: true,
    helpText: 'Turn wrestling legends into action figures'
  },
  'meme': {
    id: 'meme',
    title: 'Meme Generator',
    description: 'Create personalized, shareable memes',
    icon: <MessageSquare className="w-6 h-6" />,
    category: 'style',
    helpText: 'Generate customized memes with your text'
  },
  'ghibli': {
    id: 'ghibli',
    title: 'Studio Ghibli Style',
    description: 'Generate magical Ghibli-inspired scenes',
    icon: <Sparkles className="w-6 h-6" />,
    category: 'style',
    helpText: 'Create images with Ghibli-inspired aesthetics'
  },
  'cartoon': {
    id: 'cartoon',
    title: 'Cartoon Styles',
    description: 'Transform photos into cartoon styles',
    icon: <PaintBrush className="w-6 h-6" />,
    category: 'style',
    isNew: true,
    helpText: 'Convert images into various cartoon styles'
  },
  'video': {
    id: 'video',
    title: 'Image to Video',
    description: 'Transform images into animated videos',
    icon: <Video className="w-6 h-6" />,
    category: 'media',
    isNew: true,
    badge: 'PREMIUM',
    helpText: 'Convert any image to a short video with motion effects'
  }
};

// Context for dialog management
interface FeatureDialogContextValue {
  openFeature: (featureId: string) => void;
  closeFeature: () => void;
  activeFeature: string | null;
  getFeatureConfig: (featureId: string) => FeatureConfig | undefined;
}

const FeatureDialogContext = createContext<FeatureDialogContextValue>({
  openFeature: () => {},
  closeFeature: () => {},
  activeFeature: null,
  getFeatureConfig: () => undefined
});

// Hook to use the dialog context
export const useFeatureDialog = () => useContext(FeatureDialogContext);

interface FeatureDialogProviderProps {
  children: ReactNode;
  tokens: Record<string, string>;
}

export const FeatureDialogProvider: React.FC<FeatureDialogProviderProps> = ({ 
  children,
  tokens
}) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [lastGeneratedImage, setLastGeneratedImage] = useState<string | null>(null);
  
  // Open a feature dialog
  const openFeature = (featureId: string) => {
    setActiveFeature(featureId);
  };
  
  // Close the current feature dialog
  const closeFeature = () => {
    setActiveFeature(null);
  };
  
  // Get feature configuration by ID
  const getFeatureConfig = (featureId: string) => {
    return FEATURES[featureId];
  };
  
  // Handle image generation from any component
  const handleImageGenerated = (imageUrl: string) => {
    setLastGeneratedImage(imageUrl);
  };
  
  // Render the appropriate component based on active feature
  const renderFeatureComponent = () => {
    if (!activeFeature) return null;
    
    // Wrap all components in Suspense for lazy loading
    const renderWithSuspense = (Component: React.ComponentType<any>) => (
      <Suspense fallback={<LoadingComponent />}>
        <Component tokens={tokens} onImageGenerated={handleImageGenerated} />
      </Suspense>
    );
    
    switch(activeFeature) {
      case 'image': 
        return renderWithSuspense(AIImageGenerator);
      case 'gif':
        return renderWithSuspense(GifEditor);
      case 'action-figure':
        return renderWithSuspense(ActionFigureGenerator);
      case 'music-figure': 
        return renderWithSuspense(MusicStarActionFigureGenerator);
      case 'tv-figure': 
        return renderWithSuspense(TVShowActionFigureGenerator);
      case 'wrestling-figure': 
        return renderWithSuspense(WrestlingActionFigureGenerator);
      case 'meme': 
        return renderWithSuspense(MemeGenerator);
      case 'ghibli': 
        return renderWithSuspense(GhibliImageGenerator);
      case 'cartoon': 
        return renderWithSuspense(CartoonImageGenerator);
      case 'video':
        return renderWithSuspense(() => <VideoConverter imageUrl={lastGeneratedImage} />);
      default:
        return null;
    }
  };
  
  // Current feature config
  const activeFeatureConfig = activeFeature ? FEATURES[activeFeature] : null;
  
  return (
    <FeatureDialogContext.Provider value={{ openFeature, closeFeature, activeFeature, getFeatureConfig }}>
      {children}
      
      {activeFeature && activeFeatureConfig && (
        <FeatureDialog
          isOpen={!!activeFeature}
          onClose={closeFeature}
          title={activeFeatureConfig.title}
          icon={activeFeatureConfig.icon}
          helpText={activeFeatureConfig.helpText || `Create personalized content with ${activeFeatureConfig.title}`}
        >
          {renderFeatureComponent()}
        </FeatureDialog>
      )}
    </FeatureDialogContext.Provider>
  );
};