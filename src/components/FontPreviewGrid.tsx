import React, { useState, useEffect } from 'react';
import { FONTS, FontCategory, getFontDisplayName, getFontsByCategory } from '../types/fonts';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { loadFont } from '../services/FontService';

interface FontPreviewGridProps {
  onSelectFont?: (fontFamily: string) => void;
  sampleText?: string;
  className?: string;
  showCategories?: boolean;
  preloadFonts?: boolean;
}

const FontPreviewGrid: React.FC<FontPreviewGridProps> = ({ 
  onSelectFont, 
  sampleText = "The quick brown fox jumps over the lazy dog", 
  className = '',
  showCategories = true,
  preloadFonts = false
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<FontCategory, boolean>>({
    'sans-serif': true,
    'serif': false,
    'monospace': false,
    'display': false,
    'handwriting': false,
    'decorative': false,
  });
  
  const [loadingFonts, setLoadingFonts] = useState<Record<string, boolean>>({});
  
  // Preload fonts for expanded categories if requested
  useEffect(() => {
    if (preloadFonts) {
      Object.entries(expandedCategories).forEach(([category, isExpanded]) => {
        if (isExpanded) {
          const fontsToLoad = getFontsByCategory(category as FontCategory);
          fontsToLoad.forEach(font => {
            setLoadingFonts(prev => ({ ...prev, [font.family]: true }));
            loadFont(font.family).finally(() => {
              setLoadingFonts(prev => ({ ...prev, [font.family]: false }));
            });
          });
        }
      });
    }
  }, [expandedCategories, preloadFonts]);
  
  // Toggle category expansion
  const toggleCategory = (category: FontCategory) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
    
  // Get web-safe font categories
  const categories: FontCategory[] = ['sans-serif', 'serif', 'monospace', 'display', 'handwriting', 'decorative'];
  
  // Category display names
  const categoryNames: Record<FontCategory, string> = {
    'sans-serif': 'Sans-Serif Fonts',
    'serif': 'Serif Fonts',
    'monospace': 'Monospace Fonts',
    'display': 'Display Fonts',
    'handwriting': 'Handwriting Fonts',
    'decorative': 'Decorative Fonts'
  };

  // Preload a font when hovering over it
  const handleFontHover = (fontFamily: string) => {
    if (!loadingFonts[fontFamily]) {
      setLoadingFonts(prev => ({ ...prev, [fontFamily]: true }));
      loadFont(fontFamily).finally(() => {
        setLoadingFonts(prev => ({ ...prev, [fontFamily]: false }));
      });
    }
  };
  
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="p-4">
        <h2 className="font-medium text-lg mb-4">Font Preview</h2>
        
        {/* Categories */}
        {showCategories && categories.map(category => {
          const fonts = getFontsByCategory(category);
          if (fonts.length === 0) return null;
          
          return (
            <div key={category} className="mb-6">
              <button
                onClick={() => toggleCategory(category)}
                className="flex justify-between items-center w-full text-left mb-2"
              >
                <h3 className="font-medium text-gray-700 flex items-center">
                  {categoryNames[category]}
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {fonts.length}
                  </span>
                </h3>
                {expandedCategories[category] ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {expandedCategories[category] && (
                <div className="grid grid-cols-1 gap-2 mt-3">
                  {fonts.map(font => {
                    const fontFamilyStyle = { fontFamily: `"${font.family}", ${font.fallback}` };
                    const displayName = getFontDisplayName(font);
                    const isLoading = loadingFonts[font.family];
                    
                    return (
                      <motion.div
                        key={font.family}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ backgroundColor: "#f9fafb" }}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer"
                        onClick={() => onSelectFont?.(font.family)}
                        onMouseEnter={() => handleFontHover(font.family)}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-xs font-mono text-gray-500">{displayName}</div>
                          {isLoading && <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />}
                        </div>
                        <div 
                          className="text-lg truncate" 
                          style={fontFamilyStyle}
                        >
                          {sampleText}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Without categories, just show all fonts */}
        {!showCategories && (
          <div className="grid grid-cols-1 gap-2">
            {FONTS.map(font => {
              const fontFamilyStyle = { fontFamily: `"${font.family}", ${font.fallback}` };
              const displayName = getFontDisplayName(font);
              const isLoading = loadingFonts[font.family];
              
              return (
                <div
                  key={font.family}
                  className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelectFont?.(font.family)}
                  onMouseEnter={() => handleFontHover(font.family)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-xs font-mono text-gray-500">{displayName}</div>
                    {isLoading && <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />}
                  </div>
                  <div 
                    className="text-lg truncate" 
                    style={fontFamilyStyle}
                  >
                    {sampleText}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FontPreviewGrid;
;