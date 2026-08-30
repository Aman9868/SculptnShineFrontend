'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Banner } from '@/lib/api/banner';
import { getMediaUrl } from '@/lib/media';

interface ProductSpotlightBannersProps {
  banners: Banner[];
}

export const ProductSpotlightBanners: React.FC<ProductSpotlightBannersProps> = ({ banners }) => {
  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Horizontal scrolling container for mobile, grid for desktop */}
      <div 
        className="flex lg:grid lg:grid-cols-4 overflow-x-auto gap-4 sm:gap-6 pb-6 pt-2 snap-x snap-mandatory scrollbar-hide" 
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
              className="group flex-shrink-0 snap-start block w-[260px] sm:w-[280px] lg:w-auto relative aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
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
