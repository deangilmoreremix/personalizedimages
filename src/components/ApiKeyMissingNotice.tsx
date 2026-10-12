import React from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, AlertTriangle } from 'lucide-react';

interface ApiKeyMissingNoticeProps {
  provider?: 'openai' | 'muapi';
  message?: string;
  className?: string;
}

const DEFAULT_MESSAGES: Record<'openai' | 'muapi', string> = {
  openai: 'Your OpenAI API key is not configured yet. Add it to run this feature.',
  muapi: 'Your MuAPI API key is not configured yet. Add it to generate videos.',
};

const ApiKeyMissingNotice: React.FC<ApiKeyMissingNoticeProps> = ({
  provider = 'openai',
  message,
  className = ''
}) => {
  return (
    <div className={`p-4 bg-amber-50 border border-amber-200 rounded-lg ${className}`} role="alert">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900">
            {message || DEFAULT_MESSAGES[provider]}
          </p>
          <p className="text-xs text-amber-700 mt-1">
            PersonalizedImages is bring-your-own-key - generations run on your provider account.
          </p>
          <Link
            to="/settings/api-keys"
            className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Go to API Key Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyMissingNotice;
