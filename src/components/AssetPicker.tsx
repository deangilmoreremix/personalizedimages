import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Grid, List, Heart, Download, Loader2 } from 'lucide-react';
import { useAssetContext } from '../contexts/AssetContext';
import { Asset } from '../contexts/AssetContext';

interface AssetPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
  multiSelect?: boolean;
  maxSelection?: number;
  assetType?: Asset['type'] | 'all';
  title?: string;
  showFilters?: boolean;
}

const AssetPicker: React.FC<AssetPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiSelect = false,
  maxSelection = 10,
  assetType = 'all',
  title = 'Select Asset',
  showFilters = true
}) => {
  const {
    availableAssets,
    userLibrary,
    favoriteAssets,
    searchAssets,
    toggleFavorite,
    isSearching
  } = useAssetContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<Asset['type'] | 'all'>(assetType);
  const [selectedSource, setSelectedSource] = useState<'all' | 'stock' | 'user_upload'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'favorites' | 'library'>('browse');

  // Get assets based on active tab
  const getCurrentAssets = () => {
    switch (activeTab) {
      case 'favorites':
        return favoriteAssets;
      case 'library':
        return userLibrary.map(ua => ({ ...ua, id: ua.id.replace('user-', '') }));
      default:
        return searchResults.length > 0 ? searchResults : availableAssets;
    }
  };

  // Search assets when filters change
  useEffect(() => {
    const performSearch = async () => {
      if (activeTab === 'browse') {
        const results = await searchAssets({
          query: searchQuery,
          type: selectedType === 'all' ? undefined : selectedType,
          source: selectedSource === 'all' ? undefined : selectedSource,
          limit: 50
        });
        setSearchResults(results);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedType, selectedSource, activeTab, searchAssets]);

  const handleAssetClick = (asset: Asset) => {
    if (multiSelect) {
      setSelectedAssets(prev => {
        const newSet = new Set(prev);
        if (newSet.has(asset.id)) {
          newSet.delete(asset.id);
        } else if (newSet.size < maxSelection) {
          newSet.add(asset.id);
        }
        return newSet;
      });
    } else {
      onSelect(asset);
      onClose();
    }
  };

  const handleConfirmSelection = () => {
    const selectedAssetObjects = getCurrentAssets().filter(asset =>
      selectedAssets.has(asset.id)
    );
    // For multi-select, we could pass all selected assets
    // For now, just select the first one
    if (selectedAssetObjects.length > 0) {
      onSelect(selectedAssetObjects[0]);
    }
    onClose();
  };

  const currentAssets = getCurrentAssets();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'browse', label: 'Browse Assets', count: availableAssets.length },
            { id: 'favorites', label: 'Favorites', count: favoriteAssets.length },
            { id: 'library', label: 'My Library', count: userLibrary.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Filters */}
        {showFilters && activeTab === 'browse' && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="vector">Vectors</option>
                <option value="psd">PSD</option>
                <option value="icon">Icons</option>
                <option value="video">Videos</option>
              </select>

              {/* Source Filter */}
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="stock">Stock Library</option>
                <option value="user_upload">My Uploads</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '500px' }}>
          {isSearching && activeTab === 'browse' ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Searching assets...</span>
            </div>
          ) : currentAssets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No assets found. Try adjusting your search criteria.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {currentAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`group relative bg-white dark:bg-gray-700 border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                    selectedAssets.has(asset.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleAssetClick(asset)}
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <div className="w-8 h-8 mx-auto mb-2 opacity-50">📷</div>
                          <div className="text-xs">No preview</div>
                        </div>
                      </div>
                    )}

                    {/* Selection indicator */}
                    {multiSelect && (
                      <div className="absolute top-2 left-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedAssets.has(asset.id)
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 bg-white/80'
                        }`}>
                          {selectedAssets.has(asset.id) && <span className="text-xs">✓</span>}
                        </div>
                      </div>
                    )}

                    {/* Favorite button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(asset.id);
                      }}
                      className={`absolute top-2 right-2 p-1 rounded-full ${
                        favoriteAssets.some(fav => fav.id === asset.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <Heart className="w-3 h-3" fill={favoriteAssets.some(fav => fav.id === asset.id) ? 'currentColor' : 'none'} />
                    </button>

                    {/* Asset info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">{asset.title}</p>
                      <div className="flex items-center justify-between text-white/80 text-xs">
                        <span>{asset.type || 'Unknown'}</span>
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          <span>{asset.downloads || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {currentAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`flex items-center gap-4 p-3 bg-white dark:bg-gray-700 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
                    selectedAssets.has(asset.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleAssetClick(asset)}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                    {asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.title}
                        className="w-full h-full object-cover rounded"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        📷
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{asset.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>{asset.type || 'Unknown'}</span>
                      <span>{asset.orientation || 'Unknown'}</span>
                      {asset.author && <span>by {asset.author}</span>}
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>{asset.downloads || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{asset.likes || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(asset.id);
                      }}
                      className={`p-2 rounded-full ${
                        favoriteAssets.some(fav => fav.id === asset.id)
                          ? 'text-red-500'
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className="w-4 h-4" fill={favoriteAssets.some(fav => fav.id === asset.id) ? 'currentColor' : 'none'} />
                    </button>

                    {multiSelect && (
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedAssets.has(asset.id)
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-gray-300'
                      }`}>
                        {selectedAssets.has(asset.id) && <span className="text-xs">✓</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {multiSelect && selectedAssets.size > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedAssets.size} of {maxSelection} assets selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedAssets(new Set())}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear
              </button>
              <button
                onClick={handleConfirmSelection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Select Assets
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetPicker;