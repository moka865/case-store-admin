import { useState } from 'react';

/**
 * Inline two-step destructive confirmation (never uses window.confirm).
 */
export function InlineConfirmDelete({
  label = 'امسح',
  confirmLabel = 'تأكيد المسح',
  onConfirm,
  disabled = false,
  ariaTarget = '',
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex flex-wrap items-center gap-3">
        <span className="type-caption text-[13px] text-[var(--charcoal)]">متأكد؟</span>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            onConfirm();
          }}
          className="btn-secondary !min-h-[44px] !text-[14px] font-semibold text-[var(--klein)]"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="btn-secondary !min-h-[44px] !text-[14px] text-[var(--graphite)]"
        >
          إلغاء
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaTarget ? `${label} ${ariaTarget}` : label}
      onClick={() => setConfirming(true)}
      className="btn-secondary !min-h-[44px] !text-[14px] text-[var(--graphite)]"
    >
      {label}
    </button>
  );
}
