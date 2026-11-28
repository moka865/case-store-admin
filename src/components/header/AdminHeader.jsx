import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link, NavLink } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { ADMIN_ROLES, DEMO_ROLE_SWITCHER } from '../../services/adminService';
import { BrandLogo } from '../brand/BrandLogo';

const OPS_NAV = [
  { to: '/overview', label: 'المتابعة', badgeKey: null },
  { to: '/orders', label: 'الطلبات', badgeKey: 'pendingOrders' },
  { to: '/missing-models', label: 'الموديلات الناقصة', badgeKey: 'openMissing' },
];

const CATALOG_NAV = [
  { to: '/products', label: 'التصميمات', badgeKey: null },
  { to: '/categories', label: 'الأقسام', badgeKey: null },
  { to: '/models', label: 'الموديلات', badgeKey: null },
  { to: '/shipping', label: 'الشحن والخامات', badgeKey: null },
];

const EASE = [0.22, 1, 0.36, 1];

/**
 * Sticky Brand Header aligned 1:1 with the official غلاف storefront:
 * - Main `#010000` (`--brand-black`) bar seamlessly framing the official logo
 * - Crimson + Gold `4px` brand accent line along the bottom edge
 * - High-contrast `#FECE05` active nav indicator & role badge
 */
export function AdminHeader() {
  const {
    role,
    setRole,
    storeConfig,
    orders,
    missingModelRequests,
    resetCatalogToDefaults,
    resetOperationsToDefaults,
    exportCatalogJson,
  } = useAdmin();

  const [resetPopoverOpen, setResetPopoverOpen] = useState(false);
  const resetBoxRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const showOps = role === 'manager' || role === 'ops';
  const showCatalog = role === 'manager' || role === 'catalog';
  const homeRoute = role === 'catalog' ? '/products' : '/overview';

  const navCounts = useMemo(
    () => ({
      pendingOrders: orders.filter((o) => o.status === 'pending_confirmation').length,
      openMissing: missingModelRequests.filter(
        (r) => r.status === 'pending_confirmation' || r.status === 'contacted'
      ).length,
    }),
    [orders, missingModelRequests]
  );

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
    <header className="sticky top-0 z-30">
      <div className="brand-dark-bar bg-[var(--brand-black)] text-white">
        <div className="page-container">
          {/* Row 1: Official غلاف Logo + Workspace Tag + Role Switcher (start) | Utilities (end) */}
          <div className="flex min-h-[56px] sm:min-h-[60px] flex-nowrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-3.5">
              <Link
                to={homeRoute}
                aria-label={`${storeConfig.name} — إدارة المتجر`}
                className="inline-flex min-h-[44px] shrink-0 items-center rounded-[var(--radius-ui)] py-1"
              >
                <BrandLogo size="sm" className="lg:!h-10" />
              </Link>

              <span className="hidden whitespace-nowrap rounded-[6px] border border-white/15 bg-white/8 px-2 py-0.5 text-[12px] font-semibold text-white/85 sm:inline-flex">
                إدارة المتجر
              </span>

              {DEMO_ROLE_SWITCHER ? (
                <div className="min-w-0">
                  <label htmlFor="demo-role-select" className="sr-only">
                    تبديل صلاحية العرض (تجريبي)
                  </label>
                  <select
                    id="demo-role-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="min-h-[38px] max-w-[116px] truncate rounded-[var(--radius-ui)] border border-white/20 bg-white/10 px-2 text-[12px] font-semibold text-white cursor-pointer sm:max-w-none sm:px-3 sm:text-[13.5px]"
                  >
                    {ADMIN_ROLES.map((r) => (
                      <option key={r.id} value={r.id} className="bg-white text-[var(--ink)]">
                        {r.labelAr}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
              {showCatalog ? (
                <button
                  type="button"
                  onClick={exportCatalogJson}
                  aria-label="نزل نسخة الكتالوج JSON"
                  className="inline-flex min-h-[38px] sm:min-h-[40px] items-center rounded-[var(--radius-ui)] border border-white/18 bg-white/8 px-2.5 sm:px-3 text-[12px] sm:text-[13.5px] font-semibold text-white transition-colors hover:bg-white/15 cursor-pointer"
                >
                  <span className="sm:hidden">JSON</span>
                  <span className="hidden sm:inline">نزل JSON</span>
                </button>
              ) : null}

              <div ref={resetBoxRef} className="relative">
                <button
                  type="button"
                  aria-expanded={resetPopoverOpen}
                  aria-label="رجع البيانات الأصلية"
                  onClick={() => setResetPopoverOpen((prev) => !prev)}
                  className={`inline-flex min-h-[38px] sm:min-h-[40px] items-center whitespace-nowrap rounded-[var(--radius-ui)] px-2 sm:px-2.5 text-[12px] sm:text-[13.5px] font-semibold text-white/85 underline decoration-white/35 underline-offset-4 transition-colors hover:text-[var(--brand-yellow)] cursor-pointer ${
                    resetPopoverOpen ? 'bg-white/15 text-[var(--brand-yellow)]' : ''
                  }`}
                >
                  رجع الأصل
                </button>

                <AnimatePresence>
                  {resetPopoverOpen ? (
                    <motion.div
                      role="dialog"
                      aria-label="اختيار البيانات المطلوب استرجاعها للأصل"
                      initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: EASE }}
                      style={{ boxShadow: 'var(--shadow-panel)' }}
                      className="surface-light-panel absolute end-0 top-[calc(100%+10px)] z-40 w-[308px] max-w-[calc(100vw-32px)] space-y-4 rounded-[var(--radius-stage)] border border-[var(--border-strong)] bg-[var(--surface)] p-4 text-start text-[var(--ink)]"
                    >
                      {showCatalog ? (
                        <div className="space-y-2">
                          <p className="text-[14px] font-bold text-[var(--ink)]">
                            بيانات الكتالوج
                          </p>
                          <p className="type-caption text-[13px]">
                            يمسح تعديلات التصميمات والأقسام والموديلات والخامات ومصاريف الشحن فقط.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              resetCatalogToDefaults();
                              setResetPopoverOpen(false);
                            }}
                            className="btn-secondary !min-h-[40px] !text-[14px] font-bold text-[var(--brand)]"
                          >
                            رجع الكتالوج للأصل
                          </button>
                        </div>
                      ) : null}

                      {showOps ? (
                        <div className="space-y-2">
                          <p className="text-[14px] font-bold text-[var(--ink)]">
                            الطلبات والموديلات الناقصة
                          </p>
                          <p className="type-caption text-[13px]">
                            يمسح الأوردرات المستوردة والمعدلة وصورها المحفوظة وطلبات الموديلات
                            الناقصة، ويرجع البيانات التجريبية.
                          </p>
                          <button
                            type="button"
                            onClick={async () => {
                              await resetOperationsToDefaults();
                              setResetPopoverOpen(false);
                            }}
                            className="btn-secondary !min-h-[40px] !text-[14px] font-bold text-[var(--brand)]"
                          >
                            رجع الطلبات والطلبات الناقصة
                          </button>
                        </div>
                      ) : null}

                      <div className="border-t border-[var(--border-subtle)] pt-2">
                        <button
                          type="button"
                          onClick={() => setResetPopoverOpen(false)}
                          className="btn-secondary !min-h-[38px] !text-[13px] text-[var(--ink-muted)]"
                        >
                          إغلاق
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Row 2: Role-filtered Navigation Strip inside `#010000` */}
          <nav
            aria-label="أقسام لوحة التحكم"
            className="no-scrollbar flex items-center gap-4 overflow-x-auto border-t border-white/12 sm:gap-6"
          >
            {showOps
              ? OPS_NAV.map((item) => {
                  const badgeCount = item.badgeKey ? navCounts[item.badgeKey] || 0 : 0;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `relative inline-flex min-h-[44px] shrink-0 items-center gap-2 px-1 text-[14px] transition-colors duration-150 sm:text-[15px] ${
                          isActive
                            ? 'font-bold text-white after:absolute after:inset-x-0 after:bottom-0 after:h-[2.5px] after:rounded-full after:bg-[var(--brand-yellow)]'
                            : 'font-medium text-white/75 hover:text-white'
                        }`
                      }
                    >
                      <span>{item.label}</span>
                      {badgeCount > 0 ? (
                        <span className="min-w-[20px] rounded-[6px] bg-[var(--brand-yellow)] px-1.5 text-center text-[11.5px] font-extrabold leading-[18px] tabular-nums text-[var(--ink)]">
                          {badgeCount}
                        </span>
                      ) : null}
                    </NavLink>
                  );
                })
              : null}

            {showCatalog
              ? CATALOG_NAV.map((item, idx) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `relative inline-flex min-h-[44px] shrink-0 items-center px-1 text-[14px] transition-colors duration-150 sm:text-[15px] ${
                        showOps && idx === 0
                          ? 'ms-3 border-s border-white/15 ps-4 sm:ms-4 sm:ps-6'
                          : ''
                      } ${
                        isActive
                          ? 'font-bold text-white after:absolute after:inset-x-0 after:bottom-0 after:h-[2.5px] after:rounded-full after:bg-[var(--brand-yellow)]'
                          : 'font-medium text-white/75 hover:text-white'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))
              : null}
          </nav>
        </div>
      </div>

      {/* Signature Crimson + Gold 4px Brand Rule */}
      <div className="flex h-1 w-full" aria-hidden="true">
        <span className="w-2/3 bg-[var(--brand)]" />
        <span className="w-1/3 bg-[var(--brand-yellow)]" />
      </div>
    </header>
  );
}
