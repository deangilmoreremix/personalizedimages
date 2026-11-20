/** Text models available through the Responses API. Any other `gpt-*` id is also accepted. */
export type GPTModel = 'gpt-6.2-astra' | 'gpt-6.2-sol' | 'gpt-6.1-terra' | 'gpt-6-luna' | (string & {});

export const GPT_MODELS: { value: GPTModel; label: string }[] = [
  { value: 'gpt-6.2-sol', label: 'GPT-6.2 Sol (everyday, fast)' },
  { value: 'gpt-6.2-astra', label: 'GPT-6.2 Astra (deep reasoning)' },
  { value: 'gpt-6.1-terra', label: 'GPT-6.1 Terra' },
  { value: 'gpt-6-luna', label: 'GPT-6 Luna' },
];
