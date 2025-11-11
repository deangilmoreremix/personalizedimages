import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MessageSquare, Send, RefreshCw, Download, Image as ImageIcon } from 'lucide-react';
import { generateImageWithDalle, generateImageWithGemini } from '../utils/api';
import { AIModelSelector, AIModel } from './shared';

interface ConversationalRefinementPanelProps {
  initialImageUrl: string;
  onImageUpdated: (imageUrl: string) => void;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

export const ConversationalRefinementPanel: React.FC<ConversationalRefinementPanelProps> = ({
  initialImageUrl,
  onImageUpdated,
  onClose
}) => {
  const [currentImageUrl, setCurrentImageUrl] = useState(initialImageUrl);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "I'm here to help refine your image. Tell me what changes you'd like to make, and I'll generate an updated version.",
      imageUrl: initialImageUrl
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('openai');
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);
    setError(null);

    try {
      const refinementPrompt = `Based on the current image, apply this refinement: ${inputMessage}. Maintain the overall style and composition while making the requested changes.`;

      let newImageUrl: string;
      if (selectedModel === 'openai') {
        newImageUrl = await generateImageWithDalle(refinementPrompt, {
          size: '1024x1024',
          quality: 'hd'
        });
      } else {
        newImageUrl = await generateImageWithGemini(refinementPrompt);
      }

      setCurrentImageUrl(newImageUrl);
      onImageUpdated(newImageUrl);

      const assistantMessage: Message = {
        role: 'assistant',
        content: `I've applied your refinement: "${inputMessage}". Here's the updated image. What else would you like to change?`,
        imageUrl: newImageUrl
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Refinement error:', err);
      setError(err instanceof Error ? err.message : 'Failed to refine image');

      const errorMessage: Message = {
        role: 'assistant',
        content: `I encountered an error while refining the image: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again with a different description.`
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImageUrl;
    link.download = 'refined-image.png';
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Conversational Refinement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-3">Current Image</h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={currentImageUrl}
                  alt="Current version"
                  className="w-full h-auto"
                />
              </div>
              <button
                onClick={handleDownload}
                className="w-full mt-3 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download Current
              </button>
            </div>

            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">AI Model</h4>
              <AIModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                size="sm"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.imageUrl && (
                      <div className="mt-3 rounded-lg overflow-hidden border-2 border-white/20">
                        <img
                          src={message.imageUrl}
                          alt="Generated version"
                          className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            setCurrentImageUrl(message.imageUrl!);
                            onImageUpdated(message.imageUrl!);
                          }}
                        />
                        <div className="bg-black/20 px-2 py-1 text-xs text-white">
                          Click to set as current
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm">Generating refined image...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="bg-blue-50 rounded-lg p-3 mb-3 text-xs text-blue-700">
                <p className="font-medium mb-1">💡 Refinement Tips:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Be specific about what to change</li>
                  <li>Use descriptive language</li>
                  <li>Make incremental adjustments</li>
                  <li>Click previous versions to restore them</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe the changes you want to make..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={isProcessing}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isProcessing || !inputMessage.trim()}
                  className="px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConversationalRefinementPanel;
