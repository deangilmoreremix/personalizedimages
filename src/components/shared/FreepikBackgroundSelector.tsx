import React from 'react';
import { Search, X } from 'lucide-react';
import { StockImageButton } from './StockImageButton';
import { StockResource } from '../../services/stockImageService';
import { FreepikAttribution } from './FreepikAttribution';

interface FreepikBackgroundSelectorProps {
  selectedBackground: StockResource | null;
  onSelect: (resource: StockResource) => void;
  onClear?: () => void;
  defaultSearchTerm?: string;
  title?: string;
  description?: string;
  showAttribution?: boolean;
  compact?: boolean;
}

export function FreepikBackgroundSelector({
  selectedBackground,
  onSelect,
  onClear,
  defaultSearchTerm = 'professional background',
  title = 'Background Image',
  description = 'Choose a professional background from Freepik',
  showAttribution = true,
  compact = false
}: FreepikBackgroundSelectorProps) {
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <StockImageButton
            onSelect={onSelect}
            buttonText={selectedBackground ? "Change Background" : "Browse Backgrounds"}
            buttonIcon={Search}
            defaultSearchTerm={defaultSearchTerm}
            buttonClassName="flex-1 bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600 transition-colors text-sm"
          />
          {selectedBackground && onClear && (
            <button
              onClick={onClear}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
              title="Clear background"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {selectedBackground && (
          <div className="p-2 border rounded bg-gray-50">
            <div className="flex items-center gap-2">
              <img
                src={selectedBackground.thumbnailUrl || ''}
                alt={selectedBackground.title}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {selectedBackground.title}
                </p>
              </div>
            </div>
            {showAttribution && (
              <div className="mt-2">
                <FreepikAttribution
                  resources={[selectedBackground]}
                  isPremiumUser={false}
                  variant="inline"
                  className="text-xs"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {title}
        </label>
        <p className="text-xs text-gray-500 mb-3">{description}</p>

        <div className="flex gap-2">
          <StockImageButton
            onSelect={onSelect}
            buttonText={selectedBackground ? "Change Background" : "Browse Freepik"}
            buttonIcon={Search}
            defaultSearchTerm={defaultSearchTerm}
            buttonClassName="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2.5 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 font-medium"
          />
          {selectedBackground && onClear && (
            <button
              onClick={onClear}
              className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {selectedBackground && (
        <div className="border rounded-lg bg-white p-3 shadow-sm">
          <div className="flex items-start gap-3">
            <img
              src={selectedBackground.thumbnailUrl || ''}
              alt={selectedBackground.title}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {selectedBackground.title}
              </p>
              <p className="text-xs text-gray-600">
                {selectedBackground.width && selectedBackground.height
                  ? `${selectedBackground.width} × ${selectedBackground.height}`
                  : 'High resolution'}
              </p>
              {selectedBackground.author && (
                <p className="text-xs text-gray-500 mt-1">
                  by {selectedBackground.author}
                </p>
              )}
            </div>
          </div>

          {showAttribution && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <FreepikAttribution
                resources={[selectedBackground]}
                isPremiumUser={false}
                variant="inline"
                showComplianceInfo={true}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FreepikBackgroundSelector;
