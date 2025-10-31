import React from 'react';
import { Trash } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

interface TokenManagerProps {
  activeToken: PersonalizationToken | null;
  showColorPicker: string | false;
  onRemoveToken: (tokenId: string) => void;
  onUpdateToken: (tokenId: string, property: string, value: any) => void;
  onColorPickerToggle: (picker: string) => void;
  tokens: Record<string, string>;
}

interface PersonalizationToken {
  id: string;
  type: 'text' | 'image';
  value: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  opacity?: number;
  fontFamily?: string;
  placeholder?: string;
}

const TokenManager: React.FC<TokenManagerProps> = ({
  activeToken,
  showColorPicker,
  onRemoveToken,
  onUpdateToken,
  onColorPickerToggle,
  tokens
}) => {
  if (!activeToken) return null;

  return (
    <div className="card bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium">Token Settings</h4>
        <button
          className="p-1 text-red-600 hover:text-red-800 rounded"
          onClick={() => onRemoveToken(activeToken.id)}
          title="Remove token"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Token Text
          </label>
          <input
            type="text"
            value={activeToken.value}
            onChange={(e) => onUpdateToken(activeToken.id, 'value', e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use <span className="font-mono">[FIRSTNAME]</span>, <span className="font-mono">[LASTNAME]</span>, etc.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Font Size
          </label>
          <input
            type="range"
            min="10"
            max="72"
            value={activeToken.fontSize || 24}
            onChange={(e) => onUpdateToken(activeToken.id, 'fontSize', Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-center">{activeToken.fontSize}px</div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Font Family
          </label>
          <select
            value={activeToken.fontFamily || 'Arial'}
            onChange={(e) => onUpdateToken(activeToken.id, 'fontFamily', e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
          >
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Stick to web-safe fonts for email compatibility
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Color
          </label>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border cursor-pointer"
              style={{ backgroundColor: activeToken.color || '#ffffff' }}
              onClick={() => onColorPickerToggle('token')}
            ></div>
            <input
              type="text"
              value={activeToken.color || '#ffffff'}
              onChange={(e) => onUpdateToken(activeToken.id, 'color', e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
          </div>

          {showColorPicker === 'token' && (
            <div className="mt-2 relative">
              <div className="absolute z-10">
                <div
                  className="fixed inset-0"
                  onClick={() => onColorPickerToggle('')}
                ></div>
                <HexColorPicker
                  color={activeToken.color || '#ffffff'}
                  onChange={(color) => onUpdateToken(activeToken.id, 'color', color)}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Opacity
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={activeToken.opacity || 1}
            onChange={(e) => onUpdateToken(activeToken.id, 'opacity', Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-center">{Math.round((activeToken.opacity || 1) * 100)}%</div>
        </div>
      </div>
    </div>
  );
};

export default TokenManager;