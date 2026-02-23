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

export { useAuth };
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseInitialized, setIsSupabaseInitialized] = useState(false);

  useEffect(() => {
    const initialized = initSupabase();
    setIsSupabaseInitialized(initialized);

    if (!initialized || !supabase) {
      setLoading(false);
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        const userId = session.user.id;
        (async () => {
          await fetchProfile(userId);
          setLoading(false);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch user profile from the database
  const fetchProfile = async (userId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
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
    } catch (error) {
      console.error('Error in signOut:', error);
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
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
        .from('user_profiles')
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