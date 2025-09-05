import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';
import AiAssistant from './AIAssistant';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFeatureDialog } from './FeatureDialogProvider';

interface AiAssistantContextType {
  showAssistant: () => void;
  hideAssistant: () => void;
  isVisible: boolean;
}

// Create context for assistant state
const AiAssistantContext = createContext<AiAssistantContextType>({
  showAssistant: () => {},
  hideAssistant: () => {},
  isVisible: false
});

// Hook to use the assistant context
export const useAiAssistant = () => useContext(AiAssistantContext);

interface AiAssistantProviderProps {
  children: React.ReactNode;
}

export const AiAssistantProvider: React.FC<AiAssistantProviderProps> = ({ children }) => {
  const [isAssistantVisible, setIsAssistantVisible] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { openFeature } = useFeatureDialog();
  
  // Sample user data - in a real app this would come from your auth context
  const userData = {
    'FIRSTNAME': 'User',
    'LASTNAME': 'Example',
    'COMPANY': 'VideoRemix',
    'EMAIL': 'user@example.com'
  };

  // Show welcome message after a delay on first visit
  useEffect(() => {
    if (!hasShownWelcome) {
      const welcomeTimeout = setTimeout(() => {
        setHasShownWelcome(true);
        
        // Uncomment to automatically show the assistant on first visit
        // setIsAssistantVisible(true);
      }, 10000); // Show welcome after 10 seconds
      
      return () => clearTimeout(welcomeTimeout);
    }
  }, [hasShownWelcome]);

  const showAssistant = () => setIsAssistantVisible(true);
  const hideAssistant = () => setIsAssistantVisible(false);
  
  // Function to handle feature selection from the AI assistant
  const handleFeatureSelect = (featureId: string) => {
    console.log(`Selected feature: ${featureId}`);
    
    // Close the assistant
    hideAssistant();
    
    // Check the current location
    if (location.pathname === '/editor') {
      // Already on the editor page, just open the feature
      openFeature(featureId);
    } else {
      // Need to navigate to the editor page first, with state to open the feature after navigation
      navigate('/editor', { state: { selectedFeature: featureId } });
    }
  };

  // Listen for navigation events and check if we need to open a feature
  useEffect(() => {
    const state = location.state as { selectedFeature?: string } | null;
    
    if (state?.selectedFeature && location.pathname === '/editor') {
      // We're on the editor page with a feature to open
      openFeature(state.selectedFeature);
      
      // Clear the state so we don't reopen on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, openFeature]);

  return (
    <AiAssistantContext.Provider 
      value={{ 
        showAssistant,
        hideAssistant,
        isVisible: isAssistantVisible 
      }}
    >
      {children}
      
      {/* AI Assistant Floating Button - always visible */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg flex items-center justify-center group z-50"
        whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={showAssistant}
      >
        <Brain className="w-7 h-7 text-white" />
        <span className="absolute bottom-full right-0 mb-2 bg-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium text-indigo-700 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ask AI Assistant
        </span>
      </motion.button>

      {/* AI Assistant Dialog */}
      <AnimatePresence>
        {isAssistantVisible && (
          <AiAssistant 
            onClose={hideAssistant} 
            userData={userData}
            onFeatureSelect={handleFeatureSelect}
          />
        )}
      </AnimatePresence>
    </AiAssistantContext.Provider>
  );
};