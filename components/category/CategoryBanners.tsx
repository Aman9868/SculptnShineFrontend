'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getMediaUrl } from '@/lib/media';
import { Banner } from '@/lib/api/banner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryBannersProps {
  banners: Banner[];
  categoryName: string;
  fallbackImage: string;
}

export const CategoryBanners: React.FC<CategoryBannersProps> = ({ banners, categoryName, fallbackImage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const backendImages = banners.map(b => getMediaUrl(b.image));
  
  // Only show backend banners. If none exist, fallback to the category's main image
  const displayImages = backendImages.length > 0 
    ? backendImages 
    : fallbackImage ? [getMediaUrl(fallbackImage)] : [];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  }, [displayImages.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (displayImages.length <= 1) return;
    const timer = setInterval(nextSlide, 3500); // reduced from 5000ms for faster feedback
    return () => clearInterval(timer);
  }, [nextSlide, displayImages.length]);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 40;

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
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  if (displayImages.length === 0) return null;

  return (
    <div 
      className="relative w-full overflow-hidden group bg-black aspect-[1920/800]"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full absolute inset-0"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displayImages.map((src, idx) => (
          <div key={idx} className="relative w-full h-full flex-shrink-0">
            <Image
              src={src}
              alt={`${categoryName} banner ${idx + 1}`}
              fill
              className="object-contain sm:object-cover object-center"
              priority={idx === 0}
              sizes="(max-width: 768px) 100vw, 1920px"
            />
            {/* Overlay for fallback image to ensure title readability */}
            {banners.length === 0 && (
               <div className="absolute inset-0 bg-gradient-to-r from-[#18181B] via-[#18181B]/60 to-transparent flex flex-col justify-center px-4 sm:px-12">
                 <h1 className="text-xl sm:text-4xl md:text-5xl font-serif font-extrabold text-white tracking-tight uppercase max-w-2xl">
                   {categoryName}
                 </h1>
               </div>
            )}
          </div>
        ))}
      </div>

      {displayImages.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/30 hover:bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 opacity-0 group-hover:opacity-100 transition-all z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/30 hover:bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 opacity-0 group-hover:opacity-100 transition-all z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-10">
            {displayImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all rounded-full ${currentIndex === idx ? 'bg-gold-500 w-5 sm:w-6 h-1.5 sm:h-2' : 'bg-white/50 w-1.5 sm:w-2 h-1.5 sm:h-2 hover:bg-white'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
