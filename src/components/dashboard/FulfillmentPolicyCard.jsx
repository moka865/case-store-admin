import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { CashCodIcon, ForwardArrowRtlIcon } from '../icons/Icons';

/**
 * COD Shipping Coverage, Store Pricing Constants, Material & Terms Policy Summary.
 * Backed live by `governorates`, `materials`, and `storeConfig`.
 */
export function FulfillmentPolicyCard({ metrics }) {
  const { role, storeConfig } = useAdmin();
  const { fulfillment } = metrics;
  const isManager = role === 'manager';

  const defaultMat =
    fulfillment.activeMaterials.find((m) => m.isDefault) || fulfillment.activeMaterials[0];

  return (
    <section
      aria-labelledby="dashboard-fulfillment-heading"
      className="rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 text-start"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-ui)] bg-[var(--jade-tint)] text-[var(--jade)]">
            <CashCodIcon className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 id="dashboard-fulfillment-heading" className="type-h3 !text-[17px] text-[var(--ink)]">
              الشحن وسياسات المتجر
            </h2>
            <p className="type-caption text-[12.5px]">{storeConfig.paymentLabelAr}</p>
          </div>
        </div>

        {isManager ? (
          <Link to="/shipping" className="btn-secondary !min-h-[36px] shrink-0 !text-[13px]">
            <span>تعديل</span>
            <ForwardArrowRtlIcon className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <dl className="mt-4 space-y-2.5 text-[13.5px] tabular-nums">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--ink-muted)]">المحافظات المتاحة (كاش)</dt>
          <dd className="font-bold text-[var(--ink)]">
            {fulfillment.codActiveGovernoratesCount} / {fulfillment.totalGovernoratesCount}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--ink-muted)]">نطاق مصاريف الشحن</dt>
          <dd className="font-bold text-[var(--ink)]">
            {fulfillment.minShippingFee}–{fulfillment.maxShippingFee} {storeConfig.currencyLabel}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--ink-muted)]">سعر التصميم المخصص</dt>
          <dd className="font-bold text-[var(--ink)]">
            {storeConfig.customCasePrice} {storeConfig.currencyLabel}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--ink-muted)]">رسوم طباعة الاسم</dt>
          <dd className="font-bold text-[var(--ink)]">
            <bdi dir="ltr">+{storeConfig.namePrintFee || 50}</bdi> {storeConfig.currencyLabel}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--ink-muted)]">مدة التنفيذ (الحد الأقصى)</dt>
          <dd className="font-bold text-[var(--ink)]">
            {storeConfig.productionDays} أيام (حتى {storeConfig.maxProductionDays || 7} أيام)
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--ink-muted)]">قاعدة الديبوزت</dt>
          <dd className="font-bold text-[var(--ink)]">
            {storeConfig.depositMinItems || 4} قطع فأكثر أو مخصص
          </dd>
        </div>

        {defaultMat ? (
          <div className="flex items-baseline justify-between gap-3 border-t border-[var(--border-subtle)] pt-2.5">
            <dt className="text-[var(--ink-muted)]">الخامة الأساسية</dt>
            <dd className="font-bold text-[var(--ink)]">{defaultMat.nameAr}</dd>
          </div>
        ) : null}
      </dl>

      {fulfillment.codDisabledGovernorates.length > 0 ? (
        <p className="mt-3 rounded-[var(--radius-ui)] bg-[var(--paper)] px-3 py-2 text-[12.5px] text-[var(--ink-muted)]">
          موقوف الدفع عند الاستلام:{' '}
          <span className="font-semibold text-[var(--ink)]">
            {fulfillment.codDisabledGovernorates.map((g) => g.nameAr).join('، ')}
          </span>
        </p>
      ) : null}
    </section>
  );
}
