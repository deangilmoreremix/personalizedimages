import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current session
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

    getInitialSession();

    // Listen for auth changes
    if (supabase) {
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
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

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

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }
      
      await supabase.auth.signOut();
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};