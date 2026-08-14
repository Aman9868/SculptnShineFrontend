'use client';

import React from 'react';
import AddressesTab from '@/components/profile/AddressesTab';

export default function AddressesPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Your Addresses</h2>
      <AddressesTab />
    </div>
  );
}
