'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Package, Tag, Info, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export const NotificationBell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isPushSupported,
    isPushSubscribed,
    subscribeToPush,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!isAuthenticated) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER_UPDATE':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'PROMO':
        return <Tag className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-amber-600" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gold-600 rounded-full hover:bg-cream-50 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-serif-luxury font-bold text-base text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Web Push Prompt inside Dropdown */}
          {isPushSupported && !isPushSubscribed && (
            <div className="bg-gold-50/50 p-3.5 border-b border-gold-100 flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-gold-900 leading-normal">
                  Never miss an order update!
                </p>
                <p className="text-[10px] text-gold-700 leading-normal mt-0.5">
                  Enable push notifications on your device.
                </p>
              </div>
              <button
                onClick={subscribeToPush}
                className="bg-gold-600 hover:bg-gold-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors shrink-0"
              >
                Enable
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No new notifications at the moment.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors hover:bg-gray-50/70 flex gap-3.5 items-start ${
                    !notification.isRead ? 'bg-cream-50/30' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs truncate ${!notification.isRead ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1 font-medium break-words">
                      {notification.message}
                    </p>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        onClick={() => {
                          setIsOpen(false);
                          markAsRead(notification.id);
                        }}
                        className="text-[10px] font-bold text-gold-600 hover:text-gold-700 transition-colors mt-2 inline-block uppercase tracking-wider"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 text-gray-300 hover:text-gold-600 transition-colors shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
