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

async function callEdgeFunction(functionName: string, payload: any = {}) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    let token = '';
    try {
      const { data: authData } = await supabase.auth.getSession();
      token = authData?.session?.access_token || '';
    } catch (authError) {
      console.warn('Auth error, continuing with anonymous key:', authError);
    }

    const apiUrl = `${supabaseUrl}/functions/v1/${functionName}`;
    const authHeader = token
      ? `Bearer ${token}`
      : `Bearer ${supabaseAnonKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      try {
        errorMessage = JSON.stringify(JSON.parse(errorText));
      } catch {
        errorMessage = errorText;
      }
      throw new Error(`Edge function error: ${response.status} - ${errorMessage}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling edge function ${functionName}:`, error);
    throw error;
  }
}

export { supabase, supabaseUrl, supabaseAnonKey, isSupabaseConfigured, initSupabase, callEdgeFunction };