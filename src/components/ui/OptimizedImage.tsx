// src/components/ui/OptimizedImage.tsx
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  quality?: number;
  fallback?: string;
  placeholder?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onError?: () => void;
  onLoad?: () => void;
  priority?: boolean; // ✅ اضافه کردن priority
  style?: React.CSSProperties;
  id?: string;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  quality = 80,
  fallback = '/placeholder.png',
  placeholder = true,
  objectFit = 'cover',
  onError,
  onLoad,
  priority = false, // ✅ اضافه کردن priority با مقدار پیش‌فرض
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    // تبدیل به WebP
    const getOptimizedSrc = (url: string) => {
      if (!url) return fallback;
      
      // اگه قبلاً WebP هست
      if (url.includes('.webp')) return url;
      
      // اگه از API میاد
      if (url.includes('api') || url.includes('localhost') || url.includes('BASE_URL')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}format=webp&quality=${quality}`;
      }
      
      // اگه از public یا static هست
      if (url.startsWith('/')) {
        const lastDot = url.lastIndexOf('.');
        if (lastDot !== -1) {
          const baseName = url.substring(0, lastDot);
          const ext = url.substring(lastDot + 1).toLowerCase();
          // فقط برای فرمت‌های قابل تبدیل
          if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'].includes(ext)) {
            return `${baseName}.webp`;
          }
        }
        return url;
      }
      
      return url;
    };

    setImageSrc(getOptimizedSrc(src));
    setError(false);
    setIsLoading(true);
  }, [src, quality, fallback]);

  // اگر عکس load نشد، از fallback استفاده کن
  const handleError = () => {
    setError(true);
    setIsLoading(false);
    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback);
    }
    if (onError) onError();
  };

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  // استایل‌های object-fit
  const getObjectFitClass = () => {
    switch (objectFit) {
      case 'cover': return 'object-cover';
      case 'contain': return 'object-contain';
      case 'fill': return 'object-fill';
      case 'none': return 'object-none';
      case 'scale-down': return 'object-scale-down';
      default: return 'object-cover';
    }
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width: width || '100%', height: height || 'auto' }}
    >
      {/* Placeholder */}
      {placeholder && isLoading && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200/30 via-gray-300/20 to-gray-200/30 animate-pulse rounded-lg">
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* تصویر اصلی */}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          w-full h-full
          ${getObjectFitClass()}
          transition-all duration-500 ease-in-out
          ${isLoading && !error ? 'opacity-0 scale-105 blur-sm' : 'opacity-100 scale-100 blur-0'}
        `}
        {...props}
      />

      {/* اگر خطا داشت و fallback نمایش داده شد */}
      {error && (
        <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center">
          <span className="text-xs text-gray-400">تصویر موجود نیست</span>
        </div>
      )}
    </div>
  );
}

// کامپوننت برای عکس‌های دایره‌ای
export function CircleOptimizedImage(props: OptimizedImageProps) {
  return (
    <div className="rounded-full overflow-hidden">
      <OptimizedImage {...props} className={`${props.className || ''} rounded-full`} />
    </div>
  );
}

// کامپوننت برای عکس‌های با حاشیه
export function RoundedOptimizedImage(props: OptimizedImageProps) {
  return (
    <div className="rounded-xl overflow-hidden shadow-lg">
      <OptimizedImage {...props} className={`${props.className || ''} rounded-xl`} />
    </div>
  );
}