/**
 * SafeImage.tsx
 * 
 * Simple, reliable image component with fallback
 */

import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

export function SafeImage({ 
  src, 
  alt,
  fallbackSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IiNkMWQ1ZGIiLz4KPHRleHQgeD0iMTUwIiB5PSIxNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY5NzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RXZlbnQgSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==', // Event-specific fallback
  className = '',
  ...props 
}: SafeImageProps) {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') || '';
  const toSupabaseMediaUrl = (input: string) => {
    if (!supabaseUrl) return input; // fallback; user must configure env
    const filename = input.replace('media/', '');
    return `${supabaseUrl}/storage/v1/object/public/media/${encodeURIComponent(filename)}`;
  };

  const [imgSrc, setImgSrc] = useState(() => {
    if (src.includes('supabase.co/storage/v1/object/public')) return src;
    if (src.startsWith('media/')) return toSupabaseMediaUrl(src);
    return src;
  });
  const [hasError, setHasError] = useState(false);

  // Reset image state when src changes
  useEffect(() => {
    // Apply the same logic when src changes
  if (src.includes('supabase.co/storage/v1/object/public')) setImgSrc(src);
  else if (src.startsWith('media/')) setImgSrc(toSupabaseMediaUrl(src));
  else setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    // Only switch to fallback if we haven't already and it's not the same as current src
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
      {...props}
    />
  );
}

export default SafeImage;
