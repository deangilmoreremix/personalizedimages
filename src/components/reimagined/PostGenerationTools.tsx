import React from 'react';
import { motion } from 'framer-motion';
import {
  Download, Share2, Edit3, Wand2, Sparkles, Copy,
  Trash2, Heart, RotateCw, ZoomIn
} from 'lucide-react';

interface PostGenerationToolsProps {
  imageUrl: string;
  prompt: string;
  onImageUpdated: (imageUrl: string) => void;
}

const PostGenerationTools: React.FC<PostGenerationToolsProps> = ({
  imageUrl,
  prompt,
  onImageUpdated
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-image-${Date.now()}.png`;
    link.click();
  };

  const primaryActions = [
    { icon: Download, label: 'Download', color: 'blue', action: handleDownload },
    { icon: Share2, label: 'Share', color: 'green', action: () => {} },
    { icon: Edit3, label: 'Edit', color: 'purple', action: () => {} },
    { icon: Wand2, label: 'Enhance', color: 'pink', action: () => {} }
  ];

  const secondaryActions = [
    { icon: Copy, label: 'Variations', description: 'Create similar versions' },
    { icon: ZoomIn, label: 'Upscale', description: 'Increase resolution' },
    { icon: Sparkles, label: 'AI Edit', description: 'Edit with chat' },
    { icon: RotateCw, label: 'Remix', description: 'New style variation' }
  ];

  const utilityActions = [
    { icon: Heart, label: 'Favorite' },
    { icon: Trash2, label: 'Delete' }
  ];

  return (
    <div className="space-y-4">
      {/* Primary Actions */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {primaryActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={idx}
                onClick={action.action}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl border-2 border-${action.color}-200 bg-${action.color}-50 hover:bg-${action.color}-100 transition-all flex flex-col items-center gap-2`}
              >
                <Icon className={`w-5 h-5 text-${action.color}-600`} />
                <span className={`text-xs font-medium text-${action.color}-700`}>
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Advanced Tools
        </h4>
        <div className="space-y-2">
          {secondaryActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                className="w-full p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-3 text-left"
              >
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon className="w-4 h-4 text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{action.label}</div>
                  <div className="text-xs text-gray-500 truncate">{action.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Utility Actions */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Organize
        </h4>
        <div className="flex gap-2">
          {utilityActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                className="flex-1 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <Icon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Panel */}
      <div className="p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Generation Info</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Prompt length:</span>
            <span className="font-medium text-gray-900">{prompt.length} chars</span>
          </div>
          <div className="flex justify-between">
            <span>Generated:</span>
            <span className="font-medium text-gray-900">Just now</span>
          </div>
          <div className="flex justify-between">
            <span>Format:</span>
            <span className="font-medium text-gray-900">PNG</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostGenerationTools;
