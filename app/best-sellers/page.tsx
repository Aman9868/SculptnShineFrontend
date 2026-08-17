import React from 'react';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import { CategoryLayout } from '@/components/category/CategoryLayout';
import { productAPI, Product } from '@/lib/api/product';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Selling Products | Sculpt N Shine',
  description: 'Explore best-selling fitness, health supplements, salon haircare, and luxury skincare products at Sculpt N Shine.',
};

export default async function BestSellersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const brand = resolvedSearchParams.brand as string | undefined;
  const flavors = resolvedSearchParams.flavors as string | undefined;
  const weights = resolvedSearchParams.weights as string | undefined;
  const preferences = resolvedSearchParams.preferences as string | undefined;
  const minPrice = resolvedSearchParams.minPrice as string | undefined;
  const maxPrice = resolvedSearchParams.maxPrice as string | undefined;
  const rating = resolvedSearchParams.rating as string | undefined;
  const sort = (resolvedSearchParams.sort as string) || 'popular';
  const page = parseInt((resolvedSearchParams.page as string) || '1', 10);
  const limit = parseInt((resolvedSearchParams.limit as string) || '12', 10);

  let products: Product[] = [];
  let pagination = { total: 0, page: 1, limit: 12, totalPages: 1 };
  let dynamicFilters: any = { brands: [], flavors: [], weights: [], preferences: [] };

  try {
    const [prodRes, filtersRes] = await Promise.all([
      productAPI.getProducts({
        sort,
        brand,
        flavors,
        weights,
        preference: preferences,
        minPrice,
        maxPrice,
        rating,
        page,
        limit,
      }).catch(() => null),
      productAPI.getFilters().catch(() => null),
    ]);

    if (prodRes && prodRes.success && prodRes.data?.products?.length > 0) {
      products = prodRes.data.products;
      pagination = prodRes.data.pagination;
    } else {
      // Fallback to getBestSellers if needed
      const bestSellersRes = await productAPI.getBestSellers(20).catch(() => null);
      if (bestSellersRes && bestSellersRes.data && bestSellersRes.data.length > 0) {
        products = bestSellersRes.data.filter(p => {
          const hasBase = p.unitPrice && p.unitPrice > 0;
          const hasVariant = p.variants && p.variants.some((v: any) => v.unitPrice > 0);
          return hasBase || hasVariant;
        });
        pagination = {
          total: products.length,
          page: 1,
          limit: products.length,
          totalPages: 1,
        };
      }
    }

    if (filtersRes && filtersRes.success) {
      dynamicFilters = filtersRes.data;
    }
  } catch (error) {
    console.error('Error loading best sellers page:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 overflow-hidden">
      <CategoryHeader
        title="Best Sellers"
        description="Discover our most popular, laboratory-tested formulas and luxury personal care essentials loved by thousands of fitness enthusiasts nationwide."
        imageSrc="/assets/bestseller_banner.jpg"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Best Sellers' },
        ]}
        subcategories={[]}
      />

      <CategoryLayout
        products={products as any}
        categories={[]}
        dynamicFilters={dynamicFilters}
        pagination={pagination}
      />
    </div>
  );
}
