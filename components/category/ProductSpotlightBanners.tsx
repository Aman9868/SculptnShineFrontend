'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/lib/api/banner';
import { getMediaUrl } from '@/lib/media';

interface ProductSpotlightBannersProps {
  banners: Banner[];
}

export const ProductSpotlightBanners: React.FC<ProductSpotlightBannersProps> = ({ banners }) => {
  if (!banners || banners.length === 0) {
    return null;
  }

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [banners]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">Featured Products</h2>
        <div className="hidden sm:flex items-center gap-2">
          <button 
            onClick={() => scroll('left')} 
            disabled={!showLeftScroll}
            className={`w-10 h-10 flex items-center justify-center shrink-0 rounded-full border transition-all ${showLeftScroll ? 'bg-white border-cream-300 text-brandDark hover:bg-cream-100 shadow-sm cursor-pointer' : 'border-cream-100 text-cream-300 cursor-not-allowed bg-cream-50/50'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')} 
            disabled={!showRightScroll}
            className={`w-10 h-10 flex items-center justify-center shrink-0 rounded-full border transition-all ${showRightScroll ? 'bg-white border-cream-300 text-brandDark hover:bg-cream-100 shadow-sm cursor-pointer' : 'border-cream-100 text-cream-300 cursor-not-allowed bg-cream-50/50'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-3 sm:gap-6 pb-4 sm:pb-6 pt-1 sm:pt-2 snap-x snap-mandatory scrollbar-hide scroll-smooth" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}} />
        
        {banners.map((banner) => {
          const link = banner.targetType === 'PRODUCT' && banner.product ? `/product/${banner.product.slug}` :
                       banner.targetType === 'CATEGORY' && banner.category ? `/category/${banner.category.slug}` :
                       banner.targetType === 'SUBCATEGORY' && banner.category && banner.subcategory ? `/category/${banner.category.slug}/${banner.subcategory.slug}` :
                       banner.targetType === 'BRAND' && banner.brand ? `/brand/${banner.brand.slug}` :
                       banner.link || '#';

          return (
            <Link
              key={banner.id}
              href={link}
              className="group flex-shrink-0 snap-start block w-[190px] sm:w-[260px] lg:w-[320px] relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
            >
              <Image
                src={getMediaUrl(banner.image)}
                alt={banner.title || ''}
                fill
                sizes="(max-width: 1024px) 280px, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Hover Details Overlay */}
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 rounded-2xl">
                {banner.title && (
                  <h3 className="text-white font-bold text-xl sm:text-2xl leading-tight mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {banner.title}
                  </h3>
                )}
                {banner.subtitle && (
                  <p className="text-gray-200 text-sm font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                    {banner.subtitle}
                  </p>
                )}
                {banner.ctaText && (
                  <span className="mt-5 inline-block bg-gold-500 hover:bg-gold-400 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-full translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-150">
                    {banner.ctaText}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
