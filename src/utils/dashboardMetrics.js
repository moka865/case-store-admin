import { ORDER_STATUSES } from '../contracts/handoffSchema';

/**
 * Total piece quantity across all line items of an order.
 */
export function getOrderTotalPieces(order) {
  return (order?.items || []).reduce((sum, it) => sum + Math.max(1, Number(it?.quantity) || 1), 0);
}

/**
 * True if any item on the order has an active printed name.
 */
export function orderHasPrintedName(order) {
  return (order?.items || []).some(
    (it) => Boolean(it?.printSpec?.printedName?.enabled && String(it?.printSpec?.printedName?.text || '').trim())
  );
}

/**
 * Lists distinct item phone model names that are currently `pending` confirmation.
 */
export function getPendingModelNames(order) {
  const names = (order?.items || [])
    .filter((it) => it?.printSpec?.phoneModelStatus === 'pending')
    .map((it) => it?.printSpec?.phoneModelName || it?.phoneModelName)
    .filter(Boolean);
  if (names.length > 0) return [...new Set(names)];
  const fallback = order?.items?.[0]?.phoneModelName;
  return fallback ? [fallback] : [];
}

/**
 * Computes separated design subtotal, stored `+50 EGP` name-printing fees, shipping, and total.
 * Supports both legacy seed orders (without stored `namePrintFees`) and storefront checkout snapshots.
 */
export function getOrderPricingBreakdown(order) {
  const pricing = order?.pricing || {};
  const shippingFee = Number(pricing.shippingFee) || 0;
  const total = Number(pricing.total) || 0;

  let namePrintFees = 0;
  if (Number.isFinite(Number(pricing.namePrintFees))) {
    namePrintFees = Number(pricing.namePrintFees);
  } else {
    namePrintFees = (order?.items || []).reduce((sum, it) => {
      const fee = Number(it?.namePrintFee) || 0;
      const qty = Math.max(1, Number(it?.quantity) || 1);
      return sum + fee * qty;
    }, 0);
  }

  const subtotal = Number.isFinite(Number(pricing.subtotal))
    ? Number(pricing.subtotal)
    : Math.max(0, total - shippingFee);

  const designSubtotal = Number.isFinite(Number(pricing.designSubtotal))
    ? Number(pricing.designSubtotal)
    : Math.max(0, subtotal - namePrintFees);

  return {
    designSubtotal,
    namePrintFees,
    subtotal,
    shippingFee,
    total,
  };
}

/**
 * Enforces storefront Terms policy (`src/pages/TermsPage.jsx`):
 * Upfront deposit (`ديبوزت`) is required before production on orders with `>= 4` pieces
 * (`storeConfig.depositMinItems`) OR custom orders (`custom` / `mixed`).
 */
export function isDepositRequired(order, storeConfig = {}) {
  const threshold = Number(storeConfig?.depositMinItems) || 4;
  if (getOrderTotalPieces(order) >= threshold) return true;
  return order?.type === 'custom' || order?.type === 'mixed';
}

const URGENCY_RANK = {
  pending_confirmation: 1,
  printing: 2,
  shipped: 3,
  delivered: 4,
  returned: 5,
  cancelled: 6,
};

/**
 * Sorts orders cleanly by operational priority:
 * blocked pending-model orders -> pending confirmation -> printing -> shipped -> terminal,
 * breaking ties newest-first (`createdAt` descending).
 */
