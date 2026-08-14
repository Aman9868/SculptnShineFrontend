'use client';

import React, { useState } from 'react';
import { LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ProductCard } from './ProductCard';
import { Product } from '@/lib/api/product';

interface ProductGridProps {
  products: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, pagination }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.set('page', '1'); // Reset to page 1 on sort change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', e.target.value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentSort = searchParams.get('sort') || 'popular';
  
  const total = pagination?.total || products.length;
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const limit = pagination?.limit || 12;

  // Generate pagination buttons
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push('...');
      }
    }
    // Filter consecutive ellipses
    return pages.filter((p, idx, arr) => p !== '...' || arr[idx - 1] !== '...');
  };

  return (
    <div className="flex-grow">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <p className="text-sm text-gray-500 font-medium mb-4 sm:mb-0">
          Showing {total} products
        </p>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-gray-500">Sort by:</label>
            <select 
              id="sort"
              value={currentSort}
              onChange={handleSortChange}
              className="text-sm font-semibold text-brandDark px-3 py-1.5 border border-gray-200 rounded-md hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer bg-white"
            >
              <option value="popular">Popular</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          
          <div className="hidden sm:flex items-center gap-1 border-l border-gray-200 pl-4">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded border transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-gold-50 text-gold-600 border-gold-200' 
                  : 'text-gray-400 border-transparent hover:text-brandDark'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded border transition-colors ${
                viewMode === 'list' 
                  ? 'bg-gold-50 text-gold-600 border-gold-200' 
                  : 'text-gray-400 border-transparent hover:text-brandDark'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50/50 rounded-xl border border-gray-100">
          <div className="w-16 h-16 mb-4 text-gray-300">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
          <p className="text-gray-500 text-sm max-w-sm text-center">
            We couldn't find any products matching your current filters. Try removing some filters or adjusting your price range.
          </p>
        </div>
      ) : (
        <>
          <div className={`grid gap-4 md:gap-6 mb-10 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                viewMode={viewMode}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-100 mt-8">
              <div className="flex items-center gap-2 mb-4 sm:mb-0">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {getPageNumbers().map((p, idx) => (
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
                    ) : (
                      <button 
                        key={p} 
                        onClick={() => handlePageChange(p as number)}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-md transition-colors ${
                          p === currentPage 
                            ? 'text-white bg-[#D99A2B] shadow' 
                            : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  ))}
                </div>

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Show</span>
                <select 
                  value={limit}
                  onChange={handleLimitChange}
                  className="border border-gray-200 rounded-md px-2 py-1 text-brandDark font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                >
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                </select>
                <span>per page</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
