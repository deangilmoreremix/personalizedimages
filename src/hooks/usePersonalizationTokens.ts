import { useState, useCallback } from 'react';
import { sanitizeTokenValue } from '../utils/validation';

interface PersonalizationToken {
  id: string;
  type: 'text' | 'image';
  value: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  opacity?: number;
  fontFamily?: string;
  placeholder?: string;
}

interface UsePersonalizationTokensOptions {
  initialTokens?: PersonalizationToken[];
}

interface UsePersonalizationTokensReturn {
  tokens: PersonalizationToken[];
  activeToken: string | null;
  addTextToken: (overrides?: Partial<PersonalizationToken>) => void;
  removeToken: (tokenId: string) => void;
  updateTokenPosition: (tokenId: string, x: number, y: number) => void;
  updateTokenProperty: (tokenId: string, property: keyof PersonalizationToken, value: any) => void;
  setActiveToken: (tokenId: string | null) => void;
  getActiveToken: () => PersonalizationToken | null;
}

export const usePersonalizationTokens = (
  options: UsePersonalizationTokensOptions = {}
): UsePersonalizationTokensReturn => {
  const { initialTokens = [] } = options;

  const [tokens, setTokens] = useState<PersonalizationToken[]>(initialTokens);
  const [activeToken, setActiveToken] = useState<string | null>(null);

  const addTextToken = useCallback((overrides: Partial<PersonalizationToken> = {}) => {
    const newToken: PersonalizationToken = {
      id: `token-${Date.now()}`,
      type: 'text',
      value: '[FIRSTNAME]',
      placeholder: 'First Name',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#ffffff',
      opacity: 1,
      fontFamily: 'Arial',
      ...overrides
    };

    setTokens(prev => [...prev, newToken]);
    setActiveToken(newToken.id);
  }, []);

  const removeToken = useCallback((tokenId: string) => {
    setTokens(prev => prev.filter(token => token.id !== tokenId));
    setActiveToken(null);
  }, []);

  const updateTokenPosition = useCallback((tokenId: string, x: number, y: number) => {
    setTokens(prev => prev.map(token =>
      token.id === tokenId ? { ...token, x, y } : token
    ));
  }, []);

  const updateTokenProperty = useCallback((tokenId: string, property: keyof PersonalizationToken, value: any) => {
    setTokens(prev => prev.map(token =>
      token.id === tokenId ? { ...token, [property]: value } : token
    ));
  }, []);

  const getActiveToken = useCallback(() => {
    return tokens.find(token => token.id === activeToken) || null;
  }, [tokens, activeToken]);

  return {
    tokens,
    activeToken,
    addTextToken,
    removeToken,
    updateTokenPosition,
    updateTokenProperty,
    setActiveToken,
    getActiveToken
  };
};