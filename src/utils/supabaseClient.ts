import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate environment variables
const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl.startsWith('http');
};

// Create a singleton instance of the Supabase client if properly configured
let supabase = null;

// Initialize Supabase client
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
    console.warn('Supabase URL or Anon Key is missing or invalid. Check your environment variables.');
    return false;
  }
};

// Initialize on module import
initSupabase();

// Check if running in WebContainer environment
const isWebContainerEnvironment = () => {
  return false; // Always return false to ensure we don't use fallbacks
};

/**
 * Call a Supabase Edge Function
 * @param functionName The name of the function to call
 * @param payload The payload to send to the function
 * @returns The response from the function
 */
async function callEdgeFunction(functionName: string, payload: any = {}) {
  if (!supabase) {
    console.warn('Supabase client not initialized, cannot call edge function');
    throw new Error('Supabase client not initialized');
  }

  try {
    // Get the JWT token for the current user if available
    let token = '';
    try {
      const { data: authData } = await supabase.auth.getSession();
      token = authData.session?.access_token || '';
    } catch (authError) {
      console.warn('Auth error, continuing with anonymous key:', authError);
    }

    // Construct the API URL
    const apiUrl = `${supabase.supabaseUrl}/functions/v1/${functionName}`;

    // Make the request with authorization header
    const authHeader = token 
      ? `Bearer ${token}` 
      : `Bearer ${supabase.supabaseKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    });

    // For improved error reporting
    if (!response.ok) {
      let errorText;
      let errorObj;
      
      try {
        // Try to parse as JSON first
        errorObj = await response.json();
        errorText = JSON.stringify(errorObj);
      } catch (e) {
        // If not JSON, get as text
        errorText = await response.text();
      }
      
      throw new Error(`Edge function error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling edge function ${functionName}:`, error);
    throw error;
  }
}

export { supabase, isSupabaseConfigured, initSupabase, callEdgeFunction,  };