const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ProductVariant {
  id: string;
  productId: string;
  title: string;
  sku: string;
  flavor: string | null;
  weight: string | null;
  unitPrice: number;
  discountPercentage: number;
  gst: number;
  expiryDate?: string | null;
  stock: number;
  images: string[];
  isDefault: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  unitPrice: number;
  discountPercentage: number;
  gst: number;
  expiryDate: string | null;
  sku: string;
  images: string[];
  stock: number;
  status: string;
  preference: string;
  categoryId: string;
  subcategoryId: string;
  brandId: string;
  mainCategory?: string;
  category?: { id: string; name: string; slug: string };
  subcategory?: { id: string; name: string; slug: string };
  brand?: { id: string, name: string, logo: string };
  variants?: ProductVariant[];
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const productAPI = {
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    categorySlug?: string;
    subcategoryId?: string;
    subcategorySlug?: string;
    brand?: string;
    preference?: string;
    flavors?: string;
    weights?: string;
    minPrice?: string | number;
    maxPrice?: string | number;
    rating?: string | number;
    sort?: string;
    status?: string;
  }): Promise<ProductsResponse> {
    const url = new URL(`${API_BASE_URL}/products`);
    
    // Default to ACTIVE status for frontend queries
    const requestParams = { status: 'ACTIVE', ...params };

    Object.entries(requestParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch products');
    }

    return response.json();
  },

  async getProductById(idOrSlug: string): Promise<{ success: boolean; message: string; data: Product }> {
    const response = await fetch(`${API_BASE_URL}/products/${idOrSlug}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch product');
    }

    return response.json();
  },

  async getFilters(search?: string): Promise<{ 
    success: boolean; 
    message: string; 
    data: { 
      brands: { name: string, count: number }[],
      flavors: { name: string, count: number }[], 
      weights: { name: string, count: number }[], 
      preferences: { name: string, count: number }[],
      ratings?: { stars: number, count: number }[]
    } 
  }> {
    const url = new URL(`${API_BASE_URL}/products/filters`);
    if (search) {
      url.searchParams.append('search', search);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch product filters');
    }

    return response.json();
  }
};
