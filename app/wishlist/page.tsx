import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { productAPI } from '@/lib/api/product';
import { ProductCard } from '@/components/category/ProductCard';

export default async function WishlistPage() {
  // Fetch real products to fix type errors. We'll use the first 4 products for now.
  let wishlistItems: any[] = [];
  try {
    const res = await productAPI.getProducts({ limit: 4 });
    if (res.success) {
      wishlistItems = res.data.products;
    }
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="min-h-screen bg-cream-50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-cream-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cream-100 text-gold-600 mb-6">
            <Heart size={32} className="fill-gold-200" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-brandDark mb-4">
            Your Wishlist
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Keep track of the products you love. Add them to your cart when you're ready to make them yours.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {wishlistItems.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-brandDark">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'} Saved
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {wishlistItems.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product} />
                  
                  {/* Remove from wishlist button overlay */}
                  <button className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-cream-200">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cream-50 text-cream-300 mb-6">
              <Heart size={40} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-brandDark mb-3">Your wishlist is empty</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              You haven't saved any items yet. Start exploring our premium collections to find products you love.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-brandDark hover:bg-black text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md"
            >
              <ShoppingBag size={18} />
              Continue Shopping
              <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
