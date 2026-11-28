/**
 * Lightweight IndexedDB image store (`idb://<key>`) copied identically in both apps.
 * - Downscales oversized raster uploads to <= ~400KB before persistence.
 * - Keeps custom order images out of localStorage so orders never hit the ~5MB quota.
 * - On cross-origin demo handoff export, `hydrateOrderImages` resolves every `idb://` key
 *   to an inline data URL; on admin import, `deflateOrderImages` re-stores them in the
 *   admin origin's own IndexedDB under fresh keys.
 *
 * Backend note: Once a live backend exists, full-resolution print originals must upload
 * directly to object/file storage (e.g. S3/R2) instead of browser storage.
 */

const DB_NAME = 'ghilaf_media_v1';
const STORE_NAME = 'order_images';
const IDB_PREFIX = 'idb://';

export const MAX_IMAGE_BYTES = 400 * 1024; // ~400KB cap after downscaling
export const MAX_EXPORT_WARNING_BYTES = 8 * 1024 * 1024; // ~8MB export warning threshold

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('INDEXEDDB_UNAVAILABLE'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('INDEXEDDB_OPEN_FAILED'));
  });
}

export function isIdbImageRef(value) {
  return typeof value === 'string' && value.startsWith(IDB_PREFIX);
}

export function estimateDataUrlBytes(dataUrl) {
  if (typeof dataUrl !== 'string') return 0;
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return dataUrl.length;
  const header = dataUrl.slice(0, commaIdx);
  const body = dataUrl.slice(commaIdx + 1);
  if (header.includes(';base64')) {
    return Math.ceil((body.length * 3) / 4);
  }
  return new TextEncoder().encode(body).length;
}

/**
 * Caps raster data URLs at ~400KB via canvas downscaling & quality stepping.
 * Leaves lightweight SVG data URLs untouched.
 */
export async function downscaleImageDataUrl(dataUrl, maxBytes = MAX_IMAGE_BYTES) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  if (dataUrl.startsWith('data:image/svg+xml')) {
    return dataUrl;
  }
  if (estimateDataUrlBytes(dataUrl) <= maxBytes) {
    return dataUrl;
  }
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    return dataUrl;
  }

  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('IMAGE_DECODE_FAILED'));
      el.src = dataUrl;
    });

    let maxDim = 1400;
    let quality = 0.85;
    let candidate = dataUrl;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
      const w = Math.max(1, Math.round((img.naturalWidth || 800) * scale));
      const h = Math.max(1, Math.round((img.naturalHeight || 800) * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) break;
      ctx.drawImage(img, 0, 0, w, h);

      candidate = canvas.toDataURL('image/jpeg', quality);
      if (estimateDataUrlBytes(candidate) <= maxBytes) {
        return candidate;
      }
      quality = Math.max(0.45, quality - 0.12);
      maxDim = Math.round(maxDim * 0.78);
    }

    return candidate;
  } catch {
    return dataUrl;
  }
}

/**
 * Downscales (if raster > 400KB) and persists a data URL into this origin's IndexedDB,
 * returning an `idb://<key>` reference.
 */
export async function offloadImageToIdb(imageUrl, keyHint = 'img') {
  if (typeof imageUrl !== 'string' || !imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  const capped = await downscaleImageDataUrl(imageUrl, MAX_IMAGE_BYTES);

  try {
    const db = await openDb();
    const id = `${keyHint}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(capped, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return `${IDB_PREFIX}${id}`;
  } catch {
    // Fallback if IndexedDB is blocked in private mode
    return capped;
  }
}

export async function resolveImageFromIdb(ref) {
  if (!isIdbImageRef(ref)) return ref;
  const id = ref.slice(IDB_PREFIX.length);
  try {
    const db = await openDb();
    const dataUrl = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return dataUrl;
  } catch {
    return null;
  }
}

export async function clearIdbImages() {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore when unavailable
  }
}

/**
 * Offloads every embedded custom image inside an order's items into this origin's IndexedDB
 * (rewriting references to fresh `idb://` keys).
 */
export async function deflateOrderImages(order) {
  const items = await Promise.all(
    (order.items || []).map(async (item, idx) => {
      const url = item?.printSpec?.designSource?.imageUrl;
      if (!url || isIdbImageRef(url)) return item;
      const storedRef = await offloadImageToIdb(url, `${order.id}-${idx}`);
      return {
        ...item,
        printSpec: {
          ...item.printSpec,
          designSource: {
            ...item.printSpec.designSource,
            imageUrl: storedRef,
          },
        },
      };
    })
  );
  return { ...order, items };
}

/**
 * Resolves every `idb://` image ref inside an order back into an inline data URL.
 */
export async function hydrateOrderImages(order) {
  const items = await Promise.all(
    (order.items || []).map(async (item) => {
      const url = item?.printSpec?.designSource?.imageUrl;
      if (!isIdbImageRef(url)) return item;
      const resolved = await resolveImageFromIdb(url);
      return {
        ...item,
        printSpec: {
          ...item.printSpec,
          designSource: {
            ...item.printSpec.designSource,
            imageUrl: resolved,
          },
        },
      };
    })
  );
  return { ...order, items };
}
