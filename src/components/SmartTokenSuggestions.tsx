import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Tag,
  TrendingUp,
  Lightbulb,
  ChevronRight,
  Plus,
  BarChart3,
  History,
  Zap
} from 'lucide-react';

interface TokenSuggestion {
  token: string;
  label: string;
  description: string;
  category: 'identity' | 'brand' | 'context' | 'style' | 'audience';
  relevanceScore: number;
  usageCount: number;
}

interface SmartTokenSuggestionsProps {
  prompt: string;
  currentTokens: Record<string, string>;
  onAddToken: (key: string, value: string) => void;
  recentTokens?: Record<string, string>[];
}

const TOKEN_DATABASE: TokenSuggestion[] = [
  { token: 'FIRSTNAME', label: 'First Name', description: 'Recipient first name', category: 'identity', relevanceScore: 0, usageCount: 0 },
  { token: 'LASTNAME', label: 'Last Name', description: 'Recipient last name', category: 'identity', relevanceScore: 0, usageCount: 0 },
  { token: 'FULLNAME', label: 'Full Name', description: 'Recipient full name', category: 'identity', relevanceScore: 0, usageCount: 0 },
  { token: 'COMPANY', label: 'Company', description: 'Company or organization name', category: 'brand', relevanceScore: 0, usageCount: 0 },
  { token: 'JOBTITLE', label: 'Job Title', description: 'Professional title', category: 'identity', relevanceScore: 0, usageCount: 0 },
  { token: 'INDUSTRY', label: 'Industry', description: 'Business industry vertical', category: 'brand', relevanceScore: 0, usageCount: 0 },
  { token: 'BRANDCOLOR', label: 'Brand Color', description: 'Primary brand color', category: 'brand', relevanceScore: 0, usageCount: 0 },
  { token: 'PRODUCT', label: 'Product Name', description: 'Product being showcased', category: 'brand', relevanceScore: 0, usageCount: 0 },
  { token: 'TAGLINE', label: 'Tagline', description: 'Slogan or catchphrase', category: 'brand', relevanceScore: 0, usageCount: 0 },
  { token: 'CITY', label: 'City', description: 'Location city', category: 'context', relevanceScore: 0, usageCount: 0 },
  { token: 'EVENT', label: 'Event Name', description: 'Event or occasion', category: 'context', relevanceScore: 0, usageCount: 0 },
  { token: 'DATE', label: 'Date', description: 'Relevant date', category: 'context', relevanceScore: 0, usageCount: 0 },
  { token: 'SEASON', label: 'Season', description: 'Seasonal context', category: 'context', relevanceScore: 0, usageCount: 0 },
  { token: 'STYLE', label: 'Art Style', description: 'Visual art style preference', category: 'style', relevanceScore: 0, usageCount: 0 },
  { token: 'MOOD', label: 'Mood', description: 'Emotional tone', category: 'style', relevanceScore: 0, usageCount: 0 },
  { token: 'BACKGROUND', label: 'Background', description: 'Scene background setting', category: 'style', relevanceScore: 0, usageCount: 0 },
  { token: 'AUDIENCE', label: 'Target Audience', description: 'Intended viewers', category: 'audience', relevanceScore: 0, usageCount: 0 },
  { token: 'PLATFORM', label: 'Platform', description: 'Social media or distribution channel', category: 'audience', relevanceScore: 0, usageCount: 0 },
  { token: 'CTA', label: 'Call to Action', description: 'Desired action text', category: 'audience', relevanceScore: 0, usageCount: 0 },
  { token: 'LOGO', label: 'Logo URL', description: 'Brand logo image URL', category: 'brand', relevanceScore: 0, usageCount: 0 },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  identity: { label: 'Identity', color: 'text-blue-700', bg: 'bg-blue-50' },
  brand: { label: 'Brand', color: 'text-teal-700', bg: 'bg-teal-50' },
  context: { label: 'Context', color: 'text-amber-700', bg: 'bg-amber-50' },
  style: { label: 'Style', color: 'text-rose-700', bg: 'bg-rose-50' },
  audience: { label: 'Audience', color: 'text-emerald-700', bg: 'bg-emerald-50' },
};

const PROMPT_CATEGORY_MAP: Record<string, string[]> = {
  identity: ['headshot', 'portrait', 'person', 'professional', 'employee', 'team', 'staff', 'individual', 'face'],
  brand: ['marketing', 'brand', 'logo', 'company', 'business', 'corporate', 'product', 'advertising', 'commercial'],
  context: ['event', 'conference', 'holiday', 'seasonal', 'location', 'venue', 'celebration', 'anniversary'],
  style: ['cartoon', 'anime', 'ghibli', 'action figure', 'meme', 'painting', 'photography', 'cinematic', 'vintage'],
  audience: ['social media', 'instagram', 'linkedin', 'facebook', 'twitter', 'email', 'newsletter', 'campaign'],
};

