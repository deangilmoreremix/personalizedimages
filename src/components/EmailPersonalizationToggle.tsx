/**
 * Email Personalization Toggle Component
 * Provides a button to enable/disable email personalization mode
 */

import React from 'react';
import { Mail, Sparkles } from 'lucide-react';

interface EmailPersonalizationToggleProps {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

const EmailPersonalizationToggle: React.FC<EmailPersonalizationToggleProps> = ({
  isActive,
  onToggle,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${isActive
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isActive ? 'Disable email personalization' : 'Make this image email-ready'}
    >
      <Mail className="w-4 h-4" />
      <span>{isActive ? 'Email Mode Active' : 'Make Email Ready'}</span>
      {!isActive && <Sparkles className="w-3 h-3" />}
    </button>
  );
};

export default EmailPersonalizationToggle;