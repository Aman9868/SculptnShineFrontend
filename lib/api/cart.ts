import { apiFetch } from './apiFetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const cartAPI = {
  async getCart() {
    const response = await apiFetch(`${API_BASE_URL}/cart`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch cart');
    }

    return response.json();
  },

  async addToCart(productId: string, variantId: string | undefined, quantity: number) {
    const response = await apiFetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        variantId,
        quantity
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add to cart');
    }

    return response.json();
  },

  async updateCartItem(cartItemId: string, quantity: number) {
    const response = await apiFetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update cart item');
    }

    return response.json();
  },

  async removeFromCart(cartItemId: string) {
    const response = await apiFetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove cart item');
    }

    return response.json();
  }
};
