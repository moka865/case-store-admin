import { useId } from 'react';
import { CaseArtwork } from './CaseArtworks';

/**
 * Per-model realistic camera island cutouts rendered in 240x500 device coordinates.
 * Always rendered LTR so phone hardware geometry is never mirrored in RTL.
 */
function CameraCutout({ layout }) {
  switch (layout) {
    case 'apple-pro-triple':
      return (
        <g>
          <rect x="18" y="18" width="98" height="104" rx="26" fill="#1C1E22" stroke="#363940" strokeWidth="2.5" />
          {/* 3 lenses */}
          <circle cx="44" cy="44" r="17" fill="#0C0D10" stroke="#474B54" strokeWidth="2" />
          <circle cx="44" cy="44" r="7.5" fill="#1C2738" />
          <circle cx="41" cy="41" r="2.2" fill="#6F86A8" opacity="0.6" />

          <circle cx="44" cy="94" r="17" fill="#0C0D10" stroke="#474B54" strokeWidth="2" />
          <circle cx="44" cy="94" r="7.5" fill="#1C2738" />
          <circle cx="41" cy="91" r="2.2" fill="#6F86A8" opacity="0.6" />

          <circle cx="88" cy="69" r="17" fill="#0C0D10" stroke="#474B54" strokeWidth="2" />
          <circle cx="88" cy="69" r="7.5" fill="#1C2738" />
          <circle cx="85" cy="66" r="2.2" fill="#6F86A8" opacity="0.6" />

          {/* Flash & LiDAR */}
          <circle cx="88" cy="36" r="6" fill="#E8DFC8" />
          <circle cx="88" cy="100" r="6" fill="#2A2D34" />
        </g>
      );

    case 'apple-dual-diag':
      return (
        <g>
          <rect x="18" y="18" width="88" height="90" rx="24" fill="#1C1E22" stroke="#363940" strokeWidth="2.5" />
          <circle cx="42" cy="42" r="16" fill="#0C0D10" stroke="#474B54" strokeWidth="2" />
          <circle cx="42" cy="42" r="7" fill="#1C2738" />
          <circle cx="80" cy="82" r="16" fill="#0C0D10" stroke="#474B54" strokeWidth="2" />
          <circle cx="80" cy="82" r="7" fill="#1C2738" />
          <circle cx="80" cy="40" r="5.5" fill="#E8DFC8" />
          <circle cx="42" cy="84" r="3.5" fill="#32363E" />
        </g>
      );

    case 'apple-dual-vert':
      return (
        <g>
          <rect x="20" y="18" width="46" height="94" rx="23" fill="#1C1E22" stroke="#363940" strokeWidth="2.5" />
          <circle cx="43" cy="42" r="14.5" fill="#0C0D10" stroke="#474B54" strokeWidth="2" />
          <circle cx="43" cy="42" r="6.5" fill="#1C2738" />
          <circle cx="43" cy="88" r="14.5" fill="#0C0D10" stroke="#474B54" strokeWidth="2" />
          <circle cx="43" cy="88" r="6.5" fill="#1C2738" />
          <circle cx="80" cy="65" r="5.5" fill="#E8DFC8" stroke="#26282B" strokeWidth="1.5" />
        </g>
      );

    case 'samsung-ultra-5':
      return (
        <g>
          {/* Floating precision cutout rings typical of Galaxy Ultra */}
          <rect x="18" y="18" width="74" height="122" rx="14" fill="#1B1D21" stroke="#34373D" strokeWidth="2" />
          <circle cx="38" cy="39" r="14" fill="#0B0C0F" stroke="#525761" strokeWidth="2" />
          <circle cx="38" cy="39" r="6" fill="#1B283C" />
          <circle cx="38" cy="79" r="14" fill="#0B0C0F" stroke="#525761" strokeWidth="2" />
          <circle cx="38" cy="79" r="6" fill="#1B283C" />
          <circle cx="38" cy="119" r="14" fill="#0B0C0F" stroke="#525761" strokeWidth="2" />
          <circle cx="38" cy="119" r="5.5" fill="#1B283C" />
          <circle cx="72" cy="48" r="8.5" fill="#0B0C0F" stroke="#4B5059" strokeWidth="1.5" />
          <circle cx="72" cy="79" r="5" fill="#E8DFC8" />
          <circle cx="72" cy="110" r="8.5" fill="#0B0C0F" stroke="#4B5059" strokeWidth="1.5" />
        </g>
      );

    case 'samsung-vertical-3':
      return (
        <g>
          <rect x="20" y="20" width="38" height="114" rx="19" fill="#1B1D21" stroke="#363940" strokeWidth="2" />
          <circle cx="39" cy="40" r="12" fill="#0B0C0F" stroke="#4D525C" strokeWidth="1.8" />
          <circle cx="39" cy="40" r="5" fill="#1B283C" />
          <circle cx="39" cy="77" r="12" fill="#0B0C0F" stroke="#4D525C" strokeWidth="1.8" />
          <circle cx="39" cy="77" r="5" fill="#1B283C" />
          <circle cx="39" cy="114" r="12" fill="#0B0C0F" stroke="#4D525C" strokeWidth="1.8" />
          <circle cx="39" cy="114" r="5" fill="#1B283C" />
          <circle cx="72" cy="58" r="4.5" fill="#E8DFC8" stroke="#26282B" strokeWidth="1.5" />
        </g>
      );

    case 'xiaomi-square-quad':
      return (
        <g>
          <rect x="18" y="18" width="102" height="102" rx="22" fill="#181A1F" stroke="#383B42" strokeWidth="2.5" />
          <circle cx="46" cy="46" r="15" fill="#0B0C0F" stroke="#4C515C" strokeWidth="2" />
          <circle cx="46" cy="46" r="6.5" fill="#1B283C" />
          <circle cx="92" cy="46" r="15" fill="#0B0C0F" stroke="#4C515C" strokeWidth="2" />
          <circle cx="92" cy="46" r="6.5" fill="#1B283C" />
          <circle cx="46" cy="92" r="15" fill="#0B0C0F" stroke="#4C515C" strokeWidth="2" />
          <circle cx="46" cy="92" r="6.5" fill="#1B283C" />
          <circle cx="92" cy="92" r="9" fill="#E8DFC8" />
        </g>
      );

    case 'xiaomi-rect-triple':
      return (
        <g>
          <rect x="18" y="18" width="78" height="106" rx="18" fill="#1B1D22" stroke="#383B42" strokeWidth="2" />
          <circle cx="42" cy="44" r="15" fill="#0B0C0F" stroke="#4D525C" strokeWidth="2" />
          <circle cx="42" cy="44" r="6" fill="#1B283C" />
          <circle cx="42" cy="92" r="15" fill="#0B0C0F" stroke="#4D525C" strokeWidth="2" />
          <circle cx="42" cy="92" r="6" fill="#1B283C" />
          <circle cx="76" cy="68" r="11" fill="#0B0C0F" stroke="#4D525C" strokeWidth="1.5" />
          <circle cx="76" cy="36" r="4.5" fill="#E8DFC8" />
        </g>
      );

    case 'poco-wide-bar':
      return (
        <g>
          <rect x="16" y="18" width="208" height="92" rx="18" fill="#1A1C21" stroke="#383B42" strokeWidth="2" />
          <circle cx="48" cy="46" r="14" fill="#0B0C0F" stroke="#4E535D" strokeWidth="2" />
          <circle cx="48" cy="84" r="14" fill="#0B0C0F" stroke="#4E535D" strokeWidth="2" />
          <circle cx="90" cy="46" r="14" fill="#0B0C0F" stroke="#4E535D" strokeWidth="2" />
          <circle cx="90" cy="84" r="7" fill="#E8DFC8" />
        </g>
      );

    case 'circular-center':
      return (
        <g>
          <circle cx="120" cy="94" r="56" fill="#181A1F" stroke="#3B3F48" strokeWidth="3" />
          <circle cx="120" cy="94" r="46" fill="none" stroke="#2D3138" strokeWidth="1.5" />
          <circle cx="98" cy="78" r="13" fill="#0B0C0F" stroke="#4F545E" strokeWidth="1.8" />
          <circle cx="98" cy="78" r="5.5" fill="#1B283C" />
          <circle cx="142" cy="78" r="13" fill="#0B0C0F" stroke="#4F545E" strokeWidth="1.8" />
          <circle cx="142" cy="78" r="5.5" fill="#1B283C" />
          <circle cx="120" cy="118" r="14" fill="#0B0C0F" stroke="#4F545E" strokeWidth="1.8" />
          <circle cx="120" cy="118" r="6" fill="#1B283C" />
          <circle cx="120" cy="60" r="4.5" fill="#E8DFC8" />
        </g>
      );

    case 'pill-dual-side':
    default:
      return (
        <g>
          <rect x="20" y="18" width="52" height="106" rx="26" fill="#1B1D22" stroke="#383B42" strokeWidth="2" />
          <circle cx="46" cy="46" r="16" fill="#0B0C0F" stroke="#4D525C" strokeWidth="2" />
          <circle cx="46" cy="46" r="6.5" fill="#1B283C" />
          <circle cx="46" cy="94" r="16" fill="#0B0C0F" stroke="#4D525C" strokeWidth="2" />
          <circle cx="46" cy="94" r="6.5" fill="#1B283C" />
          <circle cx="86" cy="54" r="5" fill="#E8DFC8" stroke="#26282B" strokeWidth="1.5" />
        </g>
      );
  }
}

