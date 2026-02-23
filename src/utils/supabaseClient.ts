import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl.startsWith('http');
};

let supabase: SupabaseClient | null = null;

const initSupabase = () => {
  if (isSupabaseConfigured()) {
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
      return true;
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      return false;
    }
  } else {
    return false;
  }
};

initSupabase();

const EDGE_FUNCTION_TIMEOUT = 60_000;
const MAX_RETRIES = 2;
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

async function callEdgeFunction(functionName: string, payload: any = {}) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data: authData } = await supabase.auth.getSession();
  const token = authData?.session?.access_token;

  if (!token) {
    throw new Error('Authentication required');
  }

  const apiUrl = `${supabaseUrl}/functions/v1/${functionName}`;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), EDGE_FUNCTION_TIMEOUT);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        return await response.json();
      }

      if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }

      const errorText = await response.text();
      let errorMessage: string;
      try {
        errorMessage = JSON.stringify(JSON.parse(errorText));
      } catch {
        errorMessage = errorText;
      }
      throw new Error(`Edge function error: ${response.status} - ${errorMessage}`);
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof DOMException && error.name === 'AbortError') {
        lastError = new Error(`Edge function ${functionName} timed out after ${EDGE_FUNCTION_TIMEOUT / 1000}s`);
      } else {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
      if (attempt < MAX_RETRIES && !(lastError.message.includes('Edge function error'))) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError || new Error(`Edge function ${functionName} failed after retries`);
}

export { supabase, supabaseUrl, isSupabaseConfigured, initSupabase, callEdgeFunction };