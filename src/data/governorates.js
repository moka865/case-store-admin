/**
 * Governorate shipping matrix (cash on delivery only).
 * Ready for the checkout phase and admin management without schema changes.
 */
export const GOVERNORATES = [
  { id: 'cairo', nameAr: 'القاهرة', shippingFee: 50, estimatedDays: '2-3', codAvailable: true },
  { id: 'giza', nameAr: 'الجيزة', shippingFee: 50, estimatedDays: '2-3', codAvailable: true },
  { id: 'alexandria', nameAr: 'الإسكندرية', shippingFee: 65, estimatedDays: '3-4', codAvailable: true },
  { id: 'qalyubia', nameAr: 'القليوبية', shippingFee: 60, estimatedDays: '2-4', codAvailable: true },
  { id: 'dakahlia', nameAr: 'الدقهلية', shippingFee: 75, estimatedDays: '3-5', codAvailable: true },
  { id: 'sharqia', nameAr: 'الشرقية', shippingFee: 75, estimatedDays: '3-5', codAvailable: true },
  { id: 'gharbia', nameAr: 'الغربية', shippingFee: 75, estimatedDays: '3-5', codAvailable: true },
  { id: 'monufia', nameAr: 'المنوفية', shippingFee: 75, estimatedDays: '3-5', codAvailable: true },
  { id: 'beheira', nameAr: 'البحيرة', shippingFee: 80, estimatedDays: '3-5', codAvailable: true },
  { id: 'port-said', nameAr: 'بورسعيد', shippingFee: 75, estimatedDays: '3-5', codAvailable: true },
  { id: 'ismailia', nameAr: 'الإسماعيلية', shippingFee: 75, estimatedDays: '3-5', codAvailable: true },
  { id: 'suez', nameAr: 'السويس', shippingFee: 75, estimatedDays: '3-5', codAvailable: true },
  { id: 'fayoum', nameAr: 'الفيوم', shippingFee: 80, estimatedDays: '3-5', codAvailable: true },
  { id: 'assiut', nameAr: 'أسيوط', shippingFee: 90, estimatedDays: '4-6', codAvailable: true },
  { id: 'aswan', nameAr: 'أسوان', shippingFee: 95, estimatedDays: '4-6', codAvailable: true },
  { id: 'red-sea', nameAr: 'البحر الأحمر', shippingFee: 95, estimatedDays: '4-6', codAvailable: true },
  { id: 'north-sinai', nameAr: 'شمال سيناء', shippingFee: 110, estimatedDays: '5-7', codAvailable: false },
];
