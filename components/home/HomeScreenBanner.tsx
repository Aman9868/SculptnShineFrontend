'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { bannerApi, Banner } from '@/lib/api/banner';
import { getMediaUrl } from '@/lib/media';

interface SlideData {
  image: string;
  mobileImage?: string | null;
  ctaLink: string;
  title?: string;
  subtitle?: string | null;
  ctaText?: string | null;
  type?: string;
  video?: string | null;
}

export const HomeScreenBanner: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [dynamicSlides, setDynamicSlides] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const generalBanners = await bannerApi.getPublicBanners('HOME_GENERAL').catch(() => []);

        if (generalBanners && generalBanners.length > 0) {
          const sortedBanners = generalBanners.sort((a, b) => a.sortOrder - b.sortOrder);
          setDynamicSlides(sortedBanners);
        }
      } catch (error) {
        console.error('Failed to fetch home banners:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const resolveCtaLink = (b: Banner): string => {
    if (b.product?.slug) return `/product/${b.product.slug}`;
    if (b.link) return b.link;
    if (b.targetType === 'CATEGORY' && b.category?.slug) return `/category/${b.category.slug}`;
    if (b.targetType === 'BRAND' && b.brand?.slug) return `/brand/${b.brand.slug}`;
    return '/category/proteins-fitness-supplements';
  };

  const slides: SlideData[] = dynamicSlides.map(b => ({
    image: getMediaUrl(b.image, '/assets/og-image.png'),
    mobileImage: b.mobileImage ? getMediaUrl(b.mobileImage, null as any) : null,
    ctaLink: resolveCtaLink(b),
    title: b.title || '',
    subtitle: b.subtitle,
    ctaText: b.ctaText,
    type: b.type,
    video: b.video ? getMediaUrl(b.video, null as any) : null,
  }));

  // Auto-scroll
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance required
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    } else if (isRightSwipe) {
      setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }
  };

  if (isLoading) {
    return (
      <section className="relative w-full overflow-hidden bg-zinc-950">
        <div className="relative w-full aspect-[16/9] sm:aspect-[1920/800] bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 animate-pulse flex items-center justify-center">
          <img
            src="/assets/sculpt.png"
            alt="Loading Sculpt N Shine"
            className="h-10 sm:h-16 opacity-20 object-contain animate-pulse"
          />
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-black group select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slider Container */}
      <div className="relative w-full flex items-center justify-center bg-black transition-all duration-700 overflow-hidden">
        {/* Balanced, elegant 16:9 mobile aspect ratio and 1920x800 desktop aspect ratio */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[1920/800]">
          {slides.map((slide, index) => (
            <Link
              key={index}
              href={slide.ctaLink}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
            >
              {/* Video or Image */}
              {slide.video ? (
                <video
                  src={slide.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain sm:object-cover object-center"
                />
              ) : slide.mobileImage ? (
                <>
                  {/* Dedicated Mobile-Optimized Banner */}
                  <Image
                    src={slide.mobileImage}
                    alt={slide.title || 'Sculpt and Shine Banner'}
                    fill
                    priority={index === 0}
                    className="block sm:hidden object-cover object-center"
                    sizes="(max-width: 640px) 100vw, 1px"
                  />
                  {/* Desktop Banner */}
                  <Image
                    src={slide.image}
                    alt={slide.title || 'Sculpt and Shine Premium Banner'}
                    fill
                    priority={index === 0}
                    className="hidden sm:block object-cover object-center"
                    sizes="100vw"
                  />
                </>
              ) : (
                <Image
                  src={slide.image}
                  alt={slide.title || 'Sculpt and Shine Premium Banner'}
                  fill
                  priority={index === 0}
                  className="object-contain sm:object-cover object-center"
                  sizes="100vw"
                />
              )}

              {/* Optional Text Overlay - Only if subtitle exists and is not empty */}
              {slide.subtitle && (
                <div className="absolute inset-0 z-10 flex items-end justify-start p-3 sm:p-8 md:p-14">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                  <div className="relative z-10 max-w-xl space-y-1 sm:space-y-2">
                    {slide.title && (
                      <h2 className="text-xs xs:text-sm sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                        {slide.title}
                      </h2>
                    )}
                    <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-white/90 font-medium drop-shadow-sm line-clamp-1 sm:line-clamp-none">
                      {slide.subtitle}
                    </p>
                    {slide.ctaText && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-5 sm:py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-extrabold text-[10px] sm:text-sm rounded-lg sm:rounded-xl shadow-lg shadow-gold-500/30 transition-all">
                        {slide.ctaText}
                        <ArrowRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Carousel Prev / Next Controls (hidden on small touch screens, shown on hover for desktop) */}
      <button
        onClick={handlePrev}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-white text-white hover:text-black backdrop-blur-md shadow-lg items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:outline-none z-20 cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={handleNext}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-white text-white hover:text-black backdrop-blur-md shadow-lg items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:outline-none z-20 cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${index === activeSlide
                ? 'w-6 h-1.5 sm:w-8 sm:h-2 bg-gold-400 shadow-xs'
                : 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/40 hover:bg-white/70'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
