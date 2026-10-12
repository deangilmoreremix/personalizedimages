export const API_KEY_MISSING_MESSAGE =
  'OpenAI API key not configured. Add your key in Settings → API Keys.';

export const MUAPI_KEY_MISSING_MESSAGE =
  'MuAPI API key not configured. Add your key in Settings → API Keys.';

export function isApiKeyMissingError(error: unknown): boolean {
  if (!error) return false;
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('API key not configured') || message.includes('API Key Not Configured');
}
