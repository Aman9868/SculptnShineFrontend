const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Brand {
  id: string;
  name: string;
  slug?: string;
  logo?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  status?: string;
  _count?: {
    products?: number;
  };
}

export const brandAPI = {
  getAllBrands: async (params?: { search?: string; status?: string; limit?: number }) => {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('status', 'ACTIVE');
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.search) searchParams.append('search', params.search);

      const res = await fetch(`${API_BASE_URL}/brands?${searchParams.toString()}`, {
        next: { revalidate: 30 },
      });
      if (!res.ok) throw new Error('Failed to fetch brands');
      return await res.json();
    } catch (e) {
      return { success: false, data: [] };
    }
  },
  getBrandById: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/brands/${id}`, {
        next: { revalidate: 30 },
      });
      if (!res.ok) throw new Error('Failed to fetch brand');
      return await res.json();
    } catch (e) {
      return { success: false, data: null };
    }
  },
};
