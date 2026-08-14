'use client';

import React from 'react';
import NotificationPreferencesTab from '@/components/profile/NotificationPreferencesTab';

export default function NotificationsPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
      <NotificationPreferencesTab />
    </div>
  );
}
