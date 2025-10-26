import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // 1. جلب الجلسة الحالية فوراً
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        syncProfile(session.user);
      }
      setLoading(false);
    });

    // 2. الاستماع لأي تغييرات في حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          syncProfile(session.user);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const syncProfile = async (u: User) => {
    const fullName = (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || null;
    const avatarUrl = (u.user_metadata?.avatar_url as string) || (u.user_metadata?.picture as string) || null;
    const email = u.email || '';
    try {
      await supabase.from('profiles').upsert({
        id: u.id,
        email,
        full_name: fullName,
        avatar_url: avatarUrl,
      });
    } catch (e) {
      console.error('Profile sync failed', e);
    }
  };

  // *** هذا هو الإصلاح الرئيسي ***
  // يقوم بإنشاء رابط العودة بشكل ديناميكي
  const getRedirectUrl = () => {
    // window.location.origin يعطي http://localhost:5173 على جهازك
    // ويعطي https://www.nnh.ae على الموقع الرسمي
    const origin = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
    return `${origin}/auth/callback`;
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // استخدام الرابط الديناميكي بدلاً من الثابت
          redirectTo: getRedirectUrl(),
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      if (error) {
        console.error('Error signing in with Google:', error.message);
        throw error;
      }
    } catch (error) {
      console.error('Error in signInWithGoogle:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error.message);
        return { error };
      }
      setSession(null);
      setUser(null);
      return { error: null };
    } catch (error: any) {
      console.error('Error in signOut:', error);
      return { error };
    }
  };

  const value = {
    session,
    user,
    loading,
    signInWithGoogle,
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