'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Loader2 } from 'lucide-react';
import { Product } from '@/lib/api/product';
import { useStore } from '@/context/StoreContext';
import { QuickAddModal } from '@/components/product/QuickAddModal';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

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

  const hasVariants = product.variants && product.variants.length > 0;

  const handleCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (hasVariants) {
      setIsModalOpen(true);
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id, undefined, 1);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <div className={`group relative bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-luxury-hover hover:border-gold-200 ${viewMode === 'list' ? 'flex flex-row min-h-[130px] sm:h-48' : 'flex flex-col h-full'}`}>
        <Link href={`/product/${product.id}`} className={`cursor-pointer ${viewMode === 'list' ? 'flex flex-row w-full' : 'flex flex-col flex-grow'}`}>
          {/* Badges */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 flex flex-col gap-1 items-start">
            {discountPercent > 0 && (
              <span className="bg-orange-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 uppercase rounded-sm tracking-wide shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Image Container */}
          <div className={`relative bg-gray-50/60 p-2 sm:p-4 flex items-center justify-center overflow-hidden ${viewMode === 'list' ? 'w-28 sm:w-48 h-auto aspect-square shrink-0 border-r border-gray-100' : 'aspect-[4/5] w-full min-h-[180px] sm:min-h-[220px]'}`}>
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
          <div className={`p-3 sm:p-4 flex flex-col flex-grow ${viewMode === 'list' ? 'justify-center' : ''}`}>
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5 sm:mb-1 line-clamp-1 uppercase tracking-wider">
              {product.brand?.name || 'Sculpt & Shine'}
            </p>
            <h3 className={`text-xs sm:text-sm font-semibold text-brandDark mb-1 sm:mb-2 transition-colors group-hover:text-gold-600 ${viewMode === 'list' ? 'line-clamp-2 text-xs sm:text-base mb-1.5 sm:mb-4' : 'line-clamp-2 min-h-[36px] sm:min-h-[40px] leading-snug'}`}>
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
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gold-500 hover:bg-gold-50 hover:text-gold-600 transition-colors shadow-sm active:scale-95 disabled:opacity-50"
                onClick={handleCartClick}
                disabled={isAdding}
                aria-label="Add to cart"
                title={hasVariants ? "Choose options & Add to Cart" : "Add to Cart"}
              >
                {isAdding ? (
                  <Loader2 size={16} className="animate-spin text-gold-600" />
                ) : (
                  <ShoppingCart size={16} />
                )}
              </button>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Add / Variant Selection Modal */}
      {hasVariants && (
        <QuickAddModal 
          product={product} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

