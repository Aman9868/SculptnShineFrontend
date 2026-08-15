'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PROMO_BANNERS } from '@/data/categories';
import { bannerApi, Banner } from '@/lib/api/banner';
import { getMediaUrl } from '@/lib/media';

export const FeatureBanners: React.FC = () => {
  const [dynamicBanners, setDynamicBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const banners = await bannerApi.getPublicBanners('PROMO');
        if (banners && banners.length > 0) {
          setDynamicBanners(banners.sort((a, b) => a.sortOrder - b.sortOrder));
        }
      } catch (error) {
        console.error('Failed to fetch promo banners:', error);
      }
    };
    fetchPromos();
  }, []);

  const displayBanners = dynamicBanners.length > 0 ? dynamicBanners.map((b: Banner) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle || '',
    image: getMediaUrl(b.image, '/assets/promo_muscle.png'),
    actionText: b.ctaText || 'SHOP NOW',
    link: b.targetType === 'PRODUCT' && b.product ? `/product/${b.product.slug}` :
          b.targetType === 'CATEGORY' && b.category ? `/category/${b.category.slug}` :
          b.targetType === 'BRAND' && b.brand ? `/brand/${b.brand.slug}` :
          b.link || '/category/supplements',
  })) : PROMO_BANNERS;

  return (
    <section className="py-12 lg:py-16 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayBanners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.link}
              className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-luxury border border-cream-300 flex flex-col justify-end p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-luxury-hover"
            >
              {/* Image Background */}
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover group-hover:scale-108 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 400px"
              />

              {/* Dark Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              {/* Banner Content */}
              <div className="relative z-10 space-y-1 text-white">
                <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-gold-400">
                  {banner.title}
                </h3>
                <p className="text-xs uppercase font-semibold tracking-wider text-gray-200">
                  {banner.subtitle}
                </p>
                <div className="pt-3 inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-gold-400 transition-colors">
                  <span>{banner.actionText}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};
