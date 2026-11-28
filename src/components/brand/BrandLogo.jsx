import logoPng from '../../assets/brand/logo.png';
import logoWebp from '../../assets/brand/logo.webp';

/**
 * Official غلاف logo (`logo.webp` / `logo.png` — horizontal lockup).
 * Rendered exactly as provided: never redrawn, never recolored, never stretched, no effects.
 */
export function BrandLogo({ size = 'md', alt = 'غلاف', onLightSurface = false, className = '' }) {
  const heightClass =
    size === 'sm'
      ? 'h-8'
      : size === 'lg'
        ? 'h-11 sm:h-12'
        : 'h-9 sm:h-10';

  const img = (
    <picture className="block shrink-0 select-none">
      <source srcSet={logoWebp} type="image/webp" />
      <img
        src={logoPng}
        alt={alt}
        width={560}
        height={244}
        decoding="async"
        draggable={false}
        className={`block w-auto object-contain select-none ${heightClass} ${className}`}
      />
    </picture>
  );

  if (onLightSurface) {
    return (
      <span className="inline-flex items-center rounded-[var(--radius-ui)] bg-[var(--brand-black)] px-3 py-1.5">
        {img}
      </span>
    );
  }

  return img;
}
