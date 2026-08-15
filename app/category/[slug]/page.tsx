import React from 'react';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import { CategoryLayout } from '@/components/category/CategoryLayout';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { categoryAPI } from '@/lib/api/category';
import { productAPI } from '@/lib/api/product';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  const slugFormatted = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  return {
    title: `${slugFormatted} | Sculpt N Shine`,
    description: `Explore premium ${slugFormatted} products at Sculpt N Shine. 100% genuine supplements, fitness, and wellness.`,
    openGraph: {
      title: `${slugFormatted} | Sculpt N Shine`,
      description: `Explore premium ${slugFormatted} products at Sculpt N Shine. 100% genuine supplements, fitness, and wellness.`,
      url: `https://sculptshine.shop/category/${slug}`,
      siteName: 'Sculpt N Shine',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${slugFormatted} - Sculpt N Shine`,
        },
      ],
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const slug = (await params).slug;
  const slugLower = slug.toLowerCase();
  
  // Await searchParams in Next.js 15+
  const resolvedSearchParams = await searchParams;
  
  const subcategorySlug = resolvedSearchParams.subcategorySlug as string | undefined;
  const flavors = resolvedSearchParams.flavors as string | undefined;
  const weights = resolvedSearchParams.weights as string | undefined;
  const preferences = resolvedSearchParams.preferences as string | undefined;
  const brand = resolvedSearchParams.brand as string | undefined;
  const minPrice = resolvedSearchParams.minPrice as string | undefined;
  const maxPrice = resolvedSearchParams.maxPrice as string | undefined;
  const rating = resolvedSearchParams.rating as string | undefined;
  const sort = resolvedSearchParams.sort as string | undefined;

  const page = parseInt((resolvedSearchParams.page as string) || '1', 10);
  const limit = parseInt((resolvedSearchParams.limit as string) || '12', 10);

  // Fetch real data from backend
  const [catRes, prodRes, filtersRes] = await Promise.all([
    categoryAPI.getCategoryById(slugLower).catch(() => null),
    productAPI.getProducts({ 
      categorySlug: slugLower,
      subcategorySlug,
      flavors,
      weights,
      preference: preferences,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort,
      page,
      limit
    }).catch(() => null),
    categoryAPI.getCategoryFilters(slugLower).catch(() => null)
  ]);

  if (!catRes || !catRes.success || !catRes.data) {
    notFound(); // Trigger 404 if category slug is invalid or not found
  }

  const category = catRes.data;
  const categoryProducts = prodRes && prodRes.success ? prodRes.data.products : [];
  const pagination = prodRes && prodRes.success ? prodRes.data.pagination : { total: 0, page: 1, limit: 12, totalPages: 1 };
  const dynamicFilters = filtersRes && filtersRes.success ? filtersRes.data : { brands: [], flavors: [], weights: [], preferences: [] };
  
  const subcategories = (category as any).subcategories || [];
  const bannerImage = category.image || '/assets/promo_muscle.png';

  // Map subcategories for the CategoryHeader to objects with name and slug
  const subcatPills = [
    { name: 'All ' + category.name, slug: '' },
    ...subcategories.map((s: any) => ({ name: s.name, slug: s.slug }))
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 overflow-hidden">
      <CategoryHeader 
        title={category.name}
        description={category.description || `Explore our premium ${category.name} collection.`}
        imageSrc={bannerImage}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: category.name }
        ]}
        subcategories={subcatPills as any}
        activeSubcategorySlug={subcategorySlug || ''}
      />
      
      <CategoryLayout 
        products={categoryProducts as any} 
        categories={subcategories as any} 
        dynamicFilters={dynamicFilters}
        pagination={pagination}
      />
    </div>
  );
}
