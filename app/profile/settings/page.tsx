'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/lib/withAuth';
import { authAPI } from '@/lib/api/auth';
import { User, Phone, Camera, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import ChangePasswordTab from '@/components/profile/ChangePasswordTab';

function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
                onClick={handleCancel}
                className="px-8 py-2.5 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
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

    </div>
  );
}

export default withAuth(ProfileSettingsPage);
