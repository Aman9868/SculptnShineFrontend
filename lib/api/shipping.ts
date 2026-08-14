import { apiFetch } from './apiFetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ShippingRule {
  id: string;
  name: string;
  states: string[];
  charge: number;
  isDefault: boolean;
}

export interface ShippingData {
  rules: ShippingRule[];
  threshold: number;
}

export const shippingAPI = {
  getSettings: async (): Promise<{ success: boolean; data: ShippingData }> => {
    const res = await apiFetch(`${API_BASE_URL}/shipping`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch shipping settings');
    }
    return res.json();
  },

  calculateShipping: async (state: string, subtotal: number): Promise<{ success: boolean; data: { shippingAmount: number; matchedRule: string } }> => {
    const res = await apiFetch(`${API_BASE_URL}/shipping/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, subtotal }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to calculate shipping');
    }
    return res.json();
  }
};
