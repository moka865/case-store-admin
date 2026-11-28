/**
 * Shared Order, MissingModelRequest & Demo Handoff Contract (Version 1).
 * Copied identically into both `case-store` and `case-store-admin` so a single
 * backend API can replace both mock layers with zero component refactoring.
 *
 * Snapshot policy:
 * - Orders persist point-in-time snapshots (design title, unit price, phone model name,
 *   material name, governorate name, shipping fee, delivery window) — never mutable IDs only.
 *
 * Image policy:
 * - In mock mode, embedded custom images are offloaded to IndexedDB (`idb://<key>`) to avoid
 *   localStorage quota errors. Once a backend exists, print originals must upload directly to
 *   object/file storage (e.g. S3/R2).
 */

export const CONTRACT_VERSION = 1;

/** Strict Egyptian mobile regex: 010, 011, 012, or 015 followed by 8 Western digits. */
export const EGYPT_MOBILE_REGEX = /^01[0125]\d{8}$/;

export const ORDER_STATUSES = [
  { id: 'pending_confirmation', labelAr: 'مستني تأكيد' },
  { id: 'printing', labelAr: 'قيد الطباعة' },
  { id: 'shipped', labelAr: 'خرج للشحن' },
  { id: 'delivered', labelAr: 'تم التسليم' },
  { id: 'cancelled', labelAr: 'ملغي' },
  { id: 'returned', labelAr: 'مرتجع' },
];

export const ORDER_WORKFLOW_STAGES = [
  'pending_confirmation',
  'printing',
  'shipped',
  'delivered',
];

export const ORDER_TERMINAL_STATUSES = ['delivered', 'cancelled', 'returned'];

export const MISSING_MODEL_STATUSES = [
  { id: 'pending_confirmation', labelAr: 'مستني رد' },
  { id: 'contacted', labelAr: 'تم التواصل' },
  { id: 'model_added', labelAr: 'اتضاف للمتجر' },
  { id: 'closed', labelAr: 'مغلق' },
];

const ID_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function randomSuffix(length = 4) {
  let out = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i += 1) {
      out += ID_ALPHABET[bytes[i] % ID_ALPHABET.length];
    }
    return out;
  }
  for (let i = 0; i < length; i += 1) {
    out += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
  }
  return out;
}