export function sortOrdersByUrgency(orders = []) {
  return [...orders].sort((a, b) => {
    const blockedA = a.status === 'pending_confirmation' && a.pendingModel ? 0 : URGENCY_RANK[a.status] ?? 99;
    const blockedB = b.status === 'pending_confirmation' && b.pendingModel ? 0 : URGENCY_RANK[b.status] ?? 99;
    if (blockedA !== blockedB) return blockedA - blockedB;
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
}

/**
 * Derives 100% live operational & catalog metrics from AdminContext state.
 * Zero invented statistics or mock trend deltas.
 */
export function computeDashboardMetrics({
  orders = [],
  missingModelRequests = [],
  products = [],
  categories = [],
  models = [],
  phoneBrands = [],
  governorates = [],
  materials = [],
  storeConfig = {},
}) {
  const statusCounts = { all: orders.length };
  ORDER_STATUSES.forEach((s) => {
    statusCounts[s.id] = 0;
  });

  let pendingModelBlockedCount = 0;
  let pendingDepositCount = 0;
  let printingPiecesCount = 0;
  let printingCustomCount = 0;
  let printingWithNameCount = 0;
  let shippedCodAmount = 0;
  let deliveredRevenue = 0;
  let deliveredDesignRevenue = 0;
  let deliveredNameFees = 0;

  orders.forEach((order) => {
    if (statusCounts[order.status] !== undefined) {
      statusCounts[order.status] += 1;
    }

    const breakdown = getOrderPricingBreakdown(order);

    if (order.status === 'pending_confirmation') {
      if (order.pendingModel) pendingModelBlockedCount += 1;
      if (isDepositRequired(order, storeConfig)) pendingDepositCount += 1;
    } else if (order.status === 'printing') {
      printingPiecesCount += getOrderTotalPieces(order);
      if (order.type === 'custom' || order.type === 'mixed') printingCustomCount += 1;
      if (orderHasPrintedName(order)) printingWithNameCount += 1;
    } else if (order.status === 'shipped') {
      shippedCodAmount += breakdown.total;
    } else if (order.status === 'delivered') {
      deliveredRevenue += breakdown.total;
      deliveredDesignRevenue += breakdown.designSubtotal;
      deliveredNameFees += breakdown.namePrintFees;
    }
  });

  const activePipelineCount =
    (statusCounts.pending_confirmation || 0) +
    (statusCounts.printing || 0) +
    (statusCounts.shipped || 0);

  // Missing-model triage + linked order cross-reference
  const linkedMissingRequestIds = new Set();
  orders.forEach((ord) => {
    if (ord.missingModelRequestId) linkedMissingRequestIds.add(ord.missingModelRequestId);
    (ord.items || []).forEach((it) => {
      if (it?.printSpec?.pendingRequestId) linkedMissingRequestIds.add(it.printSpec.pendingRequestId);
    });
  });

  const openMissingRequests = missingModelRequests.filter(
    (r) => r.status === 'pending_confirmation' || r.status === 'contacted'
  );
  const pendingMissingCount = missingModelRequests.filter(
    (r) => r.status === 'pending_confirmation'
  ).length;

  // Catalog & Model coverage
  const activeProducts = products.filter((p) => p.active !== false);
  const hiddenProductsCount = products.length - activeProducts.length;
  const heroProductsCount = activeProducts.filter((p) => p.featuredInHero).length;

  const categoryBreakdown = categories.map((cat) => {
    const totalCount = products.filter((p) => p.categoryId === cat.id).length;
    const activeCount = activeProducts.filter((p) => p.categoryId === cat.id).length;
    return {
      id: cat.id,
      nameAr: cat.nameAr,
      totalCount,
      activeCount,
    };
  });

  const uncoveredModels = models.filter(
    (m) => !activeProducts.some((p) => (p.compatibleModelIds || []).includes(m.id))
  );

  const brandBreakdown = phoneBrands.map((brand) => ({
    brand,
    modelCount: models.filter((m) => m.brand === brand).length,
  }));

  // COD & Shipping policy summary
  const codActiveGovs = governorates.filter((g) => g.codAvailable !== false);
  const codDisabledGovernorates = governorates.filter((g) => g.codAvailable === false);
  const codFees = codActiveGovs.map((g) => Number(g.shippingFee) || 0);
  const minShippingFee = codFees.length ? Math.min(...codFees) : 0;
  const maxShippingFee = codFees.length ? Math.max(...codFees) : 0;
  const activeMaterials = materials.filter((m) => m.active !== false);

  return {
    statusCounts,
    activePipelineCount,
    pendingOrdersCount: statusCounts.pending_confirmation || 0,
    pendingModelBlockedCount,
    pendingDepositCount,
    printingOrdersCount: statusCounts.printing || 0,
    printingPiecesCount,
    printingCustomCount,
    printingWithNameCount,
    shippedOrdersCount: statusCounts.shipped || 0,
    shippedCodAmount,
    deliveredOrdersCount: statusCounts.delivered || 0,
    deliveredRevenue,
    deliveredDesignRevenue,
    deliveredNameFees,
    returnedCount: statusCounts.returned || 0,
    cancelledCount: statusCounts.cancelled || 0,
    openMissingRequests,
    pendingMissingCount,
    linkedMissingRequestIds,
    catalog: {
      totalProductsCount: products.length,
      activeProductsCount: activeProducts.length,
      hiddenProductsCount,
      heroProductsCount,
      categoryBreakdown,
      totalModelsCount: models.length,
      brandBreakdown,
      uncoveredModels,
    },
    fulfillment: {
      totalGovernoratesCount: governorates.length,
      codActiveGovernoratesCount: codActiveGovs.length,
      codDisabledGovernorates,
      minShippingFee,
      maxShippingFee,
      activeMaterials,
    },
  };
}
