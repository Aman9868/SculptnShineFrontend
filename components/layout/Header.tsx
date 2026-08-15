'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Search, ShoppingBag, Heart, User, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/hooks/useAuth';
import { SearchOverlay } from './SearchOverlay';
import { NotificationBell } from './NotificationBell';


export const Header: React.FC = () => {
  const router = useRouter();
  const { user, logout, deleteAccount, isLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    cartTotalCount,
    wishlist,
    openCart,
    toggleMobileMenu,
    isMobileMenuOpen,
    openSearch,
    closeSearch,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.push('/login');
  };

  const handleDeleteProfile = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      setShowUserMenu(false);
      router.push('/');
    } catch (err) {
      console.error('Failed to delete account:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  // Close dropdown when clicking outside
  const userMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      closeSearch();
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      openSearch();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-100/95 backdrop-blur-md border-b border-cream-300 shadow-sm transition-all">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 md:h-22 flex items-center justify-between gap-3 sm:gap-6">

        {/* Mobile menu toggle & Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={toggleMobileMenu}
            className="p-1.5 sm:p-2 text-gray-700 hover:text-gold-700 lg:hidden focus:outline-none rounded-lg hover:bg-cream-200"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="flex items-center group flex-shrink-0 transition-opacity hover:opacity-90">
            {/* Sculpt Logo */}
            <div className="flex items-center justify-start">
              <img
                src="/assets/sculpt.png"
                alt="Sculpt N Shine Logo"
                className="h-9 sm:h-13 md:h-15 lg:h-16 w-auto max-w-[200px] sm:max-w-[300px] md:max-w-[360px] lg:max-w-[420px] object-contain object-left"
              />
            </div>
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4 relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search for supplements, whey protein, pre workout..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={openSearch}
              className="w-full bg-white text-gray-800 text-sm pl-5 pr-12 py-2.5 rounded-full border border-cream-300 focus:border-gold-600 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all shadow-inner placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cream-200 hover:bg-gold-600 hover:text-white text-gray-600 flex items-center justify-center transition-colors"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          </form>
          {/* Desktop Search Dropdown */}
          <SearchOverlay />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="hidden sm:flex relative items-center gap-1.5 text-gray-700 hover:text-gold-700 transition-colors group"
          >
            <div className="p-2 rounded-full group-hover:bg-cream-200/70 transition-colors relative">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500"></span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-semibold">Wishlist</span>
          </Link>

          {/* Cart with badge */}
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 text-gray-700 hover:text-gold-700 transition-colors group focus:outline-none"
            aria-label="Go to Shopping Cart"
          >
            <div className="p-2 rounded-full group-hover:bg-cream-200/70 transition-colors relative">
              <ShoppingBag size={20} />
              {cartTotalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-600 text-white text-[11px] font-bold flex items-center justify-center shadow-md animate-pulse">
                  {cartTotalCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-semibold">Cart</span>
          </Link>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Profile / Login button */}
          {isLoading ? (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-cream-200 animate-pulse border border-cream-300" />
          ) : user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-full hover:bg-cream-200/70 transition-colors group"
                aria-label="User Menu"
              >
                {/* Avatar */}
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.firstName}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shadow-md border border-cream-200"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-gold-600 to-gold-700 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md">
                    {getUserInitials()}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-semibold text-gray-700 truncate max-w-[100px]">
                  {user.firstName}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-cream-300 py-2 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-cream-200">
                    <p className="text-sm font-semibold text-gray-800">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cream-100 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cream-100 transition-colors border-b border-cream-100"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowDeleteModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <Trash2 size={16} />
                    Delete Profile
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-gold-600 hover:bg-gold-700 text-white text-xs sm:text-sm font-semibold p-2 sm:px-5 sm:py-2 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              aria-label="Login or Sign up"
            >
              <User size={16} />
              <span className="hidden sm:inline">Login / Sign up</span>
            </Link>
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

      {/* Mobile Search input */}
      <div className="md:hidden px-4 pb-3 relative">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            placeholder="Search supplements, skin care..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={openSearch}
            className="w-full bg-white text-gray-800 text-xs pl-4 pr-10 py-2.5 rounded-full border border-cream-300 focus:border-gold-600 focus:ring-2 focus:ring-gold-500/20 outline-none shadow-inner placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-cream-200 hover:bg-gold-600 hover:text-white text-gray-600 flex items-center justify-center transition-colors"
            aria-label="Search"
          >
            <Search size={14} />
          </button>
        </form>
        {/* Mobile Search Dropdown */}
        <SearchOverlay />
      </div>
    </header>
  );
};