function formatDateStamp(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/** Collision-safe Order ID: GH-YYYYMMDD-XXXX */
export function generateOrderId(date = new Date()) {
  return `GH-${formatDateStamp(date)}-${randomSuffix(4)}`;
}

/** Collision-safe Missing-Model Request ID: MM-YYYYMMDD-XXXX */
export function generateMissingModelRequestId(date = new Date()) {
  return `MM-${formatDateStamp(date)}-${randomSuffix(4)}`;
}

/** Formats Egyptian mobile `01XXXXXXXXX` to WhatsApp deep link `https://wa.me/201XXXXXXXXX`. */
export function toWhatsappUrl(mobileNumber) {
  const digits = String(mobileNumber || '').replace(/[^\d]/g, '');
  if (!digits) return '#';
  const withoutZero = digits.startsWith('0') ? digits.slice(1) : digits;
  return `https://wa.me/20${withoutZero}`;
}

/**
 * Combines `productionDays` (e.g. 2) with governorate `estimatedDays` (e.g. "2-3")
 * to yield an honest total delivery estimate (e.g. "4-5").
 */
export function computeTotalDeliveryDays(productionDays = 2, shippingDaysStr = '2-3') {
  const prod = Math.max(0, Number(productionDays) || 0);
  const parts = String(shippingDaysStr || '')
    .split(/[-–]+/)
    .map((p) => Number(p.trim()))
    .filter((n) => Number.isFinite(n) && n >= 0);

  if (parts.length === 0) return `${prod + 2}-${prod + 4}`;
  if (parts.length === 1) return String(parts[0] + prod);
  return `${parts[0] + prod}-${parts[1] + prod}`;
}

/** Auto-derives order type ('catalog' | 'custom' | 'mixed') from item printSpecs. */
export function deriveOrderType(items = []) {
  let hasCatalog = false;
  let hasCustom = false;
  for (const item of items) {
    const srcType = item?.printSpec?.designSource?.type;
    if (srcType === 'custom-upload' || srcType === 'custom-text-only') {
      hasCustom = true;
    } else {
      hasCatalog = true;
    }
  }
  if (hasCatalog && hasCustom) return 'mixed';
  if (hasCustom) return 'custom';
  return 'catalog';
}

export function getOrderStatusLabel(statusId) {
  return ORDER_STATUSES.find((s) => s.id === statusId)?.labelAr || statusId;
}

export function getMissingModelStatusLabel(statusId) {
  return MISSING_MODEL_STATUSES.find((s) => s.id === statusId)?.labelAr || statusId;
}

/**
 * Runtime contract validator for an Order snapshot object.
 * Supports additive per-item `namePrintFee` and `pricing.designSubtotal` / `pricing.namePrintFees`
 * matching the storefront checkout snapshot contract.
 */
export function validateOrderRecord(order) {
  if (!order || typeof order !== 'object') return false;
  if (typeof order.id !== 'string' || !order.id.trim()) return false;
  if (!['catalog', 'custom', 'mixed'].includes(order.type)) return false;
  if (!ORDER_STATUSES.some((s) => s.id === order.status)) return false;
  if (!order.customer || typeof order.customer.fullName !== 'string') return false;
  if (!EGYPT_MOBILE_REGEX.test(String(order.customer.mobileNumber || ''))) return false;
  if (!Array.isArray(order.items) || order.items.length === 0) return false;
  for (const item of order.items) {
    if (typeof item.unitPrice !== 'number') return false;
    if (item.namePrintFee !== undefined && typeof item.namePrintFee !== 'number') return false;
  }
  if (!order.pricing || typeof order.pricing.total !== 'number') return false;
  if (order.pricing.namePrintFees !== undefined && typeof order.pricing.namePrintFees !== 'number') {
    return false;
  }
  return true;
}

/**
 * Runtime contract validator for a MissingModelRequest object.
 */
export function validateMissingModelRecord(req) {
  if (!req || typeof req !== 'object') return false;
  if (typeof req.id !== 'string' || !req.id.trim()) return false;
  if (typeof req.phoneName !== 'string' || !req.phoneName.trim()) return false;
  if (!EGYPT_MOBILE_REGEX.test(String(req.mobileNumber || ''))) return false;
  if (!MISSING_MODEL_STATUSES.some((s) => s.id === req.status)) return false;
  return true;
}

/**
 * Validates a versioned HandoffExportEnvelope `{ version, orders, missingModelRequests }`.
 * Returns `{ ok, orders, missingModelRequests, error }`.
 */
export function validateHandoffPayload(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'الملف ده مش بصيغة JSON صحيحة.' };
  }

  if (raw.version !== CONTRACT_VERSION) {
    return {
      ok: false,
      error: `إصدار الملف غير مدعوم (المطلوب version: ${CONTRACT_VERSION}).`,
    };
  }

  const hasOrders = Array.isArray(raw.orders);
  const hasRequests = Array.isArray(raw.missingModelRequests);

  if (!hasOrders && !hasRequests) {
    return {
      ok: false,
      error: 'الملف مفهوش أوردرات أو طلبات موديلات ناقصة بصيغة صالحة.',
    };
  }

  const validOrders = (raw.orders || []).filter(validateOrderRecord);
  const validRequests = (raw.missingModelRequests || []).filter(validateMissingModelRecord);
  const invalidCount =
    (raw.orders?.length || 0) -
    validOrders.length +
    ((raw.missingModelRequests?.length || 0) - validRequests.length);

  if (validOrders.length === 0 && validRequests.length === 0) {
    return {
      ok: false,
      error: 'مفيش أي سجل سليم في الملف. اتأكد إنه متصدر من متجر غلاف.',
    };
  }

  return {
    ok: true,
    orders: validOrders,
    missingModelRequests: validRequests,
    invalidCount,
  };
}

/**
 * Creates a versioned handoff envelope for demo export from storefront -> admin.
 */
export function createHandoffEnvelope({ orders = [], missingModelRequests = [] } = {}) {
  return {
    version: CONTRACT_VERSION,
    source: 'ghilaf-storefront',
    exportedAt: new Date().toISOString(),
    orders,
    missingModelRequests,
  };
}
