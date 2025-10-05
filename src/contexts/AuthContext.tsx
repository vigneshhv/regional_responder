import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isDemoMode } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileCreated, setProfileCreated] = useState<Set<string>>(new Set());

  const ensureUserProfile = async (user: User) => {
    // Prevent multiple profile creation attempts for the same user
    if (profileCreated.has(user.id)) {
      return;
    }

    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking user profile:', fetchError);
        setProfileCreated(prev => new Set(prev).add(user.id));
        return;
      }

      // Create profile if it doesn't exist
      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || '',
            phone: user.user_metadata?.phone || '',
            medical_info: ''
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        }
      }
      
      // Mark profile as processed (either existed or created)
      setProfileCreated(prev => new Set(prev).add(user.id));
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      setProfileCreated(prev => new Set(prev).add(user.id));
    }
  };
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (session?.user) {
          await ensureUserProfile(session.user);
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error getting session:', error);
        setUser(null);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await ensureUserProfile(session.user);
          setUser(session.user);
        } else {
          setUser(null);
        }
        if (loading) {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      if (isDemoMode) {
        // In demo mode, simulate the signup process
        console.log('Demo mode: Simulating signup for', email);
        return { needsConfirmation: true };
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      
      return { needsConfirmation: true };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (isDemoMode) {
        // In demo mode, simulate successful signin after "email confirmation"
        console.log('Demo mode: Simulating signin for', email);
        setUser({ id: 'demo-user', email } as any);
        setLoading(false);
        return;
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Signout error:', error);
    }
    setUser(null);
    setProfileCreated(new Set());
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};