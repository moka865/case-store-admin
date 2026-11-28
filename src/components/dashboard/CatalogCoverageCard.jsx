import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { AlertCircleIcon, ForwardArrowRtlIcon, LayersIcon } from '../icons/Icons';

/**
 * Storefront Catalog & Phone Model Coverage Summary:
 * - Active vs hidden catalog designs across the 6 storefront categories
 * - Brand & phone-model coverage highlighting any uncovered models (`0` compatible designs)
 * - Catalog action links render strictly for `manager` role to respect AdminLayout guards
 */
export function CatalogCoverageCard({ metrics }) {
  const { role } = useAdmin();
  const { catalog } = metrics;
  const maxCatCount = Math.max(1, ...catalog.categoryBreakdown.map((c) => c.totalCount));
  const isManager = role === 'manager';

  return (
    <section
      aria-labelledby="dashboard-catalog-heading"
      className="rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 text-start"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-ui)] bg-[var(--card-bg)] text-[var(--ink)]">
            <LayersIcon className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 id="dashboard-catalog-heading" className="type-h3 !text-[17px] text-[var(--ink)]">
              تغطية الكتالوج والموديلات
            </h2>
            <p className="type-caption text-[12.5px] tabular-nums">
              {catalog.activeProductsCount} تصميم متاح · {catalog.totalModelsCount} موديل
            </p>
          </div>
        </div>

        {isManager ? (
          <Link to="/products" className="btn-secondary !min-h-[36px] shrink-0 !text-[13px]">
            <span>التصميمات</span>
            <ForwardArrowRtlIcon className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      {/* Headline numbers */}
      <dl className="mt-4 grid grid-cols-3 gap-2 rounded-[var(--radius-ui)] bg-[var(--paper)] p-3 text-center tabular-nums">
        <div>
          <dt className="type-caption text-[11.5px]">المتاح</dt>
          <dd className="text-[18px] font-extrabold text-[var(--ink)]">
            {catalog.activeProductsCount}
          </dd>
        </div>
        <div className="border-x border-[var(--border-subtle)]">
          <dt className="type-caption text-[11.5px]">في الهيرو</dt>
          <dd className="text-[18px] font-extrabold text-[var(--ink)]">
            {catalog.heroProductsCount}
          </dd>
        </div>
        <div>
          <dt className="type-caption text-[11.5px]">المخفي</dt>
          <dd className="text-[18px] font-extrabold text-[var(--ink-muted)]">
            {catalog.hiddenProductsCount}
          </dd>
        </div>
      </dl>

      {/* Category breakdown */}
      <ul className="mt-4 space-y-2.5">
        {catalog.categoryBreakdown.map((cat) => (
          <li key={cat.id} className="space-y-1">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-[var(--ink)]">{cat.nameAr}</span>
              <span className="type-caption text-[12px] tabular-nums">
                {cat.activeCount} متاح
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--card-bg)]" aria-hidden="true">
              <div
                style={{ width: `${Math.round((cat.activeCount / maxCatCount) * 100)}%` }}
                className="h-full rounded-full bg-[var(--ink)]"
              />
            </div>
          </li>
        ))}
      </ul>

      {/* Uncovered Models Alert (e.g. Tecno Pop 8 with 0 compatible designs) */}
      {catalog.uncoveredModels.length > 0 ? (
        <div className="mt-4 rounded-[var(--radius-ui)] border border-[var(--ink)]/20 bg-[var(--brand-yellow-tint)] p-3.5">
          <p className="flex items-center gap-1.5 text-[13px] font-bold text-[var(--ink)]">
            <AlertCircleIcon className="h-4 w-4 shrink-0 text-[var(--brand)]" />
            <span>
              موديلات ملهاش تصميمات ({catalog.uncoveredModels.length})
            </span>
          </p>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-[var(--ink)]">
            الموديلات دي ظاهرة للعملاء لكن مفهاش تصميمات جاهزة حاليا:{' '}
            <bdi dir="ltr" className="latin-title font-bold">
              {catalog.uncoveredModels.map((m) => m.name).join('، ')}
            </bdi>
          </p>
          {isManager ? (
            <Link
              to="/models"
              className="btn-secondary mt-1.5 !min-h-[34px] !text-[12.5px] font-bold text-[var(--brand)]"
            >
              راجع الموديلات والتغطية
            </Link>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 rounded-[var(--radius-ui)] bg-[var(--jade-tint)] px-3 py-2 text-[12.5px] font-bold text-[var(--jade)]">
          كل الموديلات متغطية بتصميمات متاحة في المتجر.
        </p>
      )}
    </section>
  );
}
