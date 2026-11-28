import { useRef, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { UploadIcon } from '../icons/Icons';

/**
 * Unified versioned JSON import entry point for storefront handoff files.
 * Shared across `/overview`, `/orders`, and `/missing-models` — merges both orders
 * and missing-model requests by ID without duplicates and reports exact counts.
 */
export function HandoffImportButton({ label = 'استورد ملف JSON', variant = 'secondary' }) {
  const { importHandoffJson } = useAdmin();
  const inputRef = useRef(null);
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setBusy(true);
    setReport(null);
    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        setReport({ ok: false, message: 'الملف ده مش JSON صالح. اختار ملف متصدر من متجر غلاف.' });
        return;
      }

      const res = await importHandoffJson(parsed);
      if (!res.ok) {
        setReport({ ok: false, message: res.error });
        return;
      }

      const parts = [];
      if (res.addedOrders > 0) parts.push(`اتضاف ${res.addedOrders} أوردر`);
      if (res.skippedOrders > 0) parts.push(`اتخطى ${res.skippedOrders} أوردر مكرر`);
      if (res.addedRequests > 0) parts.push(`اتضاف ${res.addedRequests} طلب موديل`);
      if (res.skippedRequests > 0) parts.push(`اتخطى ${res.skippedRequests} طلب موديل مكرر`);

      setReport({
        ok: true,
        message: parts.length > 0 ? parts.join(' — ') : 'مفيش سجلات جديدة للاستيراد.',
      });
    } finally {
      setBusy(false);
    }
  };

  const buttonClass =
    variant === 'outline'
      ? 'btn-outline !min-h-[44px] !text-[14px]'
      : 'btn-secondary !min-h-[44px] !text-[14.5px]';

  return (
    <div className="flex flex-col items-start gap-1.5 text-start sm:items-end">
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        className="sr-only"
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className={buttonClass}
      >
        {variant === 'outline' ? <UploadIcon className="h-4 w-4 shrink-0" /> : null}
        <span>{busy ? 'جاري الاستيراد...' : label}</span>
      </button>

      {report ? (
        <p
          role="status"
          className={`text-[13px] font-semibold ${
            report.ok ? 'text-[var(--jade)]' : 'text-[var(--brand)]'
          }`}
        >
          {report.message}
        </p>
      ) : null}
    </div>
  );
}
