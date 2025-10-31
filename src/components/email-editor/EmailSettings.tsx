import React from 'react';
import { Settings } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

interface EmailSettingsProps {
  emailTemplate: string;
  emailSubject: string;
  linkText: string;
  linkUrl: string;
  emailWidth: number;
  imageHeight: number;
  emailBgColor: string;
  emailTextColor: string;
  emailAccentColor: string;
  showAdvancedOptions: boolean;
  isResponsive: boolean;
  showColorPicker: string | false;
  onTemplateChange: (template: string) => void;
  onSubjectChange: (subject: string) => void;
  onLinkTextChange: (text: string) => void;
  onLinkUrlChange: (url: string) => void;
  onWidthChange: (width: number) => void;
  onImageHeightChange: (height: number) => void;
  onBgColorChange: (color: string) => void;
  onTextColorChange: (color: string) => void;
  onAccentColorChange: (color: string) => void;
  onToggleAdvanced: () => void;
  onColorPickerToggle: (picker: string) => void;
  onResponsiveToggle: (responsive: boolean) => void;
}

const EmailSettings: React.FC<EmailSettingsProps> = ({
  emailTemplate,
  emailSubject,
  linkText,
  linkUrl,
  emailWidth,
  imageHeight,
  emailBgColor,
  emailTextColor,
  emailAccentColor,
  showAdvancedOptions,
  isResponsive,
  showColorPicker,
  onTemplateChange,
  onSubjectChange,
  onLinkTextChange,
  onLinkUrlChange,
  onWidthChange,
  onImageHeightChange,
  onBgColorChange,
  onTextColorChange,
  onAccentColorChange,
  onToggleAdvanced,
  onColorPickerToggle,
  onResponsiveToggle
}) => {
  return (
    <div className="w-full lg:w-80 space-y-4">
      {/* Email Settings */}
      <div className="card bg-gray-50">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Email Settings</h4>
          <button
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
            onClick={onToggleAdvanced}
          >
            <Settings className="w-3 h-3 mr-1" />
            {showAdvancedOptions ? 'Basic' : 'Advanced'}
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Template Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                className={`p-2 border rounded text-center text-xs ${
                  emailTemplate === 'centered' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200'
                }`}
                onClick={() => onTemplateChange('centered')}
              >
                Centered
              </button>
              <button
                className={`p-2 border rounded text-center text-xs ${
                  emailTemplate === 'leftAligned' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200'
                }`}
                onClick={() => onTemplateChange('leftAligned')}
              >
                Left Aligned
              </button>
              <button
                className={`p-2 border rounded text-center text-xs ${
                  emailTemplate === 'announcement' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200'
                }`}
                onClick={() => onTemplateChange('announcement')}
              >
                Announcement
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email Subject
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="Enter email subject line"
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Call to Action
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={linkText}
                onChange={(e) => onLinkTextChange(e.target.value)}
                placeholder="Button text"
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => onLinkUrlChange(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>

          {showAdvancedOptions && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Width (px)
                </label>
                <input
                  type="number"
                  min="300"
                  max="800"
                  step="10"
                  value={emailWidth}
                  onChange={(e) => onWidthChange(Number(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 600px (standard for email)
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Image Height (px)
                </label>
                <input
                  type="number"
                  min="200"
                  max="800"
                  step="10"
                  value={imageHeight}
                  onChange={(e) => onImageHeightChange(Number(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Background
                  </label>
                  <div className="flex">
                    <div
                      className="w-8 h-8 rounded-l border-l border-t border-b border-gray-300 cursor-pointer"
                      style={{ backgroundColor: emailBgColor }}
                      onClick={() => onColorPickerToggle('bg')}
                    ></div>
                    <input
                      type="text"
                      value={emailBgColor}
                      onChange={(e) => onBgColorChange(e.target.value)}
                      className="flex-1 rounded-r border py-1 px-2 text-sm"
                    />
                  </div>
                </div>

                <div className="w-1/2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Text Color
                  </label>
                  <div className="flex">
                    <div
                      className="w-8 h-8 rounded-l border-l border-t border-b border-gray-300 cursor-pointer"
                      style={{ backgroundColor: emailTextColor }}
                      onClick={() => onColorPickerToggle('text')}
                    ></div>
                    <input
                      type="text"
                      value={emailTextColor}
                      onChange={(e) => onTextColorChange(e.target.value)}
                      className="flex-1 rounded-r border py-1 px-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Accent Color
                </label>
                <div className="flex">
                  <div
                    className="w-8 h-8 rounded-l border-l border-t border-b border-gray-300 cursor-pointer"
                    style={{ backgroundColor: emailAccentColor }}
                    onClick={() => onColorPickerToggle('accent')}
                  ></div>
                  <input
                    type="text"
                    value={emailAccentColor}
                    onChange={(e) => onAccentColorChange(e.target.value)}
                    className="flex-1 rounded-r border py-1 px-2 text-sm"
                  />
                </div>
              </div>

              {showColorPicker && (
                <div className="mt-2 relative">
                  <div className="absolute z-10">
                    <div
                      className="fixed inset-0"
                      onClick={() => onColorPickerToggle('')}
                    ></div>
                    {showColorPicker === 'bg' && (
                      <HexColorPicker
                        color={emailBgColor}
                        onChange={onBgColorChange}
                      />
                    )}
                    {showColorPicker === 'text' && (
                      <HexColorPicker
                        color={emailTextColor}
                        onChange={onTextColorChange}
                      />
                    )}
                    {showColorPicker === 'accent' && (
                      <HexColorPicker
                        color={emailAccentColor}
                        onChange={onAccentColorChange}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="responsiveCheck"
                  checked={isResponsive}
                  onChange={(e) => onResponsiveToggle(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="responsiveCheck" className="text-xs text-gray-700">
                  Enable responsive design
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;