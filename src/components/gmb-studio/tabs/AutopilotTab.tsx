import { useState, useEffect } from 'react';
import { Bot, MessageCircle, FileText, Zap, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ActivityLog from '../autopilot/ActivityLog';

interface AutopilotTabProps {
  selectedLocation: string;
}

function AutopilotTab({ selectedLocation }: AutopilotTabProps) {
  const [masterEnabled, setMasterEnabled] = useState(false);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyMinRating, setAutoReplyMinRating] = useState(1);
  const [autoReplyTone, setAutoReplyTone] = useState('professional');
  const [smartPostingEnabled, setSmartPostingEnabled] = useState(false);
  const [postingFrequency, setPostingFrequency] = useState('3');
  const [postingDays, setPostingDays] = useState<string[]>(['monday', 'wednesday', 'friday']);
  const [activities, setActivities] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedLocation) {
      loadSettings();
      loadActivities();
    }
  }, [selectedLocation]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('ai_autopilot_settings')
      .select('*')
      .eq('location_id', selectedLocation)
      .maybeSingle();

    if (data) {
      setMasterEnabled(data.is_enabled);
      setAutoReplyEnabled(data.auto_reply_enabled);
      setAutoReplyMinRating(data.auto_reply_min_rating || 1);
      setAutoReplyTone(data.auto_reply_tone || 'professional');
      setSmartPostingEnabled(data.smart_posting_enabled);
      setPostingFrequency(data.posting_frequency?.toString() || '3');
      setPostingDays(data.posting_days || ['monday', 'wednesday', 'friday']);
    }
  };

  const loadActivities = async () => {
    const { data } = await supabase
      .from('ai_autopilot_logs')
      .select('*')
      .eq('location_id', selectedLocation)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setActivities(data);
    }
  };

  const handleSave = async () => {
    if (!selectedLocation) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ai_autopilot_settings')
        .upsert({
          location_id: selectedLocation,
          is_enabled: masterEnabled,
          auto_reply_enabled: autoReplyEnabled,
          auto_reply_min_rating: autoReplyMinRating,
          auto_reply_tone: autoReplyTone,
          smart_posting_enabled: smartPostingEnabled,
          posting_frequency: parseInt(postingFrequency),
          posting_days: postingDays
        }, {
          onConflict: 'location_id'
        });

      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setPostingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const weekDays = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Autopilot Settings</h2>
          <p className="text-white mt-1">
            Automate your Google My Business management with AI
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black rounded-lg font-semibold hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-500/20"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Master Switch</h3>
              <p className="text-sm text-white">Enable or disable all AI automation</p>
            </div>
          </div>

          <button
            onClick={() => setMasterEnabled(!masterEnabled)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              masterEnabled ? 'bg-orange-500' : 'bg-gray-700'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                masterEnabled ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black border border-neon-orange rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-white">Auto Reply to Reviews</h3>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white">Enable Auto Reply</span>
            <button
              onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
              disabled={!masterEnabled}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                autoReplyEnabled ? 'bg-orange-500' : 'bg-gray-700'
              } disabled:opacity-50`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  autoReplyEnabled ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Minimum Rating to Reply
            </label>
            <select
              value={autoReplyMinRating}
              onChange={(e) => setAutoReplyMinRating(parseInt(e.target.value))}
              disabled={!masterEnabled || !autoReplyEnabled}
              className="w-full px-4 py-3 bg-black border border-orange-500 rounded-lg text-white focus:outline-none focus:border-orange-600 focus:shadow-neon-orange transition-all disabled:opacity-50"
            >
              <option value="1">All Reviews (1+ stars)</option>
              <option value="2">2+ stars</option>
              <option value="3">3+ stars</option>
              <option value="4">4+ stars</option>
              <option value="5">5 stars only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Reply Tone
            </label>
            <select
              value={autoReplyTone}
              onChange={(e) => setAutoReplyTone(e.target.value)}
              disabled={!masterEnabled || !autoReplyEnabled}
              className="w-full px-4 py-3 bg-black border border-orange-500 rounded-lg text-white focus:outline-none focus:border-orange-600 focus:shadow-neon-orange transition-all disabled:opacity-50"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
            </select>
          </div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-white">Smart Posting</h3>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white">Enable Smart Posting</span>
            <button
              onClick={() => setSmartPostingEnabled(!smartPostingEnabled)}
              disabled={!masterEnabled}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                smartPostingEnabled ? 'bg-orange-500' : 'bg-gray-700'
              } disabled:opacity-50`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  smartPostingEnabled ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Posts Per Week
            </label>
            <input
              type="number"
              value={postingFrequency}
              onChange={(e) => setPostingFrequency(e.target.value)}
              min="1"
              max="7"
              disabled={!masterEnabled || !smartPostingEnabled}
              className="w-full px-4 py-3 bg-black border border-orange-500 rounded-lg text-white focus:outline-none focus:border-orange-600 focus:shadow-neon-orange transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Preferred Days
            </label>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  disabled={!masterEnabled || !smartPostingEnabled}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    postingDays.includes(day.value)
                      ? 'bg-orange-500 text-black font-semibold'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Status</h3>
            <Zap className={`w-5 h-5 ${masterEnabled ? 'text-orange-500' : 'text-gray-500'}`} />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {masterEnabled ? 'Active' : 'Inactive'}
          </div>
          <p className="text-sm text-white">
            {masterEnabled ? 'AI is running' : 'AI is disabled'}
          </p>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Auto Replies</h3>
            <MessageCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {activities.filter((a) => a.action_type === 'auto_reply').length}
          </div>
          <p className="text-sm text-white">Total sent</p>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Auto Posts</h3>
            <FileText className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {activities.filter((a) => a.action_type === 'auto_post').length}
          </div>
          <p className="text-sm text-white">Total created</p>
        </div>
      </div>

      <ActivityLog activities={activities} />
    </div>
  );
}

export default AutopilotTab;
