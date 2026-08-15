'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { bannerApi, Banner } from '@/lib/api/banner';
import { getMediaUrl } from '@/lib/media';

interface SlideData {
  image: string;
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

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const [productBanners, generalBanners, promoBanners] = await Promise.all([
          bannerApi.getPublicBanners('HOME_PRODUCT').catch(() => []),
          bannerApi.getPublicBanners('HOME_GENERAL').catch(() => []),
          bannerApi.getPublicBanners('PROMO').catch(() => [])
        ]);

        const allBanners = [...(productBanners || []), ...(generalBanners || []), ...(promoBanners || [])];

        if (allBanners.length > 0) {
          const sortedBanners = allBanners.sort((a, b) => a.sortOrder - b.sortOrder);
          setDynamicSlides(sortedBanners);
        }
      } catch (error) {
        console.error('Failed to fetch home banners:', error);
      }
    };
    fetchBanners();
  }, []);

  const resolveCtaLink = (b: Banner): string => {
    if (b.product?.slug) return `/product/${b.product.slug}`;
    if (b.link) return b.link;
    if (b.targetType === 'CATEGORY' && b.category?.slug) return `/category/${b.category.slug}`;
    if (b.targetType === 'BRAND' && b.brand?.slug) return `/brand/${b.brand.slug}`;
    return '/category/supplements';
  };

  const slides: SlideData[] = dynamicSlides.length > 0 ? dynamicSlides.map(b => ({
    image: getMediaUrl(b.image, '/assets/hero_bundle.png'),
    ctaLink: resolveCtaLink(b),
    title: b.title || '',
    subtitle: b.subtitle,
    ctaText: b.ctaText,
    type: b.type,
    video: b.video ? getMediaUrl(b.video, null as any) : null,
  })) : [
    {
      image: '/assets/hero_bundle.png',
      ctaLink: '/category/supplements',
    },
    {
      image: '/assets/iso_whey.png',
      ctaLink: '/category/supplements',
    },
  ];

  // Auto-scroll
  useEffect(() => {
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

  return (
    <section className="relative w-full overflow-hidden bg-black group">

      {/* Slider Container */}
      <div
        className="relative w-full flex items-center justify-center bg-black transition-all duration-700 overflow-hidden"
      >
        {/* Responsive full-width banner container - 21:9 ratio preserves full banner width without cropping on mobile */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[21/9] md:aspect-[21/9] max-h-[750px]">
          {slides.map((slide, index) => (
            <Link
              key={index}
              href={slide.ctaLink}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
              {/* Video or Image - Always edge-to-edge full cover */}
              {slide.video ? (
                <video
                  src={slide.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              ) : (
                <Image
                  src={slide.image}
                  alt={slide.title || 'Sculpt and Shine Premium Banner'}
                  fill
                  priority={index === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                />
              )}

              {/* Optional Text Overlay - Only if subtitle exists and is not empty */}
              {slide.subtitle && (
                <div className="absolute inset-0 z-10 flex items-end justify-start p-4 sm:p-10 md:p-14">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  <div className="relative z-10 max-w-xl space-y-1.5 sm:space-y-2">
                    {slide.title && (
                      <h2 className="text-sm sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                        {slide.title}
                      </h2>
                    )}
                    <p className="text-[11px] sm:text-sm md:text-base text-white/90 font-medium drop-shadow-sm line-clamp-2">
                      {slide.subtitle}
                    </p>
                    {slide.ctaText && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-5 sm:py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-extrabold text-[11px] sm:text-sm rounded-lg sm:rounded-xl shadow-lg shadow-gold-500/30 transition-all">
                        {slide.ctaText}
                        <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Carousel Prev / Next Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/90 text-white hover:text-black backdrop-blur-md shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:outline-none z-20"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/90 text-white hover:text-black backdrop-blur-md shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:outline-none z-20"
        aria-label="Next Slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-2 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`transition-all duration-300 rounded-full ${index === activeSlide ? 'w-5 sm:w-8 h-1 sm:h-2 bg-gold-500' : 'w-1 sm:w-2 h-1 sm:h-2 bg-white/50 hover:bg-white/80'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
