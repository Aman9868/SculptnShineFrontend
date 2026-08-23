'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingBag, Loader2 } from 'lucide-react';
import { Product } from '@/lib/api/product';
import { useStore } from '@/context/StoreContext';
import { QuickAddModal } from '@/components/product/QuickAddModal';
import { getMediaUrl } from '@/lib/media';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Use first image if available, else placeholder
  const imageUrl = getMediaUrl(
    product.images && product.images.length > 0 && product.images[0] ? product.images[0] : null,
    '/assets/product-placeholder.png'
  );
    
  const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];
  const originalPrice = (product.unitPrice && product.unitPrice > 0)
    ? product.unitPrice
    : (defaultVariant?.unitPrice || 0);

  // Calculate discount percentage
  const discountPercent = Math.round(product.discountPercentage || defaultVariant?.discountPercentage || 0);
    
  const currentPrice = discountPercent > 0 
    ? originalPrice * (1 - discountPercent / 100) 
    : originalPrice;

  const hasVariants = product.variants && product.variants.length > 0;
  const ratingValue = Number(product.averageRating || 0);
  const reviewCountValue = Number(product.reviewCount || 0);

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
      <div className={`group relative bg-white border border-cream-200/90 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-luxury hover:border-gold-400 hover:-translate-y-1 ${viewMode === 'list' ? 'flex flex-row min-h-[140px] sm:h-52' : 'flex flex-col h-full'}`}>
        <Link href={`/product/${product.id}`} className={`cursor-pointer ${viewMode === 'list' ? 'flex flex-row w-full' : 'flex flex-col flex-grow'}`}>
          
          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
            {discountPercent > 0 && (
              <span className="bg-red-600 text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 uppercase rounded-md tracking-wider shadow-2xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Image Container */}
          <div className={`relative bg-gradient-to-b from-cream-50/50 to-white p-3 sm:p-4 flex items-center justify-center overflow-hidden ${viewMode === 'list' ? 'w-32 sm:w-52 h-auto aspect-square shrink-0 border-r border-cream-200' : 'aspect-square w-full min-h-[190px] sm:min-h-[220px]'}`}>
            <img
              src={imageUrl}
              alt={product.title}
              loading="lazy"
              onError={(e: any) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/product-placeholder.png';
              }}
              className="object-contain max-h-full max-w-full group-hover:scale-106 transition-transform duration-500 filter drop-shadow-sm"
            />
          </div>

          {/* Content Details */}
          <div className={`p-3.5 sm:p-4 flex flex-col flex-grow ${viewMode === 'list' ? 'justify-center' : ''}`}>
            {/* Brand Name */}
            <p className="text-[10px] sm:text-[11px] text-gold-700 font-extrabold uppercase tracking-widest mb-1 truncate">
              {product.brand?.name || 'SCULPT N SHINE'}
            </p>
            
            {/* Title */}
            <h3 className={`text-xs sm:text-sm font-bold text-brandDark mb-2 transition-colors group-hover:text-gold-700 ${viewMode === 'list' ? 'line-clamp-2 text-sm sm:text-base mb-2' : 'line-clamp-2 min-h-[34px] sm:min-h-[38px] leading-snug'}`}>
              {product.title}
            </h3>
            
            {/* Price & Rating Row */}
            <div className="mt-auto pt-2 flex items-end justify-between gap-2 border-t border-cream-100">
              <div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-sm sm:text-base font-extrabold text-brandDark">
                    ₹{Math.round(currentPrice).toLocaleString('en-IN')}
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-[11px] text-gray-400 line-through font-medium">
                      ₹{Math.round(originalPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star className={`w-3.5 h-3.5 ${ratingValue > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}`} />
                  <span className="text-[11px] font-bold text-gray-700">
                    {ratingValue > 0 ? ratingValue.toFixed(1) : 'New'}
                  </span>
                  {reviewCountValue > 0 && (
                    <span className="text-[10px] text-gray-400 font-medium">({reviewCountValue})</span>
                  )}
                </div>
              </div>
              
              {/* Quick Add Button */}
              <button 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cream-100 hover:bg-gold-600 hover:text-white text-brandDark border border-cream-300 flex items-center justify-center transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                onClick={handleCartClick}
                disabled={isAdding}
                aria-label="Add to cart"
                title={hasVariants ? "Choose options & Add to Cart" : "Add to Cart"}
              >
                {isAdding ? (
                  <Loader2 size={16} className="animate-spin text-gold-600" />
                ) : (
                  <ShoppingBag size={16} className="transition-transform group-hover:scale-110" />
                )}
              </button>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Add Modal */}
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

export default ProductCard;
