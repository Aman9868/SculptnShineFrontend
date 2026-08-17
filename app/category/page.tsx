import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Home, ArrowRight, Sparkles } from 'lucide-react';
import { categoryAPI } from '@/lib/api/category';
import { getMediaUrl } from '@/lib/media';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore All Categories | Sculpt N Shine',
  description: 'Explore our complete collection of laboratory-tested wellness, nutrition, fitness, and luxury care categories.',
};

export default async function CategoriesPage() {
  let categories: any[] = [];

  try {
    const res = await categoryAPI.getCategories();
    if (res && res.success && res.data.categories) {
      categories = res.data.categories;
    }
  } catch (error) {
    console.error('Error fetching categories page:', error);
  }

  return (
    <div className="bg-cream-50 min-h-screen py-8 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-8 tracking-wide uppercase">
          <Link href="/" className="hover:text-gold-700 transition-colors flex items-center gap-1">
            <Home size={14} />
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gold-600">Categories</span>
        </nav>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-700 mb-2">
            <Sparkles size={14} className="text-amber-500 fill-amber-500" />
            <span>Curated Collections</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight uppercase mb-3">
            EXPLORE CATEGORIES
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
            Discover our full range of 100% genuine supplements, advanced skincare, salon-grade haircare, and daily wellness essentials.
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-cream-200 p-8">
            <p className="text-gray-500 font-medium mb-4">No categories available at the moment.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gold-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gold-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categories.map((cat) => {
              const imageSrc = getMediaUrl(cat.image || '/assets/promo_muscle.png');
              return (
                <Link
                  key={cat.id || cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group relative bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-luxury hover:shadow-2xl hover:border-gold-300/80 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between"
                >
                  {/* Category Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-100">
                    <Image
                      src={imageSrc}
                      alt={cat.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  {/* Content Area */}
                  <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                    <div>
                      <h2 className="text-lg sm:text-xl font-serif font-bold text-gray-900 group-hover:text-gold-700 transition-colors mb-2">
                        {cat.name}
                      </h2>
                      {cat.description && (
                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-cream-100 flex items-center justify-between mt-auto">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gold-700 group-hover:text-gold-800 transition-colors">
                        View Products
                      </span>
                      <div className="w-8 h-8 rounded-full bg-cream-100 border border-cream-200 flex items-center justify-center text-gray-700 group-hover:bg-gold-600 group-hover:text-white group-hover:border-gold-600 group-hover:translate-x-1 transition-all">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
