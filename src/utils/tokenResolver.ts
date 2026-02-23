/**
 * Universal Token Resolver System
 * Handles token replacement across all content types: prompts, emails, text messages, and marketing materials
 */

import { PERSONALIZATION_TOKENS, createDefaultTokenValues, getTokensByCategory, TokenCategory } from '../types/personalization';

// Token format patterns
const TOKEN_PATTERNS: Record<string, RegExp> = {
  squareBrackets: /\[([A-Z_]+)\]/g,  // [TOKEN]
  curlyBraces: /\{([A-Z_]+)\}/g,     // {TOKEN}
  doubleUnderscore: /__([A-Z_]+)__/g, // __TOKEN__
  percentSigns: /%([A-Z_]+)%/g        // %TOKEN%
};

// Content type configurations
const CONTENT_TYPE_CONFIGS = {
  prompt: {
    pattern: 'squareBrackets',
    fallbackFormat: '[TOKEN]'
  },
  email: {
    pattern: 'curlyBraces',
    fallbackFormat: '{TOKEN}'
  },
  sms: {
    pattern: 'percentSigns',
    fallbackFormat: '%TOKEN%'
  },
  marketing: {
    pattern: 'squareBrackets',
    fallbackFormat: '[TOKEN]'
  },
  social: {
    pattern: 'curlyBraces',
    fallbackFormat: '{TOKEN}'
  }
};

export interface TokenResolutionOptions {
  contentType?: keyof typeof CONTENT_TYPE_CONFIGS;
  customTokens?: Record<string, string>;
  fallbackValues?: Record<string, string>;
  strictMode?: boolean; // Throw error on missing tokens
  caseSensitive?: boolean;
  preserveUnresolved?: boolean;
}

export interface TokenResolutionResult {
  resolvedContent: string;
  resolvedTokens: string[];
  missingTokens: string[];
  invalidTokens: string[];
  warnings: string[];
}

/**
 * Resolve tokens in content by trying ALL known token formats.
 * This ensures tokens work regardless of whether the user typed
 * {FIRSTNAME}, [FIRSTNAME], __FIRSTNAME__, or %FIRSTNAME%.
 */
export function resolveTokens(
  content: string,
  tokenValues: Record<string, string> = {},
  options: TokenResolutionOptions = {}
): TokenResolutionResult {
  const {
    contentType = 'prompt',
    customTokens = {},
    fallbackValues = {},
    strictMode = false,
    caseSensitive = false,
    preserveUnresolved = false
  } = options;

  const config = CONTENT_TYPE_CONFIGS[contentType];

  if (!content) {
    return {
      resolvedContent: content ?? '',
      resolvedTokens: [],
      missingTokens: [],
      invalidTokens: [],
      warnings: [],
      isFullyResolved: true
    };
  }

  let resolvedContent = content;
  const resolvedTokens: string[] = [];
  const missingTokens: string[] = [];
  const invalidTokens: string[] = [];
  const warnings: string[] = [];

  const allTokens = {
    ...tokenValues,
    ...customTokens
  };

  const allPatterns = Object.values(TOKEN_PATTERNS);
  const seenTokenKeys = new Set<string>();

  for (const pattern of allPatterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    const matches = resolvedContent.match(regex);
    if (!matches) continue;

    for (const match of matches) {
      const tokenKey = match.replace(/^[\[{%_]+|[\]}%_]+$/g, '');
      if (seenTokenKeys.has(`${tokenKey}_${match}`)) continue;
      seenTokenKeys.add(`${tokenKey}_${match}`);

      if (allTokens[tokenKey]) {
        const tokenRegex = new RegExp(escapeRegExp(match), 'g');
        resolvedContent = resolvedContent.replace(tokenRegex, allTokens[tokenKey]);
        if (!resolvedTokens.includes(tokenKey)) resolvedTokens.push(tokenKey);
      } else if (fallbackValues[tokenKey]) {
        const tokenRegex = new RegExp(escapeRegExp(match), 'g');
        resolvedContent = resolvedContent.replace(tokenRegex, fallbackValues[tokenKey]);
        if (!resolvedTokens.includes(tokenKey)) resolvedTokens.push(tokenKey);
        warnings.push(`Used fallback value for token: ${tokenKey}`);
      } else if (preserveUnresolved) {
        if (!resolvedTokens.includes(tokenKey)) resolvedTokens.push(tokenKey);
        warnings.push(`Unresolved token preserved: ${tokenKey}`);
      } else if (strictMode) {
        throw new Error(`Missing required token: ${tokenKey}`);
      } else {
        const tokenRegex = new RegExp(escapeRegExp(match), 'g');
        resolvedContent = resolvedContent.replace(tokenRegex, config.fallbackFormat.replace('TOKEN', tokenKey));
        if (!missingTokens.includes(tokenKey)) missingTokens.push(tokenKey);
        warnings.push(`Token not found, using placeholder: ${tokenKey}`);
      }
    }
  }

  return {
    resolvedContent,
    resolvedTokens,
    missingTokens,
    invalidTokens,
    warnings
  };
}

