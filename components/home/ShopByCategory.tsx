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
    id: 'supplements',
    name: 'Supplements & Performance',
    tagline: 'Whey Protein, Creatine & Pre-Workouts',
    badge: 'Best Seller',
    image: '/assets/cat_supplements.png',
    href: '/category/supplements',
  },
  {
    id: 'skin-care',
    name: 'Luxury Skincare & Glow',
    tagline: 'Hydrating Serums, Cleansers & SPFs',
    badge: 'Trending',
    image: '/assets/cat_skincare.png',
    href: '/category/skin-care',
  },
  {
    id: 'hair-care',
    name: 'Salon & Haircare Excellence',
    tagline: 'Shampoos, Nourishing Oils & Masks',
    badge: 'Pro Grade',
    image: '/assets/cat_haircare.png',
    href: '/category/hair-care',
  },
  {
    id: 'wellness',
    name: 'Holistic Wellness & Recovery',
    tagline: 'Vitamins, Omega-3 & Daily Vitality',
    badge: 'Essential',
    image: '/assets/cat_wellness.png',
    href: '/category/wellness',
  },
  {
    id: 'salon',
    name: 'Professional Salon Supplies',
    tagline: 'Color, Keratin Treatment & Studio Gear',
    badge: 'Exclusive',
    image: '/assets/cat_salon.png',
    href: '/category/salon',
  },
  {
    id: 'beauty-tools',
    name: 'High-Tech Beauty Tools',
    tagline: 'Hair Dryers, Stylers & Rollers',
    badge: 'Top Rated',
    image: '/assets/cat_beauty.png',
    href: '/category/beauty-tools',
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
              name: c.name,
              tagline: enriched?.tagline || 'Explore verified premium essentials',
              badge: enriched?.badge,
              image: getMediaUrl(c.image || enriched?.image || '/assets/promo_muscle.png'),
              href: `/category/${c.slug}`,
            };
          });

          // Ensure at least 5-6 cards are displayed by supplementing with enriched categories
          const existingHrefs = new Set(mapped.map((c) => c.href));
          const fallbackList = ENRICHED_CATEGORIES.filter((s) => !existingHrefs.has(s.href));

          setCategories([...mapped, ...fallbackList]);
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
    <section className="py-14 sm:py-18 bg-gradient-to-b from-[#FAF7F2] via-[#F4EFE6] to-[#FAF7F2] border-y border-amber-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header row with Title, Pill-style Controls, and Explore All */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-700 mb-1.5">
              <Sparkles size={14} className="text-amber-500 fill-amber-500" />
              <span>Curated Collections</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-950 tracking-tight uppercase">
              SHOP BY CATEGORY
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
              Explore our laboratory-tested wellness, fitness and luxury personal care collections
            </p>
          </div>

          <div className="flex items-center gap-3.5 self-start sm:self-auto shrink-0">
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
              href="/category/supplements"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-amber-800 hover:text-amber-950 transition-colors group py-1"
            >
              <span>Explore All</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform text-amber-600" />
            </Link>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Category Cards Scroll Area */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-5 lg:gap-6 snap-x snap-mandatory pb-6 pt-2 touch-pan-x"
          >
            {loading ? (
              // Skeleton Loader
              Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-[280px] sm:w-[300px] lg:w-[calc(25%-1.2rem)] xl:w-[calc(20%-1.2rem)] h-[380px] sm:h-[420px] shrink-0 snap-start bg-white/80 rounded-3xl p-4 border border-cream-300 animate-pulse shadow-sm flex flex-col justify-end"
                >
                  <div className="w-20 h-4 bg-gray-200 rounded-full mb-3" />
                  <div className="w-40 h-6 bg-gray-200 rounded mb-2" />
                  <div className="w-32 h-3 bg-gray-200 rounded" />
                </div>
              ))
            ) : (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="group relative w-[280px] sm:w-[300px] lg:w-[calc(25%-1.2rem)] xl:w-[calc(20%-1.2rem)] h-[380px] sm:h-[420px] shrink-0 snap-start rounded-3xl overflow-hidden shadow-luxury hover:shadow-2xl border border-white/60 transition-all duration-500 hover:-translate-y-2.5 flex flex-col justify-between p-5 sm:p-6 select-none cursor-pointer"
                >
                  {/* Background Image with Ambient Zoom */}
                  <div className="absolute inset-0 bg-gray-900 overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                      sizes="(max-width: 640px) 280px, (max-width: 1024px) 300px, 20vw"
                    />
                    {/* Layered Gradient Overlay for Crystal Clear Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 group-hover:via-black/50 transition-colors duration-500" />
                  </div>

                  {/* Top Badge (if any) */}
                  <div className="relative z-10 flex items-center justify-between">
                    {cat.badge ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-md text-amber-900 shadow-sm border border-white/40">
                        <Flame size={11} className="text-amber-600 fill-amber-600" />
                        {cat.badge}
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>

                  {/* Bottom Content Area */}
                  <div className="relative z-10 space-y-2">
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-snug group-hover:text-gold-300 transition-colors drop-shadow-sm">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-300 font-medium line-clamp-1 mt-1 group-hover:text-gray-200 transition-colors">
                        {cat.tagline}
                      </p>
                    </div>

                    {/* Interactive Action Pill */}
                    <div className="pt-2 flex items-center justify-between border-t border-white/15">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-gold-400 group-hover:text-gold-300 transition-colors">
                        Shop Now
                      </span>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white group-hover:bg-gold-500 group-hover:text-gray-950 flex items-center justify-center transition-all duration-300 shadow-sm group-hover:scale-110">
                        <ChevronRight size={15} />
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


