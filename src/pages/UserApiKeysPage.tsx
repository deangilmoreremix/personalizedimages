import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Save,
  Trash2,
  Shield,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Film,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useUserApiKeys } from '../contexts/UserApiKeyContext';
import type { ApiKeyProvider } from '../utils/userApiKeyStorage';

interface ProviderConfig {
  provider: ApiKeyProvider;
  label: string;
  description: string;
  icon: React.ReactNode;
  keyPrefix: string;
  placeholder: string;
  hint: string;
  docsUrl: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    provider: 'openai',
    label: 'OpenAI API Key',
    description: 'Responses API and GPT Image 2.5 - images, editing, assistant',
    icon: <Sparkles className="w-5 h-5" />,
    keyPrefix: 'sk-',
    placeholder: 'sk-...',
    hint: 'Create a key at platform.openai.com/api-keys. Used for image generation, editing, descriptions and the AI assistant.',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    provider: 'muapi',
    label: 'MuAPI API Key',
    description: 'Image-to-video generation',
    icon: <Film className="w-5 h-5" />,
    keyPrefix: '',
    placeholder: 'Enter your MuAPI API key',
    hint: 'Create a key in your MuAPI dashboard. Used only for image-to-video conversion.',
    docsUrl: 'https://muapi.ai/dashboard',
  },
];

function maskKey(value: string): string {
  if (!value) return '';
  if (value.length <= 8) return '•'.repeat(value.length);
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

const UserApiKeysPage: React.FC = () => {
  const { keys, setKey, removeKey, clearAll, isSaving, saveError, refresh } = useUserApiKeys();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Record<string, 'idle' | 'saved' | 'removed' | 'invalid'>>({});

  useEffect(() => {
    const values: Record<string, string> = {};
    (Object.keys(keys) as ApiKeyProvider[]).forEach(provider => {
      if (keys[provider]) values[provider] = '';
    });
    setLocalValues(values);
  }, [keys]);

  const handleInputChange = (provider: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [provider]: value }));
    setStatus(prev => ({ ...prev, [provider]: 'idle' }));
  };

  const handleSave = async (config: ProviderConfig) => {
    const value = (localValues[config.provider] || '').trim();

    if (!value) {
      await handleRemove(config);
      return;
    }

    if (config.keyPrefix && !value.startsWith(config.keyPrefix)) {
      setStatus(prev => ({ ...prev, [config.provider]: 'invalid' }));
      return;
    }

    await setKey(config.provider, value);
    setLocalValues(prev => ({ ...prev, [config.provider]: '' }));
    setStatus(prev => ({ ...prev, [config.provider]: 'saved' }));
  };

  const handleRemove = async (config: ProviderConfig) => {
    await removeKey(config.provider);
    setLocalValues(prev => ({ ...prev, [config.provider]: '' }));
    setStatus(prev => ({ ...prev, [config.provider]: 'removed' }));
  };

  const handleClearAll = async () => {
    if (window.confirm('Remove both saved API keys? This cannot be undone.')) {
      const empty: Record<string, string> = {};
      PROVIDERS.forEach(p => { empty[p.provider] = ''; });
      setLocalValues(empty);
      await clearAll();
      setStatus({});
    }
  };

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
                PersonalizedImages is bring-your-own-key. Add your own OpenAI and MuAPI keys below - every
                generation runs on the provider account you connect and is billed by that provider.
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROVIDERS.map(({ provider, label, description, icon, keyPrefix, placeholder, hint, docsUrl }) => {
            const localValue = localValues[provider] || '';
            const storedKey = keys[provider];
            const isSet = !!storedKey;
            const providerStatus = status[provider] || 'idle';

            return (
              <motion.div
                key={provider}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative bg-white rounded-xl border p-6 shadow-sm transition-all ${
                  isSet ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    isSet ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isSet ? <ShieldCheck className="w-6 h-6" /> : <Key className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                      {isSet && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                    <div className="flex items-center space-x-1 mt-1 text-xs text-gray-400">
                      {icon}
                      <span>{hint}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {isSet && (
                    <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
                      <span className="text-xs font-medium text-gray-500">Saved key</span>
                      <code className="text-sm text-gray-700 tracking-wide">{maskKey(storedKey as string)}</code>
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="password"
                      value={localValue}
                      onChange={e => handleInputChange(provider, e.target.value)}
                      placeholder={isSet ? 'Enter a new key to replace...' : placeholder}
                      className={`w-full pr-10 pl-4 py-3 rounded-lg border text-sm transition-colors ${
                        isSet
                          ? 'border-green-300 bg-green-50/50 focus:ring-2 focus:ring-green-500/20 focus:border-green-500'
                          : 'border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                      }`}
                    />
                    {isSet && (
                      <button
                        onClick={() => handleRemove({ provider, label, description, icon, keyPrefix, placeholder, hint, docsUrl })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Remove key"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {providerStatus === 'invalid' && (
                    <p className="text-xs text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {keyPrefix
                        ? `A valid ${label.replace(' API Key', '')} key starts with "${keyPrefix}".`
                        : 'A valid key is required.'}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isSet ? (
                        <span className="inline-flex items-center text-xs text-green-600 font-medium">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Configured
                        </span>
                      ) : providerStatus === 'removed' ? (
                        <span className="inline-flex items-center text-xs text-gray-500 font-medium">
                          <XCircle className="w-3 h-3 mr-1" />
                          Removed
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-amber-600 font-medium">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Missing
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span>Get key</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleSave({ provider, label, description, icon, keyPrefix, placeholder, hint, docsUrl })}
                        disabled={isSaving || !localValue.trim()}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>{isSaving ? 'Saving...' : isSet ? 'Replace' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                </div>
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
                <li>Your keys are scoped to your account and are never shared with other users.</li>
                <li>Keys are sent only to the provider that needs them - we never receive your raw keys.</li>
                <li>Each provider bills you directly for what you use. There are no app credits or subscriptions.</li>
                <li>Saved keys are shown masked; the full value is never displayed.</li>
                <li>Remove a key at any time to stop using it.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserApiKeysPage;
