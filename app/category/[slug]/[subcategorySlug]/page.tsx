import React from 'react';
import { CategoryBanners } from '@/components/category/CategoryBanners';
import { TopSubcategories } from '@/components/category/TopSubcategories';
import { CategorySuperSavings } from '@/components/category/CategorySuperSavings';
import { CategoryLayout } from '@/components/category/CategoryLayout';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { categoryAPI } from '@/lib/api/category';
import { productAPI } from '@/lib/api/product';
import { bannerApi } from '@/lib/api/banner';
import { CategoryPromoCards } from '@/components/category/CategoryPromoCards';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; subcategorySlug: string }>;
}): Promise<Metadata> {
  const { slug, subcategorySlug } = await params;
  const slugFormatted = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  const subcatFormatted = subcategorySlug.charAt(0).toUpperCase() + subcategorySlug.slice(1).replace(/-/g, ' ');
  
  return {
    title: `${subcatFormatted} | ${slugFormatted} | Sculpt N Shine`,
    description: `Explore premium ${subcatFormatted} products at Sculpt N Shine. 100% genuine supplements, fitness, and wellness.`,
    openGraph: {
      title: `${subcatFormatted} | ${slugFormatted} | Sculpt N Shine`,
      description: `Explore premium ${subcatFormatted} products at Sculpt N Shine. 100% genuine supplements, fitness, and wellness.`,
      url: `https://sculptshine.shop/category/${slug}/${subcategorySlug}`,
      siteName: 'Sculpt N Shine',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${subcatFormatted} - Sculpt N Shine`,
        },
      ],
    },
  };
}

const SLUG_ALIASES: Record<string, string> = {
  'supplements': 'proteins-fitness-supplements',
  'protein': 'proteins-fitness-supplements',
  'fitness': 'proteins-fitness-supplements',
  'skin-care': 'skincare-facial-care',
  'skincare': 'skincare-facial-care',
  'hair-care': 'salon-haircare-excellence',
  'haircare': 'salon-haircare-excellence',
  'salon': 'salon-haircare-excellence',
  'wellness': 'wellness-daily-health',
  'health': 'wellness-daily-health',
  'beauty': 'beauty-luxury-cosmetics',
  'cosmetics': 'beauty-luxury-cosmetics',
};

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; subcategorySlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug: rawSlug, subcategorySlug } = await params;
  const rawLower = rawSlug.toLowerCase();
  const slugLower = SLUG_ALIASES[rawLower] || rawLower;
  
  // Await searchParams in Next.js 15+
  const resolvedSearchParams = await searchParams;
  
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

  // Fetch category first to validate subcategory
  const catRes = await categoryAPI.getCategoryById(slugLower).catch(() => null);
  if (!catRes || !catRes.success || !catRes.data) {
    notFound(); // Trigger 404 if category slug is invalid or not found
  }

  const category = catRes.data;
  const subcategories = (category as any).subcategories || [];
  const currentSubcategory = subcategories.find((s: any) => s.slug === subcategorySlug);
  
  if (!currentSubcategory) {
    notFound(); // Trigger 404 if subcategory is invalid
  }

  // Fetch real data from backend
  const [prodRes, filtersRes, headerBanners, promoBanners, superSavingsRes] = await Promise.all([
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
    categoryAPI.getCategoryFilters(slugLower).catch(() => null),
    bannerApi.getPublicBanners('CATEGORY_HEADER', slugLower, currentSubcategory.slug).catch(() => []),
    bannerApi.getPublicBanners('PROMO', slugLower, currentSubcategory.slug).catch(() => []),
    productAPI.getProducts({
      categorySlug: slugLower,
      limit: 10,
      sort: 'discount_desc'
    }).catch(() => null)
  ]);
  
  const categoryProducts = prodRes && prodRes.success ? prodRes.data.products : [];
  const pagination = prodRes && prodRes.success ? prodRes.data.pagination : { total: 0, page: 1, limit: 12, totalPages: 1 };
  const dynamicFilters = filtersRes && filtersRes.success ? filtersRes.data : { brands: [], flavors: [], weights: [], preferences: [] };
  const superSavingsProducts = superSavingsRes && superSavingsRes.success ? superSavingsRes.data.products : [];
  
  const bannerImage = category.image || '/assets/promo_muscle.png';
  
  return (
    <div className="flex flex-col">
      {headerBanners && headerBanners.length > 0 && (
        <CategoryBanners 
          banners={headerBanners} 
          categoryName={currentSubcategory.name} 
          fallbackImage={bannerImage} 
        />
      )}

      {promoBanners && promoBanners.length > 0 && (
        <section className="bg-white py-10 w-full border-b border-cream-200">
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <CategoryPromoCards banners={promoBanners} />
          </div>
        </section>
      )}

      <section className="bg-cream-50 py-10 w-full">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 overflow-hidden">
          <CategoryLayout 
            products={categoryProducts as any} 
            categories={subcategories as any} 
            subcategories={subcategories as any}
            categoryName={category.name}
            categorySlug={category.slug}
            dynamicFilters={dynamicFilters}
            pagination={pagination}
          />
        </div>
      </section>
    </div>
  );
}