/**
 * Reusable flat front-view phone case mockup.
 * Renders directly on the plaster wall with real device corner radii and camera cutout.
 * Supports both catalog artworks and custom uploaded images + printed Arabic/Latin names.
 */
export function PhoneCaseMockup({
  model,
  artworkId = null,
  artworkNode = null,
  customImage = null,
  printedName = null,
  className = '',
  style = undefined,
  onPointerDown = undefined,
  onPointerMove = undefined,
  onPointerUp = undefined,
  ariaLabel = undefined,
}) {
  const uid = useId().replace(/:/g, '');
  const clipId = `case-clip-${uid}`;

  const cornerRadius = model?.cornerRadius ?? 34;
  const cameraLayout = model?.cameraLayout ?? 'apple-pro-triple';
  const aspectRatio = model?.aspectRatio ?? 0.48;

  // Map placement to safe visual band inside the printed back face
  const nameTopPercent =
    printedName?.placement === 'top'
      ? '36%'
      : printedName?.placement === 'center'
        ? '58%'
        : '82%';

  const isArabicName = printedName?.script === 'arabic';
  const nameColor = printedName?.ink === 'dark' ? '#26282B' : '#F6F6F3';

  return (
    <div
      dir="ltr"
      className={`relative select-none ${className}`}
      style={{
        aspectRatio: `${aspectRatio}`,
        containerType: 'inline-size',
        ...style,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
    >
      {/* Physical hardware shell SVG (outer rim + side buttons + clipped artwork) */}
      <svg
        viewBox="-6 -4 252 508"
        className="block w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x="6" y="6" width="228" height="488" rx={Math.max(8, cornerRadius - 4)} />
          </clipPath>
        </defs>

        {/* Subtle tactile side hardware buttons */}
        <rect x="-4" y="92" width="4" height="24" rx="2" fill="#2B2E33" />
        <rect x="-4" y="132" width="4" height="44" rx="2" fill="#2B2E33" />
        <rect x="-4" y="186" width="4" height="44" rx="2" fill="#2B2E33" />
        <rect x="240" y="148" width="4" height="58" rx="2" fill="#2B2E33" />

        {/* Matte polycarbonate outer bumper rim */}
        <rect
          x="0"
          y="0"
          width="240"
          height="500"
          rx={cornerRadius}
          fill="#222428"
        />

        {/* Clipped back print area */}
        <g clipPath={`url(#${clipId})`}>
          {/* Base studio blank case surface when customizing without image */}
          <rect x="0" y="0" width="240" height="500" fill="#F6F6F3" />

          {/* Custom SVG slot (used by Hero for cross-fading prints inside a single solid shell) */}
          {artworkNode}

          {/* Catalog SVG print */}
          {!artworkNode && artworkId && (!customImage?.url || customImage.url.startsWith('idb://')) ? (
            <CaseArtwork artworkId={artworkId} />
          ) : null}

          {/* Custom uploaded image (transformed cleanly inside clipped shell; never fetch raw idb:// refs) */}
          {customImage?.url && !customImage.url.startsWith('idb://') ? (
            <g
              transform={`translate(${120 + (customImage.x || 0) * 1.4}, ${
                250 + (customImage.y || 0) * 2.4
              }) rotate(${customImage.rotation || 0}) scale(${customImage.scale || 1})`}
            >
              <image
                href={customImage.url}
                x="-120"
                y="-250"
                width="240"
                height="500"
                preserveAspectRatio="xMidYMid slice"
              />
            </g>
          ) : null}
        </g>

        {/* Inner micro-bevel seam around print edge */}
        <rect
          x="6"
          y="6"
          width="228"
          height="488"
          rx={Math.max(8, cornerRadius - 4)}
          fill="none"
          stroke="#191B1E"
          strokeWidth="1.5"
          opacity="0.32"
        />

        {/* Authentic per-model camera island cutout */}
        <CameraCutout layout={cameraLayout} />
      </svg>

      {/* HTML overlay for crisp native Arabic/Latin font rendering & shaping on printed names */}
      {printedName?.enabled && printedName?.text?.trim() ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[10%] flex items-center justify-center text-center"
          style={{
            top: nameTopPercent,
            transform: 'translateY(-50%)',
          }}
        >
          <span
            dir={isArabicName ? 'rtl' : 'ltr'}
            lang={isArabicName ? 'ar' : 'en'}
            className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-1.5 py-0.5 leading-snug"
            style={{
              fontFamily: printedName.fontFamily || '"Readex Pro", sans-serif',
              fontWeight: printedName.fontWeight || 700,
              letterSpacing: isArabicName ? '0px' : printedName.letterSpacing || '0px',
              color: nameColor,
              fontSize: 'clamp(4.5px, 10.5cqw, 28px)',
              textShadow:
                printedName.ink === 'dark'
                  ? '0 1px 0 rgba(246,246,243,0.45)'
                  : '0 1px 2px rgba(24,27,32,0.45)',
            }}
          >
            {printedName.text}
          </span>
        </div>
      ) : null}
    </div>
  );
}
