import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { InlineConfirmDelete } from '../components/common/InlineConfirmDelete';
import { PageHeading } from '../components/common/PageHeading';
import { SearchIcon } from '../components/icons/Icons';
import { PhoneCaseMockup } from '../components/mockup/PhoneCaseMockup';
import { ProductEditorDrawer } from '../components/products/ProductEditorDrawer';
import { useAdmin } from '../context/AdminContext';

const EASE = [0.22, 1, 0.36, 1];

/**
 * `/products` (default route):
 * Open plaster curatorial ledger — zero cards, zero borders, zero KPI boxes.
 * Boldness lives in the vibrant live PhoneCaseMockup thumbnails hanging directly on plaster.
 */
export function ProductsPage() {
  const { products, categories, storeConfig, previewModel, deleteProduct } = useAdmin();
  const prefersReducedMotion = useReducedMotion();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (activeCategoryId && p.categoryId !== activeCategoryId) return false;
      if (!q) return true;
      const catName = (categoryMap[p.categoryId]?.nameAr || '').toLowerCase();
      const tagHit = (p.tags || []).some((t) => t.toLowerCase().includes(q));
      return p.name.toLowerCase().includes(q) || catName.includes(q) || tagHit;
    });
  }, [products, activeCategoryId, searchQuery, categoryMap]);

  const openCreate = () => {
    setEditingProduct(null);
    setDrawerOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setDrawerOpen(true);
  };

  return (
    <div className="pt-6 md:pt-10">
      <div className="page-container">
        <PageHeading
          title="التصميمات"
          count={products.length}
          description="كل تصميم بيتعرض مباشرة في المتجر على حسب الموديلات المتوافقة معاه."
          action={
            <button type="button" onClick={openCreate} className="btn-primary">
              ضيف تصميم جديد
            </button>
          }
        />

        {/* Instant search + category filter */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-[380px]">
            <label htmlFor="admin-products-search" className="sr-only">
              ابحث في التصميمات
            </label>
            <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--graphite)]" />
            <input
              id="admin-products-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم التصميم أو القسم أو الوسم..."
              className="field-input ps-10"
            />
          </div>

          <div
            role="tablist"
            aria-label="تصفية حسب القسم"
            className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategoryId === null}
              onClick={() => setActiveCategoryId(null)}
              className={`min-h-[44px] shrink-0 rounded-[4px] px-3 text-[15px] font-medium cursor-pointer ${
                activeCategoryId === null
                  ? 'is-selected font-semibold text-[var(--charcoal)]'
                  : 'text-[var(--graphite)] hover:text-[var(--charcoal)]'
              }`}
            >
              الكل{' '}
              <span className="text-[13px] tabular-nums text-[var(--graphite)]">
                {products.length}
              </span>
            </button>

            {categories.map((cat) => {
              const active = activeCategoryId === cat.id;
              const catCount = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`min-h-[44px] shrink-0 rounded-[4px] px-3 text-[15px] font-medium cursor-pointer ${
                    active
                      ? 'is-selected font-semibold text-[var(--charcoal)]'
                      : 'text-[var(--graphite)] hover:text-[var(--charcoal)]'
                  }`}
                >
                  {cat.nameAr}{' '}
                  <span className="text-[13px] tabular-nums text-[var(--graphite)]">
                    {catCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Open plaster ledger — no bordered boxes, no shadows, no zebra stripes */}
        {filteredProducts.length > 0 ? (
          <ul className="mt-10 space-y-8 md:space-y-7">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const catName = categoryMap[product.categoryId]?.nameAr || 'بدون قسم';
                const modelsCount = (product.compatibleModelIds || []).length;

                return (
                  <motion.li
                    key={product.id}
                    layout={!prefersReducedMotion}
                    initial={prefersReducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                    transition={{
                      layout: { duration: 0.35, ease: EASE },
                      opacity: { duration: 0.2, ease: EASE },
                    }}
                    className="grid grid-cols-[54px_1fr] items-center gap-x-5 gap-y-2 text-start md:grid-cols-12 md:gap-x-6"
                  >
                    {/* Live mini PhoneCaseMockup sitting directly on --plaster */}
                    <div className="row-span-2 w-[54px] md:row-span-1 md:col-span-1">
                      <PhoneCaseMockup
                        model={previewModel}
                        artworkId={product.customArtworkUrl ? null : product.artworkId}
                        customImage={
                          product.customArtworkUrl ? { url: product.customArtworkUrl } : null
                        }
                        className="w-full"
                        ariaLabel={`معاينة مصغرة لتصميم ${product.name}`}
                      />
                    </div>

                    {/* English design name + Arabic category */}
                    <div className="min-w-0 md:col-span-4">
                      <h2 className="text-[18px] font-semibold leading-[1.35] text-[var(--charcoal)]">
                        <bdi dir="ltr">{product.name}</bdi>
                      </h2>
                      <p className="type-caption mt-0.5 text-[14px]">
                        <span>{catName}</span>
                        {product.featuredInHero ? (
                          <span className="ms-3 font-semibold text-[var(--charcoal)]">
                            في الواجهة
                          </span>
                        ) : null}
                      </p>
                    </div>

                    {/* Price + compatible model count */}
                    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 md:col-span-4 md:justify-between">
                      <span className="text-[16px] font-bold tabular-nums text-[var(--charcoal)]">
                        {product.price} {storeConfig.currencyLabel}
                      </span>
                      <span className="type-caption tabular-nums text-[14px]">
                        {modelsCount} موديل
                      </span>
                      <span className="type-caption hidden tabular-nums text-[13px] lg:inline">
                        {product.salonSpan || 4} أعمدة
                      </span>
                    </div>

                    {/* Inline actions (عدّل / امسح with inline confirm) */}
                    <div className="col-span-2 flex flex-wrap items-center gap-5 md:col-span-3 md:justify-end">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="btn-secondary !min-h-[44px] !text-[14px]"
                      >
                        عدّل
                      </button>
                      <InlineConfirmDelete
                        ariaTarget={product.name}
                        onConfirm={() => deleteProduct(product.id)}
                      />
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="mt-12 max-w-[46ch] py-8 text-start">
            <p className="type-h3 text-[var(--charcoal)]">
              مفيش تصميمات مطابقة للبحث ده. امسح البحث أو ضيف تصميم جديد.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-6">
              {searchQuery || activeCategoryId ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategoryId(null);
                  }}
                  className="btn-secondary"
                >
                  عرض كل التصميمات
                </button>
              ) : null}
              <button type="button" onClick={openCreate} className="btn-primary">
                ضيف تصميم جديد
              </button>
            </div>
          </div>
        )}
      </div>

      <ProductEditorDrawer
        open={drawerOpen}
        product={editingProduct}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
