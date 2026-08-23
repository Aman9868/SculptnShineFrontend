'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { getMediaUrl } from '@/lib/media';

interface TopBrandProduct {
  id: string;
  title: string;
  slug: string;
  image: string | null;
}

interface TopBrand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  productCount: number;
  maxDiscount: number;
  products: TopBrandProduct[];
}

// Crisp Vector Brand Logos for top authentic brands
const BRAND_VECTOR_LOGOS: Record<string, React.ReactNode> = {
  'optimum nutrition': (
    <svg viewBox="0 0 170 50" className="h-7 sm:h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="25" r="16" fill="#18181B" />
      <circle cx="25" cy="25" r="13" fill="none" stroke="#D4AF37" strokeWidth="2" />
      <text x="25" y="31" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="13" fill="#D4AF37" textAnchor="middle">ON</text>
      <text x="52" y="22" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="11.5" fill="#18181B" letterSpacing="1">OPTIMUM</text>
      <text x="52" y="36" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="9.5" fill="#B45309" letterSpacing="2">NUTRITION</text>
    </svg>
  ),
  'alpino': (
    <svg viewBox="0 0 160 50" className="h-7 sm:h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="25" r="14" fill="#14532D" />
      <path d="M24 15 C19 19 19 30 24 35 C29 30 29 19 24 15 Z" fill="#BBF7D0" />
      <text x="46" y="32" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="18" fill="#14532D" letterSpacing="0.5">alpino</text>
    </svg>
  ),
  'one science nutrition': (
    <svg viewBox="0 0 170 50" className="h-7 sm:h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="25,8 39,16 39,34 25,42 11,34 11,16" fill="#D97706" />
      <text x="25" y="30" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="17" fill="#FFFFFF" textAnchor="middle">1</text>
      <text x="48" y="23" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="11" fill="#111111" letterSpacing="1">ONE SCIENCE</text>
      <text x="48" y="36" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="8.5" fill="#B45309" letterSpacing="2">NUTRITION</text>
    </svg>
  ),
  'dymatize': (
    <svg viewBox="0 0 160 50" className="h-7 sm:h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 13 L28 25 L14 37 Z" fill="#002F6C" />
      <path d="M21 13 L35 25 L21 37 Z" fill="#DC2626" />
      <text x="42" y="32" fontFamily="Impact, Arial Black, sans-serif" fontStyle="italic" fontWeight="900" fontSize="23" fill="#002F6C" letterSpacing="0.5">Dymatize</text>
    </svg>
  ),
  'muscletech': (
    <svg viewBox="0 0 160 50" className="h-7 sm:h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="14,13 26,13 33,37 21,37" fill="#DC2626" />
      <polygon points="24,13 31,13 38,37 31,37" fill="#18181B" />
      <text x="43" y="31" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="16" fill="#18181B" letterSpacing="1">MUSCLETECH</text>
    </svg>
  ),
  'labrada nutrition': (
    <svg viewBox="0 0 160 50" className="h-7 sm:h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="23" cy="25" r="14" fill="#E11D48" />
      <path d="M18 16 L18 34 L30 34" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <text x="44" y="29" fontFamily="Impact, Arial Black, sans-serif" fontSize="19" fill="#E11D48" letterSpacing="1">LABRADA</text>
      <text x="44" y="39" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="6.5" fill="#18181B" letterSpacing="1.5">THE NUTRITION COMPANY</text>
    </svg>
  ),
  'labrada': (
    <svg viewBox="0 0 160 50" className="h-7 sm:h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="23" cy="25" r="14" fill="#E11D48" />
      <path d="M18 16 L18 34 L30 34" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <text x="44" y="29" fontFamily="Impact, Arial Black, sans-serif" fontSize="19" fill="#E11D48" letterSpacing="1">LABRADA</text>
      <text x="44" y="39" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="6.5" fill="#18181B" letterSpacing="1.5">THE NUTRITION COMPANY</text>
    </svg>
  ),
  'bsn nutrition': (
    <svg viewBox="0 0 150 50" className="h-7 sm:h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12 L32 18 L32 30 C32 36 22 40 22 40 C22 40 12 36 12 30 L12 18 Z" fill="#DC2626" />
      <circle cx="22" cy="21" r="3.5" stroke="#FFFFFF" strokeWidth="1.5" />
      <text x="40" y="32" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="20" fill="#DC2626" fontStyle="italic">BSN</text>
    </svg>
  ),
  'bsn': (
    <svg viewBox="0 0 150 50" className="h-7 sm:h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12 L32 18 L32 30 C32 36 22 40 22 40 C22 40 12 36 12 30 L12 18 Z" fill="#DC2626" />
      <circle cx="22" cy="21" r="3.5" stroke="#FFFFFF" strokeWidth="1.5" />
      <text x="40" y="32" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="20" fill="#DC2626" fontStyle="italic">BSN</text>
    </svg>
  ),
  'pro jym': (
    <svg viewBox="0 0 150 50" className="h-7 sm:h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="75" y="32" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="20" fill="#18181B" textAnchor="middle" fontStyle="italic">PRO JYM</text>
    </svg>
  ),
  'muscleblaze': (
    <svg viewBox="0 0 160 50" className="h-7 sm:h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="14,35 21,15 30,27 39,15 46,35 37,35 30,25 23,35" fill="#F59E0B" />
      <text x="52" y="26" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="12" fill="#111111">MUSCLE</text>
      <text x="52" y="38" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="12" fill="#F59E0B">BLAZE</text>
    </svg>
  ),
};

