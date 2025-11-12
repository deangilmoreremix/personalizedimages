import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface TimelineStripProps {
  images: string[];
  onSelectImage: (imageUrl: string) => void;
  currentImage: string | null;
}

const TimelineStrip: React.FC<TimelineStripProps> = ({
  images,
  onSelectImage,
  currentImage
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 bg-white shadow-lg">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Title */}
        <div className="flex items-center gap-2 min-w-fit">
          <ImageIcon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-900">History</span>
          <span className="text-xs text-gray-500">({images.length})</span>
        </div>

        {/* Scroll Left */}
        <button
          onClick={() => scroll('left')}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        {/* Timeline */}
        <div
          ref={scrollRef}
          className="flex-1 flex gap-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((imageUrl, idx) => {
            const isSelected = currentImage === imageUrl;
            const isRecent = idx === 0;

            return (
              <motion.button
                key={idx}
                onClick={() => onSelectImage(imageUrl)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={imageUrl}
                  alt={`Generated ${idx + 1}`}
                  className="w-20 h-20 object-cover"
                />

                {isRecent && (
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                    New
                  </div>
                )}

                {isSelected && (
                  <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Scroll Right */}
        <button
          onClick={() => scroll('right')}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default TimelineStrip;
