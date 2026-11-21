/**
 * Start-aligned focusable page heading with optional live Western count.
 */
export function PageHeading({ title, count = null, description = null, action = null }) {
  return (
    <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
      <div className="max-w-[56ch] text-start">
        <div className="flex items-baseline gap-3">
          <h1 tabIndex={-1} className="type-h1 text-[var(--charcoal)] outline-none">
            {title}
          </h1>
          {count !== null && count !== undefined ? (
            <span className="type-caption text-[18px] font-semibold tabular-nums text-[var(--graphite)]">
              {count}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="type-body mt-2 text-[var(--graphite)]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