export default function TopSellingBrands() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [brands, setBrands] = useState<TopBrand[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTopBrands = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.sculptshine.shop/api';
        const res = await fetch(`${apiUrl}/brands/top-selling?limit=10`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && isMounted) {
            setBrands(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch top selling brands:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchTopBrands();
    return () => { isMounted = false; };
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      const cardWidth = 320;
      setActiveIndex(Math.min(Math.max(0, Math.round(scrollLeft / cardWidth)), brands.length - 1));
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth',
      });
    }
  };

  if (!isLoading && brands.length === 0) return null;

  return (
    <section className="py-12 lg:py-16 bg-[#FAF7F2] border-y border-cream-300 relative overflow-hidden">
      {/* Ambient gold glow background accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-px bg-gradient-to-r from-gold-600 to-transparent w-8" />
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-gold-700 flex items-center gap-1.5">
                <Sparkles size={12} className="text-gold-600" />
                Featured Partners
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brandDark tracking-tight uppercase">
              TOP SELLING BRANDS
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
              Explore authentic formulas & exclusive deals from India&apos;s leading nutrition giants
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs p-1.5 rounded-full border border-cream-300 shadow-2xs self-start sm:self-auto">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous brand"
              className={`p-2 rounded-full transition-all flex items-center justify-center ${
                canScrollLeft
                  ? 'bg-cream-100 hover:bg-gold-600 hover:text-white text-brandDark shadow-xs cursor-pointer active:scale-95'
                  : 'opacity-30 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Next brand"
              className={`p-2 rounded-full transition-all flex items-center justify-center ${
                canScrollRight
                  ? 'bg-cream-100 hover:bg-gold-600 hover:text-white text-brandDark shadow-xs cursor-pointer active:scale-95'
                  : 'opacity-30 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex gap-5 sm:gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="shrink-0 w-[280px] sm:w-[305px] md:w-[320px] h-[380px] rounded-3xl bg-white/60 border border-cream-300/80 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Brand Cards Showcase Carousel */}
        {!isLoading && brands.length > 0 && (
          <>
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-5 sm:gap-6 overflow-x-auto hide-scrollbar pb-5 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory"
            >
              {brands.map((brand) => {
                const searchHref = `/search?brand=${encodeURIComponent(brand.name)}`;
                const normalizedName = brand.name.toLowerCase().trim();
                const customSvg = BRAND_VECTOR_LOGOS[normalizedName];
                const discount = brand.maxDiscount > 0 ? `${brand.maxDiscount}%` : null;
                const logoUrl = brand.logo && !brand.logo.includes('clearbit.com')
                  ? getMediaUrl(brand.logo, '')
                  : null;

                // Extract ONLY 100% REAL product images from the API database
                const realProductImages = (brand.products || [])
                  .map((p) => (p.image ? getMediaUrl(p.image, '') : null))
                  .filter((url): url is string => Boolean(url && !url.includes('undefined') && url.trim().length > 0));

                return (
                  <Link
                    key={brand.id}
                    href={searchHref}
                    className="group shrink-0 w-[280px] sm:w-[305px] md:w-[320px] snap-start rounded-3xl p-6 bg-gradient-to-b from-white via-cream-50/80 to-cream-100/90 border border-cream-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_-6px_rgba(184,134,11,0.18)] hover:border-gold-400 hover:-translate-y-1.5 transition-all duration-400 relative overflow-hidden flex flex-col justify-between cursor-pointer"
                  >
                    {/* Subtle Gold Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 rounded-full blur-2xl pointer-events-none group-hover:bg-gold-400/15 transition-colors duration-400" />

                    {/* Top: Brand Logo */}
                    <div className="relative z-10 flex items-center justify-center h-12 mb-3">
                      {customSvg ? (
                        <div className="group-hover:scale-108 transition-transform duration-300">
                          {customSvg}
                        </div>
                      ) : logoUrl ? (
                        <div className="h-10 flex items-center justify-center group-hover:scale-108 transition-transform duration-300">
                          <img
                            src={logoUrl}
                            alt={brand.name}
                            className="h-full w-auto object-contain max-w-[150px]"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-base sm:text-lg font-serif font-black uppercase tracking-wider text-brandDark">
                          {brand.name}
                        </span>
                      )}
                    </div>

                    {/* Center: Gold Discount Badge */}
                    <div className="relative z-10 flex justify-center my-3">
                      <div className="bg-white rounded-2xl px-5 py-2 border border-gold-300/80 shadow-xs group-hover:border-gold-500 group-hover:shadow-md transition-all duration-300 text-center">
                        <span className="block text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-gray-500 leading-none">
                          UP TO
                        </span>
                        <span className="block text-xl sm:text-2xl font-black text-amber-700 leading-tight">
                          {discount || '20%'} <span className="text-xs font-black text-amber-800">OFF</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom: 100% REAL Product Tubs (NO FAKE / UNSPLASH FALLBACKS) */}
                    <div className="relative z-10 mt-auto pt-3 h-44 sm:h-48 flex items-end justify-center">
                      {realProductImages.length >= 2 ? (
                        <div className="relative flex items-end justify-center w-full h-full pb-2">
                          {/* 1st Real Product Tub */}
                          <div className="relative w-28 sm:w-32 h-36 sm:h-40 shrink-0 transform -rotate-3 group-hover:-rotate-6 group-hover:scale-105 transition-all duration-400 z-10">
                            <img
                              src={realProductImages[0]}
                              alt={`${brand.name} product`}
                              className="w-full h-full object-contain filter drop-shadow-md"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          {/* 2nd Real Product Tub */}
                          <div className="relative w-28 sm:w-32 h-36 sm:h-40 shrink-0 transform rotate-3 group-hover:rotate-6 group-hover:scale-105 transition-all duration-400 -ml-7 z-20">
                            <img
                              src={realProductImages[1]}
                              alt={`${brand.name} product`}
                              className="w-full h-full object-contain filter drop-shadow-md"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      ) : realProductImages.length === 1 ? (
                        <div className="relative w-36 sm:w-40 h-36 sm:h-40 shrink-0 group-hover:scale-108 transition-all duration-400 pb-2 flex items-center justify-center">
                          <img
                            src={realProductImages[0]}
                            alt={`${brand.name} product`}
                            className="w-full h-full object-contain filter drop-shadow-md"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full pb-4">
                          <span className="text-xs text-gold-700 font-bold uppercase tracking-wider">
                            {brand.productCount} Products in Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Bar: Explore Link on Hover */}
                    <div className="pt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-gold-700 opacity-80 group-hover:opacity-100 group-hover:text-gold-800 transition-all duration-300">
                      <span>Explore {brand.name}</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination Indicator Dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {brands.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (scrollRef.current) {
                      scrollRef.current.scrollTo({ left: idx * 320, behavior: 'smooth' });
                      setActiveIndex(idx);
                    }
                  }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx ? 'w-7 bg-gold-600' : 'w-2 bg-cream-300 hover:bg-gold-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
