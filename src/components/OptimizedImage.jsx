import { forwardRef } from "react";

const OptimizedImage = forwardRef(function OptimizedImage(
  { src, alt = "", className, style, loading = "lazy", ...rest },
  ref,
) {
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      decoding="async"
      {...rest}
    />
  );
});

export default OptimizedImage;