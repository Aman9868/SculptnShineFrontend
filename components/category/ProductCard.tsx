'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/api/product';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  // Use first image if available, else a placeholder
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/assets/images/category-placeholder.jpg';
    
  // Calculate discount percentage
  const discountPercent = product.discountPercentage || 0;
    
  const originalPrice = product.unitPrice || 0;
  const currentPrice = discountPercent > 0 
    ? originalPrice * (1 - discountPercent / 100) 
    : originalPrice;

  return (
    <div className={`group relative bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-luxury-hover hover:border-gold-200 ${viewMode === 'list' ? 'flex flex-row h-48' : 'flex flex-col h-full'}`}>
      <Link href={`/product/${product.id}`} className={`cursor-pointer ${viewMode === 'list' ? 'flex flex-row w-full' : 'flex flex-col flex-grow'}`}>
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {discountPercent > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 uppercase rounded-sm tracking-wide shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Image Container */}
        <div className={`relative bg-gray-50/60 p-4 flex items-center justify-center overflow-hidden ${viewMode === 'list' ? 'w-48 h-48 shrink-0 border-r border-gray-100' : 'aspect-[4/5] w-full min-h-[220px]'}`}>
          <img
            src={imageUrl}
            alt={product.title}
            loading="lazy"
            onError={(e: any) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80';
            }}
            className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className={`p-4 flex flex-col flex-grow ${viewMode === 'list' ? 'justify-center' : ''}`}>
          <p className="text-xs text-gray-500 font-medium mb-1 line-clamp-1 uppercase tracking-wider">
            {product.brand?.name || 'Sculpt & Shine'}
          </p>
          <h3 className={`text-sm font-semibold text-brandDark mb-2 transition-colors group-hover:text-gold-600 ${viewMode === 'list' ? 'line-clamp-2 text-base mb-4' : 'line-clamp-2 min-h-[40px] leading-snug'}`}>
            {product.title}
          </h3>
          
          <div className="mt-auto pt-2 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-bold text-brandDark">₹{currentPrice.toLocaleString()}</span>
                {discountPercent > 0 && (
                  <span className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                <span className="text-xs font-medium text-gray-700">4.8</span>
                <span className="text-xs text-gray-400">(120)</span>
              </div>
            </div>
            
            <button 
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gold-500 hover:bg-gold-50 hover:text-gold-600 transition-colors shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Add to cart logic would go here
              }}
              aria-label="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};
