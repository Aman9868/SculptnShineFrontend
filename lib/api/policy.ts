import { apiFetch } from './apiFetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const policyApi = {
  /**
   * Get a policy by its ID or Type (e.g., PRIVACY_POLICY, SHIPPING_POLICY)
   */
  getPolicyByType: async (type: string) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/policies/${type}`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });
      return await response.json();
    } catch (error) {
      console.error(`Error fetching policy of type ${type}:`, error);
      throw error;
    }
  },

  /**
   * Get all policies
   */
  getAllPolicies: async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/policies`, {
        next: { revalidate: 3600 },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching all policies:', error);
      throw error;
    }
  },
};
