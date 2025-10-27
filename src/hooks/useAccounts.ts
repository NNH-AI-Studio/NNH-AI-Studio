import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface GmbAccount {
  id: string;
  user_id: string;
  account_name: string;
  email?: string;
  account_id?: string;
  google_account_id?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  token_expires_at?: string | null;
  status: string;
  last_sync?: string | null;
  created_at: string;
  updated_at?: string;
  total_locations?: number;
  oauth_token_expires_at?: string | null;
}

export function useAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<GmbAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('gmb_accounts')
        .select('id,user_id,account_name,account_id,is_active,created_at,updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const accountsWithLocations = await Promise.all(
        (data || []).map(async (account) => {
          const { count } = await supabase
            .from('gmb_locations')
            .select('*', { count: 'exact', head: true })
            .eq('gmb_account_id', account.id);

          const isActive = (account as any).is_active;
          const derivedStatus = (account as any).status ?? (isActive === false ? 'disconnected' : 'active');
          return {
            ...account,
            status: derivedStatus,
            last_sync: (account as any).last_sync ?? null,
            total_locations: count || 0,
          } as GmbAccount;
        })
      );

      setAccounts(accountsWithLocations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const createAccount = async (accountData: {
    account_name: string;
    email: string;
    google_account_id: string;
    access_token: string;
    refresh_token?: string;
    token_expires_at: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('gmb_accounts')
      .insert({
        user_id: user.id,
        status: 'active',
        ...accountData,
      })
      .select()
      .single();

    if (error) throw error;

    await fetchAccounts();
    return data;
  };

  const updateAccount = async (
    accountId: string,
    updates: Partial<GmbAccount>
  ) => {
    const { error } = await supabase
      .from('gmb_accounts')
      .update(updates)
      .eq('id', accountId);

    if (error) throw error;

    await fetchAccounts();
  };

  const deleteAccount = async (accountId: string) => {
    const { error } = await supabase
      .from('gmb_accounts')
      .delete()
      .eq('id', accountId);

    if (error) throw error;

    await fetchAccounts();
  };

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}
