import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getMediaUrl } from '@/lib/media';

interface CategoryHeaderProps {
  title: string;
  description: string;
  imageSrc: string;
  breadcrumbs: { label: string; href?: string }[];
  subcategories?: any[];
  activeSubcategorySlug?: string;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  title,
  description,
  imageSrc,
  breadcrumbs,
}) => {
  const resolvedImage = getMediaUrl(imageSrc, '/assets/cat_supplements.png');

  return (
    <div className="mb-6 sm:mb-8 max-w-full">
      {/* Breadcrumbs */}
      <nav className="flex items-center flex-wrap gap-y-1 text-xs text-gray-500 mb-4 sm:mb-5">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="mx-2 text-gray-400 shrink-0">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-gold-600 font-medium transition-colors shrink-0 whitespace-nowrap">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-semibold shrink-0 whitespace-nowrap truncate max-w-[220px]">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Hero Banner with Title & Description */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-cream-300 bg-gradient-to-r from-[#18181B] to-[#27272A] min-h-[140px] sm:min-h-[180px] md:min-h-[220px] flex items-center">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={resolvedImage}
            alt={title}
            fill
            className="object-cover object-center opacity-40 mix-blend-luminosity"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#18181B] via-[#18181B]/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 sm:px-10 py-6 sm:py-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/30 text-gold-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3">
            Official Store Collection
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-extrabold text-white tracking-tight uppercase leading-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-medium mt-2 leading-relaxed line-clamp-2 sm:line-clamp-none max-w-xl">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
