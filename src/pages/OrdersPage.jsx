import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { HandoffImportButton } from '../components/common/HandoffImportButton';
import { PageHeading } from '../components/common/PageHeading';
import { SearchIcon } from '../components/icons/Icons';
import { PhoneCaseMockup } from '../components/mockup/PhoneCaseMockup';
import { OrderDetailDrawer } from '../components/orders/OrderDetailDrawer';
import { useAdmin } from '../context/AdminContext';
import { getOrderStatusLabel, ORDER_STATUSES } from '../contracts/handoffSchema';

const EASE = [0.22, 1, 0.36, 1];

const TYPE_FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'catalog', label: 'جاهز' },
  { id: 'custom', label: 'مخصص' },
];

const WORK_TYPE_LABELS = {
  catalog: 'جاهز',
  custom: 'مخصص',
  mixed: 'مختلط',
};

function formatShortDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${d}/${m}`;
}

/**
 * `/orders` — Open Plaster Order Ledger.
 * Condensed controls (Search + compact Type toggle, plus ONE horizontal Status stage row)
 * so mobile stays crisp without 3-line filter wrapping.
 */
export function OrdersPage() {
  const { orders, models, previewModel, storeConfig } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  const initialStatus = searchParams.get('status') || 'all';
  const initialType = searchParams.get('type') || 'all';

  const [statusFilter, setStatusFilter] = useState(
    ORDER_STATUSES.some((s) => s.id === initialStatus) ? initialStatus : 'all'
  );
  const [typeFilter, setTypeFilter] = useState(
    TYPE_FILTERS.some((t) => t.id === initialType) ? initialType : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Sync filters and deep-linked drawer (`?open=GH-...`) when URL query params change
  useEffect(() => {
    const paramStatus = searchParams.get('status');
    const paramType = searchParams.get('type');
    const paramOpen = searchParams.get('open');

    if (paramStatus && ORDER_STATUSES.some((s) => s.id === paramStatus)) {
      setStatusFilter(paramStatus);
    }
    if (paramType && TYPE_FILTERS.some((t) => t.id === paramType)) {
      setTypeFilter(paramType);
    }
    if (paramOpen && orders.some((o) => o.id === paramOpen)) {
      setSelectedOrderId(paramOpen);
    }
  }, [searchParams, orders]);

  const modelMap = useMemo(
    () => Object.fromEntries(models.map((m) => [m.id, m])),
    [models]
  );

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    ORDER_STATUSES.forEach((s) => {
      counts[s.id] = 0;
    });
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status] += 1;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (typeFilter === 'catalog' && order.type !== 'catalog') return false;
      if (typeFilter === 'custom' && order.type !== 'custom' && order.type !== 'mixed') {
        return false;
      }
      if (!q) return true;

      const itemsHit = (order.items || []).some(
        (it) =>
          String(it.title || '').toLowerCase().includes(q) ||
          String(it.phoneModelName || '').toLowerCase().includes(q)
      );

      return (
        String(order.id).toLowerCase().includes(q) ||
        String(order.customer?.fullName || '').toLowerCase().includes(q) ||
        String(order.customer?.mobileNumber || '').includes(q) ||
        String(order.customer?.governorateNameAr || '').toLowerCase().includes(q) ||
        itemsHit
      );
    });
  }, [orders, statusFilter, typeFilter, searchQuery]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const handleCloseDrawer = () => {
    setSelectedOrderId(null);
    if (searchParams.has('open')) {
      const next = new URLSearchParams(searchParams);
      next.delete('open');
      setSearchParams(next, { replace: true });
    }
  };

  return (
    <div className="pt-6 md:pt-10">
      <div className="page-container">
        <PageHeading
          title="الطلبات"
          count={orders.length}
          description="أكّد الأوردرات بالتليفون، راجع ملفات الطباعة المخصصة، وتابع خروج الشحن."
          action={<HandoffImportButton label="استورد أوردرات JSON" />}
        />

        {/* Row 1: Search + ONE compact type toggle (`الكل | جاهز | مخصص`) */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-[380px]">
            <label htmlFor="admin-orders-search" className="sr-only">
              ابحث في الطلبات
            </label>
            <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--graphite)]" />
            <input
              id="admin-orders-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بكود الأوردر أو الاسم أو الموبايل أو الموديل..."
              className="field-input ps-10"
            />
          </div>

          <div
            role="group"
            aria-label="تصفية حسب نوع الطباعة"
            className="flex shrink-0 items-center gap-2 px-1 py-1"
          >
            {TYPE_FILTERS.map((tf) => {
              const active = typeFilter === tf.id;
              return (
                <button
                  key={tf.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTypeFilter(tf.id)}
                  className={`min-h-[44px] rounded-[4px] px-3 text-[14px] font-medium cursor-pointer ${
                    active
                      ? 'is-selected font-semibold text-[var(--charcoal)]'
                      : 'text-[var(--graphite)] hover:text-[var(--charcoal)]'
                  }`}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: ONE single-row horizontal RTL status stage filter */}
        <div
          role="tablist"
          aria-label="تصفية حسب حالة الأوردر"
          className="no-scrollbar mt-4 flex items-center gap-2 overflow-x-auto px-1 py-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
            className={`min-h-[44px] shrink-0 rounded-[4px] px-3 text-[14px] font-medium cursor-pointer ${
              statusFilter === 'all'
                ? 'is-selected font-semibold text-[var(--charcoal)]'
                : 'text-[var(--graphite)] hover:text-[var(--charcoal)]'
            }`}
          >
            الكل{' '}
            <span className="text-[13px] tabular-nums text-[var(--graphite)]">
              {statusCounts.all}
            </span>
          </button>

          {ORDER_STATUSES.map((st) => {
            const active = statusFilter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatusFilter(st.id)}
                className={`min-h-[44px] shrink-0 rounded-[4px] px-3 text-[14px] font-medium cursor-pointer ${
                  active
                    ? 'is-selected font-semibold text-[var(--charcoal)]'
                    : 'text-[var(--graphite)] hover:text-[var(--charcoal)]'
                }`}
              >
                {st.labelAr}{' '}
                <span className="text-[13px] tabular-nums text-[var(--graphite)]">
                  {statusCounts[st.id] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Open Plaster Order Ledger (zero cards, zero borders, zero middle dots) */}
        {filteredOrders.length > 0 ? (
          <ul className="mt-10 space-y-8 md:space-y-7">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order) => {
                const primaryItem = order.items?.[0];
                const spec = primaryItem?.printSpec || {};
                const src = spec.designSource || {};
                const tf = spec.imageTransform || { x: 0, y: 0, scale: 1, rotation: 0 };
                const thumbModel = modelMap[spec.phoneModelId] || previewModel;
                const extraItemsCount = Math.max(0, (order.items?.length || 0) - 1);
                const isQuietStatus =
                  order.status === 'delivered' ||
                  order.status === 'cancelled' ||
                  order.status === 'returned';

                return (
                  <motion.li
                    key={order.id}
                    layout={!prefersReducedMotion}
                    initial={prefersReducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                    transition={{
                      layout: { duration: 0.35, ease: EASE },
                      opacity: { duration: 0.2, ease: EASE },
                    }}
                    className="grid grid-cols-[54px_1fr] items-center gap-x-5 gap-y-2 text-start md:grid-cols-12 md:gap-x-6"
                  >
                    {/* Live mini PhoneCaseMockup sitting directly on --plaster */}
                    <div className="row-span-2 flex w-[54px] flex-col items-center gap-1 md:row-span-1 md:col-span-1">
                      <PhoneCaseMockup
                        model={thumbModel}
                        artworkId={src.type === 'catalog' ? src.artworkId : null}
                        customImage={
                          src.type === 'custom-upload' && src.imageUrl
                            ? {
                                url: src.imageUrl,
                                x: Number(tf.x) || 0,
                                y: Number(tf.y) || 0,
                                scale: Number(tf.scale) || 1,
                                rotation: Number(tf.rotation) || 0,
                              }
                            : null
                        }
                        printedName={spec.printedName || null}
                        className="w-full"
                        ariaLabel={`معاينة أوردر ${order.id}`}
                      />
                      {extraItemsCount > 0 ? (
                        <span className="type-caption text-[11px] tabular-nums">
                          +{extraItemsCount}
                        </span>
                      ) : null}
                    </div>

                    {/* Order code, work-type, item summary, pendingModel indicator */}
                    <div className="min-w-0 space-y-0.5 md:col-span-4">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <bdi
                          dir="ltr"
                          className="latin-title text-[16px] font-bold text-[var(--charcoal)]"
                        >
                          {order.id}
                        </bdi>
                        <span className="text-[13px] font-semibold text-[var(--graphite)]">
                          {WORK_TYPE_LABELS[order.type] || order.type}
                        </span>
                        <span className="type-caption text-[12px] tabular-nums">
                          {formatShortDate(order.createdAt)}
                        </span>
                      </div>

                      {primaryItem ? (
                        <p className="type-caption flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[14px]">
                          <bdi
                            dir="ltr"
                            className="inline-block max-w-full truncate font-medium text-[var(--charcoal)]"
                          >
                            {primaryItem.title}
                          </bdi>
                          <bdi dir="ltr" className="inline-block max-w-full truncate">
                            {primaryItem.phoneModelName}
                          </bdi>
                        </p>
                      ) : null}

                      {order.pendingModel ? (
                        <p className="text-[13px] font-semibold text-[var(--klein)]">
                          موديل لسه بيتأكد
                        </p>
                      ) : null}
                    </div>

                    {/* Customer name, phone, governorate */}
                    <div className="min-w-0 space-y-0.5 md:col-span-3">
                      <p className="truncate text-[15px] font-semibold text-[var(--charcoal)]">
                        {order.customer.fullName}
                      </p>
                      <p className="type-caption flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[13px]">
                        <bdi dir="ltr" className="tabular-nums">
                          {order.customer.mobileNumber}
                        </bdi>
                        <span>{order.customer.governorateNameAr}</span>
                      </p>
                    </div>

                    {/* Total + Status + Action (mobile: single clean full-width row; desktop: 2 + 2 grid cols) */}
                    <div className="col-span-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-1 md:contents">
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 md:col-span-2 md:flex-col">
                        <span className="text-[16px] font-bold tabular-nums text-[var(--charcoal)]">
                          {order.pricing.total} {storeConfig.currencyLabel}
                        </span>
                        <span
                          className={`text-[14px] ${
                            isQuietStatus
                              ? 'font-medium text-[var(--graphite)]'
                              : 'font-semibold text-[var(--charcoal)]'
                          }`}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>

                      <div className="flex items-center md:col-span-2 md:justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderId(order.id)}
                          className="btn-secondary !min-h-[44px] !text-[14px]"
                        >
                          افتح التفاصيل
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="mt-12 max-w-[46ch] py-8 text-start">
            <p className="type-h3 text-[var(--charcoal)]">
              مفيش أوردرات مطابقة للتصفية دي دلوقتي.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-6">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="btn-secondary"
                >
                  عرض كل الطلبات
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <OrderDetailDrawer
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
