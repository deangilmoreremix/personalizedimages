import React from 'react';

interface PageLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

/**
 * PageLoader Component
 * 
 * Displays a loading spinner while lazy-loaded components are being fetched.
 * Used as the Suspense fallback for route-level code splitting.
 */
export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-2',
    lg: 'h-16 w-16 border-4',
  };

  const containerClasses = fullScreen
    ? 'min-h-screen'
    : 'min-h-[200px]';

  return (
    <div
      className={`${containerClasses} flex flex-col items-center justify-center p-4`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`
          ${sizeClasses[size]}
          animate-spin
          rounded-full
          border-b-2
          border-blue-600
          border-t-transparent
        `}
        aria-hidden="true"
      />
      <p className="mt-4 text-gray-600 text-sm font-medium animate-pulse">
        {message}
      </p>
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default PageLoader;
