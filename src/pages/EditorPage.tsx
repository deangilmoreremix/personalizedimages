import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Layers, Search, Info, Zap, Image as ImageIcon, Mail, Box, MessageSquare, Wand2, Sparkles, Paintbrush as PaintBrush, Camera, Bell, Settings, Menu, X, HelpCircle, Music, Tv, Dumbbell, Globe, Cpu, Lightbulb, Brain, Video, Plus, Grid, List } from 'lucide-react';

// Component imports
import { createDefaultTokenValues } from '../types/personalization';
import Tooltip from '../components/ui/Tooltip';
import DraggableContentPanel from '../components/DraggableContentPanel';
import FeatureTileGrid from '../components/ui/FeatureTileGrid';
import { FeatureDialogProvider, FEATURES } from '../components/ui/FeatureDialogProvider';
import { useAiAssistant } from '../components/ui/AiAssistantProvider';
import VideoIntegrationBanner from '../components/VideoIntegrationBanner';

// Loading component for suspense fallback
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading editor...</p>
    </div>
  </div>
);

const EditorPage: React.FC = () => {
  const [userData, setUserData] = useState(createDefaultTokenValues());
  const [showTokensPanel, setShowTokensPanel] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showDragHint, setShowDragHint] = useState(true);
  const [showingIntro, setShowingIntro] = useState(true);
  const [enhancedAiEnabled, setEnhancedAiEnabled] = useState(true);
  const [uiMode, setUiMode] = useState<'grid' | 'list'>('grid');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [showVideoBanner, setShowVideoBanner] = useState(true);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const dragHintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showAssistant } = useAiAssistant();
  const location = useLocation();

  // Category filters
  const categories = [
    { id: null, label: 'All', icon: <Globe className="w-4 h-4 mr-2" /> },
    { id: 'media', label: 'Media', icon: <ImageIcon className="w-4 h-4 mr-2" /> },
    { id: 'character', label: 'Character', icon: <Box className="w-4 h-4 mr-2" /> },
    { id: 'style', label: 'Style', icon: <PaintBrush className="w-4 h-4 mr-2" /> }
  ];
  
  // Quick actions
  const quickActions = [
    { label: "Generate image", icon: <Wand2 />, feature: "image" },
    { label: "Create action figure", icon: <Box />, feature: "action-figure" },
    { label: "Ghibli style", icon: <Sparkles />, feature: "ghibli" },
    { label: "Make a meme", icon: <MessageSquare />, feature: "meme" },
    { label: "Convert to video", icon: <Video />, feature: "video" }
  ];

  // Get AI suggestion periodically
  useEffect(() => {
    if (enhancedAiEnabled) {
      const suggestions = [
        "Try using our advanced model for faster image generation",
        "Upload a reference image to improve character generation",
        "Add personalization tokens to make your content unique",
        "Combine multiple AI styles for creative results",
        "Convert your images to videos for 48% more engagement",
        "Detailed descriptions produce better results"
      ];
      
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * suggestions.length);
        setAiSuggestion(suggestions[randomIndex]);
        
        // Clear suggestion after 10 seconds
        setTimeout(() => setAiSuggestion(null), 10000);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [enhancedAiEnabled]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Show drag hint for a few seconds
  useEffect(() => {
    if (showTokensPanel && showDragHint) {
      // Clear any existing timeout
      if (dragHintTimeoutRef.current) {
        clearTimeout(dragHintTimeoutRef.current);
      }
      
      // Hide hint after 5 seconds
      dragHintTimeoutRef.current = setTimeout(() => {
        setShowDragHint(false);
      }, 5000);
    }
    
    return () => {
      if (dragHintTimeoutRef.current) {
        clearTimeout(dragHintTimeoutRef.current);
      }
    };
  }, [showTokensPanel]);

  // Auto-hide intro after 3 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowingIntro(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Check for feature to open from location state
  useEffect(() => {
    const state = location.state as { selectedFeature?: string } | null;
    if (state?.selectedFeature) {
      setActiveFeature(state.selectedFeature);
      
      // Update recently used
      setRecentlyUsed(prev => {
        const newRecent = [state.selectedFeature, ...prev.filter(f => f !== state.selectedFeature)].slice(0, 5);
        return newRecent;
      });
    }
  }, [location]);

  const updateUserData = (key: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle opening a feature from the AI assistant
  const handleFeatureSelect = (featureId: string) => {
    setActiveFeature(featureId);
    
    // Update recently used
    setRecentlyUsed(prev => {
      const newRecent = [featureId, ...prev.filter(f => f !== featureId)].slice(0, 5);
      return newRecent;
    });
  };

  // Handle video banner try now button
  const handleTryVideoFeature = () => {
    setActiveFeature('video');
    setShowVideoBanner(false);
    
    // Update recently used
    setRecentlyUsed(prev => {
      const newRecent = ['video', ...prev.filter(f => f !== 'video')].slice(0, 5);
      return newRecent;
    });
  };

  return (
    <FeatureDialogProvider tokens={userData}>
      <section className="pt-20 pb-16 bg-gradient-to-br from-gray-50/80 to-gray-100/80 min-h-screen">
        {/* Intro animation overlay */}
        <AnimatePresence>
          {showingIntro && (
            <motion.div 
              className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="text-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 1.5,
                    ease: "easeInOut",
                    times: [0, 0.3, 0.6, 1]
                  }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{ 
                      duration: 1,
                      ease: "easeInOut",
                      repeat: 1,
                      repeatType: "reverse"
                    }}
                  >
                    <Sparkles className="w-12 h-12 text-white" />
                  </motion.div>
                </motion.div>
                <motion.h1 
                  className="text-3xl font-bold text-gray-900 mb-2"
                  animate={{ 
                    opacity: [0, 1],
                    y: [20, 0]
                  }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  AI Creative Studio
                </motion.h1>
                <motion.p
                  className="text-gray-600"
                  animate={{ 
                    opacity: [0, 1],
                    y: [20, 0]
                  }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  Loading your creative AI workspace...
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header with navigation */}
          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="font-medium">Back to Home</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
              >
                <input 
                  type="text" 
                  placeholder="Search tools..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 w-40 md:w-auto"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </motion.div>
              
              <div className="hidden md:flex gap-2">
                <Tooltip content="Notifications">
                  <motion.button 
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100/80 rounded-xl transition-colors relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="w-5 h-5" />
                    <motion.span 
                      className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 }}
                    />
                  </motion.button>
                </Tooltip>
                <Tooltip content="Settings">
                  <motion.button 
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100/80 rounded-xl transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Settings className="w-5 h-5" />
                  </motion.button>
                </Tooltip>
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button 
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100/80 rounded-xl transition-colors"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                  {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Mobile menu */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white rounded-xl shadow-md mb-4 overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  <button
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                    onClick={() => {
                      setShowTokensPanel(!showTokensPanel);
                      setShowMobileMenu(false);
                    }}
                  >
                    <div className="flex items-center">
                      <Layers className="w-5 h-5 text-primary-600 mr-2" />
                      <span>Personalization Tokens</span>
                    </div>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  
                  <button
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                    onClick={() => {
                      showAssistant();
                      setShowMobileMenu(false);
                    }}
                  >
                    <div className="flex items-center">
                      <HelpCircle className="w-5 h-5 text-primary-600 mr-2" />
                      <span>Get Help</span>
                    </div>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  
                  <button
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Bell className="w-5 h-5 text-primary-600 mr-2" />
                      <span>Notifications</span>
                    </div>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </button>
                  
                  <button
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Settings className="w-5 h-5 text-primary-600 mr-2" />
                      <span>Settings</span>
                    </div>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex flex-col gap-6">
            {/* Main Content Area */}
            <div className="w-full">
              <motion.div 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                initial="hidden"
                animate="visible"
                transition={{
                  duration: 0.6,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              >
                {/* Title Bar */}
                <motion.div 
                  className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex justify-between items-center">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <h1 className="text-2xl font-bold mb-1 flex items-center">
                        <span className="mr-2">AI Creative Studio</span>
                        <motion.span 
                          className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-normal"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
                        >
                          Pro
                        </motion.span>
                      </h1>
                      <p className="text-gray-600 text-sm">
                        Create personalized content with advanced AI
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      className="flex flex-wrap gap-2 items-start"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Tooltip content="Personalization tokens">
                        <motion.button 
                          className="btn btn-sm bg-primary-50 text-primary-600 hover:bg-primary-100 flex items-center"
                          onClick={() => setShowTokensPanel(!showTokensPanel)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Layers className="w-4 h-4 mr-1.5" />
                          <span>Tokens</span>
                        </motion.button>
                      </Tooltip>
                      
                      <Tooltip content="Toggle Enhanced AI">
                        <motion.button 
                          className={`btn btn-sm flex items-center ${
                            enhancedAiEnabled 
                              ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => setEnhancedAiEnabled(!enhancedAiEnabled)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Brain className="w-4 h-4 mr-1.5" />
                          <span>Advanced AI</span>
                        </motion.button>
                      </Tooltip>
                      
                      <Tooltip content="Get help with this feature">
                        <motion.button 
                          className="p-2 text-gray-600 hover:text-primary-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                          onClick={() => showAssistant()}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <HelpCircle className="w-4 h-4" />
                        </motion.button>
                      </Tooltip>
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Demo User Data Form */}
                <motion.div 
                  className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-primary-500" />
                    <h3 className="text-sm font-medium text-gray-700">Personalization Settings</h3>
                    <Tooltip content="Enter test data to preview personalization. These values will be replaced with real user data in your campaigns.">
                      <button className="p-1 text-gray-400 hover:text-primary-600 transition-colors">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        placeholder="Your First Name"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:ring-opacity-50 focus:border-primary-400"
                        value={userData['FIRSTNAME']}
                        onChange={(e) => updateUserData('FIRSTNAME', e.target.value)}
                        required
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Your Last Name"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:ring-opacity-50 focus:border-primary-400"
                        value={userData['LASTNAME']}
                        onChange={(e) => updateUserData('LASTNAME', e.target.value)}
                        required
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        placeholder="Your Company"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:ring-opacity-50 focus:border-primary-400"
                        value={userData['COMPANY']}
                        onChange={(e) => updateUserData('COMPANY', e.target.value)}
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="Your Email"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:ring-opacity-50 focus:border-primary-400"
                        value={userData['EMAIL']}
                        onChange={(e) => updateUserData('EMAIL', e.target.value)}
                      />
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Enhanced AI Banner */}
                {enhancedAiEnabled && (
                  <motion.div 
                    className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 p-4 border-b border-indigo-100 relative overflow-hidden"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div 
                      className="absolute inset-0 opacity-10"
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                      }}
                      transition={{ 
                        duration: 10, 
                        repeat: Infinity, 
                        repeatType: "reverse" 
                      }}
                      style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%234f46e5\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                      }}
                    />
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="flex-shrink-0"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Brain className="w-6 h-6 text-indigo-600" />
                        </div>
                      </motion.div>
                      <div className="flex-grow">
                        <h2 className="text-lg font-bold text-indigo-800">Advanced AI Enabled</h2>
                        <p className="text-indigo-600 text-sm">Experience ultra-fast image generation and advanced AI capabilities for your creative projects</p>
                      </div>
                      <div className="flex-shrink-0 flex gap-2">
                        {quickActions.map((action, idx) => (
                          <motion.button
                            key={idx}
                            className="text-xs py-1.5 px-2.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 flex items-center hover:bg-indigo-100"
                            whileHover={{ y: -2 }}
                            onClick={() => {
                              setActiveFeature(action.feature);
                              // Update recently used
                              setRecentlyUsed(prev => {
                                const newRecent = [action.feature, ...prev.filter(f => f !== action.feature)].slice(0, 5);
                                return newRecent;
                              });
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + (idx * 0.1) }}
                          >
                            <span className="mr-1.5">{action.icon}</span>
                            {action.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    {/* AI Suggestion */}
                    <AnimatePresence>
                      {aiSuggestion && (
                        <motion.div 
                          className="mt-3 p-2 bg-indigo-50 rounded-lg text-xs text-indigo-700 flex items-start"
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Lightbulb className="w-4 h-4 mr-2 flex-shrink-0 mt-px" />
                          <p>{aiSuggestion}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
                
                {/* Video Banner */}
                {showVideoBanner && (
                  <div className="p-4 border-b border-gray-200">
                    <VideoIntegrationBanner onTryNow={handleTryVideoFeature} />
                  </div>
                )}
                
                {/* Recently Used Features */}
                {recentlyUsed.length > 0 && (
                  <motion.div 
                    className="p-4 border-b border-gray-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-700 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        Recently Used
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentlyUsed.map((featureId) => {
                        const feature = FEATURES[featureId];
                        if (!feature) return null;
                        
                        return (
                          <motion.button
                            key={featureId}
                            className="flex items-center gap-2 py-1.5 px-3 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
                            onClick={() => setActiveFeature(featureId)}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <span className="text-primary-600">{feature.icon}</span>
                            <span>{feature.title}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
                
                {/* Feature Categories Filter */}
                <motion.div 
                  className="p-4 border-b border-gray-200 bg-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category, index) => (
                        <motion.button
                          key={category.id || 'all'}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                            filterCategory === category.id
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          onClick={() => setFilterCategory(category.id)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + (index * 0.1) }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {category.icon}
                          {category.label}
                        </motion.button>
                      ))}
                    </div>
                    
                    {/* View mode toggle */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-md">
                      <button
                        className={`p-1.5 rounded ${uiMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                        onClick={() => setUiMode('grid')}
                       >
                        <Grid className="w-4 h-4" stroke={uiMode === 'grid' ? '#6d28d9' : '#666666'} />
                      </button>
                      <button
                        className={`p-1.5 rounded ${uiMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                        onClick={() => setUiMode('list')}
                       >
                        <List className="w-4 h-4" stroke={uiMode === 'list' ? '#6d28d9' : '#666666'} />
                      </button>
                    </div>
                  </div>
                  
                  {/* AI Accelerated Features */}
                  {enhancedAiEnabled && (
                    <motion.div 
                      className="mb-4 overflow-hidden"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 bg-indigo-100 rounded">
                          <Cpu className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h3 className="text-sm font-medium text-indigo-700">AI Accelerated Features</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['image', 'action-figure', 'ghibli', 'cartoon', 'video'].map((featureId, idx) => {
                          const feature = FEATURES[featureId];
                          if (!feature) return null;
                          
                          return (
                            <motion.button
                              key={featureId}
                              className="p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100 transition-all flex items-center gap-2 text-sm text-indigo-700"
                              onClick={() => {
                                setActiveFeature(featureId);
                                // Update recently used
                                setRecentlyUsed(prev => {
                                  const newRecent = [featureId, ...prev.filter(f => f !== featureId)].slice(0, 5);
                                  return newRecent;
                                });
                              }}
                              whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 + (idx * 0.05) }}
                            >
                              <Zap className="w-4 h-4 text-indigo-500" />
                              <span className="font-medium">
                                {feature.title}
                              </span>
                              <span className="ml-auto text-xs bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-800">Fast</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Feature Tiles */}
                <motion.div 
                  className="p-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Suspense fallback={<LoadingComponent />}>
                    <FeatureTileGrid
                      categoryFilter={filterCategory}
                      searchTerm={searchQuery}
                    />
                  </Suspense>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Floating Tokens Panel */}
        {showTokensPanel && (
          <>
            <DraggableContentPanel
              tokens={userData}
              onClose={() => setShowTokensPanel(false)}
            />
            
            {/* Drag hint animation */}
            <AnimatePresence>
              {showDragHint && (
                <motion.div 
                  className="fixed right-24 top-64 z-40 w-32"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="bg-primary-50 p-2 rounded-lg border border-primary-100 text-primary-600 text-xs font-medium shadow-lg"
                    animate={{ 
                      x: [0, -10, 0],
                      boxShadow: [
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)", 
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                      ]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <div className="flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      <span>Drag tokens here!</span>
                    </div>
                    <motion.div
                      className="w-6 h-6 mt-1 ml-10"
                      animate={{
                        x: [-10, 10, -10],
                        rotate: [0, 5, 0, -5, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19L12 5" />
                        <path d="M5 12L12 5L19 12" />
                      </svg>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        
        {/* Floating Action Button for Mobile */}
        <motion.div
          className="fixed bottom-6 right-6 md:hidden z-40"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
        >
          <motion.button
            className="w-14 h-14 rounded-full bg-primary-600 shadow-lg flex items-center justify-center"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Show a menu of quick actions
              const randomFeature = Object.keys(FEATURES)[Math.floor(Math.random() * Object.keys(FEATURES).length)];
              setActiveFeature(randomFeature);
              
              // Update recently used
              setRecentlyUsed(prev => {
                const newRecent = [randomFeature, ...prev.filter(f => f !== randomFeature)].slice(0, 5);
                return newRecent;
              });
            }}
          >
            <Plus className="w-7 h-7 text-white" />
          </motion.button>
        </motion.div>
      </section>
    </FeatureDialogProvider>
  );
};

export default EditorPage;