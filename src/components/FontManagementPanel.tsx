import React, { useState, useEffect } from 'react';
import { Clock, Download, Search, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { FONTS, Font, FontCategory, getFontsByCategory, getFontCategories, getFontDisplayName } from '../types/fonts';
import { loadFont, isFontLoaded, getLoadedFonts, loadFonts } from '../services/FontService';

interface FontManagementPanelProps {
  className?: string;
  onFontSelect?: (fontFamily: string) => void;
}

const FontManagementPanel: React.FC<FontManagementPanelProps> = ({ 
  className = '',
  onFontSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FontCategory | 'all'>('all');
  const [loadingFonts, setLoadingFonts] = useState<Record<string, boolean>>({});
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'status'>('name');
  
  const categories = getFontCategories();
  
  // Update loaded fonts list
  useEffect(() => {
    setLoadedFonts(getLoadedFonts());
    
    // Check every second for new loaded fonts
    const interval = setInterval(() => {
      setLoadedFonts(getLoadedFonts());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Get filtered and sorted fonts
  const getFilteredFonts = () => {
    let filteredFonts: Font[] = [...FONTS];
    
    // Filter by category
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
    
    // Sort fonts
    switch (sortBy) {
      case 'name':
        filteredFonts.sort((a, b) => a.family.localeCompare(b.family));
        break;
      case 'category':
        filteredFonts.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'status':
        filteredFonts.sort((a, b) => {
          const aLoaded = isFontLoaded(a.family);
          const bLoaded = isFontLoaded(b.family);
          return aLoaded === bLoaded ? 0 : aLoaded ? -1 : 1;
        });
        break;
    }
    
    return filteredFonts;
  };
  
  const handleLoadFont = async (fontFamily: string) => {
    if (loadingFonts[fontFamily]) return;
    
    setLoadingFonts(prev => ({ ...prev, [fontFamily]: true }));
    try {
      await loadFont(fontFamily);
      // Font loaded successfully
      setLoadedFonts([...loadedFonts, fontFamily]);
    } catch (error) {
      console.error(`Error loading font ${fontFamily}:`, error);
    } finally {
      setLoadingFonts(prev => ({ ...prev, [fontFamily]: false }));
    }
  };
  
  const handleLoadCategory = async (category: FontCategory) => {
    const fonts = getFontsByCategory(category);
    const fontFamilies = fonts.map(font => font.family);
    
    // Mark all fonts in category as loading
    const loadingState: Record<string, boolean> = {};
    fontFamilies.forEach(family => {
      loadingState[family] = true;
    });
    setLoadingFonts(prev => ({ ...prev, ...loadingState }));
    
    // Load all fonts in category
    await loadFonts(fontFamilies);
    
    // Mark all fonts as loaded
    setLoadingFonts(prev => {
      const newState = { ...prev };
      fontFamilies.forEach(family => {
        newState[family] = false;
      });
      return newState;
    });
    
    // Update loaded fonts
    setLoadedFonts(getLoadedFonts());
  };
  
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-medium text-lg mb-3">Font Management</h2>
        
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
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
          
          <select
            className="sm:w-40 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as FontCategory | 'all')}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            className="sm:w-40 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'category' | 'status')}
          >
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
        
        {/* Load by Category Buttons */}
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Load Fonts by Category:</div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
                onClick={() => handleLoadCategory(category)}
              >
                Load {category.charAt(0).toUpperCase() + category.slice(1)} Fonts
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Font List */}
      <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Font
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getFilteredFonts().map((font) => {
              const isLoaded = isFontLoaded(font.family);
              const isLoading = loadingFonts[font.family];
              
              return (
                <tr key={font.family} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{font.family}</div>
                        <div 
                          className="text-sm text-gray-500"
                          style={{ 
                            fontFamily: isLoaded ? `"${font.family}", ${font.fallback}` : 'inherit' 
                          }}
                        >
                          {isLoaded ? 'The quick brown fox' : 'Preview not available'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {font.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isLoaded ? (
                      <span className="inline-flex items-center text-green-700">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Loaded
                      </span>
                    ) : isLoading ? (
                      <span className="inline-flex items-center text-blue-600">
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        Not Loaded
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!isLoaded && !isLoading && (
                      <button
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        onClick={() => handleLoadFont(font.family)}
                      >
                        Load
                      </button>
                    )}
                    <button 
                      className={`text-blue-600 hover:text-blue-900 ${!isLoaded && 'opacity-50 cursor-not-allowed'}`}
                      onClick={() => {
                        if (isLoaded && onFontSelect) {
                          onFontSelect(font.family);
                        }
                      }}
                      disabled={!isLoaded}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            Total Fonts: <span className="font-medium">{FONTS.length}</span>
          </div>
          <div>
            Loaded: <span className="font-medium">{loadedFonts.length}</span> / {FONTS.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontManagementPanel;
;