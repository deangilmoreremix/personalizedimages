import React, { useState, useEffect } from 'react';
import { FONTS, getFontDisplayName } from '../types/fonts';
import FontPreviewGrid from '../components/FontPreviewGrid';
import FontStyleEditor from '../components/FontStyleEditor';
import FontManagementPanel from '../components/FontManagementPanel';
import { motion } from 'framer-motion';
import { Type, Info, Settings, Grid, List } from 'lucide-react';
import { loadFont } from '../services/FontService';

const FontsPage: React.FC = () => {
  const [selectedFont, setSelectedFont] = useState<string>('Inter');
  const [textStyles, setTextStyles] = useState({
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 1.5,
    letterSpacing: 0,
    textTransform: 'none',
    strokeWidth: 0,
    strokeColor: '#000000'
  });
  
  const [sampleText, setSampleText] = useState('The quick brown fox jumps over the lazy dog');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'management'>('grid');
  
  // Load the selected font when it changes
  useEffect(() => {
    loadFont(selectedFont);
  }, [selectedFont]);
  
  // Handle text style property change
  const handleStyleChange = (property: string, value: any) => {
    setTextStyles(prev => ({
      ...prev,
      [property]: value
    }));
  };
  
  const handleFontSelection = (fontFamily: string) => {
    setSelectedFont(fontFamily);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-8"
          >
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl font-bold mb-2">Font System</h1>
              <p className="text-gray-600">
                Explore and manage our collection of 50+ professional fonts
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                <button
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-600'}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  className={`p-2 rounded ${viewMode === 'management' ? 'bg-primary-100 text-primary-700' : 'text-gray-600'}`}
                  onClick={() => setViewMode('management')}
                  title="Management View"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              <button
                className="flex items-center px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings className="w-4 h-4 mr-2" />
                {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
              </button>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* Font Preview Panel - 3 columns wide */}
            <div className="md:col-span-3">
              {viewMode === 'grid' ? (
                <FontPreviewGrid 
                  onSelectFont={handleFontSelection} 
                  sampleText={sampleText}
                  className="h-full"
                  preloadFonts={true}
                />
              ) : (
                <FontManagementPanel
                  className="h-full"
                  onFontSelect={handleFontSelection}
                />
              )}
            </div>
            
            {/* Font Style Editor - 2 columns wide */}
            <div className="md:col-span-2 space-y-6">
              {/* Text Preview */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="font-medium text-lg mb-4 flex items-center">
                  <Type className="w-5 h-5 mr-2 text-primary-600" />
                  Font Preview
                </h2>
                
                <input
                  type="text"
                  value={sampleText}
                  onChange={e => setSampleText(e.target.value)}
                  placeholder="Type to preview..."
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
                />
                
                <div
                  className="min-h-[150px] p-6 border border-gray-200 rounded-lg flex items-center justify-center"
                  style={{
                    fontFamily: `"${selectedFont}", sans-serif`,
                    fontSize: `${textStyles.fontSize}px`,
                    fontWeight: textStyles.fontWeight,
                    fontStyle: textStyles.fontStyle,
                    textDecoration: textStyles.textDecoration,
                    color: textStyles.color,
                    textAlign: textStyles.textAlign as any,
                    lineHeight: textStyles.lineHeight,
                    letterSpacing: `${textStyles.letterSpacing}px`,
                    textTransform: textStyles.textTransform as any,
                    textShadow: textStyles.strokeWidth > 0 
                      ? `
                        -${textStyles.strokeWidth}px -${textStyles.strokeWidth}px 0 ${textStyles.strokeColor},  
                        ${textStyles.strokeWidth}px -${textStyles.strokeWidth}px 0 ${textStyles.strokeColor},
                        -${textStyles.strokeWidth}px ${textStyles.strokeWidth}px 0 ${textStyles.strokeColor},
                        ${textStyles.strokeWidth}px ${textStyles.strokeWidth}px 0 ${textStyles.strokeColor}
                      ` 
                      : 'none'
                  }}
                >
                  {sampleText || 'Type something to preview'}
                </div>
              </div>
              
              {/* Font Style Editor */}
              <FontStyleEditor 
                fontFamily={selectedFont}
                fontSize={textStyles.fontSize}
                fontWeight={textStyles.fontWeight}
                fontStyle={textStyles.fontStyle}
                textDecoration={textStyles.textDecoration}
                color={textStyles.color}
                textAlign={textStyles.textAlign}
                lineHeight={textStyles.lineHeight}
                letterSpacing={textStyles.letterSpacing}
                textTransform={textStyles.textTransform}
                strokeWidth={textStyles.strokeWidth}
                strokeColor={textStyles.strokeColor}
                onChange={handleStyleChange}
                showStroke={true}
              />
              
              {/* Font Information */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex">
                  <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800 mb-1">Improved Font Loading</h3>
                    <p className="text-sm text-blue-700">
                      Our new font system now uses the @fontsource packages to load fonts directly from your local project, reducing reliance on external CDNs and improving performance.
                    </p>
                    <p className="text-sm text-blue-700 mt-2">
                      Fonts are loaded on-demand when you select or hover over them, ensuring optimal performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Advanced Font Information Section */}
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-12 overflow-hidden"
            >
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">Advanced Font System Features</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h3 className="font-bold text-lg mb-3">Self-Hosted Fonts</h3>
                    <p className="text-gray-700">
                      Our enhanced system now uses Fontsource packages to host font files directly in the application bundle, eliminating external network requests to Google Fonts.
                    </p>
                    <ul className="list-disc pl-5 mt-3 text-sm text-gray-600">
                      <li>Improved privacy - no third-party requests</li>
                      <li>Better performance and reliability</li>
                      <li>Reduced external dependencies</li>
                      <li>Consistent font appearance</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h3 className="font-bold text-lg mb-3">Variable Font Support</h3>
                    <p className="text-gray-700">
                      Many of our fonts now use variable font technology, giving you access to a complete range of weights and styles in a single font file.
                    </p>
                    <ul className="list-disc pl-5 mt-3 text-sm text-gray-600">
                      <li>Smaller file sizes despite more options</li>
                      <li>Smooth transitions between weights</li>
                      <li>More design flexibility</li>
                      <li>Better typography control</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h3 className="font-bold text-lg mb-3">Dynamic Font Loading</h3>
                    <p className="text-gray-700">
                      Fonts are loaded on-demand as you use them, with intelligent preloading for commonly used fonts.
                    </p>
                    <ul className="list-disc pl-5 mt-3 text-sm text-gray-600">
                      <li>Optimized initial page load times</li>
                      <li>Only loads fonts you actually need</li>
                      <li>Automatic font caching</li>
                      <li>Fallback to system fonts during loading</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="font-bold text-xl mb-4">Technical Implementation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-lg mb-3">Font Service</h4>
                      <p className="text-gray-700 text-sm mb-3">
                        Our FontService provides a clean API for loading and managing fonts:
                      </p>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm overflow-auto">
                        <pre>{`// Load a single font
await loadFont('Roboto');

// Load multiple fonts
await loadFonts(['Inter', 'Poppins']);

// Check if font is loaded
const isLoaded = isFontLoaded('Montserrat');

// Preload fonts by category
await preloadFontCategory('sans-serif');`}</pre>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-lg mb-3">Integration</h4>
                      <p className="text-gray-700 text-sm mb-3">
                        Fonts are seamlessly integrated with all UI components:
                      </p>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                        <li><strong>FontSelector:</strong> Dropdown component for selecting fonts with live previews</li>
                        <li><strong>FontStyleEditor:</strong> Complete editor for all font styling properties</li>
                        <li><strong>FontPreviewGrid:</strong> Visual browser for exploring available fonts</li>
                        <li><strong>FontManagementPanel:</strong> Advanced tool for loading and managing fonts</li>
                      </ul>
                      <p className="text-gray-700 text-sm mt-3">
                        Each component handles font loading automatically, with appropriate loading states and fallbacks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Font Categories Overview */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Font Categories</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg mb-2">Sans Serif</h3>
                <p className="text-gray-700 mb-4">Clean, modern fonts without decorative strokes</p>
                <div className="space-y-1 text-sm">
                  {FONTS.filter(f => f.category === 'sans-serif').slice(0, 5).map(font => (
                    <div 
                      key={font.family}
                      className="p-2 hover:bg-white rounded cursor-pointer"
                      onClick={() => handleFontSelection(font.family)}
                      style={{ fontFamily: `"${font.family}", sans-serif` }}
                    >
                      {font.family}
                    </div>
                  ))}
                  <div className="text-primary-600 text-xs font-medium pt-1">
                    + {FONTS.filter(f => f.category === 'sans-serif').length - 5} more
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg mb-2">Serif</h3>
                <p className="text-gray-700 mb-4">Classic fonts with decorative strokes at ends</p>
                <div className="space-y-1 text-sm">
                  {FONTS.filter(f => f.category === 'serif').slice(0, 5).map(font => (
                    <div 
                      key={font.family}
                      className="p-2 hover:bg-white rounded cursor-pointer"
                      onClick={() => handleFontSelection(font.family)}
                      style={{ fontFamily: `"${font.family}", serif` }}
                    >
                      {font.family}
                    </div>
                  ))}
                  <div className="text-primary-600 text-xs font-medium pt-1">
                    + {FONTS.filter(f => f.category === 'serif').length - 5} more
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg mb-2">Monospace</h3>
                <p className="text-gray-700 mb-4">Fixed-width fonts ideal for code and tabular data</p>
                <div className="space-y-1 text-sm">
                  {FONTS.filter(f => f.category === 'monospace').slice(0, 5).map(font => (
                    <div 
                      key={font.family}
                      className="p-2 hover:bg-white rounded cursor-pointer"
                      onClick={() => handleFontSelection(font.family)}
                      style={{ fontFamily: `"${font.family}", monospace` }}
                    >
                      {font.family}
                    </div>
                  ))}
                  <div className="text-primary-600 text-xs font-medium pt-1">
                    + {FONTS.filter(f => f.category === 'monospace').length - 5} more
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg mb-2">Display</h3>
                <p className="text-gray-700 mb-4">Eye-catching fonts for headings and headlines</p>
                <div className="space-y-1 text-sm">
                  {FONTS.filter(f => f.category === 'display').slice(0, 5).map(font => (
                    <div 
                      key={font.family}
                      className="p-2 hover:bg-white rounded cursor-pointer"
                      onClick={() => handleFontSelection(font.family)}
                      style={{ fontFamily: `"${font.family}", sans-serif` }}
                    >
                      {font.family}
                    </div>
                  ))}
                  <div className="text-primary-600 text-xs font-medium pt-1">
                    + {FONTS.filter(f => f.category === 'display').length - 5} more
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg mb-2">Handwriting</h3>
                <p className="text-gray-700 mb-4">Fonts that mimic human handwriting styles</p>
                <div className="space-y-1 text-sm">
                  {FONTS.filter(f => f.category === 'handwriting').slice(0, 5).map(font => (
                    <div 
                      key={font.family}
                      className="p-2 hover:bg-white rounded cursor-pointer"
                      onClick={() => handleFontSelection(font.family)}
                      style={{ fontFamily: `"${font.family}", cursive` }}
                    >
                      {font.family}
                    </div>
                  ))}
                  <div className="text-primary-600 text-xs font-medium pt-1">
                    + {FONTS.filter(f => f.category === 'handwriting').length - 5} more
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg mb-2">Decorative</h3>
                <p className="text-gray-700 mb-4">Unique, creative fonts for special purposes</p>
                <div className="space-y-1 text-sm">
                  {FONTS.filter(f => f.category === 'decorative').slice(0, 5).map(font => (
                    <div 
                      key={font.family}
                      className="p-2 hover:bg-white rounded cursor-pointer"
                      onClick={() => handleFontSelection(font.family)}
                      style={{ fontFamily: `"${font.family}", cursive` }}
                    >
                      {font.family}
                    </div>
                  ))}
                  <div className="text-primary-600 text-xs font-medium pt-1">
                    + {FONTS.filter(f => f.category === 'decorative').length - 5} more
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontsPage;