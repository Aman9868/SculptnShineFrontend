const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  status: string;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: Category[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const categoryAPI = {
  async getCategories(): Promise<CategoriesResponse> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch categories');
    }

    return response.json();
  },

  async getCategoryById(idOrSlug: string): Promise<{ success: boolean; message: string; data: Category }> {
    const response = await fetch(`${API_BASE_URL}/categories/${idOrSlug}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch category');
    }

    return response.json();
  },

  async getCategoryFilters(idOrSlug: string, subcategorySlug?: string): Promise<{ 
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
    const url = new URL(`${API_BASE_URL}/categories/${idOrSlug}/filters`);
    if (subcategorySlug) {
      url.searchParams.append('subcategorySlug', subcategorySlug);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch category filters');
    }

    return response.json();
  }
};
