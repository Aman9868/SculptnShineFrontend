'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '@/lib/api/product';

interface SimilarBrandsShowcaseProps {
  currentProduct: Product;
  allProducts: Product[];
}

interface BrandShowcaseItem {
  brandName: string;
  brandTagline: string;
  heroMediaUrl: string;
  product: Product;
}

const BRAND_HEROES: Record<string, { banner: string; tagline: string }> = {
  'Dymatize': {
    banner: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    tagline: 'ISO100 Hydrolyzed 100% Whey Isolate & Athletic Fuel',
  },
  'Optimum Nutrition': {
    banner: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    tagline: "The World's #1 Gold Standard Whey Protein",
  },
  'One Science Nutrition': {
    banner: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    tagline: 'Grass-Fed European Whey & Gourmet Formulations',
  },
  'BSN Nutrition': {
    banner: 'https://images.unsplash.com/photo-1593095940071-007d80173876?auto=format&fit=crop&w=800&q=80',
    tagline: 'Syntha-6 Legendary Ultra-Premium Sustained Matrix',
  },
  'Scitec Nutrition': {
    banner: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80',
    tagline: '100% Whey Professional Fortified with Amino Enzymes',
  },
  'Pro JYM': {
    banner: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    tagline: 'Scientific Tri-Phase Protein Matrix by Dr. Jim Stoppani',
  },
  'Labrada Nutrition': {
    banner: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    tagline: 'IFBB Pro Formulated High-Calorie Muscle Mass Gainers',
  },
};

const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=300&q=80';

export const SimilarBrandsShowcase: React.FC<SimilarBrandsShowcaseProps> = ({
  currentProduct,
  allProducts,
}) => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Group products by brand and pick 1 representative flagship product per distinct brand
  const brandItems: BrandShowcaseItem[] = React.useMemo(() => {
    const brandsMap: Record<string, Product> = {};

    for (const p of allProducts) {
      const bName = p.brand?.name || (p as any).brandName || 'Sculpt & Shine';
      if (!brandsMap[bName] && p.id !== currentProduct.id) {
        brandsMap[bName] = p;
      }
    }

    return Object.entries(brandsMap).map(([brandName, prod]) => {
      const meta = BRAND_HEROES[brandName] || {
        banner: prod.images?.[1] || prod.images?.[0] || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
        tagline: 'Certified Authentic Fitness & Sports Nutrition',
      };

      return {
        brandName,
        brandTagline: meta.tagline,
        heroMediaUrl: meta.banner,
        product: prod,
      };
    });
  }, [allProducts, currentProduct]);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [brandItems]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  if (brandItems.length === 0) return null;

  return (
    <div className="mt-16 pt-12 border-t border-gray-200">
      {/* Header with Title and Chevrons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-serif-luxury text-brandDark">
              Similar Brands in this Category
            </h2>
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Sponsored
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Explore authentic top-rated alternatives from official certified brand partners
          </p>
        </div>

        {/* Carousel Chevrons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`p-2.5 rounded-full border transition-all ${canScrollLeft
                ? 'border-gray-300 text-gray-800 hover:bg-gold-50 hover:border-gold-400 hover:text-gold-700 shadow-xs cursor-pointer'
                : 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50/50'
              }`}
            aria-label="Previous brands"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`p-2.5 rounded-full border transition-all ${canScrollRight
                ? 'border-gray-300 text-gray-800 hover:bg-gold-50 hover:border-gold-400 hover:text-gold-700 shadow-xs cursor-pointer'
                : 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50/50'
              }`}
            aria-label="Next brands"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Brand Cards Grid / Slider */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-6 pb-6 pt-1 snap-x snap-mandatory scroll-smooth hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {brandItems.map((item, idx) => {
          const { product, brandName, heroMediaUrl } = item;
          const discountPercent = product.discountPercentage || 0;
          const originalPrice = product.unitPrice || 0;
          const finalPrice = discountPercent > 0
            ? originalPrice * (1 - discountPercent / 100)
            : originalPrice;

          const productHref = `/product/${product.slug || product.id}`;

          return (
            <div
              key={idx}
              onClick={() => router.push(productHref)}
              className="w-[320px] sm:w-[360px] shrink-0 snap-start bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
            >
              {/* Top Hero Lifestyle Banner */}
              <Link href={productHref} className="relative h-44 w-full block overflow-hidden bg-gray-900">
                <img
                  src={heroMediaUrl}
                  alt={brandName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Brand Badge Over Hero with API Logo or Shield Icon */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 border border-gray-100">
                  {product.brand?.logo ? (
                    <img
                      src={product.brand.logo}
                      alt={brandName}
                      className="h-4 max-w-[65px] object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                  )}
                  <span className="text-xs font-extrabold text-brandDark uppercase tracking-wider">
                    {brandName}
                  </span>
                </div>

                {/* Brand Tagline */}
                <p className="absolute bottom-3 left-3 right-3 text-xs font-semibold text-white/95 truncate">
                  {item.brandTagline}
                </p>
              </Link>

              {/* Bottom Featured Product Box */}
              <div className="p-4 bg-gray-50/50 flex-grow flex flex-col justify-between border-t border-gray-100">
                <Link href={productHref} className="flex gap-3 items-start mb-3 group/prod">
                  {/* Mini Product Packaging Thumbnail with onError handler */}
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-white border border-gray-200 p-1.5 flex items-center justify-center overflow-hidden shadow-2xs">
                    <img
                      src={product.images?.[0] || FALLBACK_PRODUCT_IMAGE}
                      alt={product.title}
                      className="max-h-full max-w-full object-contain group-hover/prod:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                      }}
                    />
                  </div>

                  <div className="flex-grow min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover/prod:text-gold-600 transition-colors line-clamp-2 leading-snug">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span className="text-xs font-extrabold text-gray-800">4.8</span>
                      <span className="text-[11px] text-gray-500">
                        ({(product as any).reviewCount || 120})
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Price & Action Row */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200/80">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold text-brandDark">
                        ₹{Math.round(finalPrice).toLocaleString('en-IN')}
                      </span>
                      {discountPercent > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{Math.round(originalPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    {discountPercent > 0 && (
                      <span className="text-[10px] font-bold text-orange-600 uppercase">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  <Link
                    href={productHref}
                    className="px-3.5 py-1.5 rounded-xl bg-brandDark text-white text-xs font-bold hover:bg-gold-600 active:scale-95 transition-all flex items-center gap-1 shadow-xs"
                  >
                    <span>View Deal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
