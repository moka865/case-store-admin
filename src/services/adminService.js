import { STORE_CONFIG } from '../config/store';
import { validateHandoffPayload } from '../contracts/handoffSchema';
import { CATEGORIES } from '../data/categories';
import { GOVERNORATES } from '../data/governorates';
import { MATERIALS } from '../data/materials';
import { SEED_MISSING_MODEL_REQUESTS, SEED_ORDERS } from '../data/opsSeeds';
import { PHONE_BRANDS, PHONE_MODELS } from '../data/phoneModels';
import { PRODUCTS } from '../data/products';
import {
  clearIdbImages,
  deflateOrderImages,
  hydrateOrderImages,
} from './imageBlobStore';

/**
 * Demo-only role switcher flag.
 * Replace with real authenticated RBAC claims once a backend auth layer exists.
 */
export const DEMO_ROLE_SWITCHER = true;

export const ADMIN_ROLES = [
  { id: 'manager', labelAr: 'الكل (المدير)', shortAr: 'المدير' },
  { id: 'ops', labelAr: 'التشغيل والطلبات', shortAr: 'التشغيل' },
  { id: 'catalog', labelAr: 'إدارة الكتالوج', shortAr: 'الكتالوج' },
];

export const ADMIN_STORAGE_KEYS = {
  PRODUCTS: 'ghilaf_admin_products_v1',
  CATEGORIES: 'ghilaf_admin_categories_v1',
  MODELS: 'ghilaf_admin_models_v1',
  GOVERNORATES: 'ghilaf_admin_governorates_v1',
  MATERIALS: 'ghilaf_admin_materials_v1',
  CONFIG: 'ghilaf_admin_config_v1',
  ORDERS: 'ghilaf_admin_orders_v1',
  MISSING_MODELS: 'ghilaf_admin_missing_models_v1',
  ROLE: 'ghilaf_admin_role_v1',
};

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function readKey(key, seed) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return clone(seed);
    return JSON.parse(raw);
  } catch {
    return clone(seed);
  }
}

function writeKey(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (err) {
    const isQuota =
      err?.name === 'QuotaExceededError' || err?.code === 22 || err?.code === 1014;
    return {
      ok: false,
      error: isQuota
        ? 'مساحة التخزين في المتصفح اتملت. نزل نسخة JSON أو رجع الطلبات القديمة وجرب تاني.'
        : 'حصل مشكلة أثناء الحفظ في المتصفح. جرب تاني.',
    };
  }
}

export function slugifyLatin(value, fallbackPrefix = 'item') {
  const clean = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean || `${fallbackPrefix}-${Date.now()}`;
}

function normalizeProduct(p) {
  return {
    ...p,
    active: p.active !== false,
  };
}

/**
 * Unified Admin mock service layer covering Catalog (Phase 1) and Operations (Phase 2).
 */
