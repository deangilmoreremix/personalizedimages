import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Image, Wand2, Upload, Palette, Users, Check, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Step {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  image: string;
  cta: string;
  link?: string;
}

const STEPS: Step[] = [
  {
    title: 'Welcome to VideoRemix',
    description: 'Your all-in-one platform for personalized AI image and video creation. Generate stunning visuals, customize with tokens, and scale your content production.',
    icon: Rocket,
    color: 'from-blue-500 to-cyan-500',
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    cta: 'Get Started',
  },
  {
    title: 'AI Image Generation',
    description: 'Create professional images using AI models like DALL-E 3, Gemini, and Imagen. Simply describe what you want and watch it come to life in seconds.',
    icon: Image,
    color: 'from-emerald-500 to-teal-500',
    image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
    cta: 'Try AI Images',
    link: '/features/modern-ai-image',
  },
  {
    title: 'Personalization Tokens',
    description: 'Make every image unique with dynamic tokens like [FIRSTNAME], [COMPANY], and [TITLE]. Perfect for personalized marketing campaigns at scale.',
    icon: Users,
    color: 'from-amber-500 to-orange-500',
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
    cta: 'Explore Tokens',
    link: '/tokens',
  },
  {
    title: 'Creative Styles',
    description: 'Transform images into Ghibli art, cartoon styles, action figures, memes, and more. Choose from dozens of creative presets or define your own.',
    icon: Palette,
    color: 'from-rose-500 to-pink-500',
    image: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=800',
    cta: 'See Styles',
    link: '/features/ghibli-style',
  },
  {
    title: 'AI Enhancement Tools',
    description: 'Upscale, remove backgrounds, relight scenes, and transfer styles with our AI-powered tools. Bring professional post-processing to every image.',
    icon: Wand2,
    color: 'from-blue-600 to-blue-400',
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
    cta: 'Open AI Tools',
    link: '/ai-tools',
  },
  {
    title: 'Batch Generation',
    description: 'Upload a CSV with hundreds of records and generate personalized images for each one. Perfect for email campaigns, events, and outreach at scale.',
    icon: Upload,
    color: 'from-teal-500 to-cyan-500',
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
    cta: 'Try Batch Mode',
    link: '/features/modern-batch-generation',
  },
  {
    title: 'You are All Set!',
    description: 'Start creating personalized AI content today. Visit the Editor to begin, browse the Marketplace for templates, or jump straight into any feature.',
    icon: Sparkles,
    color: 'from-emerald-500 to-green-500',
    image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800',
    cta: 'Go to Editor',
    link: '/editor',
  },
];

interface OnboardingWalkthroughProps {
  onComplete?: () => void;
  isOpen?: boolean;
}

export default function OnboardingWalkthrough({ onComplete, isOpen = true }: OnboardingWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(isOpen);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem('onboarding_complete', 'true');
    onComplete?.();
  };

  const handleCTA = () => {
    const step = STEPS[currentStep];
    if (step.link) {
      handleClose();
      navigate(step.link);
    } else if (currentStep < STEPS.length - 1) {
      handleNext();
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!visible) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 40 }}
            className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden"
          >
            <div className="h-1.5 bg-gray-100">
              <motion.div
                className={`h-full bg-gradient-to-r ${step.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -60 }}
                  transition={{ duration: 0.3 }}
                  className="grid md:grid-cols-2"
                >
                  <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-20`} />
                  </div>

                  <div className="p-8 flex flex-col justify-center">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} text-white mb-5 shadow-lg`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Step {currentStep + 1} of {STEPS.length}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h2>
                    <p className="text-gray-500 leading-relaxed mb-8">{step.description}</p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCTA}
                        className={`px-6 py-3 bg-gradient-to-r ${step.color} text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2`}
                      >
                        {isLast && <Check className="w-4 h-4" />}
                        {step.cta}
                        {!isLast && <ChevronRight className="w-4 h-4" />}
                      </button>
                      {!isLast && (
                        <button
                          onClick={handleSkip}
                          className="px-4 py-3 text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
                        >
                          Skip Tour
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="px-8 py-4 bg-gray-50 flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={isFirst}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex gap-2">
                {STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setDirection(idx > currentStep ? 1 : -1); setCurrentStep(idx); }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentStep ? 'bg-gray-800 w-6' : idx < currentStep ? 'bg-gray-400' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={isLast}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
