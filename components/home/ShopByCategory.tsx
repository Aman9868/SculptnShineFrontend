'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, ArrowRight, Sparkles, Flame } from 'lucide-react';
import { CATEGORIES as STATIC_CATEGORIES } from '@/data/categories';
import { categoryAPI } from '@/lib/api/category';
import { getMediaUrl } from '@/lib/media';

interface CategoryItem {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  image: string;
  href: string;
}

const ENRICHED_CATEGORIES: CategoryItem[] = [
  {
    id: 'wellness-daily-health',
    name: 'Wellness & Daily Health',
    tagline: 'Vitamins, Omega-3 & Daily Vitality',
    badge: 'Essential',
    image: '/assets/cat_wellness.png',
    href: '/category/wellness-daily-health',
  },
  {
    id: 'beauty-luxury-cosmetics',
    name: 'Beauty & Luxury Cosmetics',
    tagline: 'Skincare Serums, Makeup & SPFs',
    badge: 'Trending',
    image: '/assets/cat_beauty.png',
    href: '/category/beauty-luxury-cosmetics',
  },
  {
    id: 'salon-haircare-excellence',
    name: 'Salon & Haircare Excellence',
    tagline: 'Shampoos, Nourishing Oils & Masks',
    badge: 'Pro Grade',
    image: '/assets/cat_haircare.png',
    href: '/category/salon-haircare-excellence',
  },
  {
    id: 'skincare-facial-care',
    name: 'Skincare & Facial Care',
    tagline: 'Hydrating Cleansers, Toners & Moisturizers',
    badge: 'Best Seller',
    image: '/assets/cat_skincare.png',
    href: '/category/skincare-facial-care',
  },
  {
    id: 'proteins-fitness-supplements',
    name: 'Proteins & Fitness Supplements',
    tagline: 'Whey Protein, Creatine & Pre-Workouts',
    badge: 'Top Rated',
    image: '/assets/cat_supplements.png',
    href: '/category/proteins-fitness-supplements',
  },
];

export const ShopByCategory: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>(ENRICHED_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollPosition = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    if (direction === 'left') {
      el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollPosition();
    el.addEventListener('scroll', checkScrollPosition, { passive: true });
    window.addEventListener('resize', checkScrollPosition);
    return () => {
      el.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [categories]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        if (res.success && res.data.categories.length > 0) {
          const mapped = res.data.categories.map((c) => {
            const enriched = ENRICHED_CATEGORIES.find((s) => s.href === `/category/${c.slug}`);
            return {
              id: c.id,
              name: enriched?.name || c.name,
              tagline: enriched?.tagline || 'Explore verified premium essentials',
              badge: enriched?.badge,
              image: getMediaUrl(c.image || enriched?.image || '/assets/promo_muscle.png'),
              href: `/category/${c.slug}`,
            };
          });

          // Only use DB categories — no supplementing with fallback
          setCategories(mapped);
        } else {
          setCategories(ENRICHED_CATEGORIES);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories(ENRICHED_CATEGORIES);
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
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto mb-2">
            <div className="h-px bg-gradient-to-r from-transparent to-gold-600/40 flex-1" />
            <div className="w-2 h-2 rotate-45 bg-gold-600" />
            <div className="h-px bg-gradient-to-l from-transparent to-gold-600/40 flex-1" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight uppercase">
            SHOP BY CATEGORY
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1.5">
            Explore our laboratory-tested wellness, fitness and luxury personal care collections
          </p>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-end gap-3.5 mb-6">
            {/* Pill-Style Left & Right Chevron Controls */}
            <div className="flex items-center gap-1.5 bg-amber-900/5 backdrop-blur-sm p-1 rounded-full border border-amber-900/10 shadow-2xs">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Previous categories"
                className={`p-2 rounded-full transition-all flex items-center justify-center ${
                  canScrollLeft
                    ? 'bg-white hover:bg-gold-500 hover:text-white text-gray-800 shadow-sm cursor-pointer active:scale-95'
                    : 'opacity-35 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Next categories"
                className={`p-2 rounded-full transition-all flex items-center justify-center ${
                  canScrollRight
                    ? 'bg-white hover:bg-gold-500 hover:text-white text-gray-800 shadow-sm cursor-pointer active:scale-95'
                    : 'opacity-35 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <Link
              href="/category"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-amber-800 hover:text-amber-950 transition-colors group py-1"
            >
              <span>Explore All</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform text-amber-600" />
            </Link>
          </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Category Cards Scroll Area */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-5 snap-x snap-mandatory pb-4 pt-2 touch-pan-x"
          >
            {loading ? (
              // Skeleton Loader
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 w-[160px] sm:w-[220px] md:w-[260px] min-w-[160px] sm:min-w-[220px] md:min-w-[260px] shrink-0 snap-start bg-white rounded-xl sm:rounded-2xl border border-cream-300 shadow-sm animate-pulse overflow-hidden"
                >
                  <div className="w-full aspect-[4/3] bg-cream-200" />
                  <div className="p-3 sm:p-4">
                    <div className="w-16 h-3 bg-gray-200 rounded-full mb-2" />
                    <div className="w-full h-4 sm:h-5 bg-gray-200 rounded mb-1.5" />
                    <div className="w-3/4 h-3 bg-gray-200 rounded" />
                  </div>
                </div>
              ))
            ) : (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="group flex-1 w-[160px] sm:w-[220px] md:w-[260px] min-w-[160px] sm:min-w-[220px] md:min-w-[260px] shrink-0 snap-start bg-white rounded-xl sm:rounded-2xl border border-cream-300 shadow-luxury hover:shadow-xl hover:border-gold-300/80 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden select-none cursor-pointer flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-cream-50">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 640px) 160px, (max-width: 1024px) 220px, 20vw"
                    />
                    {/* Subtle Bottom Gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-12 sm:h-16 bg-gradient-to-t from-black/30 to-transparent" />

                  </div>

                  {/* Content Area */}
                  <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-bold text-xs sm:text-base text-gray-900 leading-snug group-hover:text-gold-700 transition-colors line-clamp-2 mb-1">
                        {cat.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-medium line-clamp-1">
                        {cat.tagline}
                      </p>
                    </div>

                    {/* Shop Now Footer */}
                    <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-cream-200 flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-gold-600 group-hover:text-gold-700 transition-colors">
                        Shop Now
                      </span>
                      <div className="w-7 h-7 rounded-full bg-cream-100 border border-cream-300 text-gray-600 group-hover:bg-gold-600 group-hover:text-white group-hover:border-gold-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </section>
  );
};


