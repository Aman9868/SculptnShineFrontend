import React from 'react';
import { CategoryLayout } from '@/components/category/CategoryLayout';
import { productAPI } from '@/lib/api/product';
import Link from 'next/link';
import { SearchX, ChevronRight, Home } from 'lucide-react';

export const metadata = {
  title: 'Explore Products | Sculpt & Shine',
  description: 'Browse our complete catalog of 100% genuine supplements, wellness, and beauty products.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const query = (resolvedSearchParams.q as string) || '';
  const page = parseInt((resolvedSearchParams.page as string) || '1', 10);
  const limit = parseInt((resolvedSearchParams.limit as string) || '12', 10);
  
  // Filters
  const brand = resolvedSearchParams.brand as string | undefined;
  const minPrice = resolvedSearchParams.minPrice as string | undefined;
  const maxPrice = resolvedSearchParams.maxPrice as string | undefined;
  const rating = resolvedSearchParams.rating as string | undefined;
  const sort = resolvedSearchParams.sort as string | undefined;

  let products: any[] = [];
  let pagination = { total: 0, page: 1, limit: 12, totalPages: 1 };
  
  type FilterItem = { name: string; count: number };
  let dynamicFilters: { 
    brands: FilterItem[], 
    flavors: FilterItem[], 
    weights: FilterItem[], 
    preferences: FilterItem[],
    ratings?: { stars: number, count: number }[]
  } = { brands: [], flavors: [], weights: [], preferences: [] };

  try {
    const [prodRes, filtersRes] = await Promise.all([
      productAPI.getProducts({ 
        search: query.trim() || undefined,
        brand,
        minPrice,
        maxPrice,
        rating,
        sort: sort || (query.trim() ? undefined : 'popular'),
        page,
        limit
      }).catch(() => null),
      productAPI.getFilters(query.trim() || undefined).catch(() => null)
    ]);
    
    if (prodRes && prodRes.success) {
      products = prodRes.data.products;
      pagination = prodRes.data.pagination;
    }

    if (filtersRes && filtersRes.success) {
      dynamicFilters = filtersRes.data;
    }
  } catch (e) {
    console.error('Error fetching products search results:', e);
  }

  const pageTitle = query.trim()
    ? `Results for "${query}"`
    : sort === 'popular'
    ? 'Best Selling Products'
    : 'All Products';

  const breadcrumbLabel = query.trim()
    ? 'Search Results'
    : sort === 'popular'
    ? 'Best Sellers'
    : 'All Products';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 min-h-[60vh]">
      
      {/* Breadcrumbs & Header */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6 tracking-wide uppercase">
        <Link href="/" className="hover:text-gold-700 transition-colors flex items-center gap-1">
          <Home size={14} />
          Home
        </Link>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gold-600">{breadcrumbLabel}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-gray-900 mb-2">
          {pageTitle}
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          {pagination.total} {pagination.total === 1 ? 'product' : 'products'} available
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-cream-200 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center text-gold-600 mb-6">
            <SearchX size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {query.trim() ? `No products found for "${query}"` : 'No products found'}
          </h2>
          <p className="text-gray-500 max-w-md mb-8">
            {query.trim()
              ? 'Try checking your spelling or searching with different, more general keywords.'
              : 'Please check back soon or browse our categories.'}
          </p>
          <Link
            href="/category"
            className="inline-flex items-center justify-center bg-gold-600 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-gold-700 transition-colors shadow-luxury hover:shadow-luxury-hover"
          >
            Explore Categories
          </Link>
        </div>
      ) : (
        <CategoryLayout 
          products={products} 
          categories={[]} // no subcategories for search page
          dynamicFilters={dynamicFilters}
          pagination={pagination}
        />
      )}
    </div>
  );
}
