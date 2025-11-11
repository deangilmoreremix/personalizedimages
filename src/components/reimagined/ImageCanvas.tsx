import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageCanvasProps {
  currentImage: string | null;
  isGenerating: boolean;
  workflowStage: 'prompt' | 'generating' | 'result';
  prompt: string;
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({
  currentImage,
  isGenerating,
  workflowStage,
  prompt
}) => {
  return (
    <div className="h-full rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-100 overflow-hidden shadow-inner relative">
      <AnimatePresence mode="wait">
        {/* Empty State */}
        {!currentImage && !isGenerating && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-white rounded-3xl p-8 shadow-xl">
                <ImageIcon className="w-24 h-24 text-gray-300" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 text-center"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Ready to Create
              </h3>
              <p className="text-gray-600 max-w-md">
                {prompt
                  ? "Your prompt looks great! Click Generate to bring your vision to life."
                  : "Start by writing a prompt or selecting tokens from the left sidebar."}
              </p>
            </motion.div>

            {/* Floating Tips */}
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl">
              {[
                { icon: Sparkles, text: "Use tokens for personalization" },
                { icon: ImageIcon, text: "High-quality AI models" },
                { icon: Loader2, text: "Real-time generation" }
              ].map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm"
                >
                  <tip.icon className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="text-xs text-gray-600">{tip.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Generating State */}
        {isGenerating && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
          >
            {/* Progressive Reveal Effect */}
            <div className="relative w-full max-w-2xl aspect-square">
              <motion.div
                initial={{ filter: 'blur(40px)', opacity: 0 }}
                animate={{
                  filter: ['blur(40px)', 'blur(20px)', 'blur(10px)'],
                  opacity: [0, 0.3, 0.6]
                }}
                transition={{
                  duration: 8,
                  ease: 'linear'
                }}
                className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 rounded-2xl"
              />

              {/* Loading Animation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="relative"
                >
                  <Loader2 className="w-16 h-16 text-blue-600" />
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-blue-400 rounded-full blur-xl"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 text-center"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Creating Your Image
                  </h3>
                  <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-gray-600"
                  >
                    Analyzing prompt and generating...
                  </motion.p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Result State */}
        {currentImage && !isGenerating && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 p-6"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.img
                src={currentImage}
                alt="Generated"
                initial={{ opacity: 0, filter: 'blur(20px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.5 }}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />

              {/* Success Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Generated!</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageCanvas;
