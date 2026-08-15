'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Package, Droplets, Sparkles, Leaf, Scissors, User, Heart, ShoppingBag, LogOut, LayoutGrid } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/hooks/useAuth';
import { categoryAPI, Category } from '@/lib/api/category';

export const MobileMenu: React.FC = () => {
  const { isMobileMenuOpen, closeMobileMenu, cartTotalCount, wishlist, openCart } = useStore();
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (s.includes('protein') || s.includes('supplement') || s.includes('fitness')) return <Package size={20} />;
    if (s.includes('skin')) return <Droplets size={20} />;
    if (s.includes('hair') || s.includes('salon')) return <Scissors size={20} />;
    if (s.includes('beauty') || s.includes('cosmetic')) return <Sparkles size={20} />;
    if (s.includes('wellness') || s.includes('health')) return <Leaf size={20} />;
    return <LayoutGrid size={20} />;
  };

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeMobileMenu}
      />

      {/* Menu Content Drawer */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-cream-50 shadow-2xl border-r border-cream-300 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
        
        <div className="flex-1 overflow-y-auto">
          {/* Header inside drawer */}
          <div className="p-4 border-b border-cream-300 flex items-center justify-between bg-cream-100 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold-600/20 border border-gold-600 flex items-center justify-center">
                <span className="font-serif font-bold text-gold-700 text-lg">S</span>
              </div>
              <span className="font-serif font-bold text-lg text-gray-900">
                SCULPT & SHINE
              </span>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-cream-200"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav Categories */}
          <div className="p-4">
            <h4 className="text-xs font-bold text-gold-700 uppercase tracking-widest mb-3">
              Categories
            </h4>
            <nav className="space-y-1">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-cream-100 animate-pulse">
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
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gold-600/10 hover:text-gold-700 transition-colors"
                    >
                      <span className="text-gold-600 shrink-0">{icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </Link>
                  );
                })
              )}
            </nav>
          </div>
        </div>

        {/* Footer actions inside drawer */}
        <div className="p-4 border-t border-cream-300 bg-cream-100 space-y-3">
          <div className="flex items-center justify-around py-2 border-b border-cream-200">
            <Link
              href="/wishlist"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gold-700 transition-colors"
            >
              <Heart size={18} className="text-gold-600" />
              <span>Wishlist ({wishlist.length})</span>
            </Link>
            <button
              onClick={() => {
                closeMobileMenu();
                openCart();
              }}
              className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gold-700 transition-colors"
            >
              <ShoppingBag size={18} className="text-gold-600" />
              <span>Cart ({cartTotalCount})</span>
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                onClick={closeMobileMenu}
                className="flex-1 bg-gold-600 hover:bg-gold-700 text-white font-semibold text-sm py-2.5 px-4 rounded-full flex items-center justify-center gap-2 shadow-md transition-all truncate"
              >
                <User size={16} />
                <span className="truncate">{user.firstName} (My Profile)</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                className="p-2.5 bg-cream-200 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-full border border-cream-300 transition-colors"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={closeMobileMenu}
              className="w-full bg-gold-600 hover:bg-gold-700 text-white font-semibold text-sm py-2.5 rounded-full flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <User size={16} />
              <span>Login / Sign Up</span>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
};

