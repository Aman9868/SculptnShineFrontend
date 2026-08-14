import { Address, CreateAddressRequest, UpdateAddressRequest } from '@/types/address';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AddressResponse {
  success: boolean;
  message: string;
  data: Address | Address[];
}

export const addressAPI = {
  async getAddresses(): Promise<{ success: boolean; data: any[] }> {
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch addresses');
    }

    return response.json();
  },

  async createAddress(userId: string, data: CreateAddressRequest): Promise<Address> {
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create address');
    }

    const result = await response.json();
    return result.data;
  },

  async updateAddress(userId: string, addressId: string, data: UpdateAddressRequest): Promise<Address> {
    const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update address');
    }

    const result = await response.json();
    return result.data;
  },

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete address');
    }
  },
};
