import OpenAI from 'openai';

// Get API key from environment
const getApiKey = () => {
  // Try different ways to access the API key
  if (typeof window !== 'undefined' && (window as any).importMeta?.env?.VITE_OPENAI_API_KEY) {
    return (window as any).importMeta.env.VITE_OPENAI_API_KEY;
  }
  // Fallback to direct access
  const env = (import.meta as any).env;
  return env?.VITE_OPENAI_API_KEY || '';
};

export const openai = new OpenAI({
  apiKey: getApiKey(),
  dangerouslyAllowBrowser: true, // Note: In production, API calls should be made from the server
});

export type GPTModel = 'gpt-4o' | 'gpt-4' | 'gpt-3.5-turbo';

export const GPT_MODELS: { value: GPTModel; label: string }[] = [
  { value: 'gpt-4o', label: 'GPT-4o (Latest)' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];