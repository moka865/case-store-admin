/**
 * 14 bespoke SVG gallery prints for the printed phone case catalog.
 * Zero stock photos, zero colliding SVG IDs.
 * Every artwork is composed in a 240x500 coordinate space and fills the case edge-to-edge.
 */
export function CaseArtwork({ artworkId }) {
  switch (artworkId) {
    case 'tokyo-driftline':
      return (
        <g>
          <rect width="240" height="500" fill="#F4EDE0" />
          {/* Speedline rays radiating from upper center */}
          <g stroke="#1C1E26" strokeWidth="1.4" opacity="0.22">
            <line x1="120" y1="220" x2="-40" y2="0" />
            <line x1="120" y1="220" x2="40" y2="0" />
            <line x1="120" y1="220" x2="120" y2="0" />
            <line x1="120" y1="220" x2="210" y2="0" />
            <line x1="120" y1="220" x2="280" y2="30" />
            <line x1="120" y1="220" x2="280" y2="160" />
            <line x1="120" y1="220" x2="280" y2="310" />
            <line x1="120" y1="220" x2="-40" y2="150" />
            <line x1="120" y1="220" x2="-40" y2="320" />
          </g>
          {/* Vermilion rising sun */}
          <circle cx="145" cy="215" r="76" fill="#E33B2B" />
          {/* Bold ink mountain wave silhouette */}
          <path d="M0 325 Q55 265 110 315 T240 295 L240 500 L0 500 Z" fill="#181B24" />
          <path d="M0 365 Q75 315 145 360 T240 345 L240 395 Q150 405 90 380 T0 402 Z" fill="#F4EDE0" />
          <path d="M0 415 Q85 375 160 415 T240 400 L240 500 L0 500 Z" fill="#2245B5" />
          {/* Graphic Japanese-inspired poster stripe */}
          <rect x="22" y="195" width="32" height="108" fill="#181B24" />
          <rect x="28" y="206" width="20" height="6" fill="#F4EDE0" />
          <rect x="28" y="220" width="20" height="18" fill="#E33B2B" />
          <rect x="28" y="246" width="20" height="6" fill="#F4EDE0" />
          <rect x="28" y="260" width="20" height="32" fill="#F4EDE0" />
          {/* Editorial poster label */}
          <text
            x="24"
            y="468"
            fill="#F4EDE0"
            fontFamily="Bricolage Grotesque, sans-serif"
            fontWeight="800"
            fontSize="16"
            letterSpacing="0.06em"
          >
            DRIFT / 088
          </text>
        </g>
      );

    case 'zamalek-dusk':
      return (
        <g>
          <rect width="240" height="500" fill="#D95D39" />
          {/* Dusk sky bands (flat matte screenprint layers, no CSS gradients) */}
          <rect x="0" y="0" width="240" height="165" fill="#2A2B4A" />
          <rect x="0" y="165" width="240" height="95" fill="#C44D34" />
          <rect x="0" y="260" width="240" height="105" fill="#E89A3C" />
          <rect x="0" y="365" width="240" height="135" fill="#1E3A4C" />
          {/* Oversized Nile sun */}
          <circle cx="145" cy="260" r="64" fill="#F7D479" />
          {/* Iconic Cairo architectural arches */}
          <path
            d="M0 365 L0 295 A40 40 0 0 1 80 295 L80 365 Z"
            fill="#232234"
          />
          <path
            d="M80 365 L80 295 A40 40 0 0 1 160 295 L160 365 Z"
            fill="#232234"
          />
          <path
            d="M160 365 L160 295 A40 40 0 0 1 240 295 L240 365 Z"
            fill="#232234"
          />
          {/* Arch cutouts showing glowing dusk */}
          <path d="M18 365 L18 308 A22 22 0 0 1 62 308 L62 365 Z" fill="#E89A3C" />
          <path d="M98 365 L98 308 A22 22 0 0 1 142 308 L142 365 Z" fill="#F7D479" />
          <path d="M178 365 L178 308 A22 22 0 0 1 222 308 L222 365 Z" fill="#E89A3C" />
          {/* Water reflections */}
          <rect x="86" y="388" width="68" height="7" rx="3.5" fill="#F7D479" />
          <rect x="102" y="408" width="46" height="6" rx="3" fill="#E89A3C" />
          <rect x="92" y="426" width="58" height="5" rx="2.5" fill="#F7D479" opacity="0.7" />
          {/* Geometric mashrabiya diamond motif */}
          <polygon points="184,128 202,146 184,164 166,146" fill="#F7D479" />
          <polygon points="184,137 193,146 184,155 175,146" fill="#2A2B4A" />
        </g>
      );

    case 'riso-bloom':
      return (
        <g>
          <rect width="240" height="500" fill="#F5F0E4" />
          {/* Risograph overprint petals */}
          <circle cx="155" cy="180" r="56" fill="#0F8B8D" opacity="0.88" />
          <circle cx="96" cy="242" r="64" fill="#EC4E3B" opacity="0.88" />
          <circle cx="164" cy="272" r="50" fill="#F4B942" opacity="0.92" />
          <circle cx="88" cy="348" r="58" fill="#1F51B5" opacity="0.85" />
          {/* Bold cut-out botanical stem & leaves */}
          <path
            d="M128 490 C124 385 112 310 132 190"
            stroke="#1C242B"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M125 350 C70 338 45 292 52 260 C92 268 122 302 125 350 Z" fill="#1C242B" />
          <path d="M124 275 C172 252 204 218 208 186 C168 194 134 226 124 275 Z" fill="#1C242B" />
          <circle cx="132" cy="186" r="22" fill="#F5F0E4" />
          <circle cx="132" cy="186" r="10" fill="#EC4E3B" />
          {/* Riso registration dots */}
          <circle cx="34" cy="456" r="6" fill="#EC4E3B" />
          <circle cx="52" cy="456" r="6" fill="#0F8B8D" />
          <circle cx="70" cy="456" r="6" fill="#F4B942" />
        </g>
      );

    case 'extra-time-90':
      return (
        <g>
          <rect width="240" height="500" fill="#146B3A" />
          {/* Pitch mowed stripes */}
          <rect x="0" y="0" width="240" height="62" fill="#187842" />
          <rect x="0" y="125" width="240" height="62" fill="#187842" />
          <rect x="0" y="250" width="240" height="62" fill="#187842" />
          <rect x="0" y="375" width="240" height="62" fill="#187842" />
          {/* Chalk pitch markings */}
          <rect x="18" y="18" width="204" height="464" fill="none" stroke="#F4F5EF" strokeWidth="3" />
          <line x1="18" y1="250" x2="222" y2="250" stroke="#F4F5EF" strokeWidth="3" />
          <circle cx="120" cy="250" r="46" fill="none" stroke="#F4F5EF" strokeWidth="3" />
          <circle cx="120" cy="250" r="5" fill="#F4F5EF" />
          <rect x="64" y="408" width="112" height="74" fill="none" stroke="#F4F5EF" strokeWidth="3" />
          {/* Bold brutalist stadium scoreboard stamp */}
          <rect x="28" y="176" width="184" height="78" fill="#15181C" />
          <text
            x="120"
            y="228"
            textAnchor="middle"
            fill="#E9F24D"
            fontFamily="Bricolage Grotesque, sans-serif"
            fontWeight="800"
            fontSize="44"
            letterSpacing="-0.03em"
          >
            90+4&apos;
          </text>
          <text
            x="120"
            y="366"
            textAnchor="middle"
            fill="#F4F5EF"
            fontFamily="Bricolage Grotesque, sans-serif"
            fontWeight="700"
            fontSize="16"
            letterSpacing="0.14em"
          >
            EXTRA TIME
          </text>
        </g>
      );

    case 'koshary-bauhaus':
      return (
        <g>
          <rect width="240" height="500" fill="#F4E7CE" />
          {/* Modernist Bauhaus blocks in Cairo street-food palette */}
          <rect x="0" y="0" width="120" height="170" fill="#D43A28" />
          <rect x="120" y="0" width="120" height="170" fill="#F2B830" />
          <circle cx="120" cy="170" r="78" fill="#1D232A" />
          <path d="M120 92 A78 78 0 0 1 198 170 L120 170 Z" fill="#1E6B4B" />
          <rect x="24" y="276" width="192" height="24" fill="#1D232A" />
          <rect x="24" y="314" width="90" height="118" fill="#1E6B4B" />
          <circle cx="168" cy="356" r="46" fill="#D43A28" />
          <polygon points="124,432 216,432 170,368" fill="#F2B830" />
          {/* Crisp Bauhaus grid lines */}
          <line x1="120" y1="0" x2="120" y2="500" stroke="#1D232A" strokeWidth="2.5" />
          <line x1="0" y1="260" x2="240" y2="260" stroke="#1D232A" strokeWidth="2.5" />
          <text
            x="24"
            y="472"
            fill="#1D232A"
            fontFamily="Bricolage Grotesque, sans-serif"
            fontWeight="800"
            fontSize="18"
            letterSpacing="0.04em"
          >
            CAIRO 1954
          </text>
        </g>
      );

    case 'quiet-geometry':
      return (
        <g>
          <rect width="240" height="500" fill="#EFECE4" />
          <rect x="28" y="156" width="184" height="184" fill="#9EB09E" />
          <path d="M28 340 A92 92 0 0 1 212 340 Z" fill="#C46D48" />
          <circle cx="164" cy="212" r="32" fill="#EFECE4" />
          <rect x="28" y="356" width="84" height="96" fill="#2B2E33" />
          <circle cx="166" cy="404" r="46" fill="#D9C8AD" />
          <line x1="28" y1="138" x2="212" y2="138" stroke="#2B2E33" strokeWidth="2" />
        </g>
      );

    case 'midnight-ronin':
      return (
        <g>
          <rect width="240" height="500" fill="#121626" />
          {/* Crimson full moon */}
          <circle cx="120" cy="224" r="82" fill="#D72638" />
          {/* Diagonal katana slash */}
          <polygon points="0,335 240,145 240,174 0,364" fill="#F2EFE9" />
          <polygon points="0,352 240,162 240,170 0,360" fill="#121626" />
          {/* Architectural grid bars */}
          <rect x="24" y="388" width="192" height="4" fill="#F2EFE9" />
          <rect x="24" y="404" width="128" height="4" fill="#D72638" />
          <rect x="24" y="420" width="164" height="4" fill="#F2EFE9" opacity="0.45" />
          <text
            x="24"
            y="466"
            fill="#F2EFE9"
            fontFamily="Bricolage Grotesque, sans-serif"
            fontWeight="800"
            fontSize="20"
            letterSpacing="0.08em"
          >
            RONIN IV
          </text>
        </g>
      );

    case 'no-rush-club':
      return (
        <g>
          <rect width="240" height="500" fill="#204031" />
          <rect x="20" y="152" width="200" height="296" rx="100" fill="#F4EFE2" />
          {/* Arabic typographic poster print (zero letter-spacing for joined Arabic) */}
          <text
            x="120"
            y="286"
            textAnchor="middle"
            fill="#204031"
            fontFamily="Readex Pro, sans-serif"
            fontWeight="700"
            fontSize="38"
          >
            على مهلك
          </text>
          <circle cx="120" cy="204" r="14" fill="#E05A37" />
          <line x1="68" y1="322" x2="172" y2="322" stroke="#204031" strokeWidth="2.5" />
          <text
            x="120"
            y="356"
            textAnchor="middle"
            fill="#204031"
            fontFamily="Bricolage Grotesque, sans-serif"
            fontWeight="700"
            fontSize="13"
            letterSpacing="0.14em"
          >
            NO RUSH CLUB
          </text>
        </g>
      );

    case 'chroma-grid-04':
      return (
        <g>
          <rect width="240" height="500" fill="#F5F3EC" />
          {/* Albers-style nested color fields */}
          <rect x="16" y="128" width="208" height="208" fill="#1C52D1" />
          <rect x="44" y="164" width="152" height="152" fill="#E84E32" />
          <rect x="74" y="202" width="92" height="92" fill="#F5C33B" />
          <rect x="16" y="352" width="98" height="116" fill="#0E7C66" />
          <rect x="126" y="352" width="98" height="116" fill="#23252A" />
          <circle cx="175" cy="410" r="28" fill="#F5F3EC" />
        </g>
      );

    case 'golden-boot-club':
      return (
        <g>
          <rect width="240" height="500" fill="#18392B" />
          {/* Retro 90s football kit chevron stripes */}
          <polygon points="0,150 120,235 240,150 240,192 120,277 0,192" fill="#E5B946" />
          <polygon points="0,218 120,303 240,218 240,256 120,341 0,256" fill="#F5EFE0" />
          <polygon points="0,286 120,371 240,286 240,320 120,405 0,320" fill="#E5B946" />
          {/* Crest badge */}
          <circle cx="120" cy="420" r="36" fill="#F5EFE0" />
          <circle cx="120" cy="420" r="29" fill="none" stroke="#18392B" strokeWidth="2.5" />
          <text
            x="120"
            y="428"
            textAnchor="middle"
            fill="#18392B"
            fontFamily="Bricolage Grotesque, sans-serif"
            fontWeight="800"
            fontSize="24"
          >
            10
          </text>
        </g>
      );

    case 'nile-frequency':
      return (
        <g>
          <rect width="240" height="500" fill="#136F82" />
          {/* Repeating modernist Nile wave bands */}
          <path d="M0 165 Q60 125 120 165 T240 165 L240 220 Q180 180 120 220 T0 220 Z" fill="#F3B73E" />
          <path d="M0 230 Q60 190 120 230 T240 230 L240 285 Q180 245 120 285 T0 285 Z" fill="#F6F2E7" />
          <path d="M0 295 Q60 255 120 295 T240 295 L240 350 Q180 310 120 350 T0 350 Z" fill="#E15A3B" />
          <path d="M0 360 Q60 320 120 360 T240 360 L240 415 Q180 375 120 415 T0 415 Z" fill="#162A38" />
          <circle cx="182" cy="112" r="26" fill="#F6F2E7" />
          <text
            x="24"
            y="468"
            fill="#F6F2E7"
            fontFamily="Bricolage Grotesque, sans-serif"
            fontWeight="700"
            fontSize="15"
            letterSpacing="0.1em"
          >
            30.0444 N
          </text>
        </g>
      );

    case 'paper-orbit':
      return (
        <g>
          <rect width="240" height="500" fill="#E8DFCE" />
          <ellipse
            cx="120"
            cy="272"
            rx="84"
            ry="136"
            fill="none"
            stroke="#22252A"
            strokeWidth="2.5"
            transform="rotate(-18 120 272)"
          />
          <ellipse
            cx="120"
            cy="272"
            rx="54"
            ry="106"
            fill="none"
            stroke="#22252A"
            strokeWidth="1.5"
            transform="rotate(22 120 272)"
          />
          <circle cx="164" cy="186" r="24" fill="#D93D28" />
          <circle cx="76" cy="346" r="14" fill="#22252A" />
          <circle cx="120" cy="272" r="7" fill="#22252A" />
        </g>
      );

    case 'mecha-pulse-09':
      return (
        <g>
          <rect width="240" height="500" fill="#182032" />
          {/* Acid lime & cobalt technical schematic */}
          <rect x="20" y="156" width="200" height="220" fill="none" stroke="#C8F135" strokeWidth="2.5" />
          <polygon points="20,156 124,156 20,260" fill="#2654E8" />
          <polygon points="220,376 116,376 220,272" fill="#C8F135" />
          <circle cx="120" cy="266" r="44" fill="none" stroke="#F4F6F0" strokeWidth="3" />
          <line x1="120" y1="202" x2="120" y2="330" stroke="#C8F135" strokeWidth="2" />
          <line x1="56" y1="266" x2="184" y2="266" stroke="#C8F135" strokeWidth="2" />
          {/* Caution stripes */}
          <g fill="#C8F135">
            <polygon points="20,404 42,404 28,426 6,426" />
            <polygon points="56,404 78,404 64,426 42,426" />
            <polygon points="92,404 114,404 100,426 78,426" />
            <polygon points="128,404 150,404 136,426 114,426" />
            <polygon points="164,404 186,404 172,426 150,426" />
            <polygon points="200,404 222,404 208,426 186,426" />
          </g>
          <text
            x="22"
            y="466"
            fill="#F4F6F0"
            fontFamily="Bricolage Grotesque, sans-serif"
            fontWeight="800"
            fontSize="18"
            letterSpacing="0.08em"
          >
            UNIT // 09
          </text>
        </g>
      );

    case 'cairo-state':
      return (
        <g>
          <rect width="240" height="500" fill="#F26A3D" />
          <rect x="20" y="166" width="200" height="148" fill="#1F242D" />
          <text
            x="120"
            y="256"
            textAnchor="middle"
            fill="#F7E8C8"
            fontFamily="Readex Pro, sans-serif"
            fontWeight="700"
            fontSize="54"
          >
            رايق
          </text>
          {/* Checkered graphic base */}
          <rect x="20" y="334" width="40" height="40" fill="#F7E8C8" />
          <rect x="100" y="334" width="40" height="40" fill="#F7E8C8" />
          <rect x="180" y="334" width="40" height="40" fill="#F7E8C8" />
          <rect x="60" y="374" width="40" height="40" fill="#F7E8C8" />
          <rect x="140" y="374" width="40" height="40" fill="#F7E8C8" />
          <text
            x="120"
            y="456"
            textAnchor="middle"
            fill="#1F242D"
            fontFamily="Bricolage Grotesque, sans-serif"
            fontWeight="800"
            fontSize="14"
            letterSpacing="0.1em"
          >
            CAIRO STATE OF MIND
          </text>
        </g>
      );

    default:
      return <rect width="240" height="500" fill="#D9DDD6" />;
  }
}

/**
 * Generated SVG data URLs so users can test the Customizer immediately even
 * before uploading a photo from their device (zero stock photos).
 */
export const SAMPLE_CUSTOM_IMAGES = [
  {
    id: 'sample-sunset',
    labelAr: 'غروب هندسي',
    recommendedInk: 'light',
    url:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="840" viewBox="0 0 400 840" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="840" fill="#1F355E"/>
          <rect y="400" width="400" height="440" fill="#D95D39"/>
          <circle cx="200" cy="400" r="132" fill="#F4C145"/>
          <path d="M0 570 Q100 510 200 570 T400 570 L400 840 L0 840 Z" fill="#162033"/>
          <rect x="52" y="150" width="296" height="6" fill="#F5F0E4" opacity="0.5"/>
        </svg>`
      ),
  },
  {
    id: 'sample-studio',
    labelAr: 'تشكيل لوني',
    recommendedInk: 'dark',
    url:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="840" viewBox="0 0 400 840" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="840" fill="#F3EDE0"/>
          <circle cx="120" cy="270" r="150" fill="#146B3A"/>
          <circle cx="285" cy="475" r="158" fill="#E33B2B"/>
          <rect x="65" y="530" width="160" height="160" fill="#1F51B5"/>
          <circle cx="255" cy="240" r="58" fill="#F4B942"/>
        </svg>`
      ),
  },
];