export const adminService = {
  // ---------- Demo Role Switcher ----------
  getRole() {
    const saved = readKey(ADMIN_STORAGE_KEYS.ROLE, 'manager');
    return ADMIN_ROLES.some((r) => r.id === saved) ? saved : 'manager';
  },

  setRole(roleId) {
    const valid = ADMIN_ROLES.some((r) => r.id === roleId) ? roleId : 'manager';
    writeKey(ADMIN_STORAGE_KEYS.ROLE, valid);
    return valid;
  },

  // ---------- Store Config ----------
  getStoreConfig() {
    const saved = readKey(ADMIN_STORAGE_KEYS.CONFIG, STORE_CONFIG);
    return {
      ...clone(STORE_CONFIG),
      ...saved,
      contact: {
        ...clone(STORE_CONFIG.contact),
        ...(saved?.contact || {}),
      },
      social: {
        ...clone(STORE_CONFIG.social),
        ...(saved?.social || {}),
      },
    };
  },

  updateStoreConfig(patch) {
    const current = this.getStoreConfig();
    const next = { ...current, ...patch };
    writeKey(ADMIN_STORAGE_KEYS.CONFIG, next);
    return next;
  },

  // ---------- Products ----------
  getProducts() {
    return readKey(ADMIN_STORAGE_KEYS.PRODUCTS, PRODUCTS).map(normalizeProduct);
  },

  saveProduct(productData) {
    const list = this.getProducts();
    const config = this.getStoreConfig();
    const isEditing = Boolean(productData.id && list.some((p) => p.id === productData.id));

    const id = isEditing ? productData.id : slugifyLatin(productData.name, 'design');
    const uniqueId =
      !isEditing && list.some((p) => p.id === id) ? `${id}-${Date.now().toString().slice(-4)}` : id;

    const normalized = {
      id: uniqueId,
      name: productData.name.trim(),
      artworkId: productData.customArtworkUrl ? null : productData.artworkId || 'tokyo-driftline',
      customArtworkUrl: productData.customArtworkUrl || null,
      customArtworkFileName: productData.customArtworkFileName || null,
      categoryId: productData.categoryId,
      price: Number(productData.price),
      currency: config.currencyCode,
      materialId: productData.materialId || config.defaultMaterialId,
      availableMaterialIds: productData.availableMaterialIds?.length
        ? productData.availableMaterialIds
        : [config.defaultMaterialId],
      compatibleModelIds: Array.isArray(productData.compatibleModelIds)
        ? [...new Set(productData.compatibleModelIds)]
        : [],
      featuredInHero: Boolean(productData.featuredInHero),
      active: productData.active !== false,
      salonSpan: [3, 4, 5].includes(Number(productData.salonSpan))
        ? Number(productData.salonSpan)
        : 4,
      salonOffset: Math.max(0, Math.min(120, Number(productData.salonOffset) || 0)),
      tags: Array.isArray(productData.tags)
        ? productData.tags.map((t) => t.trim()).filter(Boolean)
        : [],
    };

    const next = isEditing
      ? list.map((item) => (item.id === uniqueId ? normalized : item))
      : [normalized, ...list];

    writeKey(ADMIN_STORAGE_KEYS.PRODUCTS, next);
    return { product: normalized, list: next };
  },

  toggleProductActive(productId, active) {
    const list = this.getProducts();
    const next = list.map((p) => (p.id === productId ? { ...p, active: Boolean(active) } : p));
    writeKey(ADMIN_STORAGE_KEYS.PRODUCTS, next);
    return next;
  },

  deleteProduct(productId) {
    const next = this.getProducts().filter((p) => p.id !== productId);
    writeKey(ADMIN_STORAGE_KEYS.PRODUCTS, next);
    return next;
  },

  // ---------- Categories ----------
  getCategories() {
    const list = readKey(ADMIN_STORAGE_KEYS.CATEGORIES, CATEGORIES);
    return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
  },

  saveCategory(categoryData) {
    const list = this.getCategories();
    const isEditing = Boolean(categoryData.id && list.some((c) => c.id === categoryData.id));
    const cleanSlug = slugifyLatin(categoryData.slug || categoryData.nameAr, 'category');

    const duplicateSlug = list.some(
      (c) => c.slug.toLowerCase() === cleanSlug.toLowerCase() && c.id !== categoryData.id
    );
    if (duplicateSlug) {
      return { ok: false, error: 'الرابط ده (slug) مستخدم لقسم تاني. اختار رابط مختلف.' };
    }

    if (isEditing) {
      const next = list.map((c) =>
        c.id === categoryData.id
          ? { ...c, nameAr: categoryData.nameAr.trim(), slug: cleanSlug }
          : c
      );
      writeKey(ADMIN_STORAGE_KEYS.CATEGORIES, next);
      return { ok: true, list: next };
    }

    const maxOrder = list.reduce((max, c) => Math.max(max, c.sortOrder || 0), 0);
    const created = {
      id: cleanSlug,
      slug: cleanSlug,
      nameAr: categoryData.nameAr.trim(),
      sortOrder: maxOrder + 1,
    };
    const next = [...list, created];
    writeKey(ADMIN_STORAGE_KEYS.CATEGORIES, next);
    return { ok: true, list: next };
  },

  reorderCategory(categoryId, direction) {
    const list = this.getCategories();
    const idx = list.findIndex((c) => c.id === categoryId);
    if (idx === -1) return list;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return list;

    const reordered = [...list];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);

    const normalized = reordered.map((item, index) => ({
      ...item,
      sortOrder: index + 1,
    }));

    writeKey(ADMIN_STORAGE_KEYS.CATEGORIES, normalized);
    return normalized;
  },

  deleteCategory(categoryId) {
    const linkedProducts = this.getProducts().filter((p) => p.categoryId === categoryId);
    if (linkedProducts.length > 0) {
      return {
        ok: false,
        linkedCount: linkedProducts.length,
        error: `فيه ${linkedProducts.length} تصميمات مربوطة بالقسم ده. انقلهم لقسم تاني أو امسحهم الأول.`,
      };
    }

    const next = this.getCategories()
      .filter((c) => c.id !== categoryId)
      .map((item, index) => ({ ...item, sortOrder: index + 1 }));

    writeKey(ADMIN_STORAGE_KEYS.CATEGORIES, next);
    return { ok: true, list: next };
  },

  // ---------- Phone Models ----------
  getPhoneBrands() {
    return [...PHONE_BRANDS];
  },

  getModels() {
    return readKey(ADMIN_STORAGE_KEYS.MODELS, PHONE_MODELS);
  },

  saveModel(modelData) {
    const list = this.getModels();
    const isEditing = Boolean(modelData.id && list.some((m) => m.id === modelData.id));
    const baseId = slugifyLatin(`${modelData.brand}-${modelData.name}`, 'model');
    const id = isEditing
      ? modelData.id
      : list.some((m) => m.id === baseId)
        ? `${baseId}-${Date.now().toString().slice(-4)}`
        : baseId;

    const normalized = {
      id,
      brand: modelData.brand,
      name: modelData.name.trim(),
      aspectRatio: Number(Number(modelData.aspectRatio).toFixed(3)),
      cornerRadius: Math.round(Number(modelData.cornerRadius)),
      cameraLayout: modelData.cameraLayout,
    };

    const next = isEditing
      ? list.map((m) => (m.id === id ? normalized : m))
      : [normalized, ...list];

    writeKey(ADMIN_STORAGE_KEYS.MODELS, next);
    return { model: normalized, list: next };
  },

  deleteModel(modelId) {
    const nextModels = this.getModels().filter((m) => m.id !== modelId);
    writeKey(ADMIN_STORAGE_KEYS.MODELS, nextModels);

    const products = this.getProducts().map((p) => ({
      ...p,
      compatibleModelIds: (p.compatibleModelIds || []).filter((id) => id !== modelId),
    }));
    writeKey(ADMIN_STORAGE_KEYS.PRODUCTS, products);

    return { models: nextModels, products };
  },

  // ---------- Governorates ----------
  getGovernorates() {
    return readKey(ADMIN_STORAGE_KEYS.GOVERNORATES, GOVERNORATES);
  },

  saveGovernorate(govData) {
    const list = this.getGovernorates();
    const isEditing = Boolean(govData.id && list.some((g) => g.id === govData.id));
    const id = isEditing ? govData.id : slugifyLatin(govData.id || govData.nameAr, 'gov');

    const normalized = {
      id,
      nameAr: govData.nameAr.trim(),
      shippingFee: Math.max(0, Number(govData.shippingFee)),
      estimatedDays: String(govData.estimatedDays).trim(),
      codAvailable: Boolean(govData.codAvailable),
    };

    const next = isEditing
      ? list.map((g) => (g.id === id ? normalized : g))
      : [...list, normalized];

    writeKey(ADMIN_STORAGE_KEYS.GOVERNORATES, next);
    return next;
  },

  deleteGovernorate(govId) {
    const next = this.getGovernorates().filter((g) => g.id !== govId);
    writeKey(ADMIN_STORAGE_KEYS.GOVERNORATES, next);
    return next;
  },

  // ---------- Materials ----------
  getMaterials() {
    return readKey(ADMIN_STORAGE_KEYS.MATERIALS, MATERIALS);
  },

  saveMaterial(materialData) {
    const list = this.getMaterials();
    const isEditing = Boolean(materialData.id && list.some((m) => m.id === materialData.id));
    const id = isEditing ? materialData.id : slugifyLatin(materialData.id || materialData.nameAr, 'mat');

    const normalized = {
      id,
      nameAr: materialData.nameAr.trim(),
      descriptionAr: (materialData.descriptionAr || '').trim(),
      priceDelta: Number(materialData.priceDelta) || 0,
      isDefault: Boolean(materialData.isDefault),
      active: Boolean(materialData.active),
    };

    const next = isEditing
      ? list.map((m) => (m.id === id ? normalized : m))
      : [...list, normalized];

    writeKey(ADMIN_STORAGE_KEYS.MATERIALS, next);
    return next;
  },

  deleteMaterial(materialId) {
    const list = this.getMaterials();
    const target = list.find((m) => m.id === materialId);
    if (target?.isDefault) {
      return { ok: false, error: 'ما ينفعش تمسح الخامة الأساسية للمتجر.' };
    }
    const next = list.filter((m) => m.id !== materialId);
    writeKey(ADMIN_STORAGE_KEYS.MATERIALS, next);
    return { ok: true, list: next };
  },

  // ---------- Operations: Orders ----------
  getOrdersRaw() {
    return readKey(ADMIN_STORAGE_KEYS.ORDERS, SEED_ORDERS);
  },

  async getOrdersHydrated() {
    const raw = this.getOrdersRaw();
    return Promise.all(raw.map(hydrateOrderImages));
  },

  updateOrderStatus(orderId, nextStatus, note = '') {
    const list = this.getOrdersRaw();
    const target = list.find((o) => o.id === orderId);
    if (!target) return { ok: false, error: 'الأوردر مش موجود.' };

    // COD reality guard: block moving to printing while phone model is unresolved
    if (nextStatus === 'printing' && target.pendingModel) {
      return {
        ok: false,
        error: 'حدد الموديل الصح الأول قبل ما تحول الأوردر للمطبعة.',
      };
    }

    const now = new Date().toISOString();
    const historyEntry = { status: nextStatus, at: now };
    if (note.trim()) historyEntry.note = note.trim();

    const updatedOrder = {
      ...target,
      status: nextStatus,
      statusHistory: [...(target.statusHistory || []), historyEntry],
      updatedAt: now,
    };

    const next = list.map((o) => (o.id === orderId ? updatedOrder : o));
    const writeRes = writeKey(ADMIN_STORAGE_KEYS.ORDERS, next);
    if (!writeRes.ok) return { ok: false, error: writeRes.error };

    return { ok: true, order: updatedOrder };
  },

  resolveOrderPendingModel(orderId, modelObj) {
    const list = this.getOrdersRaw();
    const target = list.find((o) => o.id === orderId);
    if (!target) return { ok: false, error: 'الأوردر مش موجود.' };

    const now = new Date().toISOString();
    const updatedItems = (target.items || []).map((item) => {
      if (item.printSpec?.phoneModelStatus !== 'pending') return item;
      return {
        ...item,
        phoneModelName: modelObj.name,
        printSpec: {
          ...item.printSpec,
          phoneModelId: modelObj.id,
          phoneModelName: modelObj.name,
          phoneModelStatus: 'selected',
        },
      };
    });

    const updatedOrder = {
      ...target,
      pendingModel: false,
      items: updatedItems,
      statusHistory: [
        ...(target.statusHistory || []),
        {
          status: target.status,
          at: now,
          note: `تم تحديد الموديل: ${modelObj.name}`,
        },
      ],
      updatedAt: now,
    };

    const next = list.map((o) => (o.id === orderId ? updatedOrder : o));
    const writeRes = writeKey(ADMIN_STORAGE_KEYS.ORDERS, next);
    if (!writeRes.ok) return { ok: false, error: writeRes.error };

    return { ok: true, order: updatedOrder };
  },

  updateOrderInternalNotes(orderId, internalNotes) {
    const list = this.getOrdersRaw();
    const now = new Date().toISOString();
    const next = list.map((o) =>
      o.id === orderId ? { ...o, internalNotes, updatedAt: now } : o
    );
    const writeRes = writeKey(ADMIN_STORAGE_KEYS.ORDERS, next);
    return writeRes.ok ? { ok: true } : { ok: false, error: writeRes.error };
  },

  // ---------- Operations: Missing Model Requests ----------
  getMissingModelRequests() {
    return readKey(ADMIN_STORAGE_KEYS.MISSING_MODELS, SEED_MISSING_MODEL_REQUESTS);
  },

  updateMissingModelRequest(reqId, patch) {
    const list = this.getMissingModelRequests();
    const now = new Date().toISOString();
    const next = list.map((r) => {
      if (r.id !== reqId) return r;
      const statusChanged = patch.status && patch.status !== r.status;
      return {
        ...r,
        ...patch,
        statusHistory: statusChanged
          ? [...(r.statusHistory || []), { status: patch.status, at: now }]
          : r.statusHistory || [],
        updatedAt: now,
      };
    });
    writeKey(ADMIN_STORAGE_KEYS.MISSING_MODELS, next);
    return next;
  },

  // ---------- Unified Versioned Storefront Handoff Import ----------
  /**
   * Validates version & schema, merges orders and/or missing-model requests by ID
   * without duplicates, re-stores all inline order images into this origin's IndexedDB,
   * and returns exact added/skipped counts.
   */
  async importHandoffPayload(rawJson) {
    const validation = validateHandoffPayload(rawJson);
    if (!validation.ok) return validation;

    const existingOrders = this.getOrdersRaw();
    const existingOrderIds = new Set(existingOrders.map((o) => o.id));
    const newOrders = [];
    let skippedOrders = 0;

    for (const ord of validation.orders) {
      if (existingOrderIds.has(ord.id)) {
        skippedOrders += 1;
      } else {
        existingOrderIds.add(ord.id);
        // Re-store inline images into THIS origin's IndexedDB under fresh idb:// refs
        const deflated = await deflateOrderImages(ord);
        newOrders.push(deflated);
      }
    }

    const existingReqs = this.getMissingModelRequests();
    const existingReqIds = new Set(existingReqs.map((r) => r.id));
    const newReqs = [];
    let skippedRequests = 0;

    for (const req of validation.missingModelRequests) {
      if (existingReqIds.has(req.id)) {
        skippedRequests += 1;
      } else {
        existingReqIds.add(req.id);
        newReqs.push(req);
      }
    }

    if (newOrders.length > 0) {
      const writeOrders = writeKey(ADMIN_STORAGE_KEYS.ORDERS, [...newOrders, ...existingOrders]);
      if (!writeOrders.ok) return { ok: false, error: writeOrders.error };
    }

    if (newReqs.length > 0) {
      const writeReqs = writeKey(ADMIN_STORAGE_KEYS.MISSING_MODELS, [...newReqs, ...existingReqs]);
      if (!writeReqs.ok) return { ok: false, error: writeReqs.error };
    }

    return {
      ok: true,
      addedOrders: newOrders.length,
      skippedOrders,
      addedRequests: newReqs.length,
      skippedRequests,
      invalidCount: validation.invalidCount,
    };
  },

  // ---------- Split Resets & Export ----------
  resetCatalogToDefaults() {
    [
      ADMIN_STORAGE_KEYS.PRODUCTS,
      ADMIN_STORAGE_KEYS.CATEGORIES,
      ADMIN_STORAGE_KEYS.MODELS,
      ADMIN_STORAGE_KEYS.GOVERNORATES,
      ADMIN_STORAGE_KEYS.MATERIALS,
      ADMIN_STORAGE_KEYS.CONFIG,
    ].forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });

    return {
      storeConfig: clone(STORE_CONFIG),
      products: clone(PRODUCTS).map(normalizeProduct),
      categories: clone(CATEGORIES).sort((a, b) => a.sortOrder - b.sortOrder),
      models: clone(PHONE_MODELS),
      governorates: clone(GOVERNORATES),
      materials: clone(MATERIALS),
    };
  },

  async resetOperationsToDefaults() {
    [ADMIN_STORAGE_KEYS.ORDERS, ADMIN_STORAGE_KEYS.MISSING_MODELS].forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });
    await clearIdbImages();

    return {
      orders: clone(SEED_ORDERS),
      missingModelRequests: clone(SEED_MISSING_MODEL_REQUESTS),
    };
  },

  exportCatalogSnapshot() {
    return {
      exportedAt: new Date().toISOString(),
      storeConfig: this.getStoreConfig(),
      categories: this.getCategories(),
      phoneBrands: this.getPhoneBrands(),
      phoneModels: this.getModels(),
      materials: this.getMaterials(),
      governorates: this.getGovernorates(),
      products: this.getProducts(),
    };
  },
};
