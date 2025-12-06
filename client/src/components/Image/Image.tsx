import { useState } from 'react';
import './Image.css';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string; // e.g., "16/9", "4/3", "1/1"
  placeholder?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
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
  objectFit = 'cover'
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle empty src
  if (!src || src === '') {
    return placeholder ? (
      <div 
        className={`image-container ${className}`}
        style={{ 
          aspectRatio: aspectRatio,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--image-placeholder-bg, #f0f0f0)'
        }}
      >
        <div className="image-placeholder" />
      </div>
    ) : null;
  }

  return (
    <div 
      className={`image-container ${className}`}
      style={{ 
        aspectRatio: aspectRatio,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: placeholder ? 'var(--image-placeholder-bg, #f0f0f0)' : 'transparent'
      }}
    >
      {(isLoading || hasError) && placeholder && (
        <div className="image-placeholder" />
      )}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          className={`image-content ${isLoading ? 'image-loading' : 'image-loaded'}`}
          style={{ objectFit }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          loading="lazy"
        />
      )}
      {hasError && placeholder && (
        <div className="image-error">
          <span>Image unavailable</span>
        </div>
      )}
    </div>
  );
}

export default Image;

