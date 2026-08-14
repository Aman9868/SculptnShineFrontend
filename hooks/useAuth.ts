import { useAuth } from '@/context/AuthContext';

/**
 * Hook to access authentication context
 * Must be used within a component wrapped by AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, logout } = useAuth();
 *   
 *   if (!isAuthenticated) return <div>Not logged in</div>;
 *   
 *   return <div>Welcome {user?.firstName}!</div>;
 * }
 * ```
 */
export { useAuth };
