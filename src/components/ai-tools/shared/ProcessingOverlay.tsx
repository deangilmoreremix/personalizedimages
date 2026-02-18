import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingOverlayProps {
  progress: number;
  label?: string;
}

export default function ProcessingOverlay({
  progress,
  label = 'Processing...',
}: ProcessingOverlayProps) {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
      <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
      <p className="text-sm font-medium text-gray-700 mb-3">{label}</p>
      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">{progress}%</p>
    </div>
  );
}
