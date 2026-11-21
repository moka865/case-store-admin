import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminHeader } from '../components/header/AdminHeader';
import { useAdmin } from '../context/AdminContext';

const EASE = [0.22, 1, 0.36, 1];

function getAdminPageTitle(pathname, brandName) {
  if (pathname === '/products' || pathname === '/') return `التصميمات — إدارة ${brandName}`;
  if (pathname === '/categories') return `الأقسام — إدارة ${brandName}`;
  if (pathname === '/models') return `الموديلات — إدارة ${brandName}`;
  if (pathname === '/shipping') return `الشحن والخامات — إدارة ${brandName}`;
  return `الصفحة مش موجودة — إدارة ${brandName}`;
}

export function AdminLayout() {
  const { pathname } = useLocation();
  const { storeConfig, notice } = useAdmin();
  const prefersReducedMotion = useReducedMotion();
  const isFirstMountRef = useRef(true);

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
    <div className="flex min-h-screen flex-col bg-[var(--plaster)] text-[var(--charcoal)]">
      <AdminHeader />

      {/* Quiet inline live-region feedback bar (zero floating SaaS toasts) */}
      <div aria-live="polite" className="page-container min-h-[28px] pt-1 text-start">
        {notice ? (
          <p className="text-[14px] font-medium text-[var(--klein)]">{notice}</p>
        ) : null}
      </div>

      <motion.main
        key={pathname}
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.15, ease: EASE }}
        className="flex-1 pb-20"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
