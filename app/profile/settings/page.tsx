'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/lib/withAuth';
import { authAPI } from '@/lib/api/auth';
import { User, Phone, Trash2, AlertTriangle, Activity, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiFetch } from '@/lib/api/apiFetch';

function ProfileSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateUser, deleteAccount } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    bio: user?.bio || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isConnectingFit, setIsConnectingFit] = useState(false);

  React.useEffect(() => {
    // Handle OAuth callbacks
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'google_fit_connected') {
      toast.success('Successfully connected to Google Fit!');
      router.replace('/profile/settings'); // Clear query params
    }
    
    if (error === 'google_fit_declined') {
      toast.error('Google Fit connection was declined.');
      router.replace('/profile/settings');
    } else if (error === 'google_fit_failed') {
      toast.error('Failed to connect to Google Fit. Please try again.');
      router.replace('/profile/settings');
    }
  }, [searchParams, router]);

  React.useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        bio: user.bio || '',
      });
    }
  }, [user, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (!user?.id) {
        throw new Error('User ID not found');
      }

      const response = await authAPI.updateProfile(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        profileImage: profileImage || undefined,
      });

      if (response.data) {
        updateUser(response.data);
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileImage(null);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || '',
      bio: user?.bio || '',
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      router.push('/');
    } catch (err) {
      console.error('Failed to delete account:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConnectGoogleFit = async () => {
    setIsConnectingFit(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await apiFetch(`${API_URL}/integrations/google-fit/auth`);
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to get connection URL');
      }
    } catch (error) {
      console.error('Error connecting Google Fit:', error);
      toast.error('Failed to connect Google Fit. Please try again later.');
    } finally {
      setIsConnectingFit(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <User className="text-[#d87c1c]" size={24} />
            <h2 className="text-2xl font-serif font-bold text-gray-900">
              Profile Information
            </h2>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-[#fff5ee] hover:text-[#d87c1c] transition-colors"
              title="Edit Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-8 ml-9">Update your personal details and contact information</p>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Aman"
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-lg pl-11 pr-4 py-3 outline-none focus:border-[#d87c1c] focus:ring-1 focus:ring-[#d87c1c] transition-all disabled:opacity-70 disabled:bg-transparent disabled:border-transparent disabled:pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="User"
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-lg pl-11 pr-4 py-3 outline-none focus:border-[#d87c1c] focus:ring-1 focus:ring-[#d87c1c] transition-all disabled:opacity-70 disabled:bg-transparent disabled:border-transparent disabled:pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="admin@local.local"
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-lg pl-11 pr-4 py-3 outline-none focus:border-[#d87c1c] focus:ring-1 focus:ring-[#d87c1c] transition-all disabled:opacity-70 disabled:bg-transparent disabled:border-transparent disabled:pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-lg pl-11 pr-4 py-3 outline-none focus:border-[#d87c1c] focus:ring-1 focus:ring-[#d87c1c] transition-all disabled:opacity-70 disabled:bg-transparent disabled:border-transparent disabled:pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth (Optional)</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-lg px-4 py-3 outline-none focus:border-[#d87c1c] focus:ring-1 focus:ring-[#d87c1c] transition-all disabled:opacity-70 disabled:bg-transparent disabled:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Gender (Optional)</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-lg px-4 py-3 outline-none focus:border-[#d87c1c] focus:ring-1 focus:ring-[#d87c1c] transition-all disabled:opacity-70 disabled:bg-transparent disabled:border-transparent appearance-none"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Bio (Optional)</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Tell us something about yourself..."
              rows={4}
              className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-lg px-4 py-3 outline-none focus:border-[#d87c1c] focus:ring-1 focus:ring-[#d87c1c] transition-all disabled:opacity-70 disabled:bg-transparent disabled:border-transparent resize-none"
            />
          </div>

          {isEditing && (
            <div className="flex gap-4 justify-end pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-2.5 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-2.5 bg-[#d87c1c] hover:bg-[#c26e17] disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* External Integrations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="text-[#d87c1c]" size={24} />
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            External Integrations
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Connect external health tracking services to power our AI Predictive Replenishment Engine.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 48 48" className="w-8 h-8">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">Google Fit</p>
              <p className="text-xs text-gray-500 max-w-sm">
                Allows Sculpt & Shine to automatically pull your workout frequency to predict precisely when your supplements will run out.
              </p>
            </div>
          </div>
          
          {user?.integrations?.some((i: any) => i.provider === 'GOOGLE_FIT') ? (
            <div className="px-5 py-2.5 bg-green-50 border border-green-200 text-green-700 font-bold text-xs rounded-lg flex items-center gap-2 shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Active
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnectGoogleFit}
              disabled={isConnectingFit}
              className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isConnectingFit ? (
                <span className="animate-pulse">Connecting...</span>
              ) : (
                <>
                  <LinkIcon size={14} />
                  Connect Account
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8">
        <div className="flex items-center gap-3 mb-2 text-red-600">
          <Trash2 size={24} />
          <h2 className="text-xl font-bold text-gray-900">
            Danger Zone
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Permanently delete your account, saved addresses, wishlist, and profile details.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50/50 rounded-xl border border-red-100">
          <div>
            <p className="font-bold text-sm text-gray-900">Delete Account & Profile</p>
            <p className="text-xs text-gray-500">Once deleted, your account cannot be recovered.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Trash2 size={14} />
            Delete Profile
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-red-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Profile & Account?</h3>
                <p className="text-xs text-gray-500">This action is permanent and cannot be reversed.</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete your account, <strong>{user?.firstName}</strong>? All your personal details, shipping addresses, wishlist, and shopping cart will be wiped.
            </p>

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isDeleting ? (
                  <>Deleting Profile...</>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default withAuth(ProfileSettingsPage);
