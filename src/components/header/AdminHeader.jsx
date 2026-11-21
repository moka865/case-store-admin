import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link, NavLink } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

const CATALOG_NAV_ITEMS = [
  { to: '/products', label: 'التصميمات' },
  { to: '/categories', label: 'الأقسام' },
  { to: '/models', label: 'الموديلات' },
  { to: '/shipping', label: 'الشحن والخامات' },
];

const EASE = [0.22, 1, 0.36, 1];

/**
 * Sticky plaster admin shell (`غلاف — إدارة الكتالوج`).
 * Row 1 fits cleanly on one line at 390px; Row 2 shows all 4 routes unclipped.
 */
export function AdminHeader() {
  const { storeConfig, resetToDefaults, exportCatalogJson } = useAdmin();
  const [resetPopoverOpen, setResetPopoverOpen] = useState(false);
  const resetBoxRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!resetPopoverOpen) return;
    const onPointerDown = (e) => {
      if (resetBoxRef.current && !resetBoxRef.current.contains(e.target)) {
        setResetPopoverOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setResetPopoverOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [resetPopoverOpen]);

  return (
    <header className="sticky top-0 z-30 bg-[var(--plaster)]">
      <div className="page-container flex flex-wrap items-center justify-between gap-x-2 gap-y-0 pt-2 pb-1 lg:min-h-[76px] lg:flex-nowrap lg:gap-x-4 lg:py-0">
        {/* Inline-start (right): Brand + quiet workspace identifier */}
        <Link
          to="/products"
          className="order-1 inline-flex min-h-[44px] shrink-0 items-baseline gap-2 text-[var(--charcoal)]"
        >
          <span className="text-[22px] font-bold leading-none sm:text-[26px]">
            {storeConfig.name}
          </span>
          <span className="type-caption text-[12px] sm:text-[14px]">إدارة الكتالوج</span>
        </Link>

        {/* Primary nav — right after brand in DOM for strict RTL Tab order */}
        <nav
          aria-label="أقسام لوحة التحكم"
          className="order-3 no-scrollbar flex w-full items-center justify-between gap-3 overflow-x-auto pb-1 sm:justify-start sm:gap-7 lg:order-2 lg:w-auto lg:overflow-visible lg:pb-0 lg:ms-8 lg:me-auto"
        >
          {CATALOG_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `inline-flex min-h-[44px] shrink-0 items-center rounded-[4px] px-0.5 text-[14px] transition-colors duration-150 sm:px-1 sm:text-[16px] ${
                  isActive
                    ? 'font-semibold text-[var(--charcoal)] underline decoration-[var(--klein)] decoration-2 underline-offset-[8px]'
                    : 'font-medium text-[var(--graphite)] hover:text-[var(--charcoal)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Inline-end (physical left): Quiet data utilities (compact on 390px so Row 1 never wraps) */}
        <div className="order-2 flex shrink-0 items-center gap-3 sm:gap-5 lg:order-3">
          <button
            type="button"
            onClick={exportCatalogJson}
            aria-label="نزّل نسخة JSON"
            className="btn-secondary !min-h-[44px] !text-[13px] text-[var(--graphite)] sm:!text-[14px]"
          >
            <span className="sm:hidden">JSON</span>
            <span className="hidden sm:inline">نزّل JSON</span>
          </button>

          <div ref={resetBoxRef} className="relative">
            <button
              type="button"
              aria-expanded={resetPopoverOpen}
              aria-label="رجّع البيانات الأصلية"
              onClick={() => setResetPopoverOpen((prev) => !prev)}
              className={`btn-secondary !min-h-[44px] !text-[13px] text-[var(--graphite)] sm:!text-[14px] ${
                resetPopoverOpen ? 'is-selected rounded-[4px] !px-2' : ''
              }`}
            >
              <span className="sm:hidden">رجّع الأصل</span>
              <span className="hidden sm:inline">رجّع البيانات الأصلية</span>
            </button>

            <AnimatePresence>
              {resetPopoverOpen ? (
                <motion.div
                  role="dialog"
                  aria-label="تأكيد استرجاع البيانات الأصلية"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="absolute end-0 top-[calc(100%+8px)] z-40 w-[280px] max-w-[calc(100vw-32px)] rounded-[4px] border border-[rgba(38,40,43,0.18)] bg-[var(--gallery-white)] p-4 text-start"
                >
                  <p className="text-[14px] leading-[1.6] font-medium text-[var(--charcoal)]">
                    ده هيمسح أي تعديلات محفوظة ويرجّع التصميمات والأقسام والموديلات والأسعار للأصل.
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        resetToDefaults();
                        setResetPopoverOpen(false);
                      }}
                      className="btn-primary !min-h-[40px] !px-4 !text-[14px]"
                    >
                      رجّع الأصل
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetPopoverOpen(false)}
                      className="btn-secondary !min-h-[40px] !text-[14px] text-[var(--graphite)]"
                    >
                      إلغاء
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
