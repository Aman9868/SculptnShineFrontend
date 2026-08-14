'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api/auth';
import { Bell, Smartphone, Mail, Globe, Save } from 'lucide-react';
import { toast } from 'react-toastify';

export default function NotificationPreferencesTab() {
  const { user, updateUser } = useAuth();
  
  const [preferences, setPreferences] = useState({
    webPushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: false,
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setPreferences({
        webPushNotifications: user.webPushNotifications ?? true,
        emailNotifications: user.emailNotifications ?? true,
        smsNotifications: user.smsNotifications ?? false,
        whatsappNotifications: user.whatsappNotifications ?? false,
      });
    }
  }, [user]);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const response = await authAPI.updateProfile(user.id, preferences);
      
      // Update local context
      updateUser(response.data);
      toast.success('Notification preferences updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 ${
        checked ? 'bg-gold-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <Bell className="w-6 h-6 text-gold-500" />
        Notification Preferences
      </h2>

      <div className="space-y-6">
        
        {/* Web Push */}
        <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl border border-cream-200 transition-all hover:shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm text-gold-600">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Web Push Notifications</h3>
              <p className="text-sm text-gray-500">Receive alerts on your device for order updates</p>
            </div>
          </div>
          <ToggleSwitch 
            checked={preferences.webPushNotifications} 
            onChange={() => handleToggle('webPushNotifications')} 
          />
        </div>

        {/* Email */}
        <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl border border-cream-200 transition-all hover:shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm text-gold-600">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">Get promotional offers and newsletters via email</p>
            </div>
          </div>
          <ToggleSwitch 
            checked={preferences.emailNotifications} 
            onChange={() => handleToggle('emailNotifications')} 
          />
        </div>

        {/* SMS */}
        <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl border border-cream-200 transition-all hover:shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm text-gold-600">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">SMS Notifications</h3>
              <p className="text-sm text-gray-500">Important account alerts sent directly to your phone</p>
            </div>
          </div>
          <ToggleSwitch 
            checked={preferences.smsNotifications} 
            onChange={() => handleToggle('smsNotifications')} 
          />
        </div>

        {/* WhatsApp */}
        <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl border border-cream-200 transition-all hover:shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm text-green-600">
              {/* Using a general message icon for WhatsApp as lucide might not have whatsapp */}
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">WhatsApp Notifications</h3>
              <p className="text-sm text-gray-500">Track your delivery directly through WhatsApp</p>
            </div>
          </div>
          <ToggleSwitch 
            checked={preferences.whatsappNotifications} 
            onChange={() => handleToggle('whatsappNotifications')} 
          />
        </div>

      </div>

      <div className="flex justify-end pt-8 border-t border-cream-200 mt-8">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-2 bg-gold-600 hover:bg-gold-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          {isSaving ? (
            'Saving...'
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}
