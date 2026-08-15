import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Subcategory {
  name: string;
  slug: string;
}

interface CategoryHeaderProps {
  title: string;
  description: string;
  imageSrc: string;
  breadcrumbs: { label: string; href?: string }[];
  subcategories: Subcategory[];
  activeSubcategorySlug?: string;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  title,
  description,
  imageSrc,
  breadcrumbs,
  subcategories,
  activeSubcategorySlug = ''
}) => {
  return (
    <div className="mb-6 sm:mb-10 max-w-full">
      {/* Breadcrumbs */}
      <nav className="flex items-center flex-wrap gap-y-1 text-xs text-gray-500 mb-4 sm:mb-6">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="mx-1.5 text-gray-400 shrink-0">&gt;</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-gold-600 transition-colors shrink-0 whitespace-nowrap">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium shrink-0 whitespace-nowrap truncate max-w-[200px]">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-6 sm:mb-8 items-start md:items-center">
        {/* Title Section */}
        <div className="w-full md:w-1/3 z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-extrabold text-brandDark mb-2 sm:mb-3 uppercase tracking-wide break-words">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Hero Image */}
        <div className="w-full md:w-2/3 h-40 sm:h-52 md:h-64 relative rounded-2xl overflow-hidden shadow-luxury bg-cream-200 shrink-0">
          <Image
            src={imageSrc || '/assets/promo_muscle.png'}
            alt={title}
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 768px) 100vw, 66vw"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-brandDark/30 via-transparent to-transparent mix-blend-overlay"></div>
        </div>
      </div>

      {/* Subcategory Pills */}
      {subcategories && subcategories.length > 0 && (
        <div className="flex overflow-x-auto hide-scrollbar gap-2 sm:gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0 touch-pan-x">
          {subcategories.map((sub, idx) => {
            const isActive = activeSubcategorySlug === sub.slug;
            
            return (
              <Link
                key={idx}
                href={`?subcategorySlug=${sub.slug}`}
                className={`whitespace-nowrap px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-300 flex-shrink-0 ${
                  isActive
                    ? 'bg-gold-500 text-white border-gold-500 shadow-md'
                    : 'bg-white text-gray-700 border-cream-300 hover:border-gold-300 hover:text-gold-600'
                }`}
                scroll={false}
              >
                {sub.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
