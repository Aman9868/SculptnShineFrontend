import { authAPI } from './auth';

let refreshPromise: Promise<string> | null = null;

export const apiFetch = async (url: string, options: RequestInit = {}, hasRetried = false): Promise<Response> => {
  const getToken = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

  const clearTokens = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const headers = new Headers(options.headers || {});
  const accessToken = getToken('accessToken');
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url, { ...options, headers });
  if (response.status !== 401 || hasRetried) {
    return response;
  }

  const refreshToken = getToken('refreshToken');
  if (!refreshToken) {
    clearTokens();
    throw new Error('Token is not valid');
  }

  if (!refreshPromise) {
    refreshPromise = authAPI.refreshToken(refreshToken).then((refreshResponse) => {
      if (!refreshResponse.success || !refreshResponse.data?.accessToken || !refreshResponse.data?.refreshToken) {
        throw new Error('Token refresh failed');
      }

      localStorage.setItem('accessToken', refreshResponse.data.accessToken);
      localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
      return refreshResponse.data.accessToken;
    });
  }

  try {
    const newAccessToken = await refreshPromise;
    const retryHeaders = new Headers(options.headers || {});
    retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
    return apiFetch(url, { ...options, headers: retryHeaders }, true);
  } catch (err) {
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw err;
  } finally {
    refreshPromise = null;
  }
};
