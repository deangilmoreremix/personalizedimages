/**
 * Custom hook for virtualized token rendering to improve performance with large token lists
 */

import { useMemo, useState, useCallback } from 'react';
import { PERSONALIZATION_TOKENS, getTokensByCategory, TokenCategory } from '../types/personalization';

interface VirtualizedTokensConfig {
  itemsPerPage?: number;
  searchTerm?: string;
  showOnlyImplemented?: boolean;
}

interface VirtualizedTokensResult {
  visibleTokens: Record<TokenCategory, typeof PERSONALIZATION_TOKENS>;
  totalCount: number;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  searchTokens: (term: string) => void;
}

export const useVirtualizedTokens = (
  config: VirtualizedTokensConfig = {}
): VirtualizedTokensResult => {
  const { itemsPerPage = 20, showOnlyImplemented = true } = config;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(config.searchTerm || '');

  // Get all tokens by category
  const allTokensByCategory = useMemo(() => getTokensByCategory(), []);

  // Memoized token filtering function
  const filterTokensMemoized = useMemo(() => {
    return (tokens: typeof PERSONALIZATION_TOKENS, term: string, onlyImplemented: boolean) => {
      const result: Record<TokenCategory, typeof PERSONALIZATION_TOKENS> = {
        basic: [],
        location: [],
        company: [],
        social: [],
        dates: [],
        engagement: [],
        campaign: [],
        communication: [],
        dynamic: []
      };

      if (!term) {
        // Return all tokens or only implemented ones
        Object.entries(allTokensByCategory).forEach(([category, categoryTokens]) => {
          result[category as TokenCategory] = onlyImplemented
            ? categoryTokens.filter(token => token.isImplemented)
            : categoryTokens;
        });
      } else {
        // Filter based on search term
        tokens.forEach(token => {
          if (
            (token.key.toLowerCase().includes(term.toLowerCase()) ||
            token.displayName.toLowerCase().includes(term.toLowerCase()) ||
            token.description.toLowerCase().includes(term.toLowerCase())) &&
            (!onlyImplemented || token.isImplemented)
          ) {
            result[token.category].push(token);
          }
        });
      }

      return result;
    };
  }, [allTokensByCategory]);

  // Filter tokens based on search and implementation status
  const filteredTokens = useMemo(() => {
    return filterTokensMemoized(PERSONALIZATION_TOKENS, searchTerm, showOnlyImplemented);
  }, [filterTokensMemoized, searchTerm, showOnlyImplemented]);

  // Calculate total count
  const totalCount = useMemo(() => {
    return Object.values(filteredTokens).reduce((sum, tokens) => sum + tokens.length, 0);
  }, [filteredTokens]);

  // Get visible tokens based on current page
  const visibleTokens = useMemo(() => {
    const result: Record<TokenCategory, typeof PERSONALIZATION_TOKENS> = {
      basic: [],
      location: [],
      company: [],
      social: [],
      dates: [],
      engagement: [],
      campaign: [],
      communication: [],
      dynamic: []
    };

    let itemsShown = 0;
    const maxItems = currentPage * itemsPerPage;

    // Distribute items across categories proportionally
    for (const [category, tokens] of Object.entries(filteredTokens)) {
      if (itemsShown >= maxItems) break;

      const remainingSlots = maxItems - itemsShown;
      const itemsToShow = Math.min(tokens.length, remainingSlots);

      result[category as TokenCategory] = tokens.slice(0, itemsToShow);
      itemsShown += itemsToShow;
    }

    return result;
  }, [filteredTokens, currentPage, itemsPerPage]);

  // Check if there are more items to load
  const hasMore = useMemo(() => {
    return currentPage * itemsPerPage < totalCount;
  }, [currentPage, itemsPerPage, totalCount]);

  // Load more items
  const loadMore = useCallback(() => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore]);

  // Reset pagination
  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Search tokens
  const searchTokens = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  return {
    visibleTokens,
    totalCount,
    hasMore,
    loadMore,
    reset,
    searchTokens
  };
};