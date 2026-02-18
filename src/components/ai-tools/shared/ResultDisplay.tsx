import React from 'react';
import { Download, RotateCcw, Check } from 'lucide-react';

interface ResultDisplayProps {
  resultUrl: string;
  originalUrl?: string;
  onReset: () => void;
  title?: string;
  showComparison?: boolean;
}

export default function ResultDisplay({
  resultUrl,
  originalUrl,
  onReset,
  title = 'Result',
  showComparison = false,
}: ResultDisplayProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `freepik-${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(resultUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New
          </button>
        </div>
      </div>

      {showComparison && originalUrl ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Original</p>
            <img
              src={originalUrl}
              alt="Original"
              className="w-full max-h-72 object-contain rounded-xl border border-gray-200 bg-gray-50"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Enhanced</p>
            <img
              src={resultUrl}
              alt="Result"
              className="w-full max-h-72 object-contain rounded-xl border border-gray-200"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\'%3E%3Crect width=\'10\' height=\'10\' fill=\'%23f0f0f0\'/%3E%3Crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23f0f0f0\'/%3E%3C/svg%3E")' }}
            />
          </div>
        </div>
      ) : (
        <img
          src={resultUrl}
          alt="Result"
          className="w-full max-h-96 object-contain rounded-xl border border-gray-200"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\'%3E%3Crect width=\'10\' height=\'10\' fill=\'%23f0f0f0\'/%3E%3Crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23f0f0f0\'/%3E%3C/svg%3E")' }}
        />
      )}
    </div>
  );
}
