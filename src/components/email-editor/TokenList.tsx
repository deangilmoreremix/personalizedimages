import React from 'react';
import { Sparkles } from 'lucide-react';

interface TokenListProps {
  tokens: Record<string, string>;
}

const TokenList: React.FC<TokenListProps> = ({ tokens }) => {
  return (
    <div className="card bg-gray-50">
      <h4 className="font-medium mb-3">Personalization Tokens</h4>
      <div className="space-y-2">
        <div className="p-2 bg-white rounded border border-gray-200">
          <div className="font-medium">[FIRSTNAME]</div>
          <div className="text-xs text-gray-500">Current value: {tokens['FIRSTNAME'] || 'Not set'}</div>
        </div>
        <div className="p-2 bg-white rounded border border-gray-200">
          <div className="font-medium">[LASTNAME]</div>
          <div className="text-xs text-gray-500">Current value: {tokens['LASTNAME'] || 'Not set'}</div>
        </div>
        <div className="p-2 bg-white rounded border border-gray-200">
          <div className="font-medium">[COMPANY]</div>
          <div className="text-xs text-gray-500">Current value: {tokens['COMPANY'] || 'Not set'}</div>
        </div>
        <div className="p-2 bg-white rounded border border-gray-200">
          <div className="font-medium">[EMAIL]</div>
          <div className="text-xs text-gray-500">Current value: {tokens['EMAIL'] || 'Not set'}</div>
        </div>
      </div>
    </div>
  );
};

export default TokenList;