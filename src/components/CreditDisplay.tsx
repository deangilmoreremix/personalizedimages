import React from 'react';
import { Coins, AlertTriangle, Loader2 } from 'lucide-react';
import { useCreditTracking } from '../hooks/useCreditTracking';

interface CreditDisplayProps {
  showWarning?: boolean;
  warningThreshold?: number;
  className?: string;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({
  showWarning = true,
  warningThreshold = 10,
  className = ''
}) => {
  const { balance, isLoading } = useCreditTracking();

  const isLow = balance <= warningThreshold;

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
      isLow && showWarning
        ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
        : 'bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
    } ${className}`}>
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isLow && showWarning ? (
        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
      ) : (
        <Coins className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      )}

      <span className="font-medium">
        {isLoading ? '...' : balance.toLocaleString()} credits
      </span>

      {isLow && showWarning && !isLoading && (
        <span className="text-sm text-yellow-700 dark:text-yellow-300">
          Low balance
        </span>
      )}
    </div>
  );
};