// src/components/ui/SafeImage.tsx
import React, { useState } from "react";

interface SafeImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallback?: string;
  [key: string]: any;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = "",
  className = "",
  fallback = "/placeholder-image.jpg",
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    // اگر src معتبر بود استفاده کن، وگرنه fallback
    if (src && src.trim() !== "") {
      return src;
    }
    return fallback;
  });

  const handleError = () => {
    setImgSrc(fallback);
  };

  // اگر src وجود نداشت یا خالی بود، render نکن
  if (!src || src.trim() === "") {
    return null;
  }

  return (
    <img
      src={imgSrc}
      alt={alt || "تصویر"}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default SafeImage;
