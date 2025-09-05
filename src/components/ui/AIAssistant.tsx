import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Brain, RefreshCw, Image as ImageIcon, Scan, Clipboard, Bot, Rocket, Sparkles, Info, Check, ArrowRight, MessageSquare, Zap, Mic, VolumeX, Volume2 } from 'lucide-react';
import { streamAIResponse } from '../../utils/streamingApi';
import { FEATURES } from '../ui/FeatureDialogProvider';
import { useFeatureDialog } from '../ui/FeatureDialogProvider';
import { Location, NavigateFunction, useLocation, useNavigate } from 'react-router-dom';
import { createOpenAIAssistant } from '../../utils/openaiAssistant';
import { SpeechRecognitionService, SpeechSynthesisService, prepareSpokenResponse } from '../../utils/speechUtils';

interface AiAssistantProps {
  onClose: () => void;
  userData: Record<string, string>;
  onFeatureSelect?: (featureId: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isPending?: boolean;
  suggestedFeatures?: string[];
}

const AIAssistant: React.FC<AiAssistantProps> = ({
  onClose,
  userData,
  onFeatureSelect,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openFeature } = useFeatureDialog();
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
  
  // Voice interaction states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcription, setTranscription] = useState('');
  const speechRecognitionRef = useRef<SpeechRecognitionService | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisService | null>(null);
  const [useEnhancedAI, setUseEnhancedAI] = useState(false);

  // Initial greeting on mount
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${userData['FIRSTNAME'] || 'there'}! I'm your AI creative assistant, powered by advanced AI models. I can help you with:
        
• Creating personalized images and action figures
• Generating Studio Ghibli and cartoon styles
• Making personalized memes
• Answering questions about any feature

What would you like to work on today?`,
        timestamp: Date.now(),
        suggestedFeatures: ['image', 'action-figure', 'ghibli', 'meme']
      }
    ];
    
    setMessages(initialMessages);
    
    // Initialize speech services
    initSpeechServices();
    
    // Speak the welcome message if voice is enabled
    if (voiceEnabled) {
      setTimeout(() => {
        speakText(prepareSpokenResponse(initialMessages[0].content));
      }, 1000);
    }
  }, [userData]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedText]);

  // Focus input when component mounts
  useEffect(() => {
    if (!isMinimized) {
      inputRef.current?.focus();
    }
  }, [isMinimized]);

  // Check if OpenAI API key is available and toggle enhanced AI option
  useEffect(() => {
    const checkOpenAIKey = async () => {
      const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
      setUseEnhancedAI(!!openAIKey);
    };
    
    checkOpenAIKey();
  }, []);
  
  // Initialize speech recognition and synthesis
  const initSpeechServices = () => {
    // Initialize speech recognition
    speechRecognitionRef.current = new SpeechRecognitionService(
      // On result callback
      (text) => {
        setTranscription(text);
        setInputValue(text);
      },
      // On end callback
      () => {
        setIsListening(false);
        
        // If we have a transcription, automatically send the message
        if (transcription.trim()) {
          setTimeout(() => {
            handleSendMessage();
            setTranscription('');
          }, 500);
        }
      }
    );
    
    // Initialize speech synthesis
    speechSynthesisRef.current = new SpeechSynthesisService(
      // On start callback
      () => {
        setIsSpeaking(true);
      },
      // On end callback
      () => {
        setIsSpeaking(false);
      }
    );
  };
  
  // Start listening for speech
  const startListening = () => {
    if (speechRecognitionRef.current) {
      const started = speechRecognitionRef.current.start();
      if (started) {
        setIsListening(true);
        setTranscription('');
      }
    }
  };
  
  // Stop listening for speech
  const stopListening = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    }
  };
  
  // Speak the given text
  const speakText = (text: string) => {
    if (speechSynthesisRef.current && voiceEnabled) {
      speechSynthesisRef.current.speak(text);
    }
  };
  
  // Toggle voice output
  const toggleVoice = () => {
    // If currently speaking, stop
    if (isSpeaking && speechSynthesisRef.current) {
      speechSynthesisRef.current.stop();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessageId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    // Add placeholder for assistant response
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isPending: true
    };

    setMessages(prevMessages => [...prevMessages, userMessage, assistantMessage]);
    setInputValue('');
    setPendingMessageId(assistantMessageId);
    setIsTyping(true);
    setIsStreaming(true);
    setStreamedText('');

    try {
      if (useEnhancedAI) {
        // Use OpenAI for enhanced AI capabilities
        const openAIAssistant = await createOpenAIAssistant();
        const messagesForAssistant = [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: inputValue }];
        
        // Send the messages to the OpenAI assistant
        const response = await openAIAssistant.process({
          messages: messagesForAssistant,
          userData,
          onUpdate: (text) => {
            setStreamedText(text);
          }
        });
        
        // Update the message with the response
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === assistantMessageId 
              ? { 
                  ...msg, 
                  content: response.content, 
                  isPending: false,
                  suggestedFeatures: response.suggestedFeatures 
                } 
              : msg
          )
        );
        
        // Speak the response if voice is enabled
        if (voiceEnabled) {
          speakText(prepareSpokenResponse(response.content));
        }
      } else {
        // Use default streaming functionality
        await streamAIResponse({
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: inputValue }],
          userContext: userData,
          onTokenReceived: (token) => {
            setStreamedText(prev => prev + token);
          },
          onComplete: (fullResponse, suggestedFeatures) => {
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === assistantMessageId 
                  ? { 
                      ...msg, 
                      content: fullResponse, 
                      isPending: false,
                      suggestedFeatures
                    } 
                  : msg
              )
            );
            setIsStreaming(false);
            setPendingMessageId(null);
            
            // Speak the response if voice is enabled
            if (voiceEnabled) {
              speakText(prepareSpokenResponse(fullResponse));
            }
          }
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: "I'm sorry, I encountered an error while processing your request. Please try again later.", 
                isPending: false 
              } 
            : msg
        )
      );
      setIsStreaming(false);
      setPendingMessageId(null);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeatureClick = (featureId: string) => {
    // Close the assistant
    onClose();
    
    // Check the current location
    if (location.pathname !== '/editor') {
      // Navigate to editor if not already there, with state to open the feature after navigation
      navigate('/editor', { state: { selectedFeature: featureId } });
      
      // onFeatureSelect will be called by the EditorPage component after navigation
    } else {
      // Already on editor page, just open the feature
      if (onFeatureSelect) {
        onFeatureSelect(featureId);
      } else {
        // If onFeatureSelect not provided, use openFeature from context
        openFeature(featureId);
      }
    }
  };

  // Animation variants
  const dialogVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      } 
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95, 
      transition: { 
        duration: 0.2 
      }
    }
  };

  // Minimized state
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 py-2 px-4 bg-indigo-600 text-white rounded-full shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bot className="w-5 h-5" />
          <span className="font-medium">AI Assistant</span>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 w-96 max-w-[90vw] h-[500px] max-h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 z-50 flex flex-col"
      variants={dialogVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header */}
      <div 
        className="p-3 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center"
      >
        <div className="flex items-center gap-2 text-white">
          <Bot className="w-5 h-5" />
          <h3 className="font-medium">AI Creative Assistant</h3>
          <span className="ml-2 text-xs bg-white/30 text-white px-2 py-0.5 rounded-full">
            {useEnhancedAI ? "GPT-4o" : "Gemini"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-white/20 rounded-full text-white/90 hover:text-white transition-colors"
            title="Minimize"
          >
            <MinusCustomIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full text-white/90 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-indigo-50/50 to-white">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`rounded-lg p-3 max-w-[85%] ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white ml-auto'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                {/* Message content */}
                <div className="whitespace-pre-wrap text-sm">
                  {message.role === 'assistant' && message.isPending && pendingMessageId === message.id ? (
                    <div>
                      <div className="text-gray-700">{streamedText || '...'}</div>
                      {isStreaming && (
                        <div className="mt-1 flex">
                          <div className="typing-animation">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={message.role === 'user' ? 'text-white' : 'text-gray-700'}>{message.content}</div>
                  )}
                </div>

                {/* Feature suggestions */}
                {message.role === 'assistant' && message.suggestedFeatures && message.suggestedFeatures.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                    {message.suggestedFeatures.map(featureId => {
                      const feature = FEATURES[featureId];
                      if (!feature) return null;

                      return (
                        <motion.button
                          key={featureId}
                          className="flex items-center gap-2 py-1.5 px-3 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200 text-sm hover:bg-indigo-100 transition-colors"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleFeatureClick(featureId)}
                        >
                          <div className="text-indigo-600">
                            {feature.icon}
                          </div>
                          <span className="font-medium">{feature.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Display currently streaming text if applicable */}
        {isStreaming && pendingMessageId && (
          <div className="animate-pulse" ref={messagesEndRef}></div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Ask me anything..."}
              className="w-full p-3 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={1}
              disabled={isTyping || isListening}
              style={{ height: 'auto', maxHeight: '120px', minHeight: '40px' }}
            />
            {/* Voice control button */}
            <button
              className={`absolute right-3 bottom-3 p-1 ${
                isListening 
                  ? 'text-red-500 animate-pulse' 
                  : 'text-gray-400 hover:text-indigo-600'
              }`}
              onClick={isListening ? stopListening : startListening}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
          
          {/* Voice output toggle button */}
          <button
            className={`p-3 rounded-lg ${
              voiceEnabled 
                ? 'text-indigo-600 hover:text-indigo-800 bg-indigo-100' 
                : 'text-gray-500 hover:text-gray-700 bg-gray-100'
            }`}
            onClick={toggleVoice}
            title={voiceEnabled ? "Disable voice" : "Enable voice"}
          >
            {voiceEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-lg ${
              inputValue.trim() ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
          >
            {isTyping ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Quick actions */}
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <button 
            className="hover:text-indigo-600 transition-colors flex items-center"
            onClick={() => setInputValue("How do I create a personalized image?")}
          >
            <ImageIcon className="w-3.5 h-3.5 mr-1" />
            Image help
          </button>
          <button 
            className="hover:text-indigo-600 transition-colors flex items-center"
            onClick={() => setInputValue("What are personalization tokens and how do I use them?")}
          >
            <Zap className="w-3.5 h-3.5 mr-1" />
            Tokens help
          </button>
          <button 
            className="hover:text-indigo-600 transition-colors flex items-center"
            onClick={() => setInputValue("What's new in the latest update?")}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            What's new
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Custom MinusIcon component to avoid duplicate declaration
const MinusCustomIcon = ({ className = '' }) => (
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
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default AIAssistant;