import { apiFetch } from './apiFetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface BusinessConfig {
  brandName: string;
  address: string;
  gstNumber: string;
  supportEmail?: string;
  supportPhone?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
}

export const businessConfigApi = {
  getConfig: async (): Promise<{ success: boolean; data?: BusinessConfig }> => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/business-config`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch business config:', error);
      return { success: false };
    }
  },
};
