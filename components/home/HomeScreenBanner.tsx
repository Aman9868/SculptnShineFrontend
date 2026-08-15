'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { bannerApi, Banner } from '@/lib/api/banner';

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

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return '/assets/hero_bundle.png';
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return `/${url}`;
  };

  const resolveCtaLink = (b: Banner): string => {
    if (b.product?.slug) return `/product/${b.product.slug}`;
    if (b.link) return b.link;
    if (b.targetType === 'CATEGORY' && b.category?.slug) return `/category/${b.category.slug}`;
    if (b.targetType === 'BRAND' && b.brand?.slug) return `/brand/${b.brand.slug}`;
    return '/category/supplements';
  };

  const slides: SlideData[] = dynamicSlides.length > 0 ? dynamicSlides.map(b => ({
    image: resolveImageUrl(b.image),
    ctaLink: resolveCtaLink(b),
    title: b.title || '',
    subtitle: b.subtitle,
    ctaText: b.ctaText,
    type: b.type,
    video: b.video,
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
        {/* Responsive full-width banner container */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[21/9] max-h-[750px]">
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
                  src={resolveImageUrl(slide.video)}
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
                <div className="absolute inset-0 z-10 flex items-end justify-start p-6 sm:p-10 md:p-14">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  <div className="relative z-10 max-w-xl space-y-2">
                    {slide.title && (
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                        {slide.title}
                      </h2>
                    )}
                    <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium drop-shadow-sm">
                      {slide.subtitle}
                    </p>
                    {slide.ctaText && (
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-gold-500/30 transition-all">
                        {slide.ctaText}
                        <ArrowRight className="h-3.5 w-3.5" />
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
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/90 text-white hover:text-black backdrop-blur-md shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:outline-none z-20"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/90 text-white hover:text-black backdrop-blur-md shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:outline-none z-20"
        aria-label="Next Slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`transition-all duration-300 rounded-full ${index === activeSlide ? 'w-8 h-2 bg-gold-500' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
