'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Package, Heart, MapPin, CreditCard, ChevronRight, Lock } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
          Hello, {user?.firstName || 'User'}!
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <Link href="/profile/orders" className="flex items-center p-4 border border-gray-100 rounded-lg hover:border-gold-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Package size={24} />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-bold text-gray-900">Your Orders</h3>
              <p className="text-xs text-gray-500">Track, return, or buy things again</p>
            </div>
            <ChevronRight size={20} className="text-gray-300 group-hover:text-gold-500 transition-colors" />
          </Link>

          <Link href="/profile/settings" className="flex items-center p-4 border border-gray-100 rounded-lg hover:border-gold-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Lock size={24} />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-bold text-gray-900">Login & Security</h3>
              <p className="text-xs text-gray-500">Edit login, name, and mobile number</p>
            </div>
            <ChevronRight size={20} className="text-gray-300 group-hover:text-gold-500 transition-colors" />
          </Link>

          <Link href="/profile/addresses" className="flex items-center p-4 border border-gray-100 rounded-lg hover:border-gold-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
              <MapPin size={24} />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-bold text-gray-900">Your Addresses</h3>
              <p className="text-xs text-gray-500">Edit addresses for orders and gifts</p>
            </div>
            <ChevronRight size={20} className="text-gray-300 group-hover:text-gold-500 transition-colors" />
          </Link>

          <Link href="/profile/payments" className="flex items-center p-4 border border-gray-100 rounded-lg hover:border-gold-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <CreditCard size={24} />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-bold text-gray-900">Payment Options</h3>
              <p className="text-xs text-gray-500">Edit or add payment methods</p>
            </div>
            <ChevronRight size={20} className="text-gray-300 group-hover:text-gold-500 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
