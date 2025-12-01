/**
 * Utility function to get correct image paths for GitHub Pages deployment
 * This ensures images load correctly both in development and production
 */

import { getBaseUrl, isProduction } from './url-helpers';

/**
 * Get the correct image path for the current environment
 * @param imagePath - The image path relative to the public directory (e.g., "images/logo.png")
 * @returns The correct image path for the current environment
 */
// Base64 encoded SVG fallback image
const fallbackSvg = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#f0f0f0"/>
  <text x="100" y="100" font-family="Arial" font-size="14" fill="#666666" text-anchor="middle" dominant-baseline="middle">Image not available</text>
  <rect x="60" y="70" width="80" height="60" stroke="#666666" stroke-width="2" fill="none"/>
  <line x1="60" y1="70" x2="140" y2="130" stroke="#666666" stroke-width="2"/>
  <line x1="140" y1="70" x2="60" y2="130" stroke="#666666" stroke-width="2"/>
</svg>`;

// Convert SVG to base64 using Buffer (Node.js compatible) or btoa (browser)
const encodeBase64 = (str: string): string => {
  if (typeof Buffer !== 'undefined') {
    // Node.js environment (build time)
    return Buffer.from(str).toString('base64');
  } else if (typeof btoa !== 'undefined') {
    // Browser environment (runtime)
    return btoa(str);
  } else {
    // Fallback - return the SVG directly as data URL
    return encodeURIComponent(str);
  }
};

export const fallbackImageDataUrl = `data:image/svg+xml;base64,${encodeBase64(fallbackSvg)}`;

/**
 * Cache for verified image paths
 */
const imagePathCache = new Map<string, boolean>();

/**
 * Check if an image exists at the given path
 */
const verifyImagePath = async (path: string): Promise<boolean> => {
  if (imagePathCache.has(path)) {
    return imagePathCache.get(path)!;
  }

  try {
    const response = await fetch(path, { method: 'HEAD' });
    const exists = response.ok;
    imagePathCache.set(path, exists);
    return exists;
  } catch {
    imagePathCache.set(path, false);
    return false;
  }
};

/**
 * Properly encode image path components for URL use
 * @param path - The image path that may contain spaces or special characters
 * @returns URL-encoded path
 */
const encodeImagePath = (path: string): string => {
  // Split the path into segments and encode each segment separately
  // This preserves the directory structure while encoding spaces and special characters
  return path.split('/').map(segment => encodeURIComponent(segment)).join('/');
};

export const getImagePath = (imagePath: string): string => {
  try {
    // Special case for fallback image or empty paths
    if (imagePath === 'images/fallback.svg' || !imagePath) {
      return fallbackImageDataUrl;
    }

    // Check if the path is already a full URL (starts with http/https)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // For GitHub Pages with HashRouter, we need to use the static asset path
    const isProd = isProduction();
    const isGitHubPagesDirect = typeof window !== 'undefined' && (
      window.location.hostname === 'shatamcare.github.io' || 
      window.location.hostname === 'adarshalexbalmuchu.github.io'
    );
    const isCustomDomain = typeof window !== 'undefined' && 
      window.location.hostname === 'shatamcare.org';
    
    // Remove leading slash if present to avoid double slashes
    let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // Properly encode the path to handle spaces and special characters
    cleanPath = encodeImagePath(cleanPath);
    
    // For custom domain, use root path
    if (isCustomDomain) {
      return `/${cleanPath}`;
    }
    // For GitHub Pages production, use the repository path
    else if (isProd || isGitHubPagesDirect) {
      return `/ShatamCareFoundation/${cleanPath}`;
    } else {
      // In development, just ensure it starts with /
      return `/${cleanPath}`;
    }
  } catch (error) {
    console.error('Error in getImagePath:', error);
    return fallbackImageDataUrl;
  }
};

/**
 * Get the correct image path for CSS background images
 * @param imagePath - The image path relative to the public directory
 * @returns The correct image path wrapped in url() for CSS
 */
export const getBackgroundImagePath = (imagePath: string): string => {
  const imageSrc = getImagePath(imagePath);
  return `url("${imageSrc}")`;
};

/**
 * Common image paths used throughout the application
 */
export const imagePaths = {
  logo: getImagePath('images/Team/SC_LOGO-removebg-preview.png'),
  care: getImagePath('images/Users/care.jpg'),
  amrita: getImagePath('images/Team/Amrita.jpg'),
  
  // User images
  users: {
    eha1: getImagePath('images/Users/EHA (1).jpg'),
    dementiaCare1: getImagePath('images/Users/dementia care 1.jpg'),
    care: getImagePath('images/Users/care.jpg'),
  },
  
  // Caregiver images 
  caregivers: {
    sessions: getImagePath('images/Caregivers/sessions.jpg'),
    training: getImagePath('images/Caregivers/training.jpg'),
    care: getImagePath('images/Users/care.jpg'),
  },
  
  // Brain Kit images
  brainKit: {
    kit: getImagePath('images/Brain Kit/kit.jpg'),
    brainBridge: getImagePath('images/Brain Kit/brain_bridge_boxcontent-1024x1024.jpeg'),
  },
  
  // Team images
  team: {
    logo: getImagePath('images/Team/SC_LOGO-removebg-preview.png'),
    amrita: getImagePath('images/Team/Amrita.jpg'),
  }
};

// Image optimization utilities
export const getOptimizedImagePath = (path: string, size = 'default') => {
  // Base implementation - in a production environment, this could integrate with a CDN or image service
  const sizeSuffix = size === 'default' ? '' : `?size=${size}`;
  return getImagePath(path) + sizeSuffix;
};

export const lazyLoadImage = (element: HTMLImageElement) => {
  if ('loading' in HTMLImageElement.prototype) {
    element.loading = 'lazy';
  }
  // Could be extended with IntersectionObserver for browsers without native lazy loading
};

// Preload critical images
/**
 * Set of already preloaded image paths
 */
const preloadedImages = new Set<string>();

export const preloadCriticalImages = async () => {
  try {
    // Only preload absolutely critical images (header logo)
    const criticalImagePaths = [
      imagePaths.team.logo // Logo is always visible in header
      // Hero background will be loaded via CSS, no need to preload
    ];
    
    // Filter out already preloaded images
    const imagesToPreload = criticalImagePaths.filter(path => !preloadedImages.has(path));
    
    if (imagesToPreload.length === 0) {
      return; // Nothing to preload
    }

    // Use a more efficient preloading approach with proper timing
    const preloadTasks = imagesToPreload.map(async (path) => {
      try {
        // First verify the image exists
        const exists = await verifyImagePath(path);
        
        if (exists) {
          // Use Image constructor for immediate loading without adding to DOM
          const img = new Image();
          img.src = path;
          
          // Mark as preloaded
          preloadedImages.add(path);
          
          return new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load ${path}`));
          });
        } else {
          console.warn(`Skipping preload for non-existent image: ${path}`);
        }
      } catch (err) {
        console.warn(`Error preloading image ${path}:`, err);
      }
    });

    // Wait for all preload tasks to complete
    await Promise.allSettled(preloadTasks);
  } catch (error) {
    console.warn('Error in preloadCriticalImages:', error);
  }
};

