'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const pathSegments = pathname.split('/').filter(Boolean);
  const isCategoryRoute = pathSegments[0] === 'category';
  const activeSubcategory = isCategoryRoute && pathSegments.length > 2 ? pathSegments[2] : '';

  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  const handleSubcategoryClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('subcategorySlug'); // Just in case it was lingering
    params.delete('page'); // Reset pagination
    
    if (slug) {
      router.push(`/category/${categorySlug}/${slug}?${params.toString()}`);
    } else {
      router.push(`/category/${categorySlug}?${params.toString()}`);
    }
  };

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
  }, [subcategories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-10 mt-2 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">Explore Categories</h2>
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
      
      {/* Hide scrollbar with custom css class */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-4 sm:gap-6 pt-2 pb-6 px-1 snap-x snap-mandatory scrollbar-hide scroll-smooth" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}} />
        
        <button
          onClick={() => handleSubcategoryClick('')}
          className="flex-shrink-0 snap-start outline-none"
        >
          <div className={`w-28 sm:w-36 md:w-40 aspect-[4/5] rounded-2xl overflow-hidden relative shadow-sm transition-all duration-300 ${!activeSubcategory ? 'ring-2 ring-offset-2 ring-gold-500 shadow-md -translate-y-1' : 'hover:shadow-md hover:-translate-y-1 ring-1 ring-black/5'} group bg-gradient-to-br from-cream-50 to-white flex flex-col items-center justify-center p-4 border border-cream-200`}>
            {/* Ambient glow behind icon */}
            <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 shadow-sm ${!activeSubcategory ? 'bg-gold-500 text-white' : 'bg-white text-gold-600 group-hover:bg-gold-50 border border-cream-100'}`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className={`text-sm sm:text-base font-semibold text-center transition-colors duration-300 ${!activeSubcategory ? 'text-gold-700' : 'text-gray-700 group-hover:text-gold-600'}`}>
              All Categories
            </span>
          </div>
        </button>

        {subcategories.map((subcat) => {
          const isActive = activeSubcategory === subcat.slug;
          return (
            <button
              key={subcat.slug}
              onClick={() => handleSubcategoryClick(subcat.slug)}
              className="flex-shrink-0 snap-start outline-none"
            >
              <div className={`w-28 sm:w-36 md:w-40 aspect-[4/5] rounded-2xl overflow-hidden relative shadow-sm transition-all duration-300 ${isActive ? 'ring-2 ring-offset-2 ring-gold-500 shadow-md -translate-y-1' : 'hover:shadow-md hover:-translate-y-1 ring-1 ring-black/5'} group bg-cream-50`}>
                <Image
                  src={getMediaUrl(subcat.image, '/assets/promo_muscle.png')}
                  alt={subcat.name}
                  fill
                  sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 160px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${isActive ? 'from-black/80 via-black/30 to-transparent' : 'from-black/70 via-black/10 to-transparent group-hover:from-black/80 group-hover:via-black/20'}`}></div>
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-left">
                  <span className={`text-sm sm:text-base font-semibold leading-snug transition-colors duration-300 ${isActive ? 'text-gold-300' : 'text-white group-hover:text-gold-200'}`}>
                    {subcat.name}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
