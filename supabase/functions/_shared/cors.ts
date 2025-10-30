export const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGINS') || 'https://localhost:3000',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Helper function to validate API keys
export function validateApiKey(key: string | undefined, service: string): boolean {
  if (!key || key.length < 10) return false;

  switch (service) {
    case 'openai':
      return key.startsWith('sk-');
    case 'gemini':
      return key.startsWith('AIza');
    case 'stripe':
      return key.startsWith('sk_');
    default:
      return false;
  }
}

// Helper function to sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

// Helper function to validate URL
export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}