'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { BEST_SELLER_PRODUCTS } from '@/data/products';
import { Rating } from '@/components/ui/Rating';
import { useStore } from '@/context/StoreContext';
import { useRouter } from 'next/navigation';

export const BestSellers: React.FC = () => {
  const { toggleWishlist, isInWishlist } = useStore();
  const router = useRouter();

  return (
    <section className="py-12 lg:py-16 bg-white border-y border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
              BEST SELLERS
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Top rated formula loved by fitness enthusiasts nationwide
            </p>
          </div>

          <Link
            href="/category/supplements"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-gold-700 hover:text-gold-800 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {BEST_SELLER_PRODUCTS.map((prod) => {
            const isWishlisted = isInWishlist(prod.id);

            return (
              <div
                key={prod.id}
                className="group bg-cream-50/60 rounded-2xl p-3 border border-cream-300 shadow-2xs hover:shadow-luxury hover:border-gold-500/40 transition-all duration-300 flex flex-col justify-between relative"
              >
                {/* Wishlist Button Overlay */}
                <button
                  onClick={() => toggleWishlist(prod.id)}
                  className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-xs hover:bg-white text-gray-600 flex items-center justify-center shadow-xs transition-transform active:scale-90"
                  aria-label="Add to Wishlist"
                >
                  <Heart
                    size={14}
                    className={isWishlisted ? 'fill-red-500 text-red-500' : 'hover:text-red-500'}
                  />
                </button>

                {/* Product Image */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-white p-2 border border-cream-200">
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 200px"
                  />
                </div>

                {/* Product Details */}
                <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 line-clamp-2 min-h-[32px] group-hover:text-gold-700 transition-colors">
                      {prod.name}
                    </h3>

                    {/* Price and Original MRP */}
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-sm font-extrabold text-gray-900">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      {(prod.originalPrice ?? 0) > prod.price && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ₹{prod.originalPrice?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Star Ratings */}
                    <div className="mt-1">
                      <Rating value={prod.rating} count={prod.reviewsCount} />
                    </div>
                  </div>

                  {/* Add to Cart CTA */}
                  <button
                    onClick={() => router.push(`/product/${prod.id}`)}
                    className="w-full mt-3 bg-cream-200 hover:bg-gold-600 hover:text-white text-gray-800 text-xs font-bold py-2 rounded-xl border border-cream-300 transition-all flex items-center justify-center gap-1.5 group-hover:shadow-sm"
                  >
                    <ShoppingBag size={13} />
                    <span>View Product</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
