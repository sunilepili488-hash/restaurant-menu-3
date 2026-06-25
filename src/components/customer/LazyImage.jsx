import React, { useState } from 'react';

export default React.memo(function LazyImage({ src, alt, className, fallbackText, eager, ...props }) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div className={`${className || ''} bg-secondary flex items-center justify-center`}>
        <span className="text-muted-foreground font-display text-sm">{fallbackText || 'No Image'}</span>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className={`${className || ''} bg-secondary animate-pulse`} />
      )}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={eager ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        className={`${className || ''} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
        {...props}
      />
    </>
  );
});