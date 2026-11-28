import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import {
  getOrderStatusLabel,
  ORDER_TERMINAL_STATUSES,
  ORDER_WORKFLOW_STAGES,
  toWhatsappUrl,
} from '../../contracts/handoffSchema';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';
import { SlideOverDrawer } from '../common/SlideOverDrawer';
import {
  getOrderPricingBreakdown,
  getPendingModelNames,
  isDepositRequired,
} from '../../utils/dashboardMetrics';

const ORDER_TYPE_LABELS = {
  catalog: 'جراب جاهز',
  custom: 'طباعة مخصصة',
  mixed: 'مختلط (جاهز + مخصص)',
};

const PLACEMENT_LABELS = {
  top: 'فوق',
  center: 'في النص',
  bottom: 'تحت',
};

const NEXT_STAGE_CTA = {
  pending_confirmation: { nextStatus: 'printing', label: 'أكد وحول للمطبعة' },
  printing: { nextStatus: 'shipped', label: 'جاهز للشحن' },
  shipped: { nextStatus: 'delivered', label: 'تم التسليم' },
};

function formatDateTimeWestern(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function downloadDataUrl(dataUrl, baseFileName) {
  const mimeMatch = String(dataUrl).match(/^data:([^;]+);/);
  const mime = mimeMatch?.[1] || 'image/png';
  const ext = mime.includes('svg')
    ? 'svg'
    : mime.includes('jpeg') || mime.includes('jpg')
      ? 'jpg'
      : mime.includes('webp')
        ? 'webp'
        : 'png';
  const cleanName = String(baseFileName || 'custom-case-image').replace(/\.[^.]+$/, '');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${cleanName}.${ext}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadPrintSpecJson(order, item, itemIndex) {
  const payload = {
    orderId: order.id,
    itemIndex: itemIndex + 1,
    title: item.title,
    quantity: item.quantity,
    phoneModelName: item.phoneModelName,
    materialNameAr: item.materialNameAr,
    printSpec: {
      ...item.printSpec,
      designSource: item.printSpec?.designSource
        ? {
            ...item.printSpec.designSource,
            imageUrl: item.printSpec.designSource.imageUrl ? '[embedded-in-order]' : null,
          }
        : null,
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ghilaf-print-spec-${order.id}-item-${itemIndex + 1}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Print-ready Order Detail Slide-Over Drawer (`end-0` on desktop, bottom sheet on mobile).
 * Displays live per-item PhoneCaseMockup production previews, exact custom transform coordinates,
 * COD customer call/WhatsApp controls, pending-model guard & resolution, and terminal states.
 */
export function OrderDetailDrawer({ open, order, onClose }) {
  const {
    models,
    phoneBrands,
    previewModel,
    storeConfig,
    updateOrderStatus,
    resolveOrderPendingModel,
    updateOrderNotes,
  } = useAdmin();

  const [copiedPhone, setCopiedPhone] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [actionError, setActionError] = useState('');
  const [confirmTerminal, setConfirmTerminal] = useState(null); // 'cancelled' | 'returned' | null
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('');

  useEffect(() => {
    if (!order) return;
    setNotesDraft(order.internalNotes || '');
    setNotesSaved(false);
    setActionError('');
    setConfirmTerminal(null);
    setShowModelPicker(false);
    setCopiedPhone(false);
    setSelectedModelId(models[0]?.id || '');
  }, [order?.id, order?.internalNotes, models]);

  const modelsByBrand = useMemo(() => {
    const groups = new Map();
    phoneBrands.forEach((b) => groups.set(b, []));
    models.forEach((m) => {
      if (!groups.has(m.brand)) groups.set(m.brand, []);
      groups.get(m.brand).push(m);
    });
    return [...groups.entries()].filter(([, list]) => list.length > 0);
  }, [models, phoneBrands]);

  const handleCopyPhone = async () => {
    if (!order?.customer?.mobileNumber) return;
    try {
      await navigator.clipboard.writeText(order.customer.mobileNumber);
    } catch {
      // Fallback for restricted clipboard contexts
      const temp = document.createElement('textarea');
      temp.value = order.customer.mobileNumber;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      try {
        document.execCommand('copy');
      } catch {
        // ignore
      }
      temp.remove();
    }
    setCopiedPhone(true);
    window.setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleStageTransition = async (nextStatus) => {
    if (!order) return;
    setActionError('');
    const res = await updateOrderStatus(order.id, nextStatus);
    if (!res.ok) {
      setActionError(res.error || 'حصل مشكلة أثناء تحديث الحالة.');
    } else {
      setConfirmTerminal(null);
    }
  };

  const handleResolveModel = async () => {
    if (!order || !selectedModelId) return;
    const modelObj = models.find((m) => m.id === selectedModelId);
    if (!modelObj) return;
    setActionError('');
    const res = await resolveOrderPendingModel(order.id, modelObj);
    if (!res.ok) {
      setActionError(res.error || 'حصل مشكلة أثناء تحديد الموديل.');
      return;
    }
    setShowModelPicker(false);
  };

  const handleNotesBlur = async () => {
    if (!order) return;
    if (notesDraft === (order.internalNotes || '')) return;
    const res = await updateOrderNotes(order.id, notesDraft);
    if (res.ok) {
      setNotesSaved(true);
      window.setTimeout(() => setNotesSaved(false), 2200);
    }
  };

  const nextAction = order ? NEXT_STAGE_CTA[order.status] || null : null;
  const isTerminal = order ? ORDER_TERMINAL_STATUSES.includes(order.status) : false;
  const canMarkReturned = order ? order.status === 'shipped' || order.status === 'delivered' : false;
  const pricingBreakdown = order ? getOrderPricingBreakdown(order) : null;
  const pendingModelNames = order ? getPendingModelNames(order) : [];
  const depositRequired = order ? isDepositRequired(order, storeConfig) : false;

  const drawerFooter = order ? (
    <div className="space-y-3">
      {actionError ? (
        <p role="alert" className="text-[14px] font-bold text-[var(--brand)]">
          {actionError}
        </p>
      ) : null}

      {order.pendingModel && nextAction?.nextStatus === 'printing' ? (
        <p className="type-caption text-[13px] font-semibold text-[var(--ink)]">
          حدد الموديل الصح الأول من فوق قبل ما تحول الأوردر للمطبعة.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {nextAction ? (
            <button
              type="button"
              disabled={order.pendingModel && nextAction.nextStatus === 'printing'}
              onClick={() => handleStageTransition(nextAction.nextStatus)}
              className="btn-primary"
            >
              {nextAction.label}
            </button>
          ) : (
            <span className="text-[15px] font-semibold text-[var(--graphite)]">
              الحالة النهائية: {getOrderStatusLabel(order.status)}
            </span>
          )}
        </div>

        {/* Inline two-step terminal actions (zero window.confirm) */}
        <div className="flex flex-wrap items-center gap-4">
          {confirmTerminal ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[14px] font-medium text-[var(--ink)]">
                {confirmTerminal === 'cancelled'
                  ? 'أكد إلغاء الأوردر؟'
                  : 'أكد تسجيل الأوردر كمرتجع؟'}
              </span>
              <button
                type="button"
                onClick={() => handleStageTransition(confirmTerminal)}
                className="btn-secondary !min-h-[44px] !text-[14px] font-bold text-[var(--brand)]"
              >
                {confirmTerminal === 'cancelled' ? 'أكد الإلغاء' : 'أكد المرتجع'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmTerminal(null)}
                className="btn-secondary !min-h-[44px] !text-[14px] text-[var(--graphite)]"
              >
                تراجع
              </button>
            </div>
          ) : (
            <>
              {canMarkReturned ? (
                <button
                  type="button"
                  onClick={() => setConfirmTerminal('returned')}
                  className="btn-secondary !min-h-[44px] !text-[14px] text-[var(--graphite)]"
                >
                  تسجيل مرتجع
                </button>
              ) : null}

              {!isTerminal ? (
                <button
                  type="button"
                  onClick={() => setConfirmTerminal('cancelled')}
                  className="btn-secondary !min-h-[44px] !text-[14px] text-[var(--graphite)]"
                >
                  إلغاء الأوردر
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <SlideOverDrawer
      open={open && Boolean(order)}
      onClose={onClose}
      title={order ? `أوردر ${order.id}` : 'تفاصيل الأوردر'}
      widthClass="md:max-w-[min(840px,92vw)]"
      footer={drawerFooter}
    >
      {order ? (
        <div className="space-y-7 pt-1">
          {/* Metadata strip + Store policy flags */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-[6px] bg-[var(--card-bg)] px-2.5 py-0.5 text-[13px] font-bold text-[var(--ink)]">
                {ORDER_TYPE_LABELS[order.type] || order.type}
              </span>
              <span className="type-caption text-[13px]">{storeConfig.paymentLabelAr}</span>
              {depositRequired ? (
                <span className="badge-brand-yellow">
                  ديبوزت مطلوب (طلب مخصص أو {storeConfig.depositMinItems || 4} قطع فأكثر)
                </span>
              ) : null}
            </div>
            <span className="type-caption text-[13px] tabular-nums">
              <bdi dir="ltr">{formatDateTimeWestern(order.createdAt)}</bdi>
            </span>
          </div>

          {/* 4-Stage Linear Workflow Bar */}
          <section aria-label="مراحل تنفيذ الأوردر" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[14px] font-semibold text-[var(--graphite)]">حالة الأوردر</h3>
              {order.status === 'cancelled' || order.status === 'returned' ? (
                <span className="text-[14px] font-semibold text-[var(--klein)]">
                  الحالة الحالية: {getOrderStatusLabel(order.status)}
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {ORDER_WORKFLOW_STAGES.map((stageId, index) => {
                const isCurrent = order.status === stageId;
                const blockedByPending = order.pendingModel && stageId === 'printing';
                return (
                  <button
                    key={stageId}
                    type="button"
                    aria-pressed={isCurrent}
                    disabled={blockedByPending}
                    onClick={() => handleStageTransition(stageId)}
                    className={`min-h-[44px] rounded-[4px] bg-[var(--plaster)] px-3 py-2 text-start text-[14px] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 ${
                      isCurrent
                        ? 'is-selected font-semibold text-[var(--charcoal)]'
                        : 'font-medium text-[var(--graphite)] hover:text-[var(--charcoal)]'
                    }`}
                  >
                    <span className="me-1.5 text-[12px] tabular-nums text-[var(--graphite)]">
                      {index + 1}
                    </span>
                    {getOrderStatusLabel(stageId)}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Pending Model Guard & Resolution Block (one of two intentional plaster anchors) */}
          {order.pendingModel ? (
            <section
              aria-label="تأكيد موديل الموبايل"
              className="space-y-4 rounded-[4px] bg-[var(--plaster)] p-5"
            >
              <div className="space-y-1.5">
                <p className="text-[15px] font-semibold text-[var(--charcoal)]">
                  الموديل المطلوب لسه بيتأكد قبل الطباعة
                </p>
                <p className="type-caption text-[14px]">
                  العميل طلب {pendingModelNames.length > 1 ? 'موديلات مش متضافة' : 'موديل مش متضاف'} في القائمة:{' '}
                  <bdi dir="ltr" className="font-bold text-[var(--ink)]">
                    {pendingModelNames.join('، ')}
                  </bdi>
                  . مش هيتحول الأوردر لقيد الطباعة غير لما تحدد الموديل الصح هنا.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => setShowModelPicker((prev) => !prev)}
                  className="btn-secondary !min-h-[44px] !text-[14px] font-semibold text-[var(--klein)]"
                >
                  اختار الموديل الصح
                </button>

                {order.missingModelRequestId ? (
                  <Link
                    to={`/missing-models?open=${encodeURIComponent(order.missingModelRequestId)}`}
                    onClick={onClose}
                    className="btn-secondary !min-h-[44px] !text-[14px]"
                  >
                    <span>افتح طلب الموديل الناقص</span>
                    <bdi dir="ltr">({order.missingModelRequestId})</bdi>
                  </Link>
                ) : null}
              </div>

              {showModelPicker ? (
                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-1.5">
                    <label
                      htmlFor="resolve-pending-model-select"
                      className="block text-[13px] font-semibold text-[var(--charcoal)]"
                    >
                      اختار الموديل المتاح من الكتالوج
                    </label>
                    <select
                      id="resolve-pending-model-select"
                      value={selectedModelId}
                      onChange={(e) => setSelectedModelId(e.target.value)}
                      className="field-input cursor-pointer"
                    >
                      {modelsByBrand.map(([brand, list]) => (
                        <optgroup key={brand} label={brand}>
                          {list.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleResolveModel}
                    className="btn-primary shrink-0"
                  >
                    تأكيد الموديل
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* Customer & COD Confirmation Block — open on gallery-white with hairline rhythm */}
          <section
            aria-label="بيانات العميل والشحن"
            className="space-y-4 border-t border-[rgba(38,40,43,0.1)] pt-6"
          >
            <h3 className="type-h3 text-[var(--charcoal)]">بيانات العميل والتأكيد</h3>

            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <div className="space-y-0.5">
                <p className="type-caption text-[13px]">الاسم</p>
                <p className="text-[16px] font-semibold text-[var(--charcoal)]">
                  {order.customer.fullName}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="type-caption text-[13px]">الموبايل</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <bdi
                    dir="ltr"
                    className="text-[16px] font-bold tabular-nums text-[var(--charcoal)]"
                  >
                    {order.customer.mobileNumber}
                  </bdi>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="btn-secondary !min-h-[38px] !text-[14px]"
                  >
                    {copiedPhone ? 'اتنسخ' : 'نسخ الرقم'}
                  </button>
                  <a
                    href={`tel:${order.customer.mobileNumber}`}
                    className="btn-secondary !min-h-[38px] !text-[14px]"
                  >
                    اتصال
                  </a>
                  <a
                    href={toWhatsappUrl(order.customer.mobileNumber)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary !min-h-[38px] !text-[14px]"
                  >
                    واتساب
                  </a>
                </div>
              </div>

              <div className="space-y-0.5 sm:col-span-2">
                <p className="type-caption text-[13px]">العنوان</p>
                <p className="text-[15px] text-[var(--charcoal)]">
                  <span className="font-semibold">{order.customer.governorateNameAr}</span>
                  {' — '}
                  {order.customer.address}
                </p>
                {order.customer.estimatedTotalDays ? (
                  <p className="type-caption text-[13px]">
                    مدة التوصيل المتوقعة (شاملة التجهيز والطباعة):{' '}
                    <span className="font-semibold tabular-nums text-[var(--charcoal)]">
                      {order.customer.estimatedTotalDays} أيام عمل
                    </span>
                  </p>
                ) : null}
              </div>

              {order.customer.notes ? (
                <div className="space-y-0.5 sm:col-span-2">
                  <p className="type-caption text-[13px]">ملاحظات العميل</p>
                  <p className="text-[15px] text-[var(--charcoal)]">{order.customer.notes}</p>
                </div>
              ) : null}
            </div>
          </section>

          {/* Per-Item Production Stage (Bold gallery-calibrated centerpiece of the drawer) */}
          <section
            aria-label="القطع ومواصفات الطباعة"
            className="space-y-5 border-t border-[rgba(38,40,43,0.1)] pt-6"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="type-h3 text-[var(--charcoal)]">القطع ومواصفات الطباعة</h3>
              <span className="type-caption tabular-nums">
                {order.items.length} {order.items.length === 1 ? 'قطعة' : 'قطع'}
              </span>
            </div>

            <div className="space-y-8">
              {order.items.map((item, idx) => {
                const spec = item.printSpec || {};
                const src = spec.designSource || {};
                const srcType = src.type || 'catalog';
                const isCustomUpload = srcType === 'custom-upload';
                const isCustomTextOnly = srcType === 'custom-text-only';
                const isCustom = isCustomUpload || isCustomTextOnly;
                const tf = spec.imageTransform || { x: 0, y: 0, scale: 1, rotation: 0 };
                const printedName = spec.printedName || null;

                const matchedModel =
                  models.find((m) => m.id === spec.phoneModelId) || previewModel;

                const customImageProp =
                  isCustomUpload && src.imageUrl
                    ? {
                        url: src.imageUrl,
                        x: Number(tf.x) || 0,
                        y: Number(tf.y) || 0,
                        scale: Number(tf.scale) || 1,
                        rotation: Number(tf.rotation) || 0,
                      }
                    : null;

                return (
                  <article
                    key={item.id || idx}
                    className="grid grid-cols-1 gap-6 md:grid-cols-[208px_1fr] md:items-start"
                  >
                    {/* Live production mockup on bare plaster pad — the sole visual focal stage */}
                    <div className="flex flex-col items-center justify-center rounded-[4px] bg-[var(--plaster)] px-5 py-6">
                      <PhoneCaseMockup
                        model={matchedModel}
                        artworkId={srcType === 'catalog' ? src.artworkId : null}
                        customImage={customImageProp}
                        printedName={printedName}
                        className="w-[148px]"
                        ariaLabel={`معاينة طباعة ${item.title} لموديل ${item.phoneModelName}`}
                      />
                    </div>

                    {/* Exact production specs — open typography directly on --gallery-white */}
                    <div className="min-w-0 space-y-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h4 className="text-[19px] font-bold text-[var(--charcoal)]">
                          <bdi dir="ltr">{item.title}</bdi>
                        </h4>
                        <span className="text-[15px] font-bold tabular-nums text-[var(--charcoal)]">
                          {item.unitPrice} {storeConfig.currencyLabel} × {item.quantity}
                        </span>
                      </div>

                      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-[14px] sm:grid-cols-2">
                        <div>
                          <dt className="type-caption text-[12px]">موديل الموبايل</dt>
                          <dd className="font-semibold text-[var(--charcoal)]">
                            <bdi dir="ltr">{item.phoneModelName}</bdi>
                            {spec.phoneModelStatus === 'pending' ? (
                              <span className="ms-2 text-[12px] font-semibold text-[var(--klein)]">
                                لسه بيتأكد
                              </span>
                            ) : null}
                          </dd>
                        </div>

                        <div>
                          <dt className="type-caption text-[12px]">الخامة</dt>
                          <dd className="font-medium text-[var(--charcoal)]">
                            {item.materialNameAr}
                          </dd>
                        </div>

                        {srcType === 'catalog' && src.artworkId ? (
                          <div>
                            <dt className="type-caption text-[12px]">كود التصميم</dt>
                            <dd className="font-medium text-[var(--charcoal)]">
                              <bdi dir="ltr">{src.artworkId}</bdi>
                            </dd>
                          </div>
                        ) : null}

                        {isCustomUpload && src.fileName ? (
                          <div>
                            <dt className="type-caption text-[12px]">اسم ملف الصورة</dt>
                            <dd className="font-medium text-[var(--charcoal)]">
                              <bdi dir="ltr" className="inline-block max-w-full truncate">
                                {src.fileName}
                              </bdi>
                            </dd>
                          </div>
                        ) : null}
                      </dl>

                      {/* Exact numeric transform coordinates for custom photo uploads */}
                      {isCustomUpload ? (
                        <div className="space-y-2 border-t border-[rgba(38,40,43,0.08)] pt-4">
                          <p className="type-caption text-[12px]">إحداثيات ضبط الصورة على الجراب</p>
                          <div className="grid grid-cols-2 gap-3 text-[14px] tabular-nums sm:grid-cols-4">
                            <div>
                              <span className="type-caption block text-[12px]">X</span>
                              <bdi dir="ltr" className="text-[16px] font-bold text-[var(--charcoal)]">
                                {Number(tf.x) || 0}%
                              </bdi>
                            </div>
                            <div>
                              <span className="type-caption block text-[12px]">Y</span>
                              <bdi dir="ltr" className="text-[16px] font-bold text-[var(--charcoal)]">
                                {Number(tf.y) || 0}%
                              </bdi>
                            </div>
                            <div>
                              <span className="type-caption block text-[12px]">التكبير</span>
                              <bdi dir="ltr" className="text-[16px] font-bold text-[var(--charcoal)]">
                                {Math.round((Number(tf.scale) || 1) * 100)}%
                              </bdi>
                            </div>
                            <div>
                              <span className="type-caption block text-[12px]">الدوران</span>
                              <bdi dir="ltr" className="text-[16px] font-bold text-[var(--charcoal)]">
                                {Number(tf.rotation) || 0}°
                              </bdi>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Printed Name specification */}
                      {printedName?.enabled && printedName?.text?.trim() ? (
                        <div className="space-y-1.5 border-t border-[rgba(38,40,43,0.08)] pt-4">
                          <p className="type-caption text-[12px]">الاسم المطبوع على الجراب</p>
                          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[14px]">
                            <span
                              dir={printedName.script === 'arabic' ? 'rtl' : 'ltr'}
                              style={{
                                fontFamily: printedName.fontFamily || undefined,
                                fontWeight: printedName.fontWeight || 700,
                              }}
                              className="text-[20px] text-[var(--charcoal)]"
                            >
                              {printedName.text}
                            </span>
                            <span className="type-caption text-[13px]">
                              اللغة: {printedName.script === 'arabic' ? 'عربي' : 'إنجليزي'}
                            </span>
                            <span className="type-caption text-[13px]">
                              المكان: {PLACEMENT_LABELS[printedName.placement] || printedName.placement}
                            </span>
                            <span className="type-caption text-[13px]">
                              لون الحبر: {printedName.ink === 'dark' ? 'غامق' : 'فاتح'}
                            </span>
                            {printedName.fontFamily ? (
                              <span className="type-caption text-[13px]">
                                الخط:{' '}
                                <bdi dir="ltr" className="font-medium text-[var(--charcoal)]">
                                  {printedName.fontFamily.replace(/['"]/g, '').split(',')[0]}
                                </bdi>
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      {/* Print-prep downloads (honest label: `نزل الصورة`, never `الصورة الخام`) */}
                      {isCustom ? (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex flex-wrap items-center gap-5">
                            {isCustomUpload && src.imageUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  downloadDataUrl(
                                    src.imageUrl,
                                    src.fileName || `${order.id}-item-${idx + 1}`
                                  )
                                }
                                className="btn-secondary !min-h-[44px] !text-[14px] font-semibold"
                              >
                                نزل الصورة
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => downloadPrintSpecJson(order, item, idx)}
                              className="btn-secondary !min-h-[44px] !text-[14px]"
                            >
                              نزل مواصفات الطباعة
                            </button>
                          </div>

                          {isCustomUpload ? (
                            <p className="type-caption text-[12px]">
                              الصورة محفوظة مضغوطة للمعاينة التجريبية؛ النسخة الأصلية تترفع على
                              تخزين الملفات عند ربط السيرفر.
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Pricing Breakdown — open editorial ledger supporting +50 EGP name fees */}
          <section
            aria-label="ملخص الحساب"
            className="border-t border-[var(--border-subtle)] pt-6"
          >
            <dl className="space-y-2 text-[15px] tabular-nums">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[var(--ink-muted)]">سعر الجرابات</dt>
                <dd className="font-semibold text-[var(--ink)]">
                  {pricingBreakdown?.designSubtotal ?? order.pricing.subtotal} {storeConfig.currencyLabel}
                </dd>
              </div>
              {pricingBreakdown && pricingBreakdown.namePrintFees > 0 ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-semibold text-[var(--ink)]">طباعة الأسماء</dt>
                  <dd className="font-semibold text-[var(--ink)]">
                    <bdi dir="ltr">+{pricingBreakdown.namePrintFees}</bdi> {storeConfig.currencyLabel}
                  </dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[var(--ink-muted)]">
                  الشحن ({order.customer.governorateNameAr})
                </dt>
                <dd className="font-semibold text-[var(--ink)]">
                  {order.pricing.shippingFee} {storeConfig.currencyLabel}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-2.5 text-[18px] font-bold">
                <dt className="text-[var(--ink)]">الإجمالي عند الاستلام</dt>
                <dd className="text-[var(--ink)]">
                  {order.pricing.total} {storeConfig.currencyLabel}
                </dd>
              </div>
            </dl>
          </section>

          {/* Internal Staff Notes (auto-saves onBlur) */}
          <section
            aria-label="ملاحظات الفريق الداخلية"
            className="space-y-2 border-t border-[rgba(38,40,43,0.1)] pt-6"
          >
            <div className="flex items-baseline justify-between gap-4">
              <label
                htmlFor="order-internal-notes"
                className="text-[15px] font-semibold text-[var(--charcoal)]"
              >
                ملاحظات داخلية للفريق
              </label>
              {notesSaved ? (
                <span role="status" className="type-caption text-[13px] text-[var(--graphite)]">
                  اتحفظ
                </span>
              ) : null}
            </div>
            <textarea
              id="order-internal-notes"
              rows={3}
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="اكتب ملاحظة عن مكالمة التأكيد أو شركة الشحن... بتتحفظ تلقائي أول ما تطلع من الخانة."
              className="field-input py-2.5"
            />
          </section>

          {/* Chronological Status History */}
          {Array.isArray(order.statusHistory) && order.statusHistory.length > 0 ? (
            <section
              aria-label="سجل تغييرات الحالة"
              className="space-y-3 border-t border-[rgba(38,40,43,0.1)] pt-6 pb-2"
            >
              <h3 className="text-[14px] font-semibold text-[var(--graphite)]">سجل الحالة</h3>
              <ol className="space-y-2.5">
                {order.statusHistory.map((entry, idx) => (
                  <li
                    key={`${entry.status}-${entry.at}-${idx}`}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-[14px]"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-semibold text-[var(--charcoal)]">
                        {getOrderStatusLabel(entry.status)}
                      </span>
                      {entry.note ? (
                        <span className="type-caption text-[13px]">{entry.note}</span>
                      ) : null}
                    </div>
                    <span className="type-caption text-[12px] tabular-nums">
                      <bdi dir="ltr">{formatDateTimeWestern(entry.at)}</bdi>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>
      ) : null}
    </SlideOverDrawer>
  );
}
