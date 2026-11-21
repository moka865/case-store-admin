import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CloseIcon } from '../icons/Icons';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Reusable gallery-white slide-over drawer.
 * - Desktop: slides in from inline-end (`end-0`, physical left in RTL)
 * - Mobile: full-height bottom sheet
 * Solid charcoal scrim (no glassmorphism/blur), Escape to close.
 */
export function SlideOverDrawer({
  open,
  onClose,
  title,
  widthClass = 'md:max-w-[740px]',
  children,
  footer = null,
}) {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );
  const closeBtnRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(() => closeBtnRef.current?.focus());

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const panelInitial = prefersReducedMotion
    ? { opacity: 0 }
    : isMobile
      ? { y: '100%' }
      : { x: '-100%' };
  const panelAnimate = prefersReducedMotion ? { opacity: 1 } : isMobile ? { y: 0 } : { x: 0 };

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Matte charcoal scrim — zero blur/glassmorphism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            onClick={onClose}
            className="fixed inset-0 bg-[#26282B]/35"
          />

          <motion.aside
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelInitial}
            transition={{ duration: 0.24, ease: EASE }}
            className={`fixed z-50 flex flex-col bg-[var(--gallery-white)] text-start ${
              isMobile
                ? 'inset-x-0 bottom-0 top-6 rounded-t-[4px]'
                : `inset-y-0 end-0 w-full ${widthClass}`
            }`}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-4 px-5 pt-4 pb-3 sm:px-7 sm:pt-6">
              <h2 className="type-h3 min-w-0 truncate text-[var(--charcoal)]">{title}</h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="إغلاق اللوحة"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] text-[var(--graphite)] hover:text-[var(--charcoal)] cursor-pointer"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 sm:px-7">{children}</div>

            {/* Optional sticky footer */}
            {footer ? (
              <div className="shrink-0 bg-[var(--plaster)]/55 px-5 py-4 sm:px-7">{footer}</div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