/**
 * Validate tokens in content against available personalization tokens
 */
export function validateTokens(
  content: string,
  contentType: keyof typeof CONTENT_TYPE_CONFIGS = 'prompt'
): {
  isValid: boolean;
  foundTokens: string[];
  validTokens: string[];
  invalidTokens: string[];
  suggestions: string[];
} {
  if (!content) {
    return { isValid: true, foundTokens: [], validTokens: [], invalidTokens: [], suggestions: [] };
  }

  const config = CONTENT_TYPE_CONFIGS[contentType];
  const pattern = TOKEN_PATTERNS[config.pattern];

  const foundTokens: string[] = [];
  const validTokens: string[] = [];
  const invalidTokens: string[] = [];
  const suggestions: string[] = [];

  const tokenMatches = content.match(pattern);
  if (tokenMatches) {
    tokenMatches.forEach(match => {
      const tokenKey = match.replace(/^[\[{%_]+|[\]}%_]+$/g, '');
      if (!foundTokens.includes(tokenKey)) {
        foundTokens.push(tokenKey);
      }
    });
  }

  // Validate against personalization tokens
  const implementedTokens = PERSONALIZATION_TOKENS
    .filter(token => token.isImplemented)
    .map(token => token.key);

  foundTokens.forEach(token => {
    if (implementedTokens.includes(token)) {
      validTokens.push(token);
    } else {
      invalidTokens.push(token);
      // Suggest similar tokens
      const similarTokens = implementedTokens.filter(t =>
        t.toLowerCase().includes(token.toLowerCase()) ||
        token.toLowerCase().includes(t.toLowerCase())
      );
      if (similarTokens.length > 0) {
        suggestions.push(`Did you mean ${similarTokens[0]} instead of ${token}?`);
      }
    }
  });

  return {
    isValid: invalidTokens.length === 0,
    foundTokens,
    validTokens,
    invalidTokens,
    suggestions
  };
}

/**
 * Get available tokens for a specific category
 */
export function getAvailableTokens(category?: TokenCategory): Record<string, string> {
  const tokens = category
    ? getTokensByCategory()[category] || []
    : PERSONALIZATION_TOKENS.filter(token => token.isImplemented);

  return tokens.reduce((acc, token) => {
    acc[token.key] = token.displayName;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Convert token format between content types
 */
export function convertTokenFormat(
  content: string,
  fromType: keyof typeof CONTENT_TYPE_CONFIGS,
  toType: keyof typeof CONTENT_TYPE_CONFIGS
): string {
  const fromConfig = CONTENT_TYPE_CONFIGS[fromType];
  const toConfig = CONTENT_TYPE_CONFIGS[toType];
  const fromPattern = TOKEN_PATTERNS[fromConfig.pattern];

  return content.replace(fromPattern, (match) => {
    const tokenKey = match.replace(/^[\[{%_]+|[\]}%_]+$/g, '');
    return toConfig.fallbackFormat.replace('TOKEN', tokenKey);
  });
}

/**
 * Batch resolve tokens for multiple content pieces
 */
export function resolveTokensBatch(
  contents: Array<{ content: string; options?: TokenResolutionOptions }>,
  globalTokenValues: Record<string, string> = {},
  globalOptions: Partial<TokenResolutionOptions> = {}
): TokenResolutionResult[] {
  return contents.map(({ content, options = {} }) => {
    const mergedOptions = { ...globalOptions, ...options };
    return resolveTokens(content, globalTokenValues, mergedOptions);
  });
}

/**
 * Generate token usage report
 */
export function generateTokenUsageReport(
  contents: string[],
  contentType: keyof typeof CONTENT_TYPE_CONFIGS = 'prompt'
): {
  totalTokens: number;
  uniqueTokens: string[];
  tokenFrequency: Record<string, number>;
  mostUsedTokens: Array<{ token: string; count: number }>;
} {
  const allTokens: string[] = [];

  contents.forEach(content => {
    const validation = validateTokens(content, contentType);
    allTokens.push(...validation.foundTokens);
  });

  const tokenFrequency = allTokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueTokens = Object.keys(tokenFrequency);
  const mostUsedTokens = uniqueTokens
    .map(token => ({ token, count: tokenFrequency[token] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalTokens: allTokens.length,
    uniqueTokens,
    tokenFrequency,
    mostUsedTokens
  };
}

/**
 * Helper function to escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export {
  TOKEN_PATTERNS,
  CONTENT_TYPE_CONFIGS
};