import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { productAPI, Product } from '@/lib/api/product';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductDetails } from '@/components/product/ProductDetails';
import { ProductHighlights } from '@/components/product/ProductHighlights';
import { ProductTabs } from '@/components/product/ProductTabs';
import ProductReviews from '@/components/product/ProductReviews';
import { RelatedProductsCarousel } from '@/components/product/RelatedProductsCarousel';
import { SimilarBrandsShowcase } from '@/components/product/SimilarBrandsShowcase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const idOrSlug = (await params).id;
  
  let product: Product | undefined;
  let relatedProducts: Product[] = [];
  let allCategoryProducts: Product[] = [];

  try {
    const res = await productAPI.getProductById(idOrSlug);
    if (res.success && res.data) {
      product = res.data;
    }
  } catch (err) {
    console.error('Failed to fetch product:', err);
  }

  if (!product) {
    notFound();
  }

  // Fetch catalog products from the same category
  try {
    const relRes = await productAPI.getProducts({ 
      categoryId: product.categoryId || undefined, 
      limit: 12 
    });
    if (relRes.success && relRes.data?.products) {
      allCategoryProducts = relRes.data.products;
      relatedProducts = relRes.data.products.filter((p: any) => p.id !== product.id);
    }
  } catch (e) {
    console.error('Failed to fetch related products', e);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-white">
      {/* Breadcrumbs */}
      <nav className="flex items-center flex-wrap gap-y-2 text-xs text-gray-500 mb-8 font-medium">
        <Link href="/" className="hover:text-gold-600 transition-colors shrink-0 font-medium">
          Home
        </Link>
        <span className="mx-2 shrink-0 text-gray-400">&gt;</span>
        {product.category ? (
          <Link
            href={`/category/${product.category.slug || product.categoryId || ''}`}
            className="hover:text-gold-600 transition-colors shrink-0 whitespace-nowrap font-medium"
          >
            {product.category.name}
          </Link>
        ) : (
          <span className="text-gray-400">Category</span>
        )}
        {product.subcategory && (
          <>
            <span className="mx-2 shrink-0 text-gray-400">&gt;</span>
            <Link
              href={`/category/${product.category?.slug || product.categoryId || ''}?subcategorySlug=${product.subcategory.slug || product.subcategory.id}`}
              className="hover:text-gold-600 transition-colors shrink-0 whitespace-nowrap font-medium"
            >
              {product.subcategory.name}
            </Link>
          </>
        )}
        <span className="mx-2 shrink-0 text-gray-400">&gt;</span>
        <span className="text-gray-900 font-bold truncate max-w-full">{product.title}</span>
      </nav>

      {/* Top Section */}
      <div className="flex flex-col lg:flex-row gap-12 relative mb-12">
        <ProductGallery images={product.images} productName={product.title} />
        <ProductDetails product={product} />
      </div>

      {/* Highlights Bar */}
      <ProductHighlights product={product} />

      {/* Tabs Section (Includes Dynamic Reviews, Description, Ingredients, Nutrition, How to use, FAQs) */}
      <ProductTabs product={product} />

      {/* Related Products Carousel with Left/Right Chevrons */}
      <RelatedProductsCarousel 
        products={relatedProducts} 
        categorySlug={product.category?.slug} 
      />

      {/* Similar Brands & Top Alternatives Showcase (Amazon-style with Brand Media, Logos & Products) */}
      <SimilarBrandsShowcase 
        currentProduct={product}
        allProducts={allCategoryProducts.length > 0 ? allCategoryProducts : relatedProducts}
      />
    </div>
  );
}
