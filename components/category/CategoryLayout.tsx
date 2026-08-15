'use client';

import React, { useState } from 'react';
import { FilterSidebar } from './FilterSidebar';
import { ProductGrid } from './ProductGrid';
import { Product } from '@/lib/api/product';

interface FilterItem {
  name: string;
  count: number;
}

interface CategoryLayoutProps {
  products: Product[];
  categories: any[];
  dynamicFilters?: {
    brands: FilterItem[];
    flavors: FilterItem[];
    weights: FilterItem[];
    preferences: FilterItem[];
    ratings?: { stars: number; count: number }[];
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const CategoryLayout: React.FC<CategoryLayoutProps> = ({ products, categories, dynamicFilters, pagination }) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <div className="flex relative">
      {/* Sidebar (Desktop sticky & Mobile drawer) */}
      <FilterSidebar 
        categories={categories} 
        dynamicFilters={dynamicFilters}
        isMobileOpen={isMobileFilterOpen}
        onMobileClose={() => setIsMobileFilterOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-grow min-w-0 pl-0 md:pl-6 lg:pl-8 mt-4 md:mt-0">
        <ProductGrid 
          products={products} 
          pagination={pagination} 
          onOpenFilter={() => setIsMobileFilterOpen(true)}
        />
      </div>
    </div>
  );
};

