import { useState, useEffect } from 'react';
import { Save, MapPin, Phone, Globe, Clock, Mail, Bell } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface SettingsTabProps {
  selectedLocation: string;
}

function SettingsTab({ selectedLocation }: SettingsTabProps) {
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [businessHours, setBusinessHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '10:00', close: '16:00', closed: false },
    sunday: { open: '00:00', close: '00:00', closed: true }
  });
  const [notifications, setNotifications] = useState({
    newReviews: true,
    reviewReplies: true,
    postPublished: true,
    weeklyReport: true
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedLocation) {
      loadLocationSettings();
    }
  }, [selectedLocation]);

  const loadLocationSettings = async () => {
    const { data } = await supabase
      .from('gmb_locations')
      .select('*')
      .eq('id', selectedLocation)
      .maybeSingle();

    if (data) {
      setLocationName(data.location_name || '');
      setAddress(data.address || '');
      setPhone(data.phone || '');
      setWebsite(data.website || '');
      if (data.business_hours) {
        setBusinessHours(data.business_hours);
      }
    }
  };

  const handleSave = async () => {
    if (!selectedLocation) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('gmb_locations')
        .update({
          location_name: locationName,
          address,
          phone,
          website,
          business_hours: businessHours
        })
        .eq('id', selectedLocation);

      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDayClosed = (day: string) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed }
    }));
  };

  const updateHours = (day: string, type: 'open' | 'close', value: string) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [type]: value }
    }));
  };

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Business Settings</h2>
          <p className="text-white mt-1">
            Manage your business information and preferences
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !selectedLocation}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black rounded-lg font-semibold hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 shadow-lg shadow-orange-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {!selectedLocation ? (
        <div className="bg-black border border-neon-orange rounded-xl p-12 text-center">
          <MapPin className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No location selected</h3>
          <p className="text-white">
            Please select a location to manage its settings
          </p>
        </div>
      ) : (
        <>
          <div className="bg-black border border-neon-orange rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Business Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-orange-500 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 bg-black border border-orange-500 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                  className="w-full px-4 py-3 bg-black border border-orange-500 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="w-full px-4 py-3 bg-black border border-orange-500 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@yourbusiness.com"
                  className="w-full px-4 py-3 bg-black border border-orange-500 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-black border border-neon-orange rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Business Hours
            </h3>

            <div className="space-y-4">
              {weekDays.map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-32">
                    <span className="text-white capitalize">{day}</span>
                  </div>

                  <button
                    onClick={() => toggleDayClosed(day)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      businessHours[day].closed
                        ? 'bg-red-400/20 text-orange-500'
                        : 'bg-green-400/20 text-orange-500'
                    }`}
                  >
                    {businessHours[day].closed ? 'Closed' : 'Open'}
                  </button>

                  {!businessHours[day].closed && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={businessHours[day].open}
                        onChange={(e) => updateHours(day, 'open', e.target.value)}
                        className="px-4 py-2 bg-black border border-orange-500 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                      />
                      <span className="text-white">to</span>
                      <input
                        type="time"
                        value={businessHours[day].close}
                        onChange={(e) => updateHours(day, 'close', e.target.value)}
                        className="px-4 py-2 bg-black border border-orange-500 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black border border-neon-orange rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </h3>

            <div className="space-y-4">
              {Object.entries({
                newReviews: 'New reviews',
                reviewReplies: 'Review replies',
                postPublished: 'Posts published',
                weeklyReport: 'Weekly performance report'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-black rounded-lg">
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
                        : 'bg-gray-700'
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
        </>
      )}
    </div>
  );
}

export default SettingsTab;
