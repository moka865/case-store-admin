import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AdminHeader } from '../components/header/AdminHeader';
import { CheckIcon } from '../components/icons/Icons';
import { useAdmin } from '../context/AdminContext';

const EASE = [0.22, 1, 0.36, 1];

const OPS_ROUTES = ['/overview', '/orders', '/missing-models'];
const CATALOG_ROUTES = ['/products', '/categories', '/models', '/shipping'];

function getAdminPageTitle(pathname, brandName) {
  if (pathname === '/overview') return `المتابعة — إدارة ${brandName}`;
  if (pathname === '/orders') return `الطلبات — إدارة ${brandName}`;
  if (pathname === '/missing-models') return `الموديلات الناقصة — إدارة ${brandName}`;
  if (pathname === '/products') return `التصميمات — إدارة ${brandName}`;
  if (pathname === '/categories') return `الأقسام — إدارة ${brandName}`;
  if (pathname === '/models') return `الموديلات — إدارة ${brandName}`;
  if (pathname === '/shipping') return `الشحن والخامات — إدارة ${brandName}`;
  return `الصفحة مش موجودة — إدارة ${brandName}`;
}

export function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { role, storeConfig, notice } = useAdmin();
  const prefersReducedMotion = useReducedMotion();
  const isFirstMountRef = useRef(true);

  // Enforce role boundaries when switching demo roles or visiting disallowed paths
  useEffect(() => {
    if (role === 'ops' && CATALOG_ROUTES.includes(pathname)) {
      navigate('/overview', { replace: true });
    } else if (role === 'catalog' && OPS_ROUTES.includes(pathname)) {
      navigate('/products', { replace: true });
    }
  }, [role, pathname, navigate]);

  useEffect(() => {
    document.title = getAdminPageTitle(pathname, storeConfig.name);

    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
    requestAnimationFrame(() => {
      const heading = document.querySelector('main h1');
      if (heading instanceof HTMLElement) {
        heading.focus({ preventScroll: true });
      }
    });
  }, [pathname, storeConfig.name]);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--paper)] text-[var(--ink)]">
      <AdminHeader />

      {/* Quiet inline live-region feedback bar (zero floating SaaS toasts) */}
      <div aria-live="polite" className="page-container min-h-[28px] pt-2 text-start">
        {notice ? (
          <p className="inline-flex items-center gap-1.5 rounded-[var(--radius-ui)] border border-[var(--jade)]/20 bg-[var(--jade-tint)] px-3 py-1 text-[13.5px] font-bold text-[var(--jade)]">
            <CheckIcon className="h-3.5 w-3.5 shrink-0" />
            <span>{notice}</span>
          </p>
        ) : null}
      </div>

      <motion.main
        key={pathname}
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.15, ease: EASE }}
        className="flex-1 pb-16 sm:pb-20"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
