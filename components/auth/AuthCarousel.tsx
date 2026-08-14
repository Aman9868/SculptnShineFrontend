'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { bannerApi, Banner } from '@/lib/api/banner';

const IMAGES = [
  {
    src: '/assets/hero_bundle.png',
    title: 'Welcome Back.',
    subtitle: 'Continue your journey towards a healthier, stronger, and more radiant you.'
  },
  {
    src: '/assets/salon_banner.png',
    title: 'Join Our Community.',
    subtitle: 'Unlock exclusive rewards, track your orders, and elevate your wellness journey.'
  },
  {
    src: '/assets/cat_wellness.png',
    title: 'Premium Quality.',
    subtitle: 'Authentic products guaranteed to deliver powerful results.'
  }
];

interface AuthCarouselProps {
  bannerType?: 'LOGIN_BG' | 'SIGNUP_BG';
}

export const AuthCarousel: React.FC<AuthCarouselProps> = ({ bannerType = 'LOGIN_BG' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dynamicImages, setDynamicImages] = useState<Banner[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const banners = await bannerApi.getPublicBanners(bannerType);
        if (banners && banners.length > 0) {
          setDynamicImages(banners);
        }
      } catch (error) {
        console.error('Failed to fetch auth banners:', error);
      }
    };
    fetchBanners();
  }, [bannerType]);

  const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

  const displayImages = dynamicImages.length > 0 ? dynamicImages.map(b => ({
    src: b.image.startsWith('http') ? b.image : `${BACKEND_URL}${b.image}`,
    title: b.title,
    subtitle: b.subtitle || ''
  })) : IMAGES;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, [displayImages.length]);

  return (
    <div className="hidden lg:block lg:w-1/2 relative bg-cream-50 overflow-hidden">
      {displayImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={image.src}
            alt={image.title}
            fill
            className="object-cover object-center mix-blend-multiply opacity-95 p-16"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brandDark/90 via-transparent to-transparent flex flex-col justify-end p-16">
            <h2 className="text-4xl font-serif text-white mb-4 transform translate-y-0 transition-transform duration-700 delay-100">
              {image.title}
            </h2>
            <p className="text-cream-50 text-lg max-w-md transform translate-y-0 transition-transform duration-700 delay-200">
              {image.subtitle}
            </p>
          </div>
        </div>
      ))}
      
      {/* Carousel Indicators */}
      <div className="absolute bottom-6 left-16 z-20 flex gap-2">
        {displayImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-8 bg-gold-500' : 'w-2 bg-cream-100/50 hover:bg-cream-100/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
