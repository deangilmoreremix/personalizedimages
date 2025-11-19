import React, { useState, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { LazyImage } from './LazyImage';
import { TokenData } from './DraggableToken';
import {
  Download,
  Share2,
  Edit3,
  Eye,
  X,
  Check,
  Loader2,
  Type,
  Palette,
  Filter,
  Sparkles
} from 'lucide-react';

interface DroppableImageProps {
  image: {
    id: string;
    url: string;
    prompt: string;
    mode: string;
    timestamp: Date;
    metadata: {
      provider: string;
      generationTime: number;
      cost?: number;
    };
  };
  isSelected: boolean;
  onSelect: (imageId: string) => void;
  onTokenDrop: (imageId: string, token: TokenData, dropPosition?: { x: number; y: number }) => void;
  appliedTokens?: TokenData[];
  onRemoveToken?: (imageId: string, tokenId: string) => void;
  onDownload?: (image: any) => void;
  onShare?: (image: any) => void;
  onEdit?: (image: any) => void;
  onView?: (image: any) => void;
}

export const DroppableImage: React.FC<DroppableImageProps> = ({
  image,
  isSelected,
  onSelect,
  onTokenDrop,
  appliedTokens = [],
  onRemoveToken,
  onDownload,
  onShare,
  onEdit,
  onView
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'token',
    drop: (item: { token: TokenData }, monitor) => {
      const dropPosition = monitor.getClientOffset();
      const imageRect = imageRef.current?.getBoundingClientRect();

      if (dropPosition && imageRect) {
        const relativeX = ((dropPosition.x - imageRect.left) / imageRect.width) * 100;
        const relativeY = ((dropPosition.y - imageRect.top) / imageRect.height) * 100;

        onTokenDrop(image.id, item.token, { x: relativeX, y: relativeY });
        setIsProcessing(true);

        // Simulate processing delay
        setTimeout(() => setIsProcessing(false), 2000);
      } else {
        onTokenDrop(image.id, item.token);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const getTokenIcon = (token: TokenData) => {
    switch (token.type) {
      case 'text': return Type;
      case 'color': return Palette;
      case 'filter': return Filter;
      case 'style': return Sparkles;
      default: return token.icon;
    }
  };

  const getTokenColor = (token: TokenData) => {
    switch (token.category) {
      case 'user': return 'bg-blue-500';
      case 'brand': return 'bg-purple-500';
      case 'dynamic': return 'bg-orange-500';
      case 'style': return 'bg-pink-500';
      case 'filter': return 'bg-red-500';
      case 'text': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      ref={(node) => {
        drop(node);
        (imageRef as any).current = node;
      }}
      className={`relative group border-2 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-indigo-500 shadow-lg scale-105'
          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
      } ${
        isOver && canDrop
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
          : ''
      } ${
        isProcessing ? 'opacity-75' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(image.id)}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2 z-20">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(image.id)}
          className="w-4 h-4 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="absolute inset-0 z-30 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            <span className="text-sm font-medium">Applying token...</span>
          </div>
        </div>
      )}

      {/* Drop Zone Indicator */}
      {isOver && canDrop && !isProcessing && (
        <div className="absolute inset-0 z-20 bg-green-500 bg-opacity-20 flex items-center justify-center">
          <div className="bg-green-600 text-white rounded-full p-3">
            <Check className="w-6 h-6" />
          </div>
        </div>
      )}

      {/* Image */}
      <div className="aspect-square">
        <LazyImage
          src={image.url}
          alt={image.prompt}
          className="w-full h-full"
        />
      </div>

      {/* Applied Tokens Overlay */}
      {appliedTokens.length > 0 && (
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <div className="flex flex-wrap gap-1">
            {appliedTokens.slice(0, 3).map((token) => {
              const Icon = getTokenIcon(token);
              return (
                <div
                  key={token.id}
                  className={`relative w-6 h-6 rounded-full ${getTokenColor(token)} flex items-center justify-center text-white text-xs shadow-lg`}
                  title={`${token.displayName}: ${token.value}`}
                >
                  <Icon className="w-3 h-3" />
                  {onRemoveToken && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveToken(image.id, token.id);
                      }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2 h-2 text-white" />
                    </button>
                  )}
                </div>
              );
            })}
            {appliedTokens.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs shadow-lg">
                +{appliedTokens.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hover Actions */}
      <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center space-x-2">
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(image);
              }}
              className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-lg"
              title="View full size"
            >
              <Eye className="w-4 h-4 text-gray-900" />
            </button>
          )}
          {onDownload && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(image);
              }}
              className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-lg"
              title="Download"
            >
              <Download className="w-4 h-4 text-gray-900" />
            </button>
          )}
          {onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(image);
              }}
              className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-lg"
              title="Share"
            >
              <Share2 className="w-4 h-4 text-gray-900" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(image);
              }}
              className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-lg"
              title="Edit"
            >
              <Edit3 className="w-4 h-4 text-gray-900" />
            </button>
          )}
        </div>
      </div>

      {/* Image Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="text-white">
          <p className="text-sm font-medium truncate mb-1">{image.prompt}</p>
          <div className="flex items-center justify-between text-xs opacity-75">
            <span>{image.mode}</span>
            <span>{image.metadata.provider}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroppableImage;