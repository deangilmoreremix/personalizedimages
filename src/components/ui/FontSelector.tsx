import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Search, Check } from 'lucide-react';
import { FONTS, Font, FontCategory, getFontsByCategory, getFontCategories, getFontDisplayName } from '../../types/fonts';
import { loadFont } from '../../services/FontService';

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  showCategories?: boolean;
  includePreview?: boolean;
  searchable?: boolean;
  previewText?: string;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  maxHeight?: string;
  loadFonts?: boolean;
}

const FontSelector: React.FC<FontSelectorProps> = ({
  value,
  onChange,
  className = '',
  showCategories = true,
  includePreview = true,
  searchable = true,
  previewText = 'Aa',
  size = 'md',
  placeholder = 'Select Font',
  maxHeight = '300px',
  loadFonts = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FontCategory | 'all'>('all');
  const [loadingFont, setLoadingFont] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const categories = getFontCategories();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Load selected font when component mounts or value changes
  useEffect(() => {
    if (loadFonts && value) {
      setLoadingFont(true);
      loadFont(value).finally(() => setLoadingFont(false));
    }
  }, [value, loadFonts]);
  
  // Filter fonts based on search and category
  const getFilteredFonts = () => {
    let filteredFonts: Font[] = [...FONTS];
    
    // Filter by category if not "all"
    if (selectedCategory !== 'all') {
      filteredFonts = getFontsByCategory(selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredFonts = filteredFonts.filter(font => {
        const displayName = getFontDisplayName(font).toLowerCase();
        return displayName.includes(query);
      });
    }
    
    return filteredFonts;
  };
  
  // Get the display name of the selected font
  const getSelectedFontDisplayName = () => {
    const selectedFont = FONTS.find(font => font.family === value);
    return selectedFont ? getFontDisplayName(selectedFont) : placeholder;
  };
  
  // Load font on hover/selection
  const handleFontInteraction = async (font: Font) => {
    if (loadFonts) {
      await loadFont(font.family);
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-2 px-3',
    lg: 'text-base py-2.5 px-4'
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Current selection button */}
      <button
        type="button"
        className={`flex items-center justify-between w-full border border-gray-300 bg-white rounded-md ${sizeClasses[size]} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {includePreview && value && (
            <span 
              className="mr-2 inline-block text-center w-6"
              style={{ fontFamily: `"${value}", sans-serif` }}
            >
              {loadingFont ? '...' : previewText}
            </span>
          )}
          <span className="truncate">
            {getSelectedFontDisplayName()}
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 ml-2 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 ml-2 text-gray-400 flex-shrink-0" />}
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-40 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex flex-col divide-y divide-gray-200">
            {/* Search input */}
            {searchable && (
              <div className="p-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Search fonts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {/* Category selector */}
            {showCategories && (
              <div className="p-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`text-xs px-2 py-1 rounded-md ${
                      selectedCategory === 'all' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      type="button"
                      className={`text-xs px-2 py-1 rounded-md ${
                        selectedCategory === category 
                          ? 'bg-primary-100 text-primary-800' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Font list */}
            <div className={`overflow-y-auto`} style={{ maxHeight }}>
              {getFilteredFonts().length === 0 ? (
                <div className="py-3 px-4 text-sm text-gray-700">
                  No fonts found
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {getFilteredFonts().map((font) => (
                    <button
                      key={font.family}
                      type="button"
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                        value === font.family ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => {
                        onChange(font.family);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => handleFontInteraction(font)}
                      style={{ fontFamily: `"${font.family}", ${font.fallback}` }}
                    >
                      <div className="flex items-center">
                        {includePreview && (
                          <span className="mr-2 text-center w-6">
                            {previewText}
                          </span>
                        )}
                        <span>
                          {getFontDisplayName(font)}
                        </span>
                      </div>
                      {value === font.family && (
                        <Check className="h-4 w-4 text-primary-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FontSelector;
export { FontSelector };