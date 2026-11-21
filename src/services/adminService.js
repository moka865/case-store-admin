import { STORE_CONFIG } from '../config/store';
import { CATEGORIES } from '../data/categories';
import { GOVERNORATES } from '../data/governorates';
import { MATERIALS } from '../data/materials';
import { PHONE_BRANDS, PHONE_MODELS } from '../data/phoneModels';
import { PRODUCTS } from '../data/products';

export const ADMIN_STORAGE_KEYS = {
  PRODUCTS: 'ghilaf_admin_products_v1',
  CATEGORIES: 'ghilaf_admin_categories_v1',
  MODELS: 'ghilaf_admin_models_v1',
  GOVERNORATES: 'ghilaf_admin_governorates_v1',
  MATERIALS: 'ghilaf_admin_materials_v1',
  CONFIG: 'ghilaf_admin_config_v1',
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
    return true;
  } catch {
    return false;
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

/**
 * Admin Catalog mock service layer.
 * Preserves the exact data shapes of `case-store` so a shared REST/GraphQL API
 * can replace both storefront and admin services without refactoring components.
 */
export const adminService = {
  // ---------- Store Config ----------
  getStoreConfig() {
    return readKey(ADMIN_STORAGE_KEYS.CONFIG, STORE_CONFIG);
  },

  updateStoreConfig(patch) {
    const current = this.getStoreConfig();
    const next = { ...current, ...patch };
    writeKey(ADMIN_STORAGE_KEYS.CONFIG, next);
    return next;
  },

  // ---------- Products ----------
  getProducts() {
    return readKey(ADMIN_STORAGE_KEYS.PRODUCTS, PRODUCTS);
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

    // Clean removed model references from products so counts stay accurate
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

  // ---------- Utilities ----------
  resetToDefaults() {
    Object.values(ADMIN_STORAGE_KEYS).forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });

    return {
      storeConfig: clone(STORE_CONFIG),
      products: clone(PRODUCTS),
      categories: clone(CATEGORIES).sort((a, b) => a.sortOrder - b.sortOrder),
      models: clone(PHONE_MODELS),
      governorates: clone(GOVERNORATES),
      materials: clone(MATERIALS),
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
