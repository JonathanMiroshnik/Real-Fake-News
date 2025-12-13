import { useState } from 'react';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string; // e.g., "16/9", "4/3", "1/1"
  placeholder?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Image component with aspect ratio support to prevent Cumulative Layout Shift
 * @param src - Image source URL
 * @param alt - Alt text for accessibility
 * @param className - Additional CSS classes
 * @param aspectRatio - Aspect ratio in format "width/height" (e.g., "16/9")
 * @param placeholder - Show placeholder while loading
 * @param objectFit - CSS object-fit property
 */
function Image({ 
  src, 
  alt, 
  className = '', 
  aspectRatio = '16/9',
  placeholder = true,
  objectFit = 'cover',
  loading = 'lazy',
  fetchPriority = 'auto'
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle empty src
  if (!src || src === '') {
    return placeholder ? (
      <div 
        className={`relative w-full overflow-hidden ${className}`}
        style={{ 
          aspectRatio: aspectRatio,
          backgroundColor: 'var(--global-background-color, #f0f0f0)'
        }}
      >
        <div className="absolute inset-0 bg-linear-to-r 
                        from-(--global-background-color,#f0f0f0) 
                        via-(--image-placeholder-shimmer,#e0e0e0) 
                        to-(--global-background-color,#f0f0f0) 
                        bg-size-[200%_100%] animate-shimmer" />
      </div>
    ) : null;
  }

  return (
    <div 
      className={`relative w-full overflow-hidden ${className}`}
      style={{ 
        aspectRatio: aspectRatio,
        backgroundColor: placeholder ? 'var(--global-background-color, #f0f0f0)' : 'transparent'
      }}
    >
      {(isLoading || hasError) && placeholder && (
        <div className="absolute inset-0 bg-linear-to-r 
                        from-(--global-background-color,#f0f0f0) 
                        via-(--image-placeholder-shimmer,#e0e0e0) 
                        to-(--global-background-color,#f0f0f0) 
                        bg-size-[200%_100%] animate-shimmer" />
      )}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full 
                      transition-opacity duration-300 ease-in-out 
                      ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ objectFit }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          loading={loading}
          fetchPriority={fetchPriority}
        />
      )}
      {hasError && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center 
                        bg-(--global-background-color,#f0f0f0) 
                        text-(--description-color,#666) text-[0.9rem]">
          <span>Image unavailable</span>
        </div>
      )}
    </div>
  );
}

export default Image;

