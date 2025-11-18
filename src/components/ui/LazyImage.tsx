import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, AlertCircle } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
  rootMargin?: string;
  threshold?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  onLoad,
  onError,
  rootMargin = '50px',
  threshold = 0.1
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${placeholderClassName}`}>
          {isInView ? (
            <div className="animate-pulse">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-300" />
          )}
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 ${placeholderClassName}`}>
          <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
          <span className="text-xs text-gray-500">Failed to load</span>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;