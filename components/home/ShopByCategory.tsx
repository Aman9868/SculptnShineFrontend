'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { CATEGORIES as STATIC_CATEGORIES } from '@/data/categories';
import { categoryAPI } from '@/lib/api/category';
import { getMediaUrl } from '@/lib/media';

export const ShopByCategory: React.FC = () => {
  const [categories, setCategories] = useState<any[]>(STATIC_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.firstElementChild ? (container.firstElementChild as HTMLElement).offsetWidth : container.clientWidth;
    const newIndex = Math.round(scrollLeft / (itemWidth || 1));
    setActiveIndex(Math.min(Math.max(0, newIndex), categories.length - 1));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const items = container.children;
    if (items[index]) {
      (items[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        if (res.success && res.data.categories.length > 0) {
          const mapped = res.data.categories.map((c) => {
            const staticCat = STATIC_CATEGORIES.find((s) => s.href === `/category/${c.slug}`);
            return {
              id: c.id,
              name: c.name,
              image: getMediaUrl(c.image || staticCat?.image || '/assets/promo_muscle.png'),
              href: `/category/${c.slug}`,
            };
          });
          setCategories(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-12 lg:py-16 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header with Decorative Lines */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto mb-2">
            <div className="h-px bg-gradient-to-r from-transparent to-gold-600/40 flex-1" />
            <div className="w-2 h-2 rotate-45 bg-gold-600" />
            <div className="h-px bg-gradient-to-l from-transparent to-gold-600/40 flex-1" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight uppercase">
            SHOP BY CATEGORY
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Left Scroll Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md border border-cream-300 rounded-full w-12 h-12 hidden md:group-hover:flex items-center justify-center text-gray-600 hover:text-gold-600 hover:bg-cream-50 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} className="mr-0.5" />
          </button>

          {/* Right Scroll Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md border border-cream-300 rounded-full w-12 h-12 hidden md:group-hover:flex items-center justify-center text-gray-600 hover:text-gold-600 hover:bg-cream-50 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} className="ml-0.5" />
          </button>

          {/* Category Cards Scroll Area */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-6 lg:gap-8 snap-x snap-mandatory pb-4 touch-pan-x"
          >
            {loading ? (
              // Skeleton Loader
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="min-w-full sm:min-w-[calc(50%-0.75rem)] lg:min-w-[calc(33.333%-1.33rem)] shrink-0 snap-start bg-white rounded-2xl p-4 sm:p-5 border border-cream-300 shadow-luxury flex flex-col items-center">
                  <div className="w-full h-40 sm:h-48 lg:h-56 rounded-xl bg-cream-200 animate-pulse mb-4" />
                  <div className="w-24 h-5 bg-cream-200 animate-pulse rounded" />
                </div>
              ))
            ) : (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="min-w-full sm:min-w-[calc(50%-0.75rem)] lg:min-w-[calc(33.333%-1.33rem)] shrink-0 snap-start group bg-white rounded-2xl p-4 sm:p-5 border border-cream-300 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col items-center justify-between text-center"
                >
                  {/* Image Container with fixed height to match Why Choose Us proportions */}
                  <div className="relative w-full h-40 sm:h-48 lg:h-56 rounded-xl overflow-hidden mb-4 bg-cream-50 border border-cream-200">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-108 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>

                  {/* Title & Arrow Action */}
                  <div className="w-full flex items-center justify-between pt-1 px-1 gap-2">
                    <span className="text-sm font-extrabold text-gray-900 tracking-wider uppercase group-hover:text-gold-700 transition-colors truncate">
                      {cat.name}
                    </span>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-cream-200 group-hover:bg-gold-600 text-gray-700 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Pagination Dots */}
          {!loading && categories.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
              {categories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index 
                      ? 'w-6 bg-gold-600' 
                      : 'w-2 bg-cream-300 hover:bg-cream-400'
                  }`}
                  aria-label={`Go to category slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

