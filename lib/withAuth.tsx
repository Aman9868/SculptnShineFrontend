'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Higher Order Component to protect routes that require authentication
 * 
 * @example
 * ```tsx
 * function ProfilePage() {
 *   return <div>User Profile</div>;
 * }
 * 
 * export default withAuth(ProfilePage);
 * ```
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  const Protected = (props: P) => {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-block relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-gold-600/20 border-t-gold-600 animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };

  Protected.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  return Protected;
}
