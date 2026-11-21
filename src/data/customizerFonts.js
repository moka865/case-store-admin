/**
 * Customizer printed-name font catalogs by detected script (Arabic vs Latin).
 * Every Arabic font is chosen for clean cursive joining with zero letter-spacing.
 */
export const CUSTOMIZER_FONTS = {
  arabic: [
    {
      id: 'ar-clean',
      labelAr: 'بسيط',
      fontFamily: '"Readex Pro", sans-serif',
      fontWeight: 600,
      letterSpacing: '0px',
      sampleFallback: 'يوسف',
    },
    {
      id: 'ar-bold',
      labelAr: 'عريض',
      fontFamily: '"Lalezar", cursive',
      fontWeight: 400,
      letterSpacing: '0px',
      sampleFallback: 'يوسف',
    },
    {
      id: 'ar-hand',
      labelAr: 'خط يد',
      fontFamily: '"Aref Ruqaa", serif',
      fontWeight: 700,
      letterSpacing: '0px',
      sampleFallback: 'يوسف',
    },
    {
      id: 'ar-kufi',
      labelAr: 'كوفي',
      fontFamily: '"Reem Kufi", sans-serif',
      fontWeight: 700,
      letterSpacing: '0px',
      sampleFallback: 'يوسف',
    },
  ],
  latin: [
    {
      id: 'en-clean',
      labelAr: 'بسيط',
      fontFamily: '"Bricolage Grotesque", sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      sampleFallback: 'Youssef',
    },
    {
      id: 'en-bold',
      labelAr: 'عريض',
      fontFamily: '"Syne", sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      sampleFallback: 'Youssef',
    },
    {
      id: 'en-hand',
      labelAr: 'خط يد',
      fontFamily: '"Caveat", cursive',
      fontWeight: 700,
      letterSpacing: '0px',
      sampleFallback: 'Youssef',
    },
    {
      id: 'en-geometric',
      labelAr: 'هندسي',
      fontFamily: '"Unbounded", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      sampleFallback: 'Youssef',
    },
  ],
};

export const NAME_PLACEMENTS = [
  { id: 'top', labelAr: 'فوق' },
  { id: 'center', labelAr: 'في النص' },
  { id: 'bottom', labelAr: 'تحت' },
];

/**
 * Detects whether typed text is predominantly Arabic or Latin.
 * Defaults to 'arabic' when empty or ambiguous.
 */
export function detectTextScript(text) {
  if (!text || !text.trim()) return 'arabic';
  const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || []).length;
  const latinChars = (text.match(/[A-Za-z]/g) || []).length;
  if (latinChars > arabicChars) return 'latin';
  return 'arabic';
}
