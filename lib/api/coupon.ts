import { apiFetch } from './apiFetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface CouponData {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  scopeType: 'GENERAL' | 'FIRST_ORDER' | 'CATEGORY' | 'BRAND' | 'PRODUCT' | 'SEASONAL';
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  applicableBrandIds?: string[];
  badgeText?: string | null;
  bannerText?: string | null;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon: CouponData;
  discountAmount: number;
  qualifyingSubtotal: number;
  finalTotal: number;
}

export const couponAPI = {
  /**
   * Fetch top featured announcement coupon for header banner
   */
  async getAnnouncement(): Promise<{ success: boolean; data: CouponData | null }> {
    try {
      const response = await apiFetch(`${API_BASE_URL}/coupons/announcement`, {
        method: 'GET',
      });
      if (!response.ok) return { success: false, data: null };
      return response.json();
    } catch {
      return { success: false, data: null };
    }
  },

  /**
   * Fetch public active coupons / Amazon-style vouchers for storefront
   */
  async getPublicVouchers(params?: {
    productId?: string;
    categoryId?: string;
    brandId?: string;
  }): Promise<{ success: boolean; data: CouponData[] }> {
    const searchParams = new URLSearchParams();
    if (params?.productId) searchParams.append('productId', params.productId);
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params?.brandId) searchParams.append('brandId', params.brandId);

    const query = searchParams.toString();
    const url = `${API_BASE_URL}/coupons/vouchers${query ? `?${query}` : ''}`;
    const response = await apiFetch(url, { method: 'GET' });

    if (!response.ok) {
      return { success: false, data: [] };
    }

    return response.json();
  },

  /**
   * Validate a coupon against cart and calculate exact discount
   */
  async validateCoupon(
    code: string,
    cartItems?: any[],
    subtotal?: number
  ): Promise<{ success: boolean; message: string; data: CouponValidationResult }> {
    const response = await apiFetch(`${API_BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        cartItems,
        subtotal,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to apply coupon');
    }

    return data;
  },
};
