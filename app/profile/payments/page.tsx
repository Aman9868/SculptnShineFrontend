'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center py-20">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <CreditCard size={32} className="text-gray-300" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Methods</h2>
      <p className="text-gray-500 mb-8">Save your credit and debit cards for faster checkout.</p>
      <button className="bg-gold-500 text-white px-6 py-2 rounded-md font-medium hover:bg-gold-600 transition-colors">
        Add Payment Method
      </button>
    </div>
  );
}
