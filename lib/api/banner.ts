import { apiFetch } from './apiFetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  video: string | null;
  link: string | null;
  ctaText: string | null;
  type: 'HOME_GENERAL' | 'HOME_PRODUCT' | 'CATEGORY_HEADER' | 'BRAND_HEADER' | 'LOGIN_BG' | 'SIGNUP_BG' | 'PROMO';
  targetType: 'PRODUCT' | 'CATEGORY' | 'BRAND' | 'EXTERNAL_LINK' | 'NONE';
  status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED';
  sortOrder: number;
  startDate: string | null;
  endDate: string | null;
  categoryId: string | null;
  productId: string | null;
  brandId: string | null;
  product?: { slug: string; title: string } | null;
  category?: { slug: string; name: string } | null;
  brand?: { slug: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export const bannerApi = {
  /**
   * Fetch public banners by type
   */
  getPublicBanners: async (type?: string): Promise<Banner[]> => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    
    const response = await apiFetch(`${API_BASE_URL}/banners/public?${params.toString()}`);
    const data = await response.json();
    return data.data; // The backend returns { success: true, data: [...] }
  }
};
