import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, initSupabase } from '../utils/supabaseClient';
import { Session, User, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  supabaseInitialized: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (data: any) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  supabaseInitialized: false,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
});

const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseInitialized, setIsSupabaseInitialized] = useState(false);

  // Initialize Supabase once when component mounts
  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        // Initialize Supabase client
        const initialized = initSupabase();
        console.log('Supabase initialization:', initialized ? 'successful' : 'failed');
        setIsSupabaseInitialized(initialized);
        
        if (initialized) {
          // Only attempt to get the session if Supabase is initialized
          await getInitialSession();
        } else {
          // If initialization failed, stop loading
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing Supabase:', error);
        setIsSupabaseInitialized(false);
        setLoading(false);
      }
    };

    // Function to get initial session
    const getInitialSession = async () => {
      try {
        if (!supabase) {
          console.error('Supabase client not initialized');
          setLoading(false);
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSupabase();
  }, []);

  // Set up auth state change listener when Supabase is initialized
  useEffect(() => {
    if (!isSupabaseInitialized || !supabase) {
      return;
    }

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state change:", _event, session?.user?.id);
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [isSupabaseInitialized]);

  // Fetch user profile from the database
  const fetchProfile = async (userId: string) => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }
      
      console.log("Fetching profile for user:", userId);
      
      // First try to get from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.log("Error fetching from profiles:", profileError);
        
        // If not found in profiles, try users table
        if (profileError.code === 'PGRST116') {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (userError) {
            console.error('Error fetching user data:', userError);
            
            // If profile doesn't exist yet, wait and retry once
            if (userError.code === 'PGRST116') {
              console.log("Profile not found, retrying in 1 second...");
              setTimeout(() => fetchProfile(userId), 1000);
            }
            return;
          }
          
          console.log("User data fetched successfully:", userData);
          setProfile(userData);
          return;
        }
      }
      
      console.log("Profile fetched successfully:", profileData);
      setProfile(profileData);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  // Sign up a new user
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      if (!supabase || !isSupabaseInitialized) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      return { error };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { error: error as AuthError };
    }
  };

  // Sign in a user
  const signIn = async (email: string, password: string) => {
    try {
      if (!supabase || !isSupabaseInitialized) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { error: error as AuthError };
    }
  };

  // Sign out a user
  const signOut = async () => {
    try {
      if (!supabase || !isSupabaseInitialized) {
        throw new Error('Supabase client not initialized');
      }
      
      await supabase.auth.signOut();
      setProfile(null);
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      if (!supabase || !isSupabaseInitialized) {
        throw new Error('Supabase client not initialized');
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      return { error };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return { error: error as AuthError };
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      if (!supabase || !isSupabaseInitialized) {
        throw new Error('Supabase client not initialized');
      }
      
      const { error } = await supabase.auth.updateUser({ password });
      
      return { error };
    } catch (error) {
      console.error('Error in updatePassword:', error);
      return { error: error as AuthError };
    }
  };

  // Update profile
  const updateProfile = async (data: any) => {
    try {
      if (!supabase || !isSupabaseInitialized || !user) {
        throw new Error('Supabase client not initialized or user not logged in');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
        
      if (!error) {
        // Refresh profile data
        await fetchProfile(user.id);
      }
      
      return { error };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { error };
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    supabaseInitialized: isSupabaseInitialized,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};