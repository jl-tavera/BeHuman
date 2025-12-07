"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent, AuthTokenResponsePassword } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/utils/supabase/client';
import { CompanyService } from '@/lib/company-service';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isCompanyUser: boolean;
  signIn: (email: string, password: string) => Promise<AuthTokenResponsePassword>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompanyUser, setIsCompanyUser] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // Get initial session
    supabase.auth.getSession().then(async ({ data }: { data: { session: Session | null } }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);

      // Check if user is a company user
      if (data.session?.user) {
        const isCompany = await CompanyService.isCompanyUser(data.session.user.id);
        setIsCompanyUser(isCompany);
      } else {
        setIsCompanyUser(false);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Check if user is a company user
        if (session?.user) {
          const isCompany = await CompanyService.isCompanyUser(session.user.id);
          setIsCompanyUser(isCompany);
        } else {
          setIsCompanyUser(false);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseBrowserClient();
    const result = await supabase.auth.signInWithPassword({ email, password });
    return {
      error: result.error,
      data: result.data
    };
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const supabase = getSupabaseBrowserClient();
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    isCompanyUser,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
