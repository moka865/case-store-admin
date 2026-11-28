import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import {
  getOrderStatusLabel,
  ORDER_STATUSES,
  toWhatsappUrl,
} from '../../contracts/handoffSchema';
import {
  getOrderPricingBreakdown,
  getOrderTotalPieces,
  isDepositRequired,
  orderHasPrintedName,
  sortOrdersByUrgency,
} from '../../utils/dashboardMetrics';
import {
  AlertCircleIcon,
  ForwardArrowRtlIcon,
  PhoneCallIcon,
  WhatsappIcon,
} from '../icons/Icons';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';

const WORK_TYPE_LABELS = {
  catalog: 'جاهز',
  custom: 'مخصص',
  mixed: 'مختلط',
};

const NEXT_STAGE_CTA = {
  pending_confirmation: { nextStatus: 'printing', label: 'أكد وحول للمطبعة' },
  printing: { nextStatus: 'shipped', label: 'خرج للشحن' },
  shipped: { nextStatus: 'delivered', label: 'تم التسليم' },
};

const STATUS_BAR_COLORS = {
  pending_confirmation: 'bg-[var(--brand-yellow)]',
  printing: 'bg-[var(--ink)]',
  shipped: 'bg-[var(--brand)]',
  delivered: 'bg-[var(--jade)]',
  returned: 'bg-[#8A5A2B]',
  cancelled: 'bg-[var(--surface-muted)]',
};

const STATUS_CHIP_CLASS = {
  pending_confirmation: 'bg-[var(--brand-yellow-tint)] text-[var(--ink)]',
  printing: 'bg-[var(--card-bg)] text-[var(--ink)]',
  shipped: 'bg-[var(--ink)] text-white',
  delivered: 'bg-[var(--jade-tint)] text-[var(--jade)]',
  returned: 'bg-[var(--brand-tint)] text-[var(--brand)]',
  cancelled: 'bg-[var(--surface-muted)] text-[var(--ink-muted)]',
};

function formatShortDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Central Dashboard Order Pipeline & Urgent Action Queue:
 * - Proportional 6-stage distribution bar + clickable filter tabs
 * - Priority-sorted orders with live mockup previews, deposit/pending-model/name indicators,
 *   direct WhatsApp/phone confirmation links, and safe one-click stage advancement
 */
