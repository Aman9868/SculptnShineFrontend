/**
 * Helper to resolve media URLs across local dev and production deployments.
 * Supports relative paths, absolute paths, uploaded assets, and fallback images.
 */
declare const process: {
  env?: {
    NEXT_PUBLIC_API_URL?: string;
  };
};

export const getMediaUrl = (url?: string | null, fallback = '/assets/product-placeholder.png'): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }

  const trimmed = url.trim();

  // Already a full HTTP/HTTPS URL or static asset in frontend public folder
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/assets/')) {
    return trimmed;
  }

  // Normalize path with leading slash
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  // In production browser environments (e.g. sculptshine.shop),
  // /uploads and /invoices are routed directly via Nginx on the same origin.
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) {
      return cleanPath;
    }
  }

  const backendBase = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:5000/api'
  ).replace(/\/api\/?$/, '');

  return `${backendBase}${cleanPath}`;
};
