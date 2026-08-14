'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bannerApi, Banner } from '@/lib/api/banner';

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
          // Sort banners by sortOrder
          const sortedBanners = allBanners.sort((a, b) => a.sortOrder - b.sortOrder);
          setDynamicSlides(sortedBanners);
        }
      } catch (error) {
        console.error('Failed to fetch home banners:', error);
      }
    };
    fetchBanners();
  }, []);

  const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

  const slides = dynamicSlides.length > 0 ? dynamicSlides.map(b => ({
    image: b.image.startsWith('http') ? b.image : `${BACKEND_URL}${b.image}`,
    ctaLink: b.targetType === 'PRODUCT' && b.product ? `/product/${b.product.slug}` :
             b.targetType === 'CATEGORY' && b.category ? `/category/${b.category.slug}` :
             b.targetType === 'BRAND' && b.brand ? `/brand/${b.brand.slug}` :
             b.link || '/category/supplements',
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

  const currentSlide = slides[activeSlide];

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
        {/* We use 21:9 for all desktop screens since the user is exporting exactly 1920x820 (which is 21:9). This prevents ultrawide cropping. */}
        <div className="relative w-full aspect-square sm:aspect-video md:aspect-[21/9] max-h-[800px]">
          {slides.map((slide, index) => (
            <Link 
              key={index}
              href={slide.ctaLink}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <Image
                src={slide.image}
                alt="Sculpt and Shine Premium Banner"
                fill
                priority={index === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
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
