'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { getMediaUrl } from '@/lib/media';

interface Subcategory {
  name: string;
  slug: string;
  image?: string;
}

interface TopSubcategoriesProps {
  subcategories: Subcategory[];
  categorySlug: string;
}

export const TopSubcategories: React.FC<TopSubcategoriesProps> = ({ subcategories, categorySlug }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const pathSegments = pathname.split('/').filter(Boolean);
  const activeSubcategory = pathSegments[0] === 'category' && pathSegments.length > 2 ? pathSegments[2] : '';

  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  const handleClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('subcategorySlug');
    params.delete('page');
    
    if (slug) {
      router.push(`/category/${categorySlug}/${slug}?${params.toString()}`);
    } else {
      router.push(`/category/${categorySlug}?${params.toString()}`);
    }
  };

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [subcategories]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  // All items: "All Categories" + actual subcategories
  const allItems = [
    { slug: '', name: 'All Categories', image: '' },
    ...subcategories,
  ];

  return (
    <div className="mb-6 sm:mb-10 mt-2 relative">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">Explore Categories</h2>
        <div className="hidden sm:flex items-center gap-2">
          <button 
            onClick={() => scroll('left')} 
            disabled={!canScrollLeft}
            className={`w-10 h-10 flex items-center justify-center shrink-0 rounded-full border transition-all ${canScrollLeft ? 'bg-white border-cream-300 text-brandDark hover:bg-cream-100 shadow-sm cursor-pointer' : 'border-cream-100 text-cream-300 cursor-not-allowed bg-cream-50/50'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')} 
            disabled={!canScrollRight}
            className={`w-10 h-10 flex items-center justify-center shrink-0 rounded-full border transition-all ${canScrollRight ? 'bg-white border-cream-300 text-brandDark hover:bg-cream-100 shadow-sm cursor-pointer' : 'border-cream-100 text-cream-300 cursor-not-allowed bg-cream-50/50'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Scroll container */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="overflow-x-auto pb-2 sm:pb-3 -mx-1 px-1 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .cat-scroll-row::-webkit-scrollbar { display: none; }
        `}} />
        <div className="cat-scroll-row flex gap-2.5 sm:gap-4 px-1.5 py-2 sm:py-2.5">
          {allItems.map((item, idx) => {
            const isAllCard = idx === 0;
            const isActive = isAllCard ? !activeSubcategory : activeSubcategory === item.slug;

            return (
              <div
                key={item.slug || 'all'}
                onClick={() => handleClick(item.slug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleClick(item.slug)}
                className="cursor-pointer outline-none shrink-0 w-[112px] sm:w-[136px] md:w-[150px] h-[140px] sm:h-[168px] md:h-[190px] snap-start"
              >
                <div
                  className={`relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 group
                    ${isActive 
                      ? 'border-2 border-gold-500 shadow-md shadow-gold-500/25' 
                      : 'border border-cream-300 shadow-xs hover:shadow-md hover:border-gold-300'
                    }`}
                >
                  {/* Background */}
                  {isAllCard ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" />
                  ) : (
                    <>
                      <Image
                        src={getMediaUrl(item.image, '/assets/promo_muscle.png')}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 120px, 150px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className={`absolute inset-0 transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-t from-black/80 via-black/30 to-black/10' 
                          : 'bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80'
                      }`} />
                    </>
                  )}

                  {/* Content */}
                  {isAllCard ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-3 z-10">
                      <div className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 shadow-sm transition-colors ${
                        isActive ? 'bg-gold-500 text-white' : 'bg-white text-gold-600 border border-cream-200 group-hover:bg-gold-50'
                      }`}>
                        <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5" />
                      </div>
                      <span className={`text-xs sm:text-sm font-semibold text-center leading-tight ${
                        isActive ? 'text-gold-700 font-bold' : 'text-gray-700 group-hover:text-gold-600'
                      }`}>
                        All Categories
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col justify-end p-2.5 sm:p-3 z-10">
                      <span className={`text-xs sm:text-sm font-semibold leading-snug line-clamp-2 ${
                        isActive ? 'text-gold-300 font-bold' : 'text-white group-hover:text-gold-200'
                      }`}>
                        {item.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
