import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ADMIN_ROLES, adminService } from '../services/adminService';

const AdminContext = createContext(null);

function scrubUnresolvedIdbUrls(orders = []) {
  return orders.map((order) => ({
    ...order,
    items: (order.items || []).map((item) => {
      const url = item?.printSpec?.designSource?.imageUrl;
      if (typeof url !== 'string' || !url.startsWith('idb://')) return item;
      return {
        ...item,
        printSpec: {
          ...item.printSpec,
          designSource: {
            ...item.printSpec.designSource,
            imageUrl: null,
          },
        },
      };
    }),
  }));
}

export function AdminProvider({ children }) {
  const [role, setRoleState] = useState(() => adminService.getRole());
  const [storeConfig, setStoreConfig] = useState(() => adminService.getStoreConfig());
  const [products, setProducts] = useState(() => adminService.getProducts());
  const [categories, setCategories] = useState(() => adminService.getCategories());
  const [models, setModels] = useState(() => adminService.getModels());
  const [governorates, setGovernorates] = useState(() => adminService.getGovernorates());
  const [materials, setMaterials] = useState(() => adminService.getMaterials());

  const [orders, setOrders] = useState(() => scrubUnresolvedIdbUrls(adminService.getOrdersRaw()));
  const [isHydratingOrders, setIsHydratingOrders] = useState(true);
  const [missingModelRequests, setMissingModelRequests] = useState(() =>
    adminService.getMissingModelRequests()
  );

  const [notice, setNotice] = useState('');
  const noticeTimerRef = useRef(null);
  const phoneBrands = useMemo(() => adminService.getPhoneBrands(), []);

  // Hydrate any idb:// order images from admin's own IndexedDB on mount
  const refreshHydratedOrders = useCallback(async () => {
    try {
      const hydrated = await adminService.getOrdersHydrated();
      setOrders(hydrated);
    } finally {
      setIsHydratingOrders(false);
    }
  }, []);

  useEffect(() => {
    refreshHydratedOrders();
  }, [refreshHydratedOrders]);

  const announce = useCallback((message) => {
    setNotice(message);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 4200);
  }, []);

  const setRole = useCallback(
    (nextRole) => {
      const saved = adminService.setRole(nextRole);
      setRoleState(saved);
      const label = ADMIN_ROLES.find((r) => r.id === saved)?.labelAr || saved;
      announce(`اتحولت لعرض: ${label}`);
    },
    [announce]
  );

  const previewModel = useMemo(() => {
    return (
      models.find((m) => m.id === storeConfig.defaultPreviewModelId) ||
      models[0] || {
        id: 'default',
        brand: 'iPhone',
        name: 'iPhone 16 Pro',
        aspectRatio: 0.478,
        cornerRadius: 38,
        cameraLayout: 'apple-pro-triple',
      }
    );
  }, [models, storeConfig.defaultPreviewModelId]);

  const updateStoreConfig = useCallback(
    (patch) => {
      const next = adminService.updateStoreConfig(patch);
      setStoreConfig(next);
      announce('تم حفظ إعدادات التسعير.');
      return next;
    },
    [announce]
  );

  const saveProduct = useCallback(
    (productData) => {
      const { product, list } = adminService.saveProduct(productData);
      setProducts(list);
      announce(productData.id ? 'تم تحديث التصميم وحفظه.' : 'تمت إضافة التصميم الجديد.');
      return product;
    },
    [announce]
  );

  const toggleProductActive = useCallback(
    (productId, active) => {
      const next = adminService.toggleProductActive(productId, active);
      setProducts(next);
      announce(active ? 'التصميم بقى متاح في المتجر.' : 'التصميم اتخفى مؤقتا.');
    },
    [announce]
  );

  const deleteProduct = useCallback(
    (productId) => {
      const next = adminService.deleteProduct(productId);
      setProducts(next);
      announce('تم مسح التصميم.');
    },
    [announce]
  );

  const saveCategory = useCallback(
    (categoryData) => {
      const res = adminService.saveCategory(categoryData);
      if (res.ok) {
        setCategories(res.list);
        announce(categoryData.id ? 'تم تحديث القسم.' : 'تمت إضافة القسم.');
      }
      return res;
    },
    [announce]
  );

  const reorderCategory = useCallback((categoryId, direction) => {
    const next = adminService.reorderCategory(categoryId, direction);
    setCategories(next);
  }, []);

  const deleteCategory = useCallback(
    (categoryId) => {
      const res = adminService.deleteCategory(categoryId);
      if (res.ok) {
        setCategories(res.list);
        announce('تم مسح القسم.');
      }
      return res;
    },
    [announce]
  );

  const saveModel = useCallback(
    (modelData) => {
      const { model, list } = adminService.saveModel(modelData);
      setModels(list);
      announce(modelData.id ? 'تم تحديث الموديل وحفظه.' : 'تمت إضافة الموديل الجديد.');
      return model;
    },
    [announce]
  );

  const deleteModel = useCallback(
    (modelId) => {
      const res = adminService.deleteModel(modelId);
      setModels(res.models);
      setProducts(res.products);
      announce('تم مسح الموديل.');
    },
    [announce]
  );

  const saveGovernorate = useCallback(
    (govData) => {
      const next = adminService.saveGovernorate(govData);
      setGovernorates(next);
      announce('تم حفظ بيانات المحافظة.');
    },
    [announce]
  );

  const deleteGovernorate = useCallback(
    (govId) => {
      const next = adminService.deleteGovernorate(govId);
      setGovernorates(next);
      announce('تم مسح المحافظة.');
    },
    [announce]
  );

  const saveMaterial = useCallback(
    (materialData) => {
      const next = adminService.saveMaterial(materialData);
      setMaterials(next);
      announce('تم حفظ الخامة.');
    },
    [announce]
  );

  const deleteMaterial = useCallback(
    (materialId) => {
      const res = adminService.deleteMaterial(materialId);
      if (res.ok) {
        setMaterials(res.list);
        announce('تم مسح الخامة.');
      }
      return res;
    },
    [announce]
  );

  // ---------- Operations actions ----------
  const updateOrderStatus = useCallback(
    async (orderId, nextStatus, note = '') => {
      const res = adminService.updateOrderStatus(orderId, nextStatus, note);
      if (res.ok) {
        await refreshHydratedOrders();
        announce('تم تحديث حالة الأوردر.');
      }
      return res;
    },
    [refreshHydratedOrders, announce]
  );

  const resolveOrderPendingModel = useCallback(
    async (orderId, modelObj) => {
      const res = adminService.resolveOrderPendingModel(orderId, modelObj);
      if (res.ok) {
        await refreshHydratedOrders();
        announce('تم تحديد موديل الموبايل للأوردر.');
      }
      return res;
    },
    [refreshHydratedOrders, announce]
  );

  const updateOrderNotes = useCallback(
    async (orderId, notes) => {
      const res = adminService.updateOrderInternalNotes(orderId, notes);
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, internalNotes: notes } : o))
        );
      }
      return res;
    },
    []
  );

  const updateMissingModelRequest = useCallback(
    (reqId, patch) => {
      const next = adminService.updateMissingModelRequest(reqId, patch);
      setMissingModelRequests(next);
      if (patch.status) announce('تم تحديث حالة طلب الموديل.');
      return next;
    },
    [announce]
  );

  const importHandoffJson = useCallback(
    async (rawJson) => {
      const res = await adminService.importHandoffPayload(rawJson);
      if (res.ok) {
        await refreshHydratedOrders();
        setMissingModelRequests(adminService.getMissingModelRequests());
      }
      return res;
    },
    [refreshHydratedOrders]
  );

  // ---------- Split Resets ----------
  const resetCatalogToDefaults = useCallback(() => {
    const restored = adminService.resetCatalogToDefaults();
    setStoreConfig(restored.storeConfig);
    setProducts(restored.products);
    setCategories(restored.categories);
    setModels(restored.models);
    setGovernorates(restored.governorates);
    setMaterials(restored.materials);
    announce('رجعنا بيانات الكتالوج للأصل.');
  }, [announce]);

  const resetOperationsToDefaults = useCallback(async () => {
    const restored = await adminService.resetOperationsToDefaults();
    setOrders(restored.orders);
    setMissingModelRequests(restored.missingModelRequests);
    announce('رجعنا الطلبات والموديلات الناقصة للأصل.');
  }, [announce]);

  const exportCatalogJson = useCallback(() => {
    const snapshot = adminService.exportCatalogSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `ghilaf-catalog-${dateStamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    announce('تم تنزيل نسخة JSON من الكتالوج.');
  }, [announce]);

  const value = {
    role,
    setRole,
    storeConfig,
    products,
    categories,
    phoneBrands,
    models,
    governorates,
    materials,
    orders,
    isHydratingOrders,
    missingModelRequests,
    previewModel,
    notice,
    updateStoreConfig,
    saveProduct,
    toggleProductActive,
    deleteProduct,
    saveCategory,
    reorderCategory,
    deleteCategory,
    saveModel,
    deleteModel,
    saveGovernorate,
    deleteGovernorate,
    saveMaterial,
    deleteMaterial,
    updateOrderStatus,
    resolveOrderPendingModel,
    updateOrderNotes,
    updateMissingModelRequest,
    importHandoffJson,
    resetCatalogToDefaults,
    resetOperationsToDefaults,
    exportCatalogJson,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}
