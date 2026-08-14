'use client';

import React from 'react';
import Link from 'next/link';
import { User, Lock, MapPin, ShoppingBag, Heart, Bell, LogOut, Headset } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navigation = [
    { name: 'Profile Information', href: '/profile/settings', icon: User },
    { name: 'Change Password', href: '/profile/password', icon: Lock },
    { name: 'Addresses', href: '/profile/addresses', icon: MapPin },
    { name: 'Order History', href: '/profile/orders', icon: ShoppingBag },
    { name: 'Support & Complaints', href: '/profile/support', icon: Headset },
    { name: 'Wishlist', href: '/profile/wishlist', icon: Heart },
    { name: 'Notification Preferences', href: '/profile/notifications', icon: Bell },
  ];

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <div 
      className="min-h-screen pt-8 pb-20 bg-cover bg-center bg-no-repeat bg-fixed relative"
      style={{ backgroundImage: 'url("/assets/profile_bg.png")' }}
    >
      {/* Semi-transparent overlay to ensure content is readable against the background */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">My Profile</span>
        </nav>

        {/* Title */}
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600 mb-8">Manage your account settings and profile information</p>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 p-6">
              
              {/* User Info block */}
              <div className="flex flex-col items-center mb-6 relative">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-[#d87c1c] text-white flex items-center justify-center text-3xl font-bold shadow-sm overflow-hidden">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                  <button 
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-[#d87c1c] shadow-sm transition-colors"
                    title="Change Profile Picture"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                  </button>
                </div>
                <h2 className="text-xl font-serif font-bold text-gray-900 text-center">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm text-gray-500 text-center mb-2">{user?.email}</p>
              </div>

              <hr className="border-gray-100 mb-4" />

              {/* Navigation Menu */}
              <nav className="flex flex-col space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg ${
                        isActive 
                          ? 'bg-[#fff5ee] text-[#d87c1c]' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon size={18} className={isActive ? 'text-[#d87c1c]' : 'text-gray-400'} />
                      {item.name}
                    </Link>
                  );
                })}
                <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg w-full text-left">
                  <LogOut size={18} className="text-gray-400" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {children}
          </main>
          
        </div>
      </div>
    </div>
  );
}
