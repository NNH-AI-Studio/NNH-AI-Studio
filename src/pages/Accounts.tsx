import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  CheckCircle,
  Clock,
  Plus,
  Loader2,
  FolderX,
  RefreshCw,
  Trash2,
  AlertCircle,
  MapPin,
  XCircle
} from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { GoogleAuthService } from '../services/googleAuthService';
import { supabase } from '../lib/supabase';

function Accounts() {
  const { accounts, loading, refetch } = useAccounts();
  const location = useLocation();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;

      const params = new URLSearchParams(hash);
      const success = params.get('success');
      const error = params.get('error');

      window.history.replaceState({}, document.title, window.location.pathname);

      if (error) {
        setNotification({
          type: 'error',
          message: decodeURIComponent(error)
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      if (success === 'true') {
        setNotification({
          type: 'success',
          message: 'Google account connected successfully!'
        });
        setTimeout(() => setNotification(null), 5000);
        await refetch();
      }
    };

    handleOAuthCallback();
  }, [refetch]);

  // Auto-sync after successful OAuth when navigated with #autosync=true or #success=true
  useEffect(() => {
    const hash = location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const shouldAutoSync = params.get('autosync') === 'true' || params.get('success') === 'true';
    if (!shouldAutoSync || accounts.length === 0 || syncing) return;
    // pick first active account or fallback to first
    const target = accounts.find(a => a.status === 'active') || accounts[0];
    if (target) {
      // clear hash to avoid re-trigger on re-render
      window.history.replaceState({}, document.title, window.location.pathname);
      handleSync(target.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, accounts]);

  const handleConnectGoogle = async () => {
    try {
      await GoogleAuthService.connectGoogleAccount();
    } catch (error) {
      console.error('Failed to connect Google:', error);
      setNotification({
        type: 'error',
        message: 'Failed to connect Google account. Please try again.'
      });
    }
  };

  const handleSync = async (accountId: string) => {
    setSyncing(accountId);
    try {
      const account = accounts.find(a => a.id === accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        throw new Error('No active session. Please log in again.');
      }

      const { data, error } = await supabase.functions.invoke('gmb-sync', {
        body: { accountId, syncType: 'full' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (error) {
        throw new Error(error.message || 'Sync failed');
      }

      // Chain: reviews then insights
      const { data: revData, error: revError } = await supabase.functions.invoke('gmb-sync-reviews', {
        body: { accountId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (revError) {
        throw new Error(revError.message || 'Reviews sync failed');
      }

      const { data: insData, error: insError } = await supabase.functions.invoke('gmb-sync-insights', {
        body: { accountId, days: 30 },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (insError) {
        throw new Error(insError.message || 'Insights sync failed');
      }

      setNotification({
        type: 'success',
        message: `Synced ${data?.locationsCount ?? 0} locations, ${revData?.reviewsUpserted ?? 0} reviews, and ${insData?.insightsUpserted ?? 0} insights`
      });

      await refetch();
    } catch (error) {
      console.error('Sync failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setNotification({
        type: 'error',
        message: `Sync failed: ${errorMessage}`
      });
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) {
      return;
    }

    setDeleting(accountId);
    try {
      const { error } = await supabase
        .from('gmb_accounts')
        .update({ status: 'disconnected' })
        .eq('id', accountId);

      if (error) throw error;

      setNotification({
        type: 'success',
        message: 'Account disconnected successfully'
      });
      await refetch();
    } catch (error) {
      console.error('Failed to disconnect:', error);
      setNotification({
        type: 'error',
        message: 'Failed to disconnect account'
      });
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: {
        icon: CheckCircle,
        label: 'Connected',
        className: 'bg-green-400/20 text-orange-500 border-green-400/30'
      },
      disconnected: {
        icon: AlertCircle,
        label: 'Disconnected',
        className: 'bg-red-400/20 text-orange-500 border-red-400/30'
      },
      pending: {
        icon: Clock,
        label: 'Pending',
        className: 'bg-yellow-400/20 text-orange-500 border-yellow-400/30'
      }
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${badge.className}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg border flex items-center gap-3 ${
              notification.type === 'success'
                ? 'bg-green-400/10 border-green-400/30 text-orange-500'
                : 'bg-red-400/10 border-red-400/30 text-orange-500'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="flex-1">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="text-current hover:opacity-70"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Google Accounts</h1>
          <p className="text-white mt-2">Manage your connected Google My Business accounts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConnectGoogle}
          className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Connect Account
        </motion.button>
      </div>

      {accounts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-black rounded-xl border border-neon-orange shadow-neon-orange"
        >
          <FolderX className="w-16 h-16 text-white/20 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Accounts Connected</h3>
          <p className="text-white mb-6 text-center max-w-md">
            Connect your Google My Business account to start managing your locations and business presence.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConnectGoogle}
            className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Connect First Account
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black rounded-xl p-6 border border-neon-orange shadow-neon-orange hover:border-neon-orange shadow-neon-orange transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-nnh-orange/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{account.account_name}</h3>
                    <p className="text-sm text-white">{(account as any).account_email || account.email}</p>
                  </div>
                </div>
                {getStatusBadge(account.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-nnh-orange/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <p className="text-sm text-white">Locations</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{account.total_locations || 0}</p>
                </div>
                <div className="bg-nnh-orange/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <p className="text-sm text-white">Last Sync</p>
                  </div>
                  <p className="text-sm text-white font-medium">
                    {formatDate(account.last_sync)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleSync(account.id)}
                  disabled={syncing === account.id || account.status !== 'active'}
                  className="flex-1 px-4 py-2 bg-nnh-orange/10 hover:bg-nnh-orange/20 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing === account.id ? 'animate-spin' : ''}`} />
                  {syncing === account.id ? 'Syncing...' : 'Sync Now'}
                </button>

                <button
                  onClick={() => handleDisconnect(account.id)}
                  disabled={deleting === account.id}
                  className="px-4 py-2 bg-red-400/10 hover:bg-red-400/20 text-orange-500 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting === account.id ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default Accounts;