export function OrderPipelineSection({ metrics, onOpenOrder }) {
  const {
    orders,
    models,
    previewModel,
    storeConfig,
    isHydratingOrders,
    updateOrderStatus,
  } = useAdmin();

  const [activeStage, setActiveStage] = useState('all');
  const [rowError, setRowError] = useState({ orderId: null, message: '' });

  const modelMap = useMemo(
    () => Object.fromEntries(models.map((m) => [m.id, m])),
    [models]
  );

  const visibleOrders = useMemo(() => {
    const filtered =
      activeStage === 'all' ? orders : orders.filter((o) => o.status === activeStage);
    return sortOrdersByUrgency(filtered).slice(0, 8);
  }, [orders, activeStage]);

  const totalMatching =
    activeStage === 'all' ? orders.length : metrics.statusCounts[activeStage] || 0;

  const handleQuickAdvance = async (order, nextStatus) => {
    setRowError({ orderId: null, message: '' });
    const res = await updateOrderStatus(order.id, nextStatus);
    if (!res.ok) {
      setRowError({
        orderId: order.id,
        message: res.error || 'حصل مشكلة أثناء تحديث حالة الأوردر.',
      });
    }
  };

  return (
    <section
      aria-labelledby="dashboard-pipeline-heading"
      className="rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 sm:p-6 text-start"
    >
      {/* Header + Full Ledger link */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2.5">
            <h2 id="dashboard-pipeline-heading" className="type-h2 text-[var(--ink)]">
              مسار الطلبات اليومي
            </h2>
            <span className="type-caption tabular-nums">
              {metrics.activePipelineCount} طلب نشط
            </span>
          </div>
          <p className="type-caption mt-0.5 text-[13px]">
            الأولوية للأوردرات المستنية تأكيد أو معلقة على تأكيد الموديل قبل الطباعة.
          </p>
        </div>

        <Link
          to={activeStage === 'all' ? '/orders' : `/orders?status=${activeStage}`}
          className="btn-secondary !min-h-[40px] !text-[14px]"
        >
          <span>كل الطلبات</span>
          <ForwardArrowRtlIcon className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Quiet IndexedDB hydration indicator when loading custom order artwork */}
      {isHydratingOrders ? (
        <p role="status" className="type-caption mt-3 text-[12.5px]">
          جاري تجهيز معاينات الصور المخصصة...
        </p>
      ) : null}

      {/* Proportional 6-stage bar */}
      {orders.length > 0 ? (
        <div
          aria-hidden="true"
          className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-[var(--card-bg)]"
        >
          {ORDER_STATUSES.map((st) => {
            const count = metrics.statusCounts[st.id] || 0;
            if (!count) return null;
            const pct = (count / orders.length) * 100;
            return (
              <span
                key={st.id}
                style={{ width: `${pct}%` }}
                className={`${STATUS_BAR_COLORS[st.id] || 'bg-[var(--ink-muted)]'} border-e border-[var(--surface)] last:border-e-0`}
                title={`${st.labelAr}: ${count}`}
              />
            );
          })}
        </div>
      ) : null}

      {/* Filter tabs across all 6 contract statuses */}
      <div
        role="tablist"
        aria-label="تصفية الطلبات حسب الحالة"
        className="no-scrollbar mt-4 flex items-center gap-1.5 overflow-x-auto pb-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeStage === 'all'}
          onClick={() => {
            setActiveStage('all');
            setRowError({ orderId: null, message: '' });
          }}
          className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold transition-colors cursor-pointer ${
            activeStage === 'all'
              ? 'bg-[var(--ink)] text-white'
              : 'bg-[var(--card-bg)] text-[var(--ink)] hover:bg-[var(--surface-muted)]'
          }`}
        >
          <span>الكل</span>
          <span className="tabular-nums opacity-80">{metrics.statusCounts.all}</span>
        </button>

        {ORDER_STATUSES.map((st) => {
          const isActive = activeStage === st.id;
          const count = metrics.statusCounts[st.id] || 0;
          return (
            <button
              key={st.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveStage(st.id);
                setRowError({ orderId: null, message: '' });
              }}
              className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[var(--ink)] text-white'
                  : 'bg-[var(--card-bg)] text-[var(--ink)] hover:bg-[var(--surface-muted)]'
              }`}
            >
              <span>{st.labelAr}</span>
              <span className="tabular-nums opacity-80">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Urgent / Recent Actionable Orders List */}
      {visibleOrders.length > 0 ? (
        <ul className="mt-4 divide-y divide-[var(--border-subtle)]">
          {visibleOrders.map((order) => {
            const primaryItem = order.items?.[0];
            const spec = primaryItem?.printSpec || {};
            const src = spec.designSource || {};
            const tf = spec.imageTransform || { x: 0, y: 0, scale: 1, rotation: 0 };
            const thumbModel = modelMap[spec.phoneModelId] || previewModel;
            const totalPieces = getOrderTotalPieces(order);
            const hasNamePrint = orderHasPrintedName(order);
            const depositNeeded = isDepositRequired(order, storeConfig);
            const pricing = getOrderPricingBreakdown(order);
            const nextAction = NEXT_STAGE_CTA[order.status] || null;
            const isBlockedFromPrinting =
              Boolean(order.pendingModel) && nextAction?.nextStatus === 'printing';
            const hasLineError = rowError.orderId === order.id && rowError.message;

            return (
              <li key={order.id} className="py-4 first:pt-2 last:pb-1">
                <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
                  {/* Thumbnail + Order & Customer Metadata */}
                  <div className="flex min-w-0 flex-1 items-start gap-3.5">
                    <div className="product-stage relative flex w-[56px] shrink-0 flex-col items-center p-1.5">
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
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      {/* Top row: Order ID + Status chip + Work Type + Date */}
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <bdi
                          dir="ltr"
                          className="latin-title text-[15px] font-extrabold text-[var(--ink)]"
                        >
                          {order.id}
                        </bdi>

                        <span
                          className={`inline-flex rounded-[6px] px-2 py-0.5 text-[11.5px] font-bold ${
                            STATUS_CHIP_CLASS[order.status] || 'bg-[var(--card-bg)] text-[var(--ink)]'
                          }`}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>

                        <span className="rounded-[6px] bg-[var(--paper)] px-2 py-0.5 text-[11.5px] font-semibold text-[var(--ink-muted)]">
                          {WORK_TYPE_LABELS[order.type] || order.type} · {totalPieces}{' '}
                          {totalPieces === 1 ? 'قطعة' : 'قطع'}
                        </span>

                        <span className="type-caption text-[12px] tabular-nums">
                          {formatShortDate(order.createdAt)}
                        </span>
                      </div>

                      {/* Item & Phone Model line */}
                      {primaryItem ? (
                        <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 text-[13.5px] text-[var(--ink)]">
                          <bdi dir="ltr" className="latin-title font-bold">
                            {primaryItem.title}
                          </bdi>
                          <span className="text-[var(--ink-muted)]">·</span>
                          <bdi dir="ltr" className="latin-title text-[var(--ink-muted)]">
                            {primaryItem.phoneModelName}
                          </bdi>
                          {order.items.length > 1 ? (
                            <span className="text-[12px] font-semibold text-[var(--ink-muted)]">
                              (+{order.items.length - 1} أصناف أخرى)
                            </span>
                          ) : null}
                        </p>
                      ) : null}

                      {/* Policy & Feature Flags */}
                      {order.pendingModel || depositNeeded || hasNamePrint ? (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {order.pendingModel ? (
                            <span className="inline-flex items-center gap-1 rounded-[6px] bg-[var(--brand-tint)] px-2 py-0.5 text-[11.5px] font-bold text-[var(--brand)]">
                              <AlertCircleIcon className="h-3 w-3 shrink-0" />
                              <span>موديل مستني تأكيد</span>
                            </span>
                          ) : null}
                          {depositNeeded && order.status === 'pending_confirmation' ? (
                            <span className="badge-brand-yellow !text-[11.5px]">
                              ديبوزت مطلوب
                            </span>
                          ) : null}
                          {hasNamePrint ? (
                            <span className="inline-flex items-center gap-1 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--paper)] px-2 py-0.5 text-[11.5px] font-semibold text-[var(--ink)]">
                              <span>طباعة اسم</span>
                              <bdi dir="ltr" className="latin-title tabular-nums">
                                +{storeConfig.namePrintFee || 50}
                              </bdi>
                              <span>{storeConfig.currencyLabel}</span>
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      {/* Customer & Quick Contact Row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--ink-muted)]">
                        <span className="font-semibold text-[var(--ink)]">
                          {order.customer.fullName}
                        </span>
                        <span>{order.customer.governorateNameAr}</span>
                        <bdi dir="ltr" className="tabular-nums font-medium">
                          {order.customer.mobileNumber}
                        </bdi>

                        <span className="inline-flex items-center gap-2">
                          <a
                            href={`tel:${order.customer.mobileNumber}`}
                            aria-label={`اتصال بـ ${order.customer.fullName}`}
                            className="inline-flex min-h-[30px] items-center gap-1 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--paper)] px-2 text-[12px] font-semibold text-[var(--ink)] hover:border-[var(--ink)]"
                          >
                            <PhoneCallIcon className="h-3.5 w-3.5" />
                            <span>اتصال</span>
                          </a>
                          <a
                            href={toWhatsappUrl(order.customer.mobileNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`واتساب ${order.customer.fullName}`}
                            className="inline-flex min-h-[30px] items-center gap-1 rounded-[6px] border border-[var(--jade)]/25 bg-[var(--jade-tint)] px-2 text-[12px] font-bold text-[var(--jade)] hover:border-[var(--jade)]"
                          >
                            <WhatsappIcon className="h-3.5 w-3.5" />
                            <span>واتساب</span>
                          </a>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* COD Total + One-Click Action + Details Drawer */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[var(--border-subtle)] pt-3 sm:shrink-0 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                    <div className="text-start sm:text-end">
                      <p className="text-[17px] font-extrabold tabular-nums text-[var(--ink)]">
                        {pricing.total} {storeConfig.currencyLabel}
                      </p>
                      {pricing.namePrintFees > 0 ? (
                        <p className="type-caption text-[11.5px] tabular-nums">
                          شامل <bdi dir="ltr">+{pricing.namePrintFees}</bdi> {storeConfig.currencyLabel} أسماء
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {nextAction ? (
                        <button
                          type="button"
                          disabled={isBlockedFromPrinting}
                          title={
                            isBlockedFromPrinting
                              ? 'حدد موديل الموبايل من التفاصيل قبل التحويل للمطبعة'
                              : undefined
                          }
                          onClick={() => handleQuickAdvance(order, nextAction.nextStatus)}
                          className="btn-primary !min-h-[38px] !px-3.5 !text-[13px]"
                        >
                          {nextAction.label}
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => onOpenOrder(order.id)}
                        className="btn-outline !min-h-[38px] !px-3.5 !text-[13px]"
                      >
                        افتح التفاصيل
                      </button>
                    </div>
                  </div>
                </div>

                {hasLineError ? (
                  <p role="alert" className="mt-2 text-[13px] font-bold text-[var(--brand)]">
                    {rowError.message}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-4 rounded-[var(--radius-stage)] border border-dashed border-[var(--border-strong)] bg-[var(--paper)] p-6 text-start">
          <p className="text-[15px] font-bold text-[var(--ink)]">
            مفيش طلبات في المرحلة دي دلوقتي.
          </p>
          <p className="type-caption mt-1 text-[13.5px]">
            تقدر تعرض كل الطلبات أو تستورد ملف طلب جديد من المتجر.
          </p>
          {activeStage !== 'all' ? (
            <button
              type="button"
              onClick={() => setActiveStage('all')}
              className="btn-secondary mt-3 !min-h-[40px]"
            >
              عرض كل الطلبات
            </button>
          ) : null}
        </div>
      )}

      {totalMatching > visibleOrders.length ? (
        <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
          <span className="type-caption text-[13px] tabular-nums">
            بتعرض أول {visibleOrders.length} من أصل {totalMatching} طلب
          </span>
          <Link
            to={activeStage === 'all' ? '/orders' : `/orders?status=${activeStage}`}
            className="btn-secondary !min-h-[38px] !text-[13.5px]"
          >
            افتح الكل في صفحة الطلبات
          </Link>
        </div>
      ) : null}
    </section>
  );
}
