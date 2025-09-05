import React, { useState } from 'react';
import { Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Palette, Droplet, Sliders, PenTool, ArrowUp, ArrowDown, CassetteTape as LetterCase, CassetteTape as LetterCaseToggle, Heading1, Heading2, Heading3 } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { FontSelector } from './ui/FontSelector';

interface FontStyleEditorProps {
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  fontStyle: string;
  textDecoration: string;
  color: string;
  textAlign: string;
  lineHeight: number;
  letterSpacing: number;
  textTransform: string;
  strokeWidth?: number;
  strokeColor?: string;
  onChange: (property: string, value: any) => void;
  className?: string;
  showStroke?: boolean;
}

const FontStyleEditor: React.FC<FontStyleEditorProps> = ({
  fontFamily,
  fontSize,
  fontWeight,
  fontStyle,
  textDecoration,
  color,
  textAlign,
  lineHeight,
  letterSpacing,
  textTransform,
  strokeWidth = 0,
  strokeColor = '#000000',
  onChange,
  className = '',
  showStroke = false,
}) => {
  const [activeTab, setActiveTab] = useState<'font' | 'text' | 'styles'>('font');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokeColorPicker, setShowStrokeColorPicker] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  
  // Toggle font weight between normal and bold
  const toggleWeight = () => {
    const newWeight = fontWeight === 'bold' || fontWeight === 700 ? 'normal' : 'bold';
    onChange('fontWeight', newWeight);
  };
  
  // Toggle font style between normal and italic
  const toggleStyle = () => {
    const newStyle = fontStyle === 'italic' ? 'normal' : 'italic';
    onChange('fontStyle', newStyle);
  };
  
  // Toggle text decoration between none and underline
  const toggleDecoration = () => {
    const newDecoration = textDecoration === 'underline' ? 'none' : 'underline';
    onChange('textDecoration', newDecoration);
  };
  
  // Toggle case transformation
  const toggleCase = () => {
    const transformations = ['none', 'uppercase', 'lowercase', 'capitalize'];
    const currentIndex = transformations.indexOf(textTransform);
    const nextIndex = (currentIndex + 1) % transformations.length;
    onChange('textTransform', transformations[nextIndex]);
  };
  
  const getTransformLabel = () => {
    switch(textTransform) {
      case 'uppercase': return 'ABC';
      case 'lowercase': return 'abc';
      case 'capitalize': return 'Abc';
      default: return 'Aa';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Mobile header - only visible on small screens */}
      <div className="md:hidden border-b border-gray-200">
        <button
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="w-full p-3 flex justify-between items-center"
        >
          <span className="flex items-center text-sm font-medium">
            <Type className="w-4 h-4 mr-2" /> 
            Font & Text Styling
          </span>
          {mobileExpanded ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        </button>
      </div>

      <div className={`${mobileExpanded ? 'block' : 'hidden'} md:block`}>
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === 'font' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('font')}
          >
            Font
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === 'text' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('text')}
          >
            Text
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === 'styles' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('styles')}
          >
            Styles
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'font' && (
            <div className="space-y-4">
              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Family
                </label>
                <FontSelector
                  value={fontFamily}
                  onChange={(value) => onChange('fontFamily', value)}
                  className="w-full"
                  size="sm"
                />
              </div>

              {/* Font Size */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Font Size
                  </label>
                  <span className="text-sm text-gray-500">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="120"
                  step="1"
                  value={fontSize}
                  onChange={(e) => onChange('fontSize', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              {/* Font Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Style
                </label>
                <div className="flex space-x-2">
                  <button
                    className={`p-2 rounded ${
                      fontWeight === 'bold' || fontWeight === 700 || fontWeight === 600
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={toggleWeight}
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-2 rounded ${
                      fontStyle === 'italic'
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={toggleStyle}
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-2 rounded ${
                      textDecoration === 'underline'
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={toggleDecoration}
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-2 rounded ${
                      textTransform !== 'none'
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={toggleCase}
                    title="Change Text Case"
                  >
                    <LetterCaseToggle className="w-4 h-4" />
                    <span className="sr-only">{getTransformLabel()}</span>
                  </button>
                </div>
                
                {/* Presets */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50"
                    onClick={() => {
                      onChange('fontSize', 32);
                      onChange('fontWeight', 'bold');
                    }}
                  >
                    <Heading1 className="w-3 h-3 inline mr-1" /> Heading
                  </button>
                  <button
                    className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50"
                    onClick={() => {
                      onChange('fontSize', 24);
                      onChange('fontWeight', 'semibold');
                    }}
                  >
                    <Heading2 className="w-3 h-3 inline mr-1" /> Subheading
                  </button>
                  <button
                    className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50"
                    onClick={() => {
                      onChange('fontSize', 16);
                      onChange('fontWeight', 'normal');
                    }}
                  >
                    <Heading3 className="w-3 h-3 inline mr-1" /> Body
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'text' && (
            <div className="space-y-4">
              {/* Text Alignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Alignment
                </label>
                <div className="flex space-x-2">
                  <button
                    className={`p-2 rounded ${
                      textAlign === 'left'
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => onChange('textAlign', 'left')}
                    title="Left Align"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-2 rounded ${
                      textAlign === 'center'
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => onChange('textAlign', 'center')}
                    title="Center Align"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-2 rounded ${
                      textAlign === 'right'
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => onChange('textAlign', 'right')}
                    title="Right Align"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Line Height */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Line Height
                  </label>
                  <span className="text-sm text-gray-500">{lineHeight.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => onChange('lineHeight', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              {/* Letter Spacing */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Letter Spacing
                  </label>
                  <span className="text-sm text-gray-500">{letterSpacing.toFixed(1)}px</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="10"
                  step="0.5"
                  value={letterSpacing}
                  onChange={(e) => onChange('letterSpacing', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              {/* Text Case */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Case
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    className={`p-2 text-xs rounded ${
                      textTransform === 'none'
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => onChange('textTransform', 'none')}
                  >
                    Normal
                  </button>
                  <button
                    className={`p-2 text-xs rounded ${
                      textTransform === 'uppercase'
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => onChange('textTransform', 'uppercase')}
                  >
                    UPPER
                  </button>
                  <button
                    className={`p-2 text-xs rounded ${
                      textTransform === 'lowercase'
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => onChange('textTransform', 'lowercase')}
                  >
                    lower
                  </button>
                  <button
                    className={`p-2 text-xs rounded ${
                      textTransform === 'capitalize'
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => onChange('textTransform', 'capitalize')}
                  >
                    Capitalize
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'styles' && (
            <div className="space-y-4">
              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <div className="relative">
                  <div className="flex">
                    <div
                      className="w-10 h-10 border border-gray-300 rounded-l cursor-pointer"
                      style={{ backgroundColor: color }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    ></div>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => onChange('color', e.target.value)}
                      className="flex-1 rounded-r border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  {showColorPicker && (
                    <div className="absolute z-10 mt-1">
                      <div className="fixed inset-0" onClick={() => setShowColorPicker(false)}></div>
                      <div className="relative">
                        <HexColorPicker
                          color={color}
                          onChange={(color) => onChange('color', color)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Stroke */}
              {showStroke && (
                <>
                  {/* Stroke Width */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Text Stroke Width
                      </label>
                      <span className="text-sm text-gray-500">{strokeWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={strokeWidth}
                      onChange={(e) => onChange('strokeWidth', Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>

                  {/* Stroke Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stroke Color
                    </label>
                    <div className="relative">
                      <div className="flex">
                        <div
                          className="w-10 h-10 border border-gray-300 rounded-l cursor-pointer"
                          style={{ backgroundColor: strokeColor }}
                          onClick={() => setShowStrokeColorPicker(!showStrokeColorPicker)}
                        ></div>
                        <input
                          type="text"
                          value={strokeColor}
                          onChange={(e) => onChange('strokeColor', e.target.value)}
                          className="flex-1 rounded-r border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      
                      {showStrokeColorPicker && (
                        <div className="absolute z-10 mt-1">
                          <div className="fixed inset-0" onClick={() => setShowStrokeColorPicker(false)}></div>
                          <div className="relative">
                            <HexColorPicker
                              color={strokeColor}
                              onChange={(color) => onChange('strokeColor', color)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Preset Styles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preset Styles
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Meme Style */}
                  <button
                    className="p-2 text-sm border border-gray-300 rounded hover:bg-gray-50 text-left"
                    onClick={() => {
                      onChange('fontFamily', 'Impact');
                      onChange('fontSize', 36);
                      onChange('color', '#FFFFFF');
                      onChange('fontWeight', 'bold');
                      onChange('textTransform', 'uppercase');
                      if (showStroke) {
                        onChange('strokeWidth', 2);
                        onChange('strokeColor', '#000000');
                      }
                      onChange('textAlign', 'center');
                    }}
                  >
                    <span className="font-mono text-xs text-gray-500 block">Meme Style</span>
                    <span style={{ fontFamily: 'Impact', color: 'black' }}>IMPACT BOLD</span>
                  </button>
                  
                  {/* Modern Style */}
                  <button
                    className="p-2 text-sm border border-gray-300 rounded hover:bg-gray-50 text-left"
                    onClick={() => {
                      onChange('fontFamily', 'Poppins');
                      onChange('fontSize', 24);
                      onChange('color', '#4338ca');
                      onChange('fontWeight', 'medium');
                      onChange('textTransform', 'none');
                      if (showStroke) {
                        onChange('strokeWidth', 0);
                      }
                      onChange('textAlign', 'center');
                    }}
                  >
                    <span className="font-mono text-xs text-gray-500 block">Modern</span>
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#4338ca' }}>Poppins Medium</span>
                  </button>
                  
                  {/* Handwritten Style */}
                  <button
                    className="p-2 text-sm border border-gray-300 rounded hover:bg-gray-50 text-left"
                    onClick={() => {
                      onChange('fontFamily', 'Caveat');
                      onChange('fontSize', 30);
                      onChange('color', '#0f766e');
                      onChange('fontWeight', 'normal');
                      onChange('fontStyle', 'normal');
                      onChange('textTransform', 'none');
                      if (showStroke) {
                        onChange('strokeWidth', 0);
                      }
                      onChange('textAlign', 'center');
                    }}
                  >
                    <span className="font-mono text-xs text-gray-500 block">Handwritten</span>
                    <span style={{ fontFamily: 'Caveat, cursive', color: '#0f766e' }}>Handwritten</span>
                  </button>
                  
                  {/* Vintage Style */}
                  <button
                    className="p-2 text-sm border border-gray-300 rounded hover:bg-gray-50 text-left"
                    onClick={() => {
                      onChange('fontFamily', 'Playfair Display');
                      onChange('fontSize', 28);
                      onChange('color', '#78350f');
                      onChange('fontWeight', 'bold');
                      onChange('fontStyle', 'normal');
                      onChange('textTransform', 'none');
                      if (showStroke) {
                        onChange('strokeWidth', 0);
                      }
                      onChange('textAlign', 'center');
                    }}
                  >
                    <span className="font-mono text-xs text-gray-500 block">Classic</span>
                    <span style={{ fontFamily: 'Playfair Display, serif', color: '#78350f' }}>Playfair</span>
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                Font styles are loaded dynamically based on your selection. Some fonts may not display correctly until loaded.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FontStyleEditor;
;