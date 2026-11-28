import { Link } from 'react-router-dom';
import {
  AlertCircleIcon,
  CashCodIcon,
  ClockIcon,
  ForwardArrowRtlIcon,
  PrinterIcon,
  TruckIcon,
} from '../icons/Icons';

/**
 * 4 Operational KPI Cards strictly backed by real AdminContext order metrics.
 * Zero invented trend deltas or fake historical percentages.
 */
export function DashboardKpiStrip({ metrics, currencyLabel = 'ج.م' }) {
  const {
    pendingOrdersCount,
    pendingModelBlockedCount,
    pendingDepositCount,
    printingOrdersCount,
    printingPiecesCount,
    printingCustomCount,
    printingWithNameCount,
    shippedOrdersCount,
    shippedCodAmount,
    deliveredOrdersCount,
    deliveredRevenue,
    deliveredNameFees,
    returnedCount,
    cancelledCount,
  } = metrics;

  const cards = [
    {
      id: 'pending',
      title: 'مستني تأكيد',
      to: '/orders?status=pending_confirmation',
      value: String(pendingOrdersCount),
      unit: pendingOrdersCount === 1 ? 'أوردر' : 'أوردرات',
      Icon: ClockIcon,
      iconWrapClass: 'bg-[var(--brand-black)] text-[var(--brand-yellow)]',
      subline:
        pendingOrdersCount === 0
          ? 'مفيش مكالمات تأكيد متأخرة دلوقتي'
          : `${pendingDepositCount} محتاج ديبوزت قبل الطباعة`,
      alertText:
        pendingModelBlockedCount > 0
          ? `${pendingModelBlockedCount} موقف لعدم تأكيد الموديل`
          : null,
    },
    {
      id: 'printing',
      title: 'قيد الطباعة',
      to: '/orders?status=printing',
      value: String(printingOrdersCount),
      unit: printingOrdersCount === 1 ? 'أوردر' : 'أوردرات',
      Icon: PrinterIcon,
      iconWrapClass: 'bg-[var(--card-bg)] text-[var(--ink)]',
      subline: `${printingPiecesCount} قطعة في المطبعة · ${printingCustomCount} مخصص`,
      secondaryNote:
        printingWithNameCount > 0 ? `${printingWithNameCount} بطباعة اسم` : null,
    },
    {
      id: 'shipped',
      title: 'مع الشحن (تحصيل كاش)',
      to: '/orders?status=shipped',
      value: String(shippedCodAmount),
      unit: currencyLabel,
      Icon: TruckIcon,
      iconWrapClass: 'bg-[var(--brand-yellow-tint)] text-[var(--ink)]',
      subline: `${shippedOrdersCount} ${shippedOrdersCount === 1 ? 'شحنة' : 'شحنات'} في الطريق عند الاستلام`,
    },
    {
      id: 'delivered',
      title: 'إجمالي المسلم',
      to: '/orders?status=delivered',
      value: String(deliveredRevenue),
      unit: currencyLabel,
      Icon: CashCodIcon,
      iconWrapClass: 'bg-[var(--jade-tint)] text-[var(--jade)]',
      subline: `${deliveredOrdersCount} ${
        deliveredOrdersCount === 1 ? 'أوردر متحصل كاش' : 'أوردرات متحصلة كاش'
      }${deliveredNameFees > 0 ? ` · منها ${deliveredNameFees} ${currencyLabel} أسماء` : ''}`,
      secondaryNote:
        returnedCount + cancelledCount > 0
          ? `${returnedCount} مرتجع · ${cancelledCount} ملغي`
          : null,
    },
  ];

  return (
    <section aria-label="ملخص التشغيل اليومي">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.Icon;
          return (
            <Link
              key={card.id}
              to={card.to}
              className="group flex flex-col justify-between rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 text-start transition-colors hover:border-[var(--border-strong)]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-ui)] ${card.iconWrapClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--ink-muted)] group-hover:text-[var(--brand)]">
                    <span>افتح</span>
                    <ForwardArrowRtlIcon className="h-3.5 w-3.5" />
                  </span>
                </div>

                <h2 className="mt-4 text-[14px] font-bold text-[var(--ink-muted)]">{card.title}</h2>

                <p className="mt-1 flex items-baseline gap-1.5 font-[family-name:var(--font-display)] text-[28px] font-extrabold leading-tight tabular-nums text-[var(--ink)]">
                  <span>{card.value}</span>
                  <span className="text-[14px] font-semibold text-[var(--ink-muted)]">
                    {card.unit}
                  </span>
                </p>
              </div>

              <div className="mt-3 space-y-1.5 border-t border-[var(--border-subtle)] pt-3">
                <p className="text-[13px] font-medium leading-[1.55] text-[var(--ink-muted)] tabular-nums">
                  {card.subline}
                </p>

                {card.alertText ? (
                  <p className="inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--brand-tint)] px-2 py-0.5 text-[12px] font-bold text-[var(--brand)] tabular-nums">
                    <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>{card.alertText}</span>
                  </p>
                ) : null}

                {card.secondaryNote ? (
                  <p className="text-[12px] font-semibold text-[var(--ink-muted)] tabular-nums">
                    {card.secondaryNote}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
