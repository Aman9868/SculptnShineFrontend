# Authentication Implementation Guide

This document explains the authentication system implemented in the SculptnShine frontend.

## Overview

The authentication system integrates with the SculptnShine backend API and provides:

- User login and registration
- Token-based authentication (JWT)
- Session persistence using localStorage
- Protected routes
- Global auth state management with React Context

## Architecture

### Components

1. **API Service** (`lib/api/auth.ts`)
   - Handles all authentication API calls
   - Base URL: `http://localhost:5000/api`
   - Endpoints:
     - `POST /auth/register` - Register new user
     - `POST /auth/login` - Login user
     - `POST /auth/refresh-token` - Refresh access token
     - `POST /auth/logout` - Logout user

2. **Auth Context** (`context/AuthContext.tsx`)
   - Global auth state management
   - Provides auth methods and state to entire app
   - Handles token persistence
   - Manages loading and error states

3. **Pages**
   - `app/login/page.tsx` - Login page with form and validation
   - `app/signup/page.tsx` - Registration page with form and validation

4. **Utilities**
   - `hooks/useAuth.ts` - Custom hook to access auth context
   - `lib/withAuth.tsx` - HOC for protecting routes

## Environment Configuration

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Usage

### Using Auth in Components

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.firstName} {user?.lastName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting Routes

```tsx
// app/profile/page.tsx
import { withAuth } from '@/lib/withAuth';

function ProfilePage() {
  return <div>This is a protected page</div>;
}

export default withAuth(ProfilePage);
```

### Manual Login

```tsx
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const { login, error, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login('user@example.com', 'password123');
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {error && <div>{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## API Reference

### useAuth Hook

Returns an object with the following properties and methods:

```typescript
interface AuthContext {
  user: UserData | null;              // Current logged-in user
  accessToken: string | null;         // JWT access token
  refreshToken: string | null;        // Refresh token
  isLoading: boolean;                 // Loading state
  isAuthenticated: boolean;           // Is user logged in
  error: string | null;               // Error message
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}
```

### UserData

```typescript
interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
```

## Data Flow

### Login Flow

1. User enters email and password on `/login` page
2. Form is submitted, calling `auth.login(email, password)`
3. `useAuth` hook calls `authAPI.login()`
4. API makes POST request to backend `/auth/login`
5. On success:
   - User data, access token, and refresh token are returned
   - Auth state is updated
   - Tokens are stored in localStorage
   - User is redirected to home page
6. On error:
   - Error message is displayed to user
   - User can retry

### Registration Flow

1. User enters name, email, phone, and password on `/signup` page
2. Form is submitted, parsing name into firstName and lastName
3. `auth.register()` is called with all required fields
4. API makes POST request to backend `/auth/register`
5. On success:
   - User is automatically logged in
   - Same as login flow from step 5
6. On error:
   - Error message is displayed
   - User can retry

## Token Management

### Storage

- Access Token: Stored in `localStorage` as `accessToken`
- Refresh Token: Stored in `localStorage` as `refreshToken`
- User Data: Stored in `localStorage` as `user` (JSON string)

### Persistence

On app load, `AuthContext` checks localStorage and restores:
- User session if tokens exist
- Loading state until check is complete

### Refresh Token

The `refreshToken()` method is available but currently not automatically called on token expiration. To implement automatic refresh:

```tsx
// Add to AuthContext useEffect
useEffect(() => {
  if (accessToken && refreshToken) {
    const timer = setInterval(async () => {
      try {
        const response = await authAPI.refreshToken(refreshToken);
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        // Update localStorage...
      } catch (err) {
        // Token refresh failed, logout
        await logout();
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(timer);
  }
}, [accessToken, refreshToken]);
```

## Error Handling

The auth system provides error handling at multiple levels:

1. **API Errors**: Caught from backend responses
2. **Validation Errors**: Form validation before submission
3. **Network Errors**: Fetch errors are caught and displayed
4. **Context Errors**: useAuth must be used within AuthProvider

Example error handling:

```tsx
try {
  await login(email, password);
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Login failed';
  setLocalError(errorMessage);
}
```

## Integration with Backend

The frontend expects the following responses from the backend:

### Success Response (2xx)

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2024-08-09T00:00:00Z",
      "updatedAt": "2024-08-09T00:00:00Z"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Error Response (4xx, 5xx)

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## Best Practices

1. **Always use useAuth within AuthProvider**: The context is provided in the root layout
2. **Protect sensitive pages**: Use `withAuth()` HOC for pages requiring authentication
3. **Handle loading states**: Show loading indicators while auth operations are in progress
4. **Clear errors**: Call `clearError()` when user starts a new action
5. **Secure tokens**: Never expose tokens in URLs or send them in headers manually (they're managed by the context)
6. **Validate input**: Always validate email and password format before submission

## Testing

To test the authentication flow:

1. Ensure backend is running on `http://localhost:5000`
2. Run frontend: `npm run dev`
3. Navigate to `/signup` to create a new account
4. Login with the created account at `/login`
5. Check localStorage in browser DevTools to see stored tokens
6. Navigate to protected routes to verify they require authentication

## Troubleshooting

### "useAuth must be used within an AuthProvider" Error

**Cause**: Using `useAuth` hook outside of a component wrapped by `AuthProvider`

**Solution**: Ensure the component is wrapped by `AuthProvider` in the component tree (already done in root layout)

### Tokens Not Persisting

**Cause**: localStorage is disabled or being cleared

**Solution**: Check browser privacy settings and ensure localStorage is enabled

### API Requests Failing (CORS)

**Cause**: Backend CORS configuration doesn't allow frontend origin

**Solution**: Update backend CORS configuration to include frontend URL

### "Login failed" Generic Error

**Cause**: Various possible issues - invalid credentials, network error, server error

**Solution**: Check browser console for detailed error message and backend logs

## Future Enhancements

1. Automatic token refresh on expiration
2. Multi-factor authentication (MFA)
3. Social login (Google, GitHub)
4. Remember me functionality
5. Password reset flow
6. Email verification for signup
