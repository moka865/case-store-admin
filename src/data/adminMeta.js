/**
 * Built-in SVG artwork definitions matching CaseArtworks.jsx.
 */
export const BUILTIN_ARTWORKS = [
  { id: 'tokyo-driftline', label: 'Tokyo Driftline' },
  { id: 'zamalek-dusk', label: 'Zamalek Dusk' },
  { id: 'riso-bloom', label: 'Riso Bloom' },
  { id: 'extra-time-90', label: 'Extra Time 90+4' },
  { id: 'koshary-bauhaus', label: 'Koshary Bauhaus' },
  { id: 'quiet-geometry', label: 'Quiet Geometry' },
  { id: 'midnight-ronin', label: 'Midnight Ronin' },
  { id: 'no-rush-club', label: 'No Rush Club' },
  { id: 'chroma-grid-04', label: 'Chroma Grid 04' },
  { id: 'golden-boot-club', label: 'Golden Boot Club' },
  { id: 'nile-frequency', label: 'Nile Frequency' },
  { id: 'paper-orbit', label: 'Paper Orbit' },
  { id: 'mecha-pulse-09', label: 'Mecha Pulse 09' },
  { id: 'cairo-state', label: 'Cairo State of Mind' },
];

/**
 * The 10 camera island layouts supported by PhoneCaseMockup.jsx.
 */
export const CAMERA_LAYOUTS = [
  { id: 'apple-pro-triple', labelAr: 'مربع 3 عدسات (Pro)' },
  { id: 'apple-dual-diag', labelAr: 'مربع عدستين قطري' },
  { id: 'apple-dual-vert', labelAr: 'شريط عدستين رأسي' },
  { id: 'samsung-ultra-5', labelAr: '5 عدسات ألترا' },
  { id: 'samsung-vertical-3', labelAr: '3 عدسات رأسي' },
  { id: 'xiaomi-square-quad', labelAr: 'مربع رباعي كبير' },
  { id: 'xiaomi-rect-triple', labelAr: 'مستطيل 3 عدسات' },
  { id: 'poco-wide-bar', labelAr: 'شريط عريض (POCO)' },
  { id: 'circular-center', labelAr: 'دائري في النص' },
  { id: 'pill-dual-side', labelAr: 'بيضاوي جانبي عدستين' },
];

export const SALON_SPANS = [3, 4, 5];

export function getCameraLayoutLabel(layoutId) {
  return CAMERA_LAYOUTS.find((l) => l.id === layoutId)?.labelAr || layoutId;
}
