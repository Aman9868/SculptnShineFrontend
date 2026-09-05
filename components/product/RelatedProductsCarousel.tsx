'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/category/ProductCard';

interface RelatedProductsCarouselProps {
  products: any[];
  categorySlug?: string;
}

export const RelatedProductsCarousel: React.FC<RelatedProductsCarouselProps> = ({
  products,
  categorySlug,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [products]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="mt-16 pt-12 border-t border-gray-100 relative">
      {/* Header with Title, Chevron Controls & View All */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury text-brandDark">
            You may also like
          </h2>
          <p className="text-xs text-gray-500 mt-1">Recommended products based on this category</p>
        </div>

        <div className="flex items-center gap-3">
          {categorySlug && (
            <Link
              href={`/category/${categorySlug}`}
              className="text-xs sm:text-sm font-bold text-gray-600 hover:text-gold-600 transition-colors mr-2 hidden sm:inline-block"
            >
              View all
            </Link>
          )}

          {/* Navigation Chevron Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`p-2 sm:p-2.5 rounded-full border transition-all ${
                canScrollLeft
                  ? 'border-gray-300 text-gray-800 hover:bg-gold-50 hover:border-gold-400 hover:text-gold-700 shadow-xs cursor-pointer'
                  : 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50/50'
              }`}
              aria-label="Previous products"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`p-2 sm:p-2.5 rounded-full border transition-all ${
                canScrollRight
                  ? 'border-gray-300 text-gray-800 hover:bg-gold-50 hover:border-gold-400 hover:text-gold-700 shadow-xs cursor-pointer'
                  : 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50/50'
              }`}
              aria-label="Next products"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-3 sm:gap-6 pb-4 pt-1 snap-x snap-mandatory scroll-smooth hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((p: any) => (
          <div
            key={p.id}
            className="w-[155px] sm:w-[220px] md:w-[260px] shrink-0 snap-start flex flex-col"
          >
            <ProductCard product={p} viewMode="grid" />
          </div>
        ))}
      </div>
    </div>
  );
};
