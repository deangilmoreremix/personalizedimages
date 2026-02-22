import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Sparkles, Download, RefreshCw, Copy, Check, Shuffle,
  Flame, Star, Wand2, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateImage } from '../../services/imageGenerationService';

const CRAZY_PRESETS = [
  {
    id: 'surreal-mashup',
    label: 'Surreal Mashup',
    icon: Sparkles,
    color: 'from-orange-500 to-red-500',
    prompts: [
      'A skyscraper made entirely of melting clocks, floating over an ocean of liquid gold, with giant butterflies carrying briefcases, photorealistic surrealism',
      'A massive whale swimming through clouds above a neon-lit cyberpunk city, leaving a trail of cherry blossoms, cinematic lighting',
      'An enormous treehouse built inside a crystal geode cave, with bioluminescent mushrooms as streetlights, tiny trains on spiral tracks around the trunk',
    ],
  },
  {
    id: 'impossible-food',
    label: 'Impossible Food',
    icon: Flame,
    color: 'from-amber-500 to-orange-500',
    prompts: [
      'A five-star restaurant dish made entirely of gemstones and precious metals, rubies as tomatoes, gold leaf pasta, diamond ice cubes, food photography style',
      'A towering burger the size of a building with layers of rainbow-colored cheese, miniature people climbing it with ropes, dramatic sunset lighting',
      'An elaborate sushi platter arranged on a miniature Japanese zen garden, each piece glowing with ethereal inner light, macro photography',
    ],
  },
  {
    id: 'retro-future',
    label: 'Retro Future',
    icon: Zap,
    color: 'from-cyan-500 to-blue-500',
    prompts: [
      'A 1950s diner floating in outer space, chrome and neon exterior, Saturn visible through the windows, flying cars in the parking lot, retro sci-fi illustration',
      'Victorian-era robots having afternoon tea in a steampunk greenhouse, brass gears and steam pipes everywhere, warm amber lighting',
      'An art deco spaceship interior with velvet seats and crystal chandeliers, viewing window showing a nebula, 1920s glamour meets Star Trek',
    ],
  },
  {
    id: 'tiny-worlds',
    label: 'Tiny Worlds',
    icon: Star,
    color: 'from-emerald-500 to-teal-500',
    prompts: [
      'A miniature city built inside a glass terrarium, complete with tiny working streetlights and flowing rivers, tilt-shift photography effect',
      'Tiny people having a beach party on a slice of pizza floating in a coffee cup ocean, macro photography, warm lighting',
      'A microscopic civilization living inside a vintage pocket watch, buildings between the gears, tiny bridges over spring mechanisms, golden light',
    ],
  },
  {
    id: 'animal-remix',
    label: 'Animal Remix',
    icon: Shuffle,
    color: 'from-rose-500 to-pink-500',
    prompts: [
      'A majestic owl wearing a tiny top hat and monocle, sitting at a miniature desk writing with a quill pen, Victorian study background, portrait style',
      'A corgi astronaut floating in space with a tiny jetpack, Earth reflected in the helmet visor, surrounded by floating dog treats, digital art',
      'A group of penguins in formal business suits having a boardroom meeting in an igloo office, one presenting charts on an ice whiteboard',
    ],
  },
  {
    id: 'dream-scenes',
    label: 'Dream Scenes',
    icon: Wand2,
    color: 'from-blue-500 to-cyan-400',
    prompts: [
      'An infinite library where books fly like birds between impossible Escher-like staircases, soft golden light streaming through stained glass windows',
      'A person walking on a path made of piano keys over a sea of clouds, musical notes floating upward turning into stars, dreamlike atmosphere',
      'A massive hourglass containing two different seasons - summer beach on top, winter wonderland on bottom, sand made of tiny flowers, magical realism',
    ],
  },
];

export default function CrazyImagePage() {
  const [selectedPreset, setSelectedPreset] = useState(CRAZY_PRESETS[0]);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getRandomPrompt = useCallback(() => {
    const prompts = selectedPreset.prompts;
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(randomPrompt);
  }, [selectedPreset]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateImage(prompt, {
        size: '1024x1024',
        quality: 'hd',
        category: 'crazy-image',
      });
      setGeneratedImage(result.imageUrl);
    } catch (err: any) {
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crazy-image-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(generatedImage, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" /> Crazy Image Generator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Create Wild & Creative Images
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Generate surreal, impossible, and wonderfully weird images with AI. Pick a style, randomize a prompt, or write your own.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,1.2fr] gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Style Presets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CRAZY_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isActive = selectedPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => { setSelectedPreset(preset); }}
                      className={`p-3 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-white shadow-lg border-2 border-orange-300'
                          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${preset.color} text-white mb-2`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-medium text-gray-800">{preset.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Prompt</h3>
                <div className="flex gap-2">
                  <button
                    onClick={getRandomPrompt}
                    className="px-3 py-1.5 text-xs font-medium bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-1"
                  >
                    <Shuffle className="w-3 h-3" /> Random
                  </button>
                  <button
                    onClick={handleCopyPrompt}
                    disabled={!prompt}
                    className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 disabled:opacity-40"
                  >
                    {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe something wild, surreal, or wonderfully impossible..."
                className="w-full h-32 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-lg"
            >
              {isGenerating ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Generate Crazy Image</>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden min-h-[400px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center p-12"
                  >
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-orange-200" />
                      <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-orange-500" />
                    </div>
                    <p className="text-gray-500 text-sm">Creating something wild...</p>
                  </motion.div>
                ) : generatedImage ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    <img
                      src={generatedImage}
                      alt="Generated crazy image"
                      className="w-full h-auto"
                    />
                    <div className="p-4 flex gap-3">
                      <button
                        onClick={handleDownload}
                        className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" /> Regenerate
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center p-12"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 bg-orange-50 rounded-2xl flex items-center justify-center">
                      <Zap className="w-10 h-10 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to Get Crazy</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                      Choose a style preset and click Random for inspiration, or write your own wild prompt
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
