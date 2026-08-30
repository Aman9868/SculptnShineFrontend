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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {banners.slice(0, 4).map((banner, index) => {
        const isDark = index % 2 === 1;
        
        const link = banner.targetType === 'PRODUCT' && banner.product ? `/product/${banner.product.slug}` :
                     banner.targetType === 'CATEGORY' && banner.category ? `/category/${banner.category.slug}` :
                     banner.targetType === 'SUBCATEGORY' && banner.category && banner.subcategory ? `/category/${banner.category.slug}/${banner.subcategory.slug}` :
                     banner.targetType === 'BRAND' && banner.brand ? `/brand/${banner.brand.slug}` :
                     banner.link || '#';

        return (
          <Link key={banner.id} href={link} className={`group relative rounded-lg p-5 flex flex-col items-center text-center overflow-hidden h-[340px] shadow-sm hover:shadow-md transition-shadow ${isDark ? 'bg-gradient-to-b from-[#E6EFF1] to-[#607D8B]' : 'bg-gradient-to-br from-[#E0F7F6] to-[#C9EDEB]'}`}>
            
            <h3 className="text-2xl font-black text-[#006E82] tracking-tight leading-tight">{banner.title}</h3>
            {banner.subtitle && <p className="text-[13px] font-bold text-gray-800 mt-0.5">{banner.subtitle}</p>}
            
            {banner.ctaText && (
              <div className="mt-3 inline-flex items-center border border-gray-300 rounded-sm overflow-hidden bg-white z-10">
                <span className="text-[11px] font-black text-white bg-[#006E82] px-3 py-1.5 uppercase">{banner.ctaText}</span>
              </div>
            )}

            <div className="relative flex-grow w-full mt-4 flex items-end justify-center group-hover:scale-105 transition-transform duration-300">
              {isDark && <div className="absolute bottom-0 w-[120%] h-24 bg-gradient-to-t from-green-900/60 to-transparent -mx-6 rounded-b-lg"></div>}
              
              <Image src={getMediaUrl(banner.image, '/assets/promo_muscle.png')} alt={banner.title} width={180} height={180} className={`object-contain filter drop-shadow-lg z-10 ${isDark ? 'relative bottom-4' : ''}`} />
              
              {!isDark && (
                <div className="absolute right-2 top-4 bg-[#358798] text-white text-[9px] font-black leading-tight text-center rounded-full w-12 h-12 flex items-center justify-center border-[3px] border-white shadow-md z-20 shadow-black/10 transform rotate-12">
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
