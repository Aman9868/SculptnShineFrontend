import { apiFetch } from './apiFetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const orderAPI = {
  /**
   * Track an order publicly
   * @param orderNumber The Order ID (e.g. ORD-1234)
   * @param emailOrPhone The customer's email or shipping phone
   */
  trackOrder: async (orderNumber: string, emailOrPhone: string) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/orders/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderNumber, emailOrPhone }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error tracking order:', error);
      throw error;
    }
  },

  /**
   * Get authenticated user's orders
   */
  getMyOrders: async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/orders/my-orders`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching my orders:', error);
      throw error;
    }
  },
};
