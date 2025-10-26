import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars');
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      gmb_accounts: {
        Row: {
          id: string;
          user_id: string;
          account_name: string;
          account_email: string;
          account_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_name: string;
          account_email: string;
          account_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_name?: string;
          account_email?: string;
          account_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      gmb_locations: {
        Row: {
          id: string;
          gmb_account_id: string;
          location_name: string;
          location_id: string;
          address: string | null;
          phone: string | null;
          category: string | null;
          website: string | null;
          is_active: boolean;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gmb_account_id: string;
          location_name: string;
          location_id: string;
          address?: string | null;
          phone?: string | null;
          category?: string | null;
          website?: string | null;
          is_active?: boolean;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gmb_account_id?: string;
          location_name?: string;
          location_id?: string;
          address?: string | null;
          phone?: string | null;
          category?: string | null;
          website?: string | null;
          is_active?: boolean;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      oauth_tokens: {
        Row: {
          id: string;
          user_id: string;
          account_id: string | null;
          provider: string;
          access_token: string;
          refresh_token: string | null;
          expires_at: string | null;
          scope: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id?: string | null;
          provider: string;
          access_token: string;
          refresh_token?: string | null;
          expires_at?: string | null;
          scope?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string | null;
          provider?: string;
          access_token?: string;
          refresh_token?: string | null;
          expires_at?: string | null;
          scope?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};