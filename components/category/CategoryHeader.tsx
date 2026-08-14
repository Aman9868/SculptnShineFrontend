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
    <div className="mb-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center flex-wrap gap-y-1 text-xs sm:text-sm text-gray-500 mb-6">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="mx-1.5 text-gray-400 shrink-0">&gt;</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-gold-600 transition-colors shrink-0 whitespace-nowrap">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium shrink-0 whitespace-nowrap">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="flex flex-col md:flex-row gap-8 mb-8 items-start md:items-center">
        {/* Title Section */}
        <div className="md:w-1/3 z-10">
          <h1 className="text-4xl md:text-5xl font-serif-luxury text-brandDark mb-3 uppercase tracking-wider">
            {title}
          </h1>
          <p className="text-gray-600">
            {description}
          </p>
        </div>

        {/* Hero Image */}
        <div className="w-full md:w-2/3 h-48 md:h-64 relative rounded-2xl overflow-hidden shadow-luxury">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover object-center"
            priority
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-brandDark/20 to-transparent mix-blend-overlay"></div>
        </div>
      </div>

      {/* Subcategory Pills */}
      <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {subcategories.map((sub, idx) => {
          const isActive = activeSubcategorySlug === sub.slug;
          
          return (
            <Link
              key={idx}
              href={`?subcategorySlug=${sub.slug}`}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-300 flex-shrink-0 ${
                isActive
                  ? 'bg-gold-500 text-white border-gold-500 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gold-300 hover:text-gold-600'
              }`}
              scroll={false}
            >
              {sub.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
