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
    <div className="mb-10 mt-2 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">Explore Categories</h2>
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
      
      {/* Scroll container — plain div, no flex tricks */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="overflow-x-auto pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .cat-scroll-row::-webkit-scrollbar { display: none; }
        `}} />
        {/* 
          Use a single inline-flex row. Each child is a plain div with fixed inline width/height.
          This avoids ALL flex/button sizing bugs.
        */}
        <div className="cat-scroll-row" style={{ display: 'inline-flex', gap: 16, paddingTop: 4, paddingBottom: 8 }}>
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
                className="cursor-pointer outline-none"
                style={{ width: 150, minWidth: 150, height: 190 }}
              >
                <div
                  className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-300 group
                    ${isActive 
                      ? 'ring-2 ring-gold-500 ring-offset-2 shadow-lg scale-[1.02]' 
                      : 'shadow-md hover:shadow-lg hover:scale-[1.02] ring-1 ring-black/5'
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
                        sizes="150px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm transition-colors ${
                        isActive ? 'bg-gold-500 text-white' : 'bg-white text-gold-600 border border-cream-200 group-hover:bg-gold-50'
                      }`}>
                        <LayoutGrid size={22} />
                      </div>
                      <span className={`text-sm font-semibold text-center leading-tight ${
                        isActive ? 'text-gold-700' : 'text-gray-700 group-hover:text-gold-600'
                      }`}>
                        All Categories
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col justify-end p-3 z-10">
                      <span className={`text-sm font-semibold leading-snug line-clamp-2 ${
                        isActive ? 'text-gold-300' : 'text-white group-hover:text-gold-200'
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
