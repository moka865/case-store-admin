/**
 * Supported phone brands (exact tab order required by DESIGN.md).
 */
export const PHONE_BRANDS = [
  'iPhone',
  'Samsung',
  'Xiaomi',
  'Oppo',
  'Realme',
  'Infinix',
  'Tecno',
];

/**
 * Popular Egyptian-market phone models with authentic aspect ratios,
 * device corner radii (in 240x500 SVG space), and camera island layouts.
 */
export const PHONE_MODELS = [
  // iPhone
  {
    id: 'iphone-16-pro',
    brand: 'iPhone',
    name: 'iPhone 16 Pro',
    aspectRatio: 0.478,
    cornerRadius: 38,
    cameraLayout: 'apple-pro-triple',
  },
  {
    id: 'iphone-16',
    brand: 'iPhone',
    name: 'iPhone 16',
    aspectRatio: 0.484,
    cornerRadius: 38,
    cameraLayout: 'apple-dual-vert',
  },
  {
    id: 'iphone-15-pro',
    brand: 'iPhone',
    name: 'iPhone 15 Pro',
    aspectRatio: 0.481,
    cornerRadius: 38,
    cameraLayout: 'apple-pro-triple',
  },
  {
    id: 'iphone-15',
    brand: 'iPhone',
    name: 'iPhone 15',
    aspectRatio: 0.485,
    cornerRadius: 38,
    cameraLayout: 'apple-dual-diag',
  },
  {
    id: 'iphone-14-pro',
    brand: 'iPhone',
    name: 'iPhone 14 Pro',
    aspectRatio: 0.484,
    cornerRadius: 37,
    cameraLayout: 'apple-pro-triple',
  },
  {
    id: 'iphone-13',
    brand: 'iPhone',
    name: 'iPhone 13',
    aspectRatio: 0.487,
    cornerRadius: 36,
    cameraLayout: 'apple-dual-diag',
  },

  // Samsung
  {
    id: 'samsung-s24-ultra',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    aspectRatio: 0.486,
    cornerRadius: 12,
    cameraLayout: 'samsung-ultra-5',
  },
  {
    id: 'samsung-s24',
    brand: 'Samsung',
    name: 'Galaxy S24',
    aspectRatio: 0.48,
    cornerRadius: 30,
    cameraLayout: 'samsung-vertical-3',
  },
  {
    id: 'samsung-a55',
    brand: 'Samsung',
    name: 'Galaxy A55',
    aspectRatio: 0.479,
    cornerRadius: 30,
    cameraLayout: 'samsung-vertical-3',
  },
  {
    id: 'samsung-a35',
    brand: 'Samsung',
    name: 'Galaxy A35',
    aspectRatio: 0.481,
    cornerRadius: 29,
    cameraLayout: 'samsung-vertical-3',
  },
  {
    id: 'samsung-a15',
    brand: 'Samsung',
    name: 'Galaxy A15',
    aspectRatio: 0.478,
    cornerRadius: 28,
    cameraLayout: 'samsung-vertical-3',
  },

  // Xiaomi
  {
    id: 'xiaomi-14',
    brand: 'Xiaomi',
    name: 'Xiaomi 14',
    aspectRatio: 0.468,
    cornerRadius: 32,
    cameraLayout: 'xiaomi-square-quad',
  },
  {
    id: 'redmi-note-13-pro',
    brand: 'Xiaomi',
    name: 'Redmi Note 13 Pro',
    aspectRatio: 0.461,
    cornerRadius: 28,
    cameraLayout: 'xiaomi-rect-triple',
  },
  {
    id: 'redmi-note-13',
    brand: 'Xiaomi',
    name: 'Redmi Note 13',
    aspectRatio: 0.464,
    cornerRadius: 28,
    cameraLayout: 'xiaomi-rect-triple',
  },
  {
    id: 'poco-x6-pro',
    brand: 'Xiaomi',
    name: 'POCO X6 Pro',
    aspectRatio: 0.463,
    cornerRadius: 27,
    cameraLayout: 'poco-wide-bar',
  },

  // Oppo
  {
    id: 'oppo-reno-12',
    brand: 'Oppo',
    name: 'Oppo Reno 12',
    aspectRatio: 0.459,
    cornerRadius: 31,
    cameraLayout: 'pill-dual-side',
  },
  {
    id: 'oppo-reno-11',
    brand: 'Oppo',
    name: 'Oppo Reno 11',
    aspectRatio: 0.458,
    cornerRadius: 31,
    cameraLayout: 'pill-dual-side',
  },
  {
    id: 'oppo-a79',
    brand: 'Oppo',
    name: 'Oppo A79',
    aspectRatio: 0.46,
    cornerRadius: 28,
    cameraLayout: 'pill-dual-side',
  },
  {
    id: 'oppo-a38',
    brand: 'Oppo',
    name: 'Oppo A38',
    aspectRatio: 0.462,
    cornerRadius: 28,
    cameraLayout: 'samsung-vertical-3',
  },

  // Realme
  {
    id: 'realme-12-pro-plus',
    brand: 'Realme',
    name: 'Realme 12 Pro+',
    aspectRatio: 0.458,
    cornerRadius: 32,
    cameraLayout: 'circular-center',
  },
  {
    id: 'realme-gt-6t',
    brand: 'Realme',
    name: 'Realme GT 6T',
    aspectRatio: 0.463,
    cornerRadius: 30,
    cameraLayout: 'xiaomi-rect-triple',
  },
  {
    id: 'realme-c67',
    brand: 'Realme',
    name: 'Realme C67',
    aspectRatio: 0.461,
    cornerRadius: 28,
    cameraLayout: 'pill-dual-side',
  },

  // Infinix
  {
    id: 'infinix-zero-30',
    brand: 'Infinix',
    name: 'Infinix Zero 30',
    aspectRatio: 0.457,
    cornerRadius: 30,
    cameraLayout: 'xiaomi-rect-triple',
  },
  {
    id: 'infinix-note-40-pro',
    brand: 'Infinix',
    name: 'Infinix Note 40 Pro',
    aspectRatio: 0.458,
    cornerRadius: 30,
    cameraLayout: 'xiaomi-square-quad',
  },
  {
    id: 'infinix-hot-40-pro',
    brand: 'Infinix',
    name: 'Infinix Hot 40 Pro',
    aspectRatio: 0.459,
    cornerRadius: 28,
    cameraLayout: 'apple-pro-triple',
  },

  // Tecno
  {
    id: 'tecno-camon-30',
    brand: 'Tecno',
    name: 'Tecno Camon 30',
    aspectRatio: 0.458,
    cornerRadius: 30,
    cameraLayout: 'circular-center',
  },
  {
    id: 'tecno-spark-20-pro',
    brand: 'Tecno',
    name: 'Tecno Spark 20 Pro',
    aspectRatio: 0.459,
    cornerRadius: 28,
    cameraLayout: 'apple-pro-triple',
  },
  {
    id: 'tecno-pop-8',
    brand: 'Tecno',
    name: 'Tecno Pop 8',
    aspectRatio: 0.462,
    cornerRadius: 28,
    cameraLayout: 'pill-dual-side',
  },
];
