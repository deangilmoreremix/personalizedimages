import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { resolveTokens, type TokenResolutionResult } from '../utils/tokenResolver';

interface PersonalizationContextType {
  tokens: Record<string, string>;
  updateToken: (key: string, value: string) => void;
  updateTokens: (updates: Record<string, string>) => void;
  resetTokens: () => void;
  resolvePrompt: (prompt: string) => TokenResolutionResult;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}

const DEFAULT_TOKENS: Record<string, string> = {
  FIRSTNAME: 'John',
  LASTNAME: 'Doe',
  COMPANY: 'Acme Corp',
  EMAIL: 'john@acme.com',
  CHARACTER_NAME: 'Alex',
  STYLE: 'heroic',
  POSE: 'action',
  ENVIRONMENT: 'urban',
};

const PersonalizationContext = createContext<PersonalizationContextType>({
  tokens: DEFAULT_TOKENS,
  updateToken: () => {},
  updateTokens: () => {},
  resetTokens: () => {},
  resolvePrompt: (prompt: string) => ({
    resolvedContent: prompt,
    resolvedTokens: [],
    missingTokens: [],
    invalidTokens: [],
    warnings: [],
  }),
  isLoading: false,
  isSaving: false,
  lastSaved: null,
});

export const usePersonalization = () => useContext(PersonalizationContext);

export const PersonalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<Record<string, string>>(DEFAULT_TOKENS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTokensRef = useRef<Record<string, string> | null>(null);

  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured() || !supabase) return;

    const loadTokens = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('personalization_tokens')
          .select('token_key, token_value')
          .eq('user_id', user.id);

        if (error) {
          console.error('Failed to load tokens:', error);
          return;
        }

        if (data && data.length > 0) {
          const loaded: Record<string, string> = { ...DEFAULT_TOKENS };
          data.forEach((row: { token_key: string; token_value: string }) => {
            loaded[row.token_key] = row.token_value;
          });
          setTokens(loaded);
        }
      } catch (err) {
        console.error('Error loading tokens:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, [user?.id]);

  const persistTokens = useCallback(async (tokensToSave: Record<string, string>) => {
    if (!user?.id || !isSupabaseConfigured() || !supabase) return;

    setIsSaving(true);
    try {
      const rows = Object.entries(tokensToSave).map(([token_key, token_value]) => ({
        user_id: user.id,
        token_key,
        token_value,
        category: 'general',
      }));

      const { error } = await supabase
        .from('personalization_tokens')
        .upsert(rows, { onConflict: 'user_id,token_key' });

      if (error) {
        console.error('Failed to persist tokens:', error);
      } else {
        setLastSaved(new Date());
      }
    } catch (err) {
      console.error('Error persisting tokens:', err);
    } finally {
      setIsSaving(false);
    }
  }, [user?.id]);

  const scheduleSave = useCallback((newTokens: Record<string, string>) => {
    pendingTokensRef.current = newTokens;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      if (pendingTokensRef.current) {
        persistTokens(pendingTokensRef.current);
        pendingTokensRef.current = null;
      }
    }, 1500);
  }, [persistTokens]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const updateToken = useCallback((key: string, value: string) => {
    setTokens(prev => {
      const next = { ...prev, [key]: value };
      scheduleSave(next);
      return next;
    });
  }, [scheduleSave]);

  const updateTokens = useCallback((updates: Record<string, string>) => {
    setTokens(prev => {
      const next = { ...prev, ...updates };
      scheduleSave(next);
      return next;
    });
  }, [scheduleSave]);

  const resetTokens = useCallback(() => {
    setTokens(DEFAULT_TOKENS);
    scheduleSave(DEFAULT_TOKENS);
  }, [scheduleSave]);

  const resolvePrompt = useCallback((prompt: string): TokenResolutionResult => {
    return resolveTokens(prompt, tokens);
  }, [tokens]);

  return (
    <PersonalizationContext.Provider
      value={{
        tokens,
        updateToken,
        updateTokens,
        resetTokens,
        resolvePrompt,
        isLoading,
        isSaving,
        lastSaved,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
};
