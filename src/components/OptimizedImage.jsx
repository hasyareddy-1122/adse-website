import { useState } from "react";

function deriveAvifUrl(src) {
  if (!src || typeof src !== "string") return null;
  if (
    /^https?:\/\//i.test(src) ||
    src.startsWith("data:") ||
    src.startsWith("/api/")
  ) {
    return null;
  }
  const match = src.match(/^([^?#]+)\.(png|jpe?g|webp)([?#].*)?$/i);
  if (!match) return null;
  return `${match[1]}.avif${match[3] || ""}`;
}

export default function OptimizedImage({
  src,
  avifSrc: explicitAvifSrc,
  alt = "",
  className,
  style,
  width,
  height,
  priority = false,
  ...rest
}) {
  const [avifFailed, setAvifFailed] = useState(false);
  const resolvedAvif = !avifFailed
    ? explicitAvifSrc || deriveAvifUrl(src)
    : null;

  const loadingProps = priority
    ? { loading: "eager", fetchPriority: "high", decoding: "sync" }
    : { loading: "lazy", decoding: "async" };

  if (resolvedAvif) {
    return (
      <picture>
        <source
          srcSet={resolvedAvif}
          type="image/avif"
          onError={() => setAvifFailed(true)}
        />
        <img
          src={src}
          alt={alt}
          className={className}
          style={style}
          width={width}
          height={height}
          {...loadingProps}
          {...rest}
        />
      </picture>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      {...loadingProps}
      {...rest}
    />
  );
}
