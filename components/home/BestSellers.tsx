'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight, Flame, Star, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { productAPI, Product } from '@/lib/api/product';
import { getMediaUrl } from '@/lib/media';
import { Rating } from '@/components/ui/Rating';
import { useStore } from '@/context/StoreContext';
import { useRouter } from 'next/navigation';

export const BestSellers: React.FC = () => {
  const { toggleWishlist, isInWishlist } = useStore();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic best sellers
  useEffect(() => {
    let isMounted = true;
    const fetchBestSellers = async () => {
      try {
        setIsLoading(true);
        const res = await productAPI.getBestSellers(12);
        if (isMounted) {
          const validProducts = (res.data || []).filter((prod) => {
            const hasBasePrice = prod.unitPrice && prod.unitPrice > 0;
            const hasVariantPrice = prod.variants?.some((v) => v.unitPrice > 0);
            return hasBasePrice || hasVariantPrice;
          });
          setProducts(validProducts);
        }
      } catch (err: any) {
        console.error('Failed to load best seller products:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBestSellers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update scroll arrow disabled state
  const checkScrollPosition = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
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
  }, [products]);

  // Smooth scroll handler by 1 view distance
  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    if (direction === 'left') {
      el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      // Loop back to start if at the end
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Auto-scroll every 4.5 seconds (pauses on hover)
  useEffect(() => {
    if (isHovered || isLoading || products.length <= 5) return;
    const interval = setInterval(() => {
      const el = scrollContainerRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 280, behavior: 'smooth' });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered, isLoading, products]);

  return (
    <section 
      className="py-10 sm:py-14 lg:py-16 bg-white border-y border-cream-300 relative overflow-hidden group/section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header row with Chevrons and View All */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700 mb-1">
              <Flame size={14} className="text-amber-500 fill-amber-500" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight uppercase flex items-center gap-2">
              <span>BEST SELLERS</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              Top-rated formulas loved by fitness enthusiasts nationwide
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Left & Right Chevron Controls */}
            <div className="flex items-center gap-1.5 bg-cream-100 p-1 rounded-full border border-cream-300 shadow-2xs">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Previous products"
                className={`p-2 rounded-full transition-all flex items-center justify-center ${
                  canScrollLeft
                    ? 'bg-white hover:bg-gold-600 hover:text-white text-gray-800 shadow-xs cursor-pointer active:scale-95'
                    : 'opacity-35 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight && products.length <= 5}
                aria-label="Next products"
                className={`p-2 rounded-full transition-all flex items-center justify-center ${
                  canScrollRight
                    ? 'bg-white hover:bg-gold-600 hover:text-white text-gray-800 shadow-xs cursor-pointer active:scale-95'
                    : 'opacity-35 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <Link
              href="/best-sellers"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-gold-700 hover:text-gold-800 transition-colors group py-1"
            >
              <span>Explore All</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Loading Skeleton (5 items in view) */}
        {isLoading && (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(20%-13px)] shrink-0 bg-cream-50/80 rounded-2xl p-3 border border-cream-200 animate-pulse space-y-3"
              >
                <div className="w-full aspect-square rounded-xl bg-gray-200/80" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-8 w-full bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-10 bg-cream-50/50 rounded-2xl border border-cream-200 p-6">
            <Sparkles className="w-8 h-8 text-gold-600 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold text-gray-800">Featured collection updating</p>
            <p className="text-xs text-gray-500 mt-1">Check back shortly for our highest rated favorites.</p>
          </div>
        )}

        {/* Horizontal Scrollable Carousel (Top 5 in desktop view) */}
        {!isLoading && products.length > 0 && (
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((prod) => {
                const isWishlisted = isInWishlist(prod.id);

                // Calculate price & discount from default variant or base product
                const defaultVariant = prod.variants?.find((v) => v.isDefault && v.unitPrice > 0) || 
                                       prod.variants?.find((v) => v.unitPrice > 0) || 
                                       prod.variants?.[0];
                const unitPrice = (prod.unitPrice && prod.unitPrice > 0)
                  ? prod.unitPrice
                  : (defaultVariant?.unitPrice || 0);
                const discountPct = defaultVariant?.discountPercentage || prod.discountPercentage || 0;
                const originalPrice = discountPct > 0 
                  ? Math.round(unitPrice / (1 - discountPct / 100))
                  : null;

                // Image URL resolution
                const rawImage = prod.images?.[0] || defaultVariant?.images?.[0] || '';
                const imageUrl = getMediaUrl(rawImage, '/assets/og-image.png');

                const ratingValue = prod.averageRating && prod.averageRating > 0 ? prod.averageRating : 4.8;
                const reviewCountValue = prod.reviewCount && prod.reviewCount > 0 ? prod.reviewCount : 124;

                return (
                  <div
                    key={prod.id}
                    className="w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(20%-13px)] shrink-0 snap-start bg-white rounded-2xl p-3 border border-cream-300 shadow-2xs hover:shadow-luxury hover:border-gold-500/50 transition-all duration-300 flex flex-col justify-between relative group"
                  >
                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
                      <span className="bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs uppercase tracking-wider flex items-center gap-0.5">
                        <Star size={9} className="fill-white" />
                        <span>BEST SELLER</span>
                      </span>
                      {discountPct > 0 && (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                          -{Math.round(discountPct)}% OFF
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button Overlay */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(prod.id);
                      }}
                      className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white text-gray-600 flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer"
                      aria-label="Add to Wishlist"
                    >
                      <Heart
                        size={14}
                        className={isWishlisted ? 'fill-red-500 text-red-500' : 'hover:text-red-500'}
                      />
                    </button>

                    {/* Product Image */}
                    <Link
                      href={`/product/${prod.slug || prod.id}`}
                      className="relative w-full aspect-square rounded-xl overflow-hidden mb-2.5 bg-cream-50/50 p-2 border border-cream-200/80 flex items-center justify-center block"
                    >
                      <Image
                        src={imageUrl}
                        alt={prod.title}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-500 p-1"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Brand name */}
                        {prod.brand?.name && (
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gold-700 truncate">
                            {prod.brand.name}
                          </p>
                        )}

                        {/* Title */}
                        <Link href={`/product/${prod.slug || prod.id}`} className="block">
                          <h3 className="text-xs font-bold text-gray-900 line-clamp-2 min-h-[32px] group-hover:text-gold-700 transition-colors leading-snug">
                            {prod.title}
                          </h3>
                        </Link>

                        {/* Price and Original MRP */}
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-sm font-extrabold text-gray-900">
                            ₹{unitPrice.toLocaleString('en-IN')}
                          </span>
                          {originalPrice && originalPrice > unitPrice && (
                            <span className="text-[11px] text-gray-400 line-through">
                              ₹{originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Star Ratings */}
                        <div className="mt-1">
                          <Rating value={ratingValue} count={reviewCountValue} />
                        </div>
                      </div>

                      {/* View Product CTA */}
                      <button
                        onClick={() => router.push(`/product/${prod.slug || prod.id}`)}
                        className="w-full mt-2.5 bg-cream-200/90 hover:bg-gold-600 hover:text-white text-gray-900 text-xs font-bold py-2 rounded-xl border border-cream-300 transition-all flex items-center justify-center gap-1.5 group-hover:shadow-sm cursor-pointer active:scale-98"
                      >
                        <ShoppingBag size={13} />
                        <span>View Product</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

