import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Banner } from '@/lib/api/banner';
import { getMediaUrl } from '@/lib/media';

interface CategoryPromoCardsProps {
  banners: Banner[];
}

export const CategoryPromoCards: React.FC<CategoryPromoCardsProps> = ({ banners }) => {
  if (!banners || banners.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {banners.slice(0, 4).map((banner, index) => {
        const isDark = index % 2 === 1;
        
        const link = banner.targetType === 'PRODUCT' && banner.product ? `/product/${banner.product.slug}` :
                     banner.targetType === 'CATEGORY' && banner.category ? `/category/${banner.category.slug}` :
                     banner.targetType === 'SUBCATEGORY' && banner.category && banner.subcategory ? `/category/${banner.category.slug}/${banner.subcategory.slug}` :
                     banner.targetType === 'BRAND' && banner.brand ? `/brand/${banner.brand.slug}` :
                     banner.link || '#';

        return (
          <Link key={banner.id} href={link} className={`group relative rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col items-center text-center overflow-hidden h-[220px] sm:h-[290px] lg:h-[340px] shadow-sm hover:shadow-md transition-shadow ${isDark ? 'bg-gradient-to-b from-[#E6EFF1] to-[#607D8B]' : 'bg-gradient-to-br from-[#E0F7F6] to-[#C9EDEB]'}`}>
            
            <h3 className="text-base sm:text-xl lg:text-2xl font-black text-[#006E82] tracking-tight leading-tight line-clamp-1">{banner.title}</h3>
            {banner.subtitle && <p className="text-[10px] sm:text-[13px] font-bold text-gray-800 mt-0.5 line-clamp-1">{banner.subtitle}</p>}
            
            {banner.ctaText && (
              <div className="mt-2 sm:mt-3 inline-flex items-center border border-gray-300 rounded-sm overflow-hidden bg-white z-10">
                <span className="text-[9px] sm:text-[11px] font-black text-white bg-[#006E82] px-2 sm:px-3 py-1 sm:py-1.5 uppercase">{banner.ctaText}</span>
              </div>
            )}

            <div className="relative flex-grow w-full mt-2 sm:mt-4 flex items-end justify-center group-hover:scale-105 transition-transform duration-300">
              {isDark && <div className="absolute bottom-0 w-[120%] h-16 sm:h-24 bg-gradient-to-t from-green-900/60 to-transparent -mx-6 rounded-b-lg"></div>}
              
              <Image src={getMediaUrl(banner.image, '/assets/promo_muscle.png')} alt={banner.title} width={180} height={180} className={`object-contain max-h-[110px] sm:max-h-[150px] lg:max-h-[180px] w-auto filter drop-shadow-lg z-10 ${isDark ? 'relative bottom-2 sm:bottom-4' : ''}`} />
              
              {!isDark && (
                <div className="absolute right-1 sm:right-2 top-1 sm:top-4 bg-[#358798] text-white text-[8px] sm:text-[9px] font-black leading-tight text-center rounded-full w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center border-2 sm:border-[3px] border-white shadow-md z-20 shadow-black/10 transform rotate-12">
                  LIMITED<br/>OFFER
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};
