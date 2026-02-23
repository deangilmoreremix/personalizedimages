export type GPTModel = 'gpt-4o' | 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4o-mini';

export const GPT_MODELS: { value: GPTModel; label: string }[] = [
  { value: 'gpt-4o', label: 'GPT-4o (Latest)' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];
