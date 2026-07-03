import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Zap,
  Image,
  Film,
  Hash,
} from 'lucide-react';
import { useUserApiKeys } from '../contexts/UserApiKeyContext';
import { getUserApiKey } from '../utils/userApiKeyStorage';
import { useAuth } from '../auth/AuthContext';
import { userProfileService } from '../services/supabaseService';
import { Loader2 } from 'lucide-react';

interface ProviderConfig {
  provider: ApiKeyProvider;
  label: string;
  description: string;
  icon: React.ReactNode;
  tiers: string[];
  hint: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    provider: 'openai',
    label: 'OpenAI',
    description: 'GPT-4o, DALL-E 3, Whisper',
    icon: <Sparkles className="w-5 h-5" />,
    tiers: ['Pro'],
    hint: 'Enter your OpenAI API key to unlock GPT and DALL-E features.',
  },
  {
    provider: 'gemini',
    label: 'Google Gemini',
    description: 'Image generation and description',
    icon: <Zap className="w-5 h-5" />,
    tiers: ['Free', 'Pro'],
    hint: 'Enter your Google AI Studio API key to use Gemini models.',
  },
  {
    provider: 'gemini-nano',
    label: 'Gemini Nano',
    description: 'On-device personalization studio',
    icon: <Image className="w-5 h-5" />,
    tiers: ['Free', 'Pro'],
    hint: 'Reuses your Gemini key by default.',
  },
  {
    provider: 'leonardo',
    label: 'Leonardo AI',
    description: 'Photorealistic image models',
    icon: <Film className="w-5 h-5" />,
    tiers: ['Pro'],
    hint: 'Enter your Leonardo API key for premium image generation.',
  },
  {
    provider: 'giphy',
    label: 'GIPHY',
    description: 'GIFs and sticker search',
    icon: <Hash className="w-5 h-5" />,
    tiers: ['Free'],
    hint: 'Enter your GIPHY API key to enable GIF search.',
  },
  {
    provider: 'freepik',
    label: 'Freepik',
    description: 'Stock images and vectors',
    icon: <Image className="w-5 h-5" />,
    tiers: ['Free', 'Pro'],
    hint: 'Enter your Freepik API key to access stock media.',
  },
];

const UserApiKeysPage: React.FC = () => {
  const { keys, setKey, removeKey, clearAll, isSaving, saveError, refresh } = useUserApiKeys();
  const { user } = useAuth();
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const values: Record<string, string> = {};
    (Object.keys(keys) as ApiKeyProvider[]).forEach(provider => {
      const value = getUserApiKey(provider);
      if (value) values[provider] = value;
    });
    setLocalValues(values);
  }, [keys]);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingProfile(true);
    userProfileService.getProfile(user.id).then(p => {
      setProfile(p);
      setLoadingProfile(false);
    }).catch(() => setLoadingProfile(false));
  }, [user?.id]);

  const toggleVisibility = (provider: string) => {
    setVisibleKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleInputChange = (provider: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [provider]: value }));
    if (inputErrors[provider]) {
      setInputErrors(prev => ({ ...prev, [provider]: '' }));
    }
  };

  const handleSave = async (provider: string) => {
    const value = localValues[provider] || '';
    if (!value.trim()) {
      await removeKey(provider as ApiKeyProvider);
      return;
    }
    await setKey(provider as ApiKeyProvider, value);
  };

  const handleRemove = async (provider: string) => {
    setLocalValues(prev => ({ ...prev, [provider]: '' }));
    await removeKey(provider as ApiKeyProvider);
  };

  const handleClearAll = async () => {
    if (window.confirm('Remove all your saved API keys? This cannot be undone.')) {
      const empty: Record<string, string> = {};
      PROVIDERS.forEach(p => { empty[p.provider] = ''; });
      setLocalValues(empty);
      await clearAll();
    }
  };

  const userTier = profile?.tier || 'free';
  const isPro = userTier === 'pro' || userTier === 'premium';

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container-custom max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">API Keys</h1>
              <p className="text-gray-600">
                Enter your own API keys to use AI features. Keys are stored securely in your account and used in preference to any pre-configured keys.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refresh}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </motion.div>

        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">{saveError}</p>
          </motion.div>
        )}

        <div className="mb-6 flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
            isPro ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'
          }`}>
            {isPro ? (
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            ) : (
              <ShieldOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isPro ? 'Pro Plan' : 'Free Plan'}
              </p>
              <p className="text-xs text-gray-500">
                {isPro ? 'All features unlocked' : 'Basic features only'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROVIDERS.map(({ provider, label, description, icon, tiers, hint }) => {
            const isVisible = visibleKeys[provider];
            const localValue = localValues[provider] || '';
            const storedValue = keys[provider];
            const isSet = !!storedValue;
            const isFree = tiers.includes('Free');
            const isLocked = !isFree && !isPro;

            return (
              <motion.div
                key={provider}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative bg-white rounded-xl border p-6 shadow-sm transition-all ${
                  isLocked ? 'opacity-75' : ''
                } ${isSet ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-200'}`}
              >
                {isLocked && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
                      Pro
                    </span>
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    isSet ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isSet ? <ShieldCheck className="w-6 h-6" /> : <Key className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                      {isSet && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                    <p className="text-xs text-gray-400 mt-1">{hint}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <input
                      type={isVisible ? 'text' : 'password'}
                      value={localValue}
                      onChange={e => handleInputChange(provider, e.target.value)}
                      placeholder="Enter your API key..."
                      disabled={isLocked}
                      className={`w-full pr-20 pl-4 py-3 rounded-lg border text-sm transition-colors ${
                        isLocked
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          : isSet
                          ? 'border-green-300 bg-green-50/50 focus:ring-2 focus:ring-green-500/20 focus:border-green-500'
                          : 'border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                      }`}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                      {isSet && (
                        <button
                          onClick={() => handleRemove(provider)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Remove key"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      {!isLocked && (
                        <button
                          onClick={() => toggleVisibility(provider)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                          title={isVisible ? 'Hide key' : 'Show key'}
                        >
                          {isVisible ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {isLocked && (
                    <p className="text-xs text-purple-600 font-medium">
                      Available on Pro plan
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isSet ? (
                        <span className="inline-flex items-center text-xs text-green-600 font-medium">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Key configured
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-gray-400 font-medium">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Not configured
                        </span>
                      )}
                    </div>
                    {!isLocked && (
                      <button
                        onClick={() => handleSave(provider)}
                        disabled={isSaving}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>{isSaving ? 'Saving...' : 'Save'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {inputErrors[provider] && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-2 text-xs text-red-600 flex items-center"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {inputErrors[provider]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                About Your API Keys
              </h3>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Keys you enter here are stored in your account and take priority over environment keys.</li>
                <li>Keys are sent directly from your browser to the AI provider - we never receive your raw keys.</li>
                <li>You are responsible for any costs incurred through your API keys.</li>
                <li>Sign out or remove a key to stop using it.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserApiKeysPage;
