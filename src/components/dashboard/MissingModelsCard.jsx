import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import {
  getMissingModelStatusLabel,
  toWhatsappUrl,
} from '../../contracts/handoffSchema';
import { ForwardArrowRtlIcon, PhoneHardwareIcon, WhatsappIcon } from '../icons/Icons';

/**
 * Open Missing-Model Requests triage card ("موبايلي مش في القايمة" storefront requests).
 */
export function MissingModelsCard({ metrics }) {
  const { updateMissingModelRequest } = useAdmin();
  const { openMissingRequests, linkedMissingRequestIds } = metrics;
  const visible = openMissingRequests.slice(0, 4);

  return (
    <section
      aria-labelledby="dashboard-missing-models-heading"
      className="rounded-[var(--radius-stage)] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 text-start"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-ui)] bg-[var(--brand-black)] text-[var(--brand-yellow)]">
            <PhoneHardwareIcon className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 id="dashboard-missing-models-heading" className="type-h3 !text-[17px] text-[var(--ink)]">
              طلبات الموديلات الناقصة
            </h2>
            <p className="type-caption text-[12.5px] tabular-nums">
              {openMissingRequests.length} طلب مستني مراجعة
            </p>
          </div>
        </div>

        <Link
          to="/missing-models"
          className="btn-secondary !min-h-[36px] shrink-0 !text-[13px]"
        >
          <span>الكل</span>
          <ForwardArrowRtlIcon className="h-3.5 w-3.5" />
        </Link>
      </div>

      {visible.length > 0 ? (
        <ul className="mt-4 divide-y divide-[var(--border-subtle)]">
          {visible.map((req) => {
            const hasLinkedOrder = linkedMissingRequestIds.has(req.id);
            const isPendingReply = req.status === 'pending_confirmation';
            return (
              <li key={req.id} className="space-y-2 py-3 first:pt-1 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-bold text-[var(--ink)]">
                      <bdi dir="ltr" className="latin-title">{req.phoneName}</bdi>
                    </p>
                    <p className="type-caption mt-0.5 flex flex-wrap items-center gap-x-2 text-[12.5px]">
                      <bdi dir="ltr" className="tabular-nums font-medium">{req.mobileNumber}</bdi>
                      <span>·</span>
                      <span>{getMissingModelStatusLabel(req.status)}</span>
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-[6px] px-2 py-0.5 text-[11.5px] font-bold ${
                      isPendingReply
                        ? 'bg-[var(--brand-yellow-tint)] text-[var(--ink)]'
                        : 'bg-[var(--card-bg)] text-[var(--ink-muted)]'
                    }`}
                  >
                    {getMissingModelStatusLabel(req.status)}
                  </span>
                </div>

                {hasLinkedOrder ? (
                  <p className="text-[12px] font-bold text-[var(--brand)]">
                    مربوط بأوردر مستني تأكيد المقاس
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={toWhatsappUrl(req.mobileNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[32px] items-center gap-1 rounded-[6px] border border-[var(--jade)]/25 bg-[var(--jade-tint)] px-2.5 text-[12px] font-bold text-[var(--jade)] hover:border-[var(--jade)]"
                  >
                    <WhatsappIcon className="h-3.5 w-3.5" />
                    <span>تواصل واتساب</span>
                  </a>

                  {isPendingReply ? (
                    <button
                      type="button"
                      onClick={() => updateMissingModelRequest(req.id, { status: 'contacted' })}
                      className="btn-outline !min-h-[32px] !px-2.5 !text-[12px]"
                    >
                      تم التواصل
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 rounded-[var(--radius-ui)] bg-[var(--paper)] p-3.5 text-[13.5px] text-[var(--ink-muted)]">
          مفيش طلبات موديلات ناقصة مستنية رد دلوقتي.
        </p>
      )}
    </section>
  );
}
