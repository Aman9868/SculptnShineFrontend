'use client';

import React from 'react';
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
  return (
    <div className="flex relative">
      {/* Sidebar */}
      <FilterSidebar 
        categories={categories} 
        dynamicFilters={dynamicFilters}
      />

      {/* Main Content */}
      <div className="flex-grow min-w-0 pl-0 lg:pl-8 mt-8 lg:mt-0">
        <ProductGrid products={products} pagination={pagination} />
      </div>
    </div>
  );
};
