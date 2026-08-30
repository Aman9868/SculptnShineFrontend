'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/api/product';
import { ProductCard } from './ProductCard';
import { ArrowRight } from 'lucide-react';

interface CategorySuperSavingsProps {
  products: Product[];
  categorySlug: string;
}

export const CategorySuperSavings: React.FC<CategorySuperSavingsProps> = ({ products, categorySlug }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 border-b border-cream-200 pb-2">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
          Super Savings
          <span className="text-sm font-medium text-red-600 ml-2 tracking-wide">(Up to 64% Off)</span>
        </h2>
        <Link 
          href={`/category/${categorySlug}?sort=discount_desc`} 
          className="text-xs sm:text-sm font-medium text-gold-600 hover:text-gold-700 flex items-center gap-1 transition-colors group"
        >
          View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* Horizontal scrolling container */}
      <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 pt-2 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}} />
        
        {products.map((product) => (
          <div key={product.id} className="w-[180px] sm:w-[220px] md:w-[240px] flex-shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};
