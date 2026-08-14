import { apiFetch } from './apiFetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'ORDER_UPDATE' | 'PROMO' | 'SYSTEM';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  subscribe: async (subscription: PushSubscription): Promise<{ success: boolean }> => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to subscribe user to push:', error);
      return { success: false };
    }
  },

  getMyNotifications: async (limit = 20): Promise<{ success: boolean; data?: NotificationItem[] }> => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/notifications/my-notifications?limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return { success: false };
    }
  },

  markAsRead: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: false };
    }
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/notifications/all/read`, {
        method: 'PATCH',
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return { success: false };
    }
  },
};
