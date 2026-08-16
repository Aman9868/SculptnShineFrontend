'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Package, 
  Droplets, 
  Sparkles, 
  Leaf, 
  Scissors, 
  User, 
  Heart, 
  ShoppingBag, 
  LogOut, 
  LayoutGrid, 
  Trash2, 
  ChevronRight, 
  AlertTriangle,
  Camera,
  Loader2
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/lib/api/auth';
import { apiFetch } from '@/lib/api/apiFetch';
import { categoryAPI, Category } from '@/lib/api/category';
import { getMediaUrl } from '@/lib/media';
import { toast } from 'react-toastify';

export const MobileMenu: React.FC = () => {
  const router = useRouter();
  const { isMobileMenuOpen, closeMobileMenu, cartTotalCount, wishlist, openCart } = useStore();
  const { user, logout, deleteAccount, updateUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        if (res.success && res.data.categories) {
          setCategories(res.data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories in mobile menu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const getCategoryIcon = (slug: string = '') => {
    const s = slug.toLowerCase();
    if (s.includes('protein') || s.includes('supplement') || s.includes('fitness')) return <Package size={18} />;
    if (s.includes('skin')) return <Droplets size={18} />;
    if (s.includes('hair') || s.includes('salon')) return <Scissors size={18} />;
    if (s.includes('beauty') || s.includes('cosmetic')) return <Sparkles size={18} />;
    if (s.includes('wellness') || s.includes('health')) return <Leaf size={18} />;
    return <LayoutGrid size={18} />;
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate size (< 5MB) and type
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setIsUploadingImage(true);
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

      // Update user profile in backend
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
      console.error('Failed to upload profile photo:', err);
      toast.error(err.message || 'Failed to update profile photo');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    router.push('/login');
  };

  const handleDeleteProfile = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      closeMobileMenu();
      router.push('/');
    } catch (err) {
      console.error('Failed to delete account:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isMobileMenuOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={closeMobileMenu}
        />

        {/* Menu Drawer */}
        <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-cream-50 shadow-2xl border-r border-cream-300 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-cream-300 flex items-center justify-between bg-cream-100 sticky top-0 z-10">
            <Link href="/" onClick={closeMobileMenu} className="flex items-center">
              <img
                src="/assets/sculpt.png"
                alt="Sculpt N Shine Logo"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <button
              onClick={closeMobileMenu}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-cream-200 cursor-pointer transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-cream-300/80">
            
            {/* 1. User Profile & Account Section */}
            <div className="p-4 bg-white/70">
              {user ? (
                <div className="space-y-3">
                  {/* Hidden File Input for Avatar Upload */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  {/* User Profile Card with Change Photo Option */}
                  <div className="p-3.5 bg-gradient-to-r from-cream-100 to-cream-200/60 rounded-2xl border border-cream-300 shadow-xs">
                    <div className="flex items-center gap-3">
                      {/* Avatar with Camera Overlay */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gold-500 shadow-sm flex items-center justify-center bg-gradient-to-br from-gold-600 to-gold-700 text-white font-bold text-base cursor-pointer hover:opacity-90 transition-opacity group"
                          title="Click to change profile picture"
                        >
                          {isUploadingImage ? (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Loader2 size={18} className="animate-spin text-white" />
                            </div>
                          ) : user.profileImage ? (
                            <img
                              src={getMediaUrl(user.profileImage, '/assets/sculpt.png')}
                              alt={user.firstName}
                              onError={(e: any) => {
                                e.currentTarget.style.display = 'none';
                              }}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{getUserInitials()}</span>
                          )}

                          {/* Hover camera badge */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera size={16} className="text-white" />
                          </div>
                        </button>

                        {/* Floating Camera Icon Badge */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-gold-500 rounded-full flex items-center justify-center text-gold-700 shadow-xs hover:bg-gold-50 cursor-pointer transition-transform hover:scale-110"
                          title="Change Profile Photo"
                          aria-label="Upload photo"
                        >
                          <Camera size={10} />
                        </button>
                      </div>

                      {/* User Text Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user.firstName} {user.lastName || ''}
                        </p>
                        <p className="text-xs text-gray-500 truncate mb-1">{user.email}</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="text-[11px] font-bold text-gold-700 hover:text-gold-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors bg-transparent border-none p-0"
                        >
                          <Camera size={11} />
                          <span>{isUploadingImage ? 'Uploading...' : 'Change Photo'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Account Navigation List */}
                  <div className="space-y-1 pt-1">
                    <Link
                      href="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-cream-200/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <User size={18} className="text-gold-600" />
                        <span>My Profile</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </Link>

                    <Link
                      href="/profile/orders"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-cream-200/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Package size={18} className="text-gold-600" />
                        <span>My Orders</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-cream-200/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Heart size={18} className="text-gold-600" />
                        <span>Wishlist</span>
                      </div>
                      {wishlist.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-800 border border-amber-500/30">
                          {wishlist.length}
                        </span>
                      ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                      )}
                    </Link>

                    <button
                      onClick={() => {
                        closeMobileMenu();
                        openCart();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-cream-200/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingBag size={18} className="text-gold-600" />
                        <span>Cart</span>
                      </div>
                      {cartTotalCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gold-600 text-white shadow-xs">
                          {cartTotalCount}
                        </span>
                      ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 bg-gradient-to-r from-gold-600/10 to-amber-600/10 rounded-2xl border border-gold-600/20 text-center">
                    <p className="text-xs font-bold text-gray-800 mb-2">Welcome to Sculpt & Shine</p>
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <User size={15} />
                      <span>Sign In / Create Account</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/wishlist"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-cream-100 border border-cream-300 text-xs font-bold text-gray-700 hover:bg-cream-200 transition-colors"
                    >
                      <Heart size={16} className="text-gold-600" />
                      <span>Wishlist ({wishlist.length})</span>
                    </Link>
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        openCart();
                      }}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-cream-100 border border-cream-300 text-xs font-bold text-gray-700 hover:bg-cream-200 transition-colors cursor-pointer"
                    >
                      <ShoppingBag size={16} className="text-gold-600" />
                      <span>Cart ({cartTotalCount})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Categories Navigation */}
            <div className="p-4">
              <h4 className="text-xs font-bold text-gold-700 uppercase tracking-widest mb-3">
                Categories
              </h4>
              <nav className="space-y-1">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-cream-100 animate-pulse">
                      <div className="w-5 h-5 rounded-full bg-cream-200" />
                      <div className="w-32 h-4 rounded bg-cream-200" />
                    </div>
                  ))
                ) : (
                  categories.map((cat) => {
                    const icon = getCategoryIcon(cat.slug);
                    return (
                      <Link
                        key={cat.id || cat.slug}
                        href={`/category/${cat.slug}`}
                        onClick={closeMobileMenu}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gold-600/10 hover:text-gold-700 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-gold-600 shrink-0 group-hover:scale-110 transition-transform">
                            {icon}
                          </span>
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <ChevronRight size={15} className="text-gray-400 group-hover:text-gold-600 transition-colors shrink-0" />
                      </Link>
                    );
                  })
                )}
              </nav>
            </div>
          </div>

          {/* Footer logout & delete actions inside drawer */}
          {user && (
            <div className="p-4 border-t border-cream-300 bg-cream-100 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 bg-white border border-cream-300 hover:bg-cream-200 transition-colors cursor-pointer"
              >
                <LogOut size={15} className="text-gray-600" />
                <span>Logout</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete Profile</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Delete Profile Confirmation Modal */}
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
                onClick={handleDeleteProfile}
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
    </>
  );
};