function scoreTokenRelevance(
  token: TokenSuggestion,
  prompt: string,
  currentTokens: Record<string, string>
): number {
  if (currentTokens[token.token]) return -1;

  let score = 0;
  const lower = prompt.toLowerCase();

  const keywords = PROMPT_CATEGORY_MAP[token.category] || [];
  for (const kw of keywords) {
    if (lower.includes(kw)) score += 20;
  }

  if (lower.includes(token.token.toLowerCase())) score += 30;
  if (lower.includes(token.label.toLowerCase())) score += 25;

  const hasTokenPlaceholder = lower.includes(`[${token.token.toLowerCase()}]`);
  if (hasTokenPlaceholder) score += 50;

  if (['FIRSTNAME', 'COMPANY'].includes(token.token)) score += 5;

  return score;
}

const SmartTokenSuggestions: React.FC<SmartTokenSuggestionsProps> = ({
  prompt,
  currentTokens,
  onAddToken,
  recentTokens = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const suggestions = useMemo(() => {
    return TOKEN_DATABASE
      .map(token => ({
        ...token,
        relevanceScore: scoreTokenRelevance(token, prompt, currentTokens),
      }))
      .filter(t => t.relevanceScore >= 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [prompt, currentTokens]);

  const filteredSuggestions = useMemo(() => {
    let items = suggestions;
    if (selectedCategory) {
      items = items.filter(t => t.category === selectedCategory);
    }
    return showAll ? items : items.slice(0, 8);
  }, [suggestions, selectedCategory, showAll]);

  const topSuggestions = suggestions.filter(t => t.relevanceScore >= 15).slice(0, 4);

  const missingOpportunities = useMemo(() => {
    const opportunities: string[] = [];
    const lower = prompt.toLowerCase();

    if ((lower.includes('person') || lower.includes('portrait') || lower.includes('headshot')) && !currentTokens['FIRSTNAME']) {
      opportunities.push('Add [FIRSTNAME] to personalize the portrait');
    }
    if ((lower.includes('company') || lower.includes('brand') || lower.includes('corporate')) && !currentTokens['COMPANY']) {
      opportunities.push('Add [COMPANY] for brand-specific customization');
    }
    if ((lower.includes('product') || lower.includes('item') || lower.includes('showcase')) && !currentTokens['PRODUCT']) {
      opportunities.push('Add [PRODUCT] to feature specific items');
    }
    if ((lower.includes('social') || lower.includes('post') || lower.includes('content')) && !currentTokens['PLATFORM']) {
      opportunities.push('Add [PLATFORM] to optimize for specific channels');
    }
    return opportunities;
  }, [prompt, currentTokens]);

  const frequentTokens = useMemo(() => {
    const counts: Record<string, number> = {};
    recentTokens.forEach(tokenSet => {
      Object.keys(tokenSet).forEach(key => {
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([key, count]) => ({ key, count }));
  }, [recentTokens]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Smart Token Suggestions
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Personalization tokens detected from your prompt
        </p>
      </div>

      {/* Top Recommendations */}
      {topSuggestions.length > 0 && (
        <div className="p-4 border-b border-gray-100 bg-blue-50/50">
          <p className="text-xs font-medium text-blue-700 mb-2 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5" />
            Recommended for this prompt
          </p>
          <div className="flex flex-wrap gap-2">
            {topSuggestions.map(token => (
              <button
                key={token.token}
                onClick={() => onAddToken(token.token, '')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm hover:bg-blue-50 hover:border-blue-300 transition-all group"
              >
                <Tag className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-medium text-gray-800">[{token.token}]</span>
                <Plus className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Missing Opportunities */}
      {missingOpportunities.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            Personalization Opportunities
          </p>
          <ul className="space-y-1">
            {missingOpportunities.map((opp, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                <ChevronRight className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                {opp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category Filter */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              !selectedCategory ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedCategory === key
                  ? `${config.bg} ${config.color} ring-1 ring-current`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Token Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <AnimatePresence mode="popLayout">
            {filteredSuggestions.map(token => {
              const cat = CATEGORY_LABELS[token.category];
              return (
                <motion.button
                  key={token.token}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => onAddToken(token.token, '')}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className={`mt-0.5 shrink-0 w-6 h-6 rounded flex items-center justify-center ${cat.bg}`}>
                    <Tag className={`w-3.5 h-3.5 ${cat.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-medium text-gray-900">[{token.token}]</span>
                      {token.relevanceScore >= 15 && (
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{token.description}</p>
                  </div>
                  <Plus className="w-4 h-4 text-gray-300 group-hover:text-blue-600 mt-0.5 shrink-0 transition-colors" />
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {suggestions.length > 8 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="mt-3 w-full py-2 text-xs font-medium text-blue-600 hover:text-blue-700 text-center"
          >
            Show all {suggestions.length} tokens
          </button>
        )}
      </div>

      {/* Frequent Tokens */}
      {frequentTokens.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
            <History className="w-3.5 h-3.5" />
            Frequently Used
          </p>
          <div className="flex flex-wrap gap-2">
            {frequentTokens.map(({ key, count }) => (
              <button
                key={key}
                onClick={() => onAddToken(key, '')}
                className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">[{key}]</span>
                <span className="text-gray-400 flex items-center gap-0.5">
                  <BarChart3 className="w-2.5 h-2.5" />
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartTokenSuggestions;
