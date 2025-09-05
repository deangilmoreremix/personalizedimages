import { supabase, isSupabaseConfigured } from './supabaseClient';

// Debug flags to control debugging behavior
const DEBUG_CONFIG = {
  // Set to true to enable verbose logging of edge function calls
  VERBOSE_LOGGING: true,
  // Set to true to force using edge functions (disable fallback)
  FORCE_EDGE_FUNCTIONS: false,
  // Set to true to force direct API calls (bypass edge functions)
  FORCE_DIRECT_API: false
};

interface EdgeFunctionDebugOptions {
  functionName: string;
  payload: any;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onFallback?: () => void;
}

/**
 * Tests an Edge Function call with detailed logging
 */
export async function testEdgeFunction({
  functionName,
  payload,
  onSuccess,
  onError,
  onFallback
}: EdgeFunctionDebugOptions): Promise<any> {
  console.group(`🧪 Testing Edge Function: ${functionName}`);
  console.log(`📥 Payload:`, payload);

  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured() || DEBUG_CONFIG.FORCE_DIRECT_API) {
      if (DEBUG_CONFIG.FORCE_DIRECT_API) {
        console.warn('❗ Forced direct API mode - bypassing edge function');
      } else {
        console.warn('❗ Supabase not properly configured - bypassing edge function');
      }
      onFallback?.();
      console.groupEnd();
      return { _skipEdgeFunction: true, _reason: 'Forced direct API or Supabase not configured' };
    }

    if (!supabase) {
      console.error('❌ Supabase client is not initialized');
      onFallback?.();
      console.groupEnd();
      return { _skipEdgeFunction: true, _reason: 'Supabase client not initialized' };
    }

    console.log(`🔄 Calling edge function: ${functionName}`);
    console.time(`⏱️ ${functionName} response time`);

    // Get the JWT token for the current user if available
    let token = '';
    try {
      const { data: authData } = await supabase.auth.getSession();
      token = authData.session?.access_token || '';
      console.log(`🔑 Authentication: ${token ? 'User token available' : 'Using anonymous key'}`);
    } catch (authError) {
      console.warn(`⚠️ Auth error, continuing with anonymous key:`, authError);
    }

    // Construct the API URL
    const apiUrl = `${supabase.supabaseUrl}/functions/v1/${functionName}`;
    console.log(`🔗 Edge function URL: ${apiUrl}`);

    // Make the request with authorization header
    const authHeader = token 
      ? `Bearer ${token}` 
      : `Bearer ${supabase.supabaseKey}`;

    const startTime = performance.now();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'X-Debug-Mode': 'true',
        'X-Request-ID': `debug_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      },
      body: JSON.stringify(payload)
    });
    const endTime = performance.now();
    console.log(`⏱️ Network time: ${(endTime - startTime).toFixed(2)}ms`);
    console.timeEnd(`⏱️ ${functionName} response time`);

    // Log response status
    console.log(`📊 Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
    
    if (!response.ok) {
      let errorMessage = `Error calling ${functionName}: ${response.status}`;
      let errorData;
      
      try {
        errorData = await response.json();
        console.error(`❌ Edge function error:`, errorData);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If it's not JSON, get the error text
        const errorText = await response.text();
        console.error(`❌ Edge function error text:`, errorText);
        errorMessage = errorText || errorMessage;
      }
      
      const error = new Error(errorMessage);
      onError?.(error);
      console.groupEnd();
      throw error;
    }

    // Parse the response
    const responseData = await response.json();
    console.log(`✅ Edge function response:`, responseData);
    onSuccess?.(responseData);
    console.groupEnd();
    return responseData;
  } catch (error) {
    console.error(`❌ Error testing edge function ${functionName}:`, error);
    onError?.(error);
    console.groupEnd();
    
    // Return error response
    return { 
      _skipEdgeFunction: true, 
      _reason: `Error: ${error.message}`,
      error: error.message 
    };
  }
}

/**
 * Checks if all required edge functions are accessible and working
 */
export async function checkEdgeFunctionStatus(): Promise<Record<string, boolean>> {
  console.log('🔍 Checking edge function status...');
  
  const functions = [
    'health-check',
    'action-figure',
    'assistant-stream',
    'crazy-image',
    'ghibli-image',
    'image-generation',
    'meme-generator',
    'prompt-recommendations',
    'reference-image'
  ];
  
  const results: Record<string, boolean> = {};
  
  // First check health-check function
  try {
    if (!supabase) {
      console.warn('⚠️ Supabase client not initialized, skipping edge function check');
      return functions.reduce((acc, func) => ({ ...acc, [func]: false }), {});
    }
    
    const healthCheckUrl = `${supabase.supabaseUrl}/functions/v1/health-check`;
    console.log(`🔍 Testing health-check at: ${healthCheckUrl}`);
    
    const response = await fetch(healthCheckUrl, {
      headers: {
        'Authorization': `Bearer ${supabase.supabaseKey}`,
      }
    });
    
    if (!response.ok) {
      console.error(`❌ Health check failed: ${response.status}`);
      return functions.reduce((acc, func) => ({ ...acc, [func]: false }), {});
    }
    
    const data = await response.json();
    console.log('✅ Health check result:', data);
    results['health-check'] = true;
    
    // Check if required API keys are set
    if (data && data.envVars) {
      console.log('🔑 API key status:');
      Object.entries(data.envVars).forEach(([key, value]) => {
        console.log(`   ${key}: ${value ? '✅ Set' : '❌ Missing'}`);
      });
    }
  } catch (error) {
    console.error('❌ Health check error:', error);
    results['health-check'] = false;
    return functions.reduce((acc, func) => ({ ...acc, [func]: false }), {});
  }
  
  // Do basic accessibility check for other functions
  for (const func of functions) {
    if (func === 'health-check') continue; // Already checked
    
    try {
      const optionsResponse = await fetch(`${supabase.supabaseUrl}/functions/v1/${func}`, {
        method: 'OPTIONS'
      });
      
      // OPTIONS should respond with 204 No Content for properly configured CORS
      results[func] = optionsResponse.status === 204;
      console.log(`${results[func] ? '✅' : '❌'} ${func}: ${optionsResponse.status}`);
    } catch (error) {
      console.error(`❌ Error checking ${func}:`, error);
      results[func] = false;
    }
  }
  
  console.log('📊 Edge function status check complete:', results);
  
  return results;
}

/**
 * Logs extra information about the environment to help with debugging
 */
export function logEdgeFunctionDebugInfo() {
  console.group('🔍 Edge Function Environment Info');
  
  // Log Supabase config
  console.log('🔵 Supabase Configuration:');
  console.log(`   URL configured: ${!!import.meta.env.VITE_SUPABASE_URL}`);
  console.log(`   ANON key configured: ${!!import.meta.env.VITE_SUPABASE_ANON_KEY}`);
  console.log(`   Supabase client initialized: ${!!supabase}`);
  
  // Log API keys
  console.log('🔑 API Keys:');
  console.log(`   OpenAI API key configured: ${!!import.meta.env.VITE_OPENAI_API_KEY}`);
  console.log(`   Gemini API key configured: ${!!import.meta.env.VITE_GEMINI_API_KEY}`);
  
  // Log environment info
  console.log('🌐 Environment:');
  console.log(`   Development mode: ${import.meta.env.DEV ? 'Yes' : 'No'}`);
  console.log(`   Base URL: ${import.meta.env.BASE_URL}`);
  console.log(`   User Agent: ${navigator.userAgent}`);
  console.log(`   WebContainer: ${window.location.hostname.includes('webcontainer') ? 'Yes' : 'No'}`);
  
  console.groupEnd();
}