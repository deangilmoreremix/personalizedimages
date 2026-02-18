import React, { useState } from 'react';
import {
  Scissors,
  Maximize2,
  Wand2,
  Sparkles,
  Sun,
  Palette,
  ArrowLeft,
  Zap,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackgroundRemover from '../components/ai-tools/BackgroundRemover';
import ImageUpscaler from '../components/ai-tools/ImageUpscaler';
import MysticGenerator from '../components/ai-tools/MysticGenerator';
import PromptImprover from '../components/ai-tools/PromptImprover';
import ImageRelighter from '../components/ai-tools/ImageRelighter';
import StyleTransfer from '../components/ai-tools/StyleTransfer';

interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  tag?: string;
  component: React.ComponentType;
}

const TOOLS: ToolConfig[] = [
  {
    id: 'mystic',
    name: 'Mystic AI Generator',
    description: 'Create ultra-realistic images with Freepik\'s flagship AI model',
    icon: Wand2,
    gradient: 'from-amber-500 to-orange-600',
    tag: 'Popular',
    component: MysticGenerator,
  },
  {
    id: 'remove-bg',
    name: 'Background Remover',
    description: 'Remove image backgrounds with one click',
    icon: Scissors,
    gradient: 'from-teal-500 to-emerald-600',
    component: BackgroundRemover,
  },
  {
    id: 'upscale',
    name: 'Image Upscaler',
    description: 'Enhance resolution up to 4x with Magnific AI',
    icon: Maximize2,
    gradient: 'from-blue-500 to-cyan-600',
    tag: 'New',
    component: ImageUpscaler,
  },
  {
    id: 'relight',
    name: 'Image Relighter',
    description: 'Change lighting direction and mood of any photo',
    icon: Sun,
    gradient: 'from-yellow-500 to-amber-600',
    component: ImageRelighter,
  },
  {
    id: 'style-transfer',
    name: 'Style Transfer',
    description: 'Apply artistic styles like watercolor, anime, and more',
    icon: Palette,
    gradient: 'from-green-500 to-emerald-600',
    component: StyleTransfer,
  },
  {
    id: 'prompt-improver',
    name: 'Prompt Improver',
    description: 'AI-enhanced prompts for better generation results',
    icon: Sparkles,
    gradient: 'from-rose-500 to-pink-600',
    component: PromptImprover,
  },
];

export default function AIToolsHub() {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const activeConfig = TOOLS.find((t) => t.id === activeTool);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => (activeTool ? setActiveTool(null) : navigate('/'))}
            className="p-2 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTool ? activeConfig?.name : 'AI Tools Hub'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeTool
                ? activeConfig?.description
                : 'Powered by Freepik API -- professional AI tools at your fingertips'}
            </p>
          </div>
        </div>

        {!activeTool ? (
          <>
            <div className="mb-8 p-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                    Freepik AI Suite
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-2">
                  6 Professional AI Tools in One Place
                </h2>
                <p className="text-gray-400 text-sm max-w-lg">
                  Generate images with Mystic AI, remove backgrounds, upscale resolution,
                  change lighting, transfer artistic styles, and improve your prompts --
                  all powered by Freepik's enterprise-grade API.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className="group text-left bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {tool.tag && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                          <Star className="w-3 h-3" />
                          {tool.tag}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-800">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {tool.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                      Open Tool
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            {activeConfig && <activeConfig.component />}
          </div>
        )}
      </div>
    </div>
  );
}
