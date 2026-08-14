import { apiFetch } from './apiFetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ProductReview {
  id: string;
  productId: string;
  userProfile?: {
    user: { firstName: string; lastName: string };
  };
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export const reviewAPI = {
  getProductReviews: async (productId: string, limit?: number) => {
    let url = `${API_BASE_URL}/reviews/product/${productId}`;
    if (limit) {
      url += `?limit=${limit}`;
    }
    const response = await apiFetch(url);
    return response.json();
  },

  addReview: async (data: {
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
  }) => {
    const response = await apiFetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  checkEligibility: async (productId: string) => {
    const response = await apiFetch(`${API_BASE_URL}/reviews/eligibility/${productId}`);
    return response.json();
  }
};
