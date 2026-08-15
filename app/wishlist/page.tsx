'use client';

import React from 'react';
import WishlistTab from '@/components/profile/WishlistTab';

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-cream-50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-cream-200 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-brandDark mb-3">
            Your Wishlist
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            Keep track of the products you love. Add them to your cart when you're ready.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <WishlistTab />
      </div>
    </div>
  );
}

