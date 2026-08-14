import { authAPI } from './auth';

let isRefreshing = false;
let refreshSubscribers: ((accessToken: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (accessToken: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (accessToken: string) => {
  refreshSubscribers.forEach((cb) => cb(accessToken));
  refreshSubscribers = [];
};

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const getRefreshToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  };

  const setTokens = (accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  };

  const clearTokens = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  // Attach access token to headers
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const newOptions = { ...options, headers };

  let response = await fetch(url, newOptions);

  // Handle 401 Unauthorized
  if (response.status === 401) {
    const originalRequest = newOptions;
    
    // Check if we already have a refresh token
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      throw new Error('Token is not valid');
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await authAPI.refreshToken(refreshToken);
        if (refreshResponse.success && refreshResponse.data) {
          const newAccessToken = refreshResponse.data.accessToken;
          const newRefreshToken = refreshResponse.data.refreshToken;
          
          setTokens(newAccessToken, newRefreshToken);
          onRefreshed(newAccessToken);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (err) {
        clearTokens();
        // Redirect to login or dispatch an event here if needed
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    // Wait for the token to refresh, then retry
    return new Promise<Response>((resolve, reject) => {
      subscribeTokenRefresh((newAccessToken: string) => {
        const retryHeaders = new Headers(originalRequest.headers);
        retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
        originalRequest.headers = retryHeaders;
        
        fetch(url, originalRequest)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  return response;
};
