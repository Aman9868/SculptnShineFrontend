import { apiFetch } from './apiFetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface WishlistResponse {
  success: boolean;
  message: string;
  data: {
    data: WishlistItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    unitPrice: number;
    discountPercentage: number;
    gst: number;
    status: string;
    stock: number;
  };
}

export const wishlistAPI = {
  async getWishlist(page: number = 1, limit: number = 10): Promise<WishlistResponse> {
    const response = await apiFetch(`${API_BASE_URL}/wishlist?page=${page}&limit=${limit}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch wishlist');
    }

    return response.json();
  },

  async toggleWishlist(productId: string): Promise<{ success: boolean; message: string; data: { isAdded: boolean } }> {
    const response = await apiFetch(`${API_BASE_URL}/wishlist/${productId}/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle wishlist');
    }

    return response.json();
  },
};