/**
 * Preload hero background image specifically
 */
export const preloadHeroImage = async () => {
  const heroImagePath = getImagePath('images/Users/care.jpg');
  
  if (!preloadedImages.has(heroImagePath)) {
    try {
      const exists = await verifyImagePath(heroImagePath);
      if (exists) {
        const img = new Image();
        img.src = heroImagePath;
        preloadedImages.add(heroImagePath);
        
        return new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load hero image: ${heroImagePath}`));
        });
      }
    } catch (error) {
      console.warn('Error preloading hero image:', error);
    }
  }
};

/**
 * Preload images that are about to become visible using Intersection Observer
 */
export const preloadNearbyImages = () => {
  if (typeof window === 'undefined') return;

  const imageElements = document.querySelectorAll('img[data-src], [style*="background-image"]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        
        // Handle img elements with data-src
        if (element.tagName === 'IMG' && element.hasAttribute('data-src')) {
          const img = element as HTMLImageElement;
          const src = img.getAttribute('data-src');
          if (src && !preloadedImages.has(src)) {
            const preloadImg = new Image();
            preloadImg.src = src;
            preloadedImages.add(src);
          }
        }
        
        // Handle background images
        const style = element.getAttribute('style');
        if (style && style.includes('background-image')) {
          const urlMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (urlMatch && urlMatch[1] && !preloadedImages.has(urlMatch[1])) {
            const preloadImg = new Image();
            preloadImg.src = urlMatch[1];
            preloadedImages.add(urlMatch[1]);
          }
        }
        
        imageObserver.unobserve(element);
      }
    });
  }, {
    root: null,
    rootMargin: '200px', // Start loading when element is 200px away from viewport
    threshold: 0.1
  });

  imageElements.forEach(img => imageObserver.observe(img));
};

/**
 * Performance-optimized image preloading strategies
 */
export const optimizeImageLoading = () => {
  // Remove any existing preload links that aren't being used
  const existingPreloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]');
  existingPreloadLinks.forEach(link => {
    const href = (link as HTMLLinkElement).href;
    // Check if image is actually being used in the DOM
    const isImageUsed = document.querySelector(`img[src="${href}"], [style*="${href}"]`);
    if (!isImageUsed) {
      console.log(`Removing unused preload link: ${href}`);
      link.remove();
    }
  });

  // Setup performance observer to monitor preload efficiency
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name.includes('preload') && entry.duration > 100) {
            console.warn(`Slow preload detected: ${entry.name} took ${entry.duration}ms`);
          }
        });
      });
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    } catch (error) {
      console.log('Performance observer not supported');
    }
  }
};