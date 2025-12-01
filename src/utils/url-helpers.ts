/**
 * url-helpers.ts
 * Helper functions for managing URLs in development and production environments
 */

/**
 * Determines if the current environment is production
 */
export const isProduction = (): boolean => {
  // Check multiple ways to detect production
  const isViteProd = import.meta.env.PROD;
  const isGitHubPages = typeof window !== 'undefined' && (
    window.location.hostname === 'shatamcare.github.io' || 
    window.location.hostname === 'adarshalexbalmuchu.github.io' ||
    window.location.hostname === 'shatamcare.org'
  );
  const isProductionDomain = typeof window !== 'undefined' && window.location.href.includes('github.io');
  
  return isViteProd || isGitHubPages || isProductionDomain;
};

/**
 * Gets the base URL for the application
 * In production, this includes the repository name for GitHub Pages
 * In development, this is empty
 */
export const getBaseUrl = (): string => {
  // Only use the ShatamCareFoundation path in production (GitHub Pages)
  if (isProduction()) {
    return '/ShatamCareFoundation';
  }
  // In development, use empty string
  return '';
};

/**
 * Gets the development server URL
 * This is useful for absolute URLs in development
 */
export const getDevServerUrl = (): string => {
  return 'http://localhost:5174';
};

/**
 * Transforms a relative path to a full URL with the appropriate base path
 * for the current environment
 * 
 * @param path The relative path (e.g., "/about", "/contact")
 * @returns The full URL for the current environment
 */
export const getFullUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (isProduction()) {
    const baseUrl = getBaseUrl();
    return baseUrl.endsWith('/') 
      ? `${baseUrl}${cleanPath}` 
      : `${baseUrl}/${cleanPath}`;
  }
  
  return `/${cleanPath}`;
};

/**
 * Checks if a given URL is valid for the current environment
 * This helps prevent 404 errors when navigating between development and production
 * 
 * @param url The URL to check
 * @returns True if the URL is valid for the current environment
 */
export const isValidUrl = (url: string): boolean => {
  const baseUrl = getBaseUrl();
  
  // In production, URLs should start with the base URL
  if (isProduction() && !url.startsWith(baseUrl) && url !== '/') {
    return false;
  }
  
  // In development, URLs should not include the production base URL
  if (!isProduction() && url.includes('/ShatamCareFoundation/')) {
    return false;
  }
  
  return true;
};

/**
 * Fixes a URL to be valid for the current environment
 * 
 * @param url The URL to fix
 * @returns The fixed URL
 */
export const fixUrl = (url: string): string => {
  if (isValidUrl(url)) {
    return url;
  }
  
  if (isProduction()) {
    // Make sure production URLs have the base path
    if (!url.startsWith('/ShatamCareFoundation/')) {
      return `/ShatamCareFoundation${url === '/' ? '' : url}`;
    }
  } else {
    // Remove base path in development
    return url.replace('/ShatamCareFoundation', '');
  }
  
  return url;
};

/**
 * Safely executes querySelector with hash-based selectors
 * Handles cases where selectors might contain invalid characters for CSS selectors
 * 
 * @param selector The CSS selector to use
 * @returns The selected element or null if not found or invalid
 */
export const safeQuerySelector = (selector: string): Element | null => {
  try {
    // Skip selectors that contain forward slashes (likely route hashes)
    if (selector.includes('/')) {
      console.warn('Skipping potentially invalid selector with forward slash:', selector);
      return null;
    }
    
    return document.querySelector(selector);
  } catch (error) {
    console.warn('Invalid selector for querySelector:', selector, error);
    return null;
  }
};
