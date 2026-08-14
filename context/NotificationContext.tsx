'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notificationApi, NotificationItem } from '@/lib/api/notification';
import io from 'socket.io-client';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isPushSupported: boolean;
  isPushSubscribed: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToPush: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Fetch in-app notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await notificationApi.getMyNotifications(20);
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await notificationApi.markAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await notificationApi.markAllAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Convert VAPID key helper
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Register Service Worker & Check Push Support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkPushSupport = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setIsPushSupported(true);
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          setSwRegistration(reg);

          // Check if subscription already exists
          const sub = await reg.pushManager.getSubscription();
          setIsPushSubscribed(!!sub);
        } catch (err) {
          console.error('Service Worker registration failed:', err);
        }
      }
    };

    checkPushSupport();
  }, []);

  // Fetch initial notifications on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();

      // Setup WebSocket for real-time in-app notifications
      const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        transports: ['websocket'],
      });

      socket.emit('join_user_room', user?.id);

      socket.on('notification_received', () => {
        fetchNotifications();
      });

      return () => {
        socket.disconnect();
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user?.id]);

  // Request notification permission and subscribe
  const subscribeToPush = async () => {
    if (!swRegistration || !VAPID_PUBLIC_KEY) {
      console.warn('Push manager or VAPID key is missing.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied.');
        return;
      }

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send subscription to backend
      const res = await notificationApi.subscribe(subscription as any);
      if (res.success) {
        setIsPushSubscribed(true);
        console.log('Successfully subscribed to Push Notifications');
      }
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isPushSupported,
        isPushSubscribed,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        subscribeToPush,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
