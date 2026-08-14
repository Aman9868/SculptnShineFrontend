'use client';

import React from 'react';
import Link from 'next/link';
import { X, Package, Droplets, Sparkles, Leaf, Sliders, Scissors, User, Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const MobileMenu: React.FC = () => {
  const { isMobileMenuOpen, closeMobileMenu, cartTotalCount, wishlist, openCart } = useStore();

  if (!isMobileMenuOpen) return null;

  const categories = [
    { name: 'Salon', href: '/category/salon', icon: <Scissors size={20} /> },
    { name: 'Supplements', href: '/category/supplements', icon: <Package size={20} /> },
    { name: 'Skin Care', href: '/category/skin-care', icon: <Droplets size={20} /> },
    { name: 'Hair Care', href: '/category/hair-care', icon: <Sparkles size={20} /> },
    { name: 'Wellness', href: '/category/wellness', icon: <Leaf size={20} /> },
    { name: 'Beauty Tools', href: '/category/beauty-tools', icon: <Sliders size={20} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeMobileMenu}
      />

      {/* Menu Content Drawer */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-cream-50 shadow-2xl border-r border-cream-300 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
        
        <div>
          {/* Header inside drawer */}
          <div className="p-4 border-b border-cream-300 flex items-center justify-between bg-cream-100">
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
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gold-600/10 hover:text-gold-700 transition-colors"
                >
                  <span className="text-gold-600">{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer actions inside drawer */}
        <div className="p-4 border-t border-cream-300 bg-cream-100 space-y-3">
          <div className="flex items-center justify-around py-2 border-b border-cream-200">
            <Link
              href="/wishlist"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 text-xs font-semibold text-gray-700"
            >
              <Heart size={18} className="text-gold-600" />
              <span>Wishlist ({wishlist.length})</span>
            </Link>
            <button
              onClick={() => {
                closeMobileMenu();
                openCart();
              }}
              className="flex items-center gap-2 text-xs font-semibold text-gray-700"
            >
              <ShoppingBag size={18} className="text-gold-600" />
              <span>Cart ({cartTotalCount})</span>
            </button>
          </div>

          <Link
            href="/login"
            onClick={closeMobileMenu}
            className="w-full bg-gold-600 hover:bg-gold-700 text-white font-semibold text-sm py-2.5 rounded-full flex items-center justify-center gap-2 shadow-md"
          >
            <User size={16} />
            <span>Login / Sign Up</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
