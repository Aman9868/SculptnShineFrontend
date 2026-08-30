import React from 'react';
import { CategoryBanners } from '@/components/category/CategoryBanners';
import { TopSubcategories } from '@/components/category/TopSubcategories';
import { CategorySuperSavings } from '@/components/category/CategorySuperSavings';
import { CategoryLayout } from '@/components/category/CategoryLayout';
import { CategoryPromoCards } from '@/components/category/CategoryPromoCards';
import { ProductSpotlightBanners } from '@/components/category/ProductSpotlightBanners';
import TopSellingBrands from '@/components/home/TopSellingBrands';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { categoryAPI } from '@/lib/api/category';
import { productAPI } from '@/lib/api/product';
import { bannerApi } from '@/lib/api/banner';

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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawSlug = (await params).slug;
  const rawLower = rawSlug.toLowerCase();
  const slugLower = SLUG_ALIASES[rawLower] || rawLower;
  
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
  const [catRes, prodRes, filtersRes, banners, superSavingsRes, promoBanners, productSpotlightBanners] = await Promise.all([
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
    categoryAPI.getCategoryFilters(slugLower).catch(() => null),
    bannerApi.getPublicBanners('CATEGORY_HEADER', slugLower).catch(() => []),
    productAPI.getProducts({
      categorySlug: slugLower,
      limit: 10,
      sort: 'discount_desc'
    }).catch(() => null),
    bannerApi.getPublicBanners('PROMO', slugLower).catch(() => []),
    bannerApi.getPublicBanners('HOME_PRODUCT', slugLower).catch(() => []),
  ]);

  if (!catRes || !catRes.success || !catRes.data) {
    notFound(); // Trigger 404 if category slug is invalid or not found
  }

  const category = catRes.data;
  const categoryProducts = prodRes && prodRes.success ? prodRes.data.products : [];
  const pagination = prodRes && prodRes.success ? prodRes.data.pagination : { total: 0, page: 1, limit: 12, totalPages: 1 };
  const dynamicFilters = filtersRes && filtersRes.success ? filtersRes.data : { brands: [], flavors: [], weights: [], preferences: [] };
  const superSavingsProducts = superSavingsRes && superSavingsRes.success ? superSavingsRes.data.products : [];
  
  const subcategories = (category as any).subcategories || [];
  const bannerImage = category.image || '/assets/promo_muscle.png';

  // Map subcategories for the CategoryHeader to objects with name and slug
  const subcatPills = [
    { name: 'All ' + category.name, slug: '' },
    ...subcategories.map((s: any) => ({ name: s.name, slug: s.slug }))
  ];
  // Determine which sections will render and dynamically assign alternating backgrounds
  const sectionsToRender = [
    {
      id: 'top-subcategories',
      condition: subcategories && subcategories.length > 0,
      render: (bgClass: string) => (
        <section key="top-subcategories" className={`${bgClass} py-10 w-full`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TopSubcategories subcategories={subcategories} categorySlug={category.slug} />
          </div>
        </section>
      )
    },
    {
      id: 'promo-banners',
      condition: promoBanners && promoBanners.length > 0,
      render: (bgClass: string) => (
        <section key="promo-banners" className={`${bgClass} py-10 w-full border-t border-cream-200`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CategoryPromoCards banners={promoBanners} />
          </div>
        </section>
      )
    },
    {
      id: 'super-savings',
      condition: superSavingsProducts && (superSavingsProducts as any).length > 0,
      render: (bgClass: string) => (
        <section key="super-savings" className={`${bgClass} py-10 w-full border-t border-cream-200`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CategorySuperSavings products={superSavingsProducts as any} categorySlug={category.slug} />
          </div>
        </section>
      )
    },
    {
      id: 'product-spotlight',
      condition: productSpotlightBanners && productSpotlightBanners.length > 0,
      render: (bgClass: string) => (
        <section key="product-spotlight" className={`${bgClass} py-10 w-full border-t border-cream-200`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductSpotlightBanners banners={productSpotlightBanners} />
          </div>
        </section>
      )
    },
    {
      id: 'top-selling-brands',
      condition: true, // Internal state handles empty
      render: (bgClass: string) => (
        <TopSellingBrands key="top-selling-brands" categorySlug={category.slug} bgClass={bgClass} />
      )
    }
  ];

  const renderedSections = sectionsToRender
    .filter(section => section.condition)
    .map((section, index) => {
      // Strictly alternate between cream and white for all rendered sections
      const bgClass = index % 2 === 0 ? 'bg-cream-100' : 'bg-white';
      return section.render(bgClass);
    });
  
  return (
    <div className="flex flex-col">
      <CategoryBanners 
        banners={banners || []} 
        categoryName={category.name} 
        fallbackImage={bannerImage} 
      />

      {renderedSections}
    </div>
  );
}
