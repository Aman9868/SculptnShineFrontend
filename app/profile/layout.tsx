'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { User, Lock, MapPin, ShoppingBag, Heart, Bell, LogOut, Headset, Camera, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api/auth';
import { apiFetch } from '@/lib/api/apiFetch';
import { getMediaUrl } from '@/lib/media';
import { toast } from 'react-toastify';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, updateUser, logout } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const uploadRes = await apiFetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success || !uploadData.data?.url) {
        throw new Error(uploadData.message || 'Failed to upload photo');
      }

      const uploadedUrl = uploadData.data.url;

      const updateRes = await authAPI.updateProfile(user.id, {
        profileImage: uploadedUrl,
      });

      if (updateRes.data) {
        updateUser(updateRes.data);
      } else {
        updateUser({ ...user, profileImage: uploadedUrl });
      }

      toast.success('Profile photo updated successfully!');
    } catch (err: any) {
      console.error('Failed to update photo:', err);
      toast.error(err.message || 'Failed to update profile photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                <div className="relative mb-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-24 h-24 rounded-full bg-[#d87c1c] text-white flex items-center justify-center text-3xl font-bold shadow-sm overflow-hidden relative cursor-pointer group"
                    title="Change Profile Picture"
                  >
                    {isUploading ? (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-white" />
                      </div>
                    ) : user?.profileImage ? (
                      <img 
                        src={getMediaUrl(user.profileImage, '/assets/sculpt.png')} 
                        alt="Profile" 
                        onError={(e: any) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      getUserInitials()
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera size={22} className="text-white" />
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-[#d87c1c] shadow-sm transition-colors cursor-pointer"
                    title="Change Profile Picture"
                  >
                    <Camera size={14} />
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
