import React, { useState } from 'react';
import FreepikResourceGallery from '../components/FreepikResourceGallery';
import { stockImageService } from '../services/stockImageService';
import { Search, Heart, Download, Code, Book } from 'lucide-react';

interface StockResource {
  id: number;
  title: string;
  url: string;
  filename: string;
  thumbnailUrl: string | null;
  type: string | null;
  orientation: string | null;
  width: number | null;
  height: number | null;
  downloads: number;
  likes: number;
  author: string | null;
  publishedAt: string | null;
  license: string | null;
}

const FreepikDemo: React.FC = () => {
  const [selectedResource, setSelectedResource] = useState<StockResource | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [favorites, setFavorites] = useState<StockResource[]>([]);
  const [searchResults, setSearchResults] = useState<StockResource[]>([]);

  const handleResourceSelect = async (resource: StockResource) => {
    setSelectedResource(resource);
    console.log('Selected resource:', resource);
  };

  const handleAddToFavorites = async (resource: StockResource) => {
    const success = await stockImageService.addFavorite(resource);
    if (success) {
      setFavorites([...favorites, resource]);
      alert('Added to favorites!');
    }
  };

  const loadFavorites = async () => {
    const favs = await stockImageService.getFavorites();
    console.log('Your favorites:', favs);
    alert(`You have ${favs.length} favorites`);
  };

  const searchExample = async () => {
    try {
      const result = await stockImageService.search({
        keywords: 'technology startup',
        content_type: 'photo',
        orientation: 'horizontal',
        per_page: 10
      });

      setSearchResults(result.resources);
      alert(`Found ${result.resources.length} resources`);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Check console for details.');
    }
  };

  const codeExample = `import { stockImageService } from './services/stockImageService';

// Search for resources
const result = await stockImageService.search({
  keywords: 'business',
  content_type: 'photo',
  orientation: 'horizontal',
  page: 1,
  per_page: 20
});

// Add to favorites
await stockImageService.addFavorite(resource);

// Get favorites
const favorites = await stockImageService.getFavorites();

// Track download
await stockImageService.recordDownload(
  resource,
  'jpg',
  resource.url,
  'email-campaign'
);`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Freepik API Demo</h1>
              <p className="mt-1 text-sm text-gray-500">
                Explore millions of stock resources from Freepik
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/FREEPIK_QUICKSTART.md"
                target="_blank"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Book className="w-4 h-4 mr-2" />
                Quick Start
              </a>
              <button
                onClick={() => setShowCode(!showCode)}
                className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-lg text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
              >
                <Code className="w-4 h-4 mr-2" />
                {showCode ? 'Hide Code' : 'Show Code'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Code Example */}
        {showCode && (
          <div className="mb-8 bg-gray-900 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Usage Example</h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeExample);
                  alert('Code copied to clipboard!');
                }}
                className="text-sm px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                Copy Code
              </button>
            </div>
            <pre className="text-sm overflow-x-auto">
              <code>{codeExample}</code>
            </pre>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={searchExample}
            className="p-6 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors text-left"
          >
            <Search className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Try Search API</h3>
            <p className="text-sm text-gray-600">
              Search for "technology startup" photos
            </p>
          </button>

          <button
            onClick={loadFavorites}
            className="p-6 bg-white rounded-lg border-2 border-pink-200 hover:border-pink-400 transition-colors text-left"
          >
            <Heart className="w-8 h-8 text-pink-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">View Favorites</h3>
            <p className="text-sm text-gray-600">
              See your saved resources
            </p>
          </button>

          <button
            onClick={() => window.open('https://www.freepik.com/api/docs', '_blank')}
            className="p-6 bg-white rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors text-left"
          >
            <Download className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">API Docs</h3>
            <p className="text-sm text-gray-600">
              Read official Freepik API documentation
            </p>
          </button>
        </div>

        {/* Selected Resource Details */}
        {selectedResource && (
          <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Selected Resource</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {selectedResource.thumbnailUrl && (
                  <img
                    src={selectedResource.thumbnailUrl}
                    alt={selectedResource.title}
                    className="w-full rounded-lg"
                  />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedResource.title}</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Type:</dt>
                    <dd className="font-medium">{selectedResource.type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Orientation:</dt>
                    <dd className="font-medium">{selectedResource.orientation}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Dimensions:</dt>
                    <dd className="font-medium">
                      {selectedResource.width} x {selectedResource.height}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Downloads:</dt>
                    <dd className="font-medium">{selectedResource.downloads.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Likes:</dt>
                    <dd className="font-medium">{selectedResource.likes.toLocaleString()}</dd>
                  </div>
                  {selectedResource.author && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Author:</dt>
                      <dd className="font-medium">{selectedResource.author}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-600">License:</dt>
                    <dd className="font-medium">{selectedResource.license || 'N/A'}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleAddToFavorites(selectedResource)}
                    className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Add to Favorites
                  </button>
                  <a
                    href={selectedResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    View on Freepik
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">
              Search Results ({searchResults.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {searchResults.map((resource) => (
                <div
                  key={resource.id}
                  onClick={() => setSelectedResource(resource)}
                  className="cursor-pointer group"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {resource.thumbnailUrl ? (
                      <img
                        src={resource.thumbnailUrl}
                        alt={resource.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-600 truncate">{resource.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Component */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Interactive Gallery</h2>
          <FreepikResourceGallery
            onResourceSelect={handleResourceSelect}
            maxHeight="600px"
            showFilters={true}
          />
        </div>

        {/* Integration Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Integration Features
          </h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✅ Secure API key storage via Supabase secrets</li>
            <li>✅ Automatic rate limiting (100 requests per 15 minutes)</li>
            <li>✅ Credit tracking (500 credits per day)</li>
            <li>✅ Response caching (5-minute duration)</li>
            <li>✅ User authentication required</li>
            <li>✅ Favorites and download tracking</li>
            <li>✅ Grid and list view modes</li>
            <li>✅ Pagination support</li>
            <li>✅ Advanced search filters</li>
          </ul>
        </div>

        {/* Documentation Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/FREEPIK_QUICKSTART.md"
            target="_blank"
            className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Quick Start Guide</h3>
            <p className="text-sm text-gray-600">
              Get started with Freepik API in 5 minutes
            </p>
          </a>
          <a
            href="/FREEPIK_API_INTEGRATION_GUIDE.md"
            target="_blank"
            className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Complete Integration Guide</h3>
            <p className="text-sm text-gray-600">
              Comprehensive documentation with examples
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FreepikDemo;
