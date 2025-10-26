import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Bell, Palette, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

function Settings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    avatarUrl: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    reviewAlerts: true,
    weeklyReports: true,
    marketingEmails: false
  });

  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          fullName: data.full_name || '',
          email: data.email || user.email || '',
          avatarUrl: data.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      showToast('error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.fullName,
          email: profile.email,
          avatar_url: profile.avatarUrl
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      showToast('success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('error', 'Failed to save profile');
    } finally {
      setSaving(false);
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
      className="space-y-6 max-w-4xl"
    >
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-white mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="bg-black border border-neon-orange shadow-neon-orange rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-neon-orange shadow-neon-orange pb-4">
          <User className="w-6 h-6 text-white" />
          <h2 className="text-xl font-semibold text-white">Profile Information</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full px-4 py-3 bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-3 bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
              placeholder="your@email.com"
              disabled
            />
            <p className="text-sm text-white mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Avatar URL
            </label>
            <input
              type="url"
              value={profile.avatarUrl}
              onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
              className="w-full px-4 py-3 bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold rounded-lg font-semibold hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div className="bg-black border border-neon-orange shadow-neon-orange rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-neon-orange shadow-neon-orange pb-4">
          <Bell className="w-6 h-6 text-white" />
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
        </div>

        <div className="space-y-4">
          {Object.entries({
            emailNotifications: 'Email Notifications',
            reviewAlerts: 'New Review Alerts',
            weeklyReports: 'Weekly Performance Reports',
            marketingEmails: 'Marketing Emails'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-nnh-orange/5 rounded-lg">
              <span className="text-white">{label}</span>
              <button
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    [key]: !prev[key as keyof typeof notifications]
                  }))
                }
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  notifications[key as keyof typeof notifications]
                    ? 'bg-green-500'
                    : 'bg-nnh-orange/20'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    notifications[key as keyof typeof notifications]
                      ? 'translate-x-6'
                      : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black border border-neon-orange shadow-neon-orange rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-neon-orange shadow-neon-orange pb-4">
          <Palette className="w-6 h-6 text-white" />
          <h2 className="text-xl font-semibold text-white">Appearance</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Theme
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'dark', label: 'Dark', desc: 'Default dark theme' },
                { value: 'light', label: 'Light', desc: 'Coming soon' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  disabled={option.value === 'light'}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    theme === option.value
                      ? 'border-white bg-nnh-orange/10'
                      : 'border-neon-orange shadow-neon-orange hover:border-neon-orange shadow-neon-orange-strong'
                  } ${option.value === 'light' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold text-white mb-1">{option.label}</div>
                  <div className="text-sm text-white">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black border border-neon-orange shadow-neon-orange rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-neon-orange shadow-neon-orange pb-4">
          <Lock className="w-6 h-6 text-white" />
          <h2 className="text-xl font-semibold text-white">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-nnh-orange/5 rounded-lg">
            <h3 className="font-medium text-white mb-2">Password</h3>
            <p className="text-sm text-white mb-4">
              Change your password to keep your account secure
            </p>
            <button className="px-4 py-2 bg-nnh-orange/10 hover:bg-nnh-orange/20 text-white rounded-lg font-medium transition-colors">
              Change Password
            </button>
          </div>

          <div className="p-4 bg-nnh-orange/5 rounded-lg">
            <h3 className="font-medium text-white mb-2">Two-Factor Authentication</h3>
            <p className="text-sm text-white mb-4">
              Add an extra layer of security to your account
            </p>
            <button className="px-4 py-2 bg-nnh-orange/10 hover:bg-nnh-orange/20 text-white rounded-lg font-medium transition-colors">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Settings;
