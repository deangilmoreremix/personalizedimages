import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  getUserApiKey,
  setUserApiKey,
  removeUserApiKey,
  hasUserApiKey,
  getUserApiKeyStatuses,
  validateUserApiKey,
  clearAllUserApiKeys,
  type ApiKeyProvider,
  type ApiKeyStatus,
} from '../utils/userApiKeyStorage';
import { tokenService } from '../services/supabaseService';

interface UserApiKeyContextType {
  keys: Record<ApiKeyProvider, string | null>;
  statuses: ApiKeyStatus[];
  setKey: (provider: ApiKeyProvider, key: string) => Promise<void>;
  removeKey: (provider: ApiKeyProvider) => Promise<void>;
  clearAll: () => Promise<void>;
  isSaving: boolean;
  saveError: string | null;
  refresh: () => void;
}

const UserApiKeyContext = createContext<UserApiKeyContextType>({
  keys: {
    openai: null,
    gemini: null,
    'gemini-nano': null,
    leonardo: null,
    giphy: null,
    freepik: null,
  },
  statuses: [],
  setKey: async () => {},
  removeKey: async () => {},
  clearAll: async () => {},
  isSaving: false,
  saveError: null,
  refresh: () => {},
});

export const useUserApiKeys = () => useContext(UserApiKeyContext);

const PROVIDERS: ApiKeyProvider[] = [
  'openai',
  'gemini',
  'gemini-nano',
  'leonardo',
  'giphy',
  'freepik',
];

export const UserApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [keys, setKeys] = useState<Record<ApiKeyProvider, string | null>>(() => {
    const initial: Record<ApiKeyProvider, string | null> = {
      openai: null,
      gemini: null,
      'gemini-nano': null,
      leonardo: null,
      giphy: null,
      freepik: null,
    };
    PROVIDERS.forEach(provider => {
      const value = getUserApiKey(provider);
      if (value) initial[provider] = value;
    });
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const fresh: Record<ApiKeyProvider, string | null> = {
      openai: null,
      gemini: null,
      'gemini-nano': null,
      leonardo: null,
      giphy: null,
      freepik: null,
    };
    PROVIDERS.forEach(provider => {
      const value = getUserApiKey(provider);
      if (value) fresh[provider] = value;
    });
    setKeys(fresh);
  }, []);

  const syncToSupabase = useCallback(
    async (provider: ApiKeyProvider, value: string | null) => {
      if (!user?.id) return;

      try {
        if (value) {
          await tokenService.saveToken({
            user_id: user.id,
            token_key: `api_key_${provider}`,
            token_value: value,
            category: 'api_key',
          });
        } else {
          const existing = await tokenService.getTokenByKey(
            user.id,
            `api_key_${provider}`
          );
          if (existing?.id) {
            await tokenService.deleteToken(existing.id);
          }
        }
      } catch {
        console.warn(`Failed to sync API key for ${provider} to Supabase`);
      }
    },
    [user?.id]
  );

  const setKey = useCallback(
    async (provider: ApiKeyProvider, key: string) => {
      setIsSaving(true);
      setSaveError(null);

      const trimmed = key.trim();
      const validation = validateUserApiKey(provider, trimmed);
      if (!validation.valid) {
        setSaveError(validation.message || 'Invalid API key');
        setIsSaving(false);
        return;
      }

      setUserApiKey(provider, trimmed);
      setKeys(prev => ({ ...prev, [provider]: trimmed }));

      try {
        await syncToSupabase(provider, trimmed);
      } catch {
        const message = `Failed to save ${provider} key to cloud. Saved locally.`;
        setSaveError(message);
      } finally {
        setIsSaving(false);
      }
    },
    [syncToSupabase]
  );

  const removeKey = useCallback(
    async (provider: ApiKeyProvider) => {
      setIsSaving(true);
      setSaveError(null);

      removeUserApiKey(provider);
      setKeys(prev => ({ ...prev, [provider]: null }));

      try {
        await syncToSupabase(provider, null);
      } catch {
        const message = `Failed to remove ${provider} key from cloud. Removed locally.`;
        setSaveError(message);
      } finally {
        setIsSaving(false);
      }
    },
    [syncToSupabase]
  );

  const clearAll = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);

    clearAllUserApiKeys();
    const empty: Record<ApiKeyProvider, string | null> = {
      openai: null,
      gemini: null,
      'gemini-nano': null,
      leonardo: null,
      giphy: null,
      freepik: null,
    };
    setKeys(empty);

    if (user?.id) {
      try {
        await tokenService.getUserTokens(user.id).then(async tokens => {
          const apiKeyTokens = tokens.filter(t => t.category === 'api_key');
          for (const token of apiKeyTokens) {
            await tokenService.deleteToken(token.id);
          }
        });
      } catch {
        setSaveError('Failed to clear keys from cloud. Cleared locally.');
      }
    }

    setIsSaving(false);
  }, [user?.id]);

  const statuses = getUserApiKeyStatuses();

  return (
    <UserApiKeyContext.Provider
      value={{
        keys,
        statuses,
        setKey,
        removeKey,
        clearAll,
        isSaving,
        saveError,
        refresh,
      }}
    >
      {children}
    </UserApiKeyContext.Provider>
  );
};
