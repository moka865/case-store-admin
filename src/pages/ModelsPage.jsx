import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { InlineConfirmDelete } from '../components/common/InlineConfirmDelete';
import { PageHeading } from '../components/common/PageHeading';
import { SearchIcon } from '../components/icons/Icons';
import { PhoneCaseMockup } from '../components/mockup/PhoneCaseMockup';
import { ModelEditorDrawer } from '../components/models/ModelEditorDrawer';
import { useAdmin } from '../context/AdminContext';
import { getCameraLayoutLabel } from '../data/adminMeta';

const EASE = [0.22, 1, 0.36, 1];

/**
 * `/models`:
 * Brand tabs + search + open plaster list with real per-model PhoneCaseMockup
 * hardware silhouettes showing authentic corner radii and camera cutouts.
 */
export function ModelsPage() {
  const { phoneBrands, models, products, deleteModel } = useAdmin();
  const prefersReducedMotion = useReducedMotion();

  const [activeBrand, setActiveBrand] = useState(phoneBrands[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);

  const visibleModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return models.filter(
        (m) => m.name.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q)
      );
    }
    return models.filter((m) => m.brand === activeBrand);
  }, [models, activeBrand, searchQuery]);

  const getCompatibleCount = (modelId) =>
    products.filter((p) => (p.compatibleModelIds || []).includes(modelId)).length;

  const openCreate = () => {
    setEditingModel(null);
    setDrawerOpen(true);
  };

  const openEdit = (model) => {
    setEditingModel(model);
    setDrawerOpen(true);
  };

  return (
    <div className="pt-6 md:pt-10">
      <div className="page-container">
        <PageHeading
          title="الموديلات"
          count={models.length}
          description="كل موديل ليه مقاس وانحناء وفتحة كاميرا خاصة بتظهر في المعاينة الحية للعميل."
          action={
            <button type="button" onClick={openCreate} className="btn-primary">
              ضيف موديل جديد
            </button>
          }
        />

        {/* Brand tabs + model search */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="tablist"
            aria-label="ماركات الموبايلات"
            className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1"
          >
            {phoneBrands.map((brand) => {
              const active = activeBrand === brand && !searchQuery.trim();
              const count = models.filter((m) => m.brand === brand).length;
              return (
                <button
                  key={brand}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setActiveBrand(brand);
                    setSearchQuery('');
                  }}
                  className={`min-h-[44px] shrink-0 rounded-[4px] px-3 text-[15px] font-semibold cursor-pointer ${
                    active
                      ? 'is-selected text-[var(--charcoal)]'
                      : 'text-[var(--graphite)] hover:text-[var(--charcoal)]'
                  }`}
                >
                  <bdi dir="ltr">{brand}</bdi>{' '}
                  <span className="text-[13px] font-medium tabular-nums text-[var(--graphite)]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full max-w-[340px]">
            <label htmlFor="admin-models-search" className="sr-only">
              ابحث باسم الموديل
            </label>
            <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--graphite)]" />
            <input
              id="admin-models-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="دوّر على الموديل في كل الماركات..."
              className="field-input ps-10"
            />
          </div>
        </div>

        {/* Open plaster hardware list */}
        {visibleModels.length > 0 ? (
          <ul className="mt-10 space-y-7">
            <AnimatePresence mode="popLayout">
              {visibleModels.map((model) => {
                const compatCount = getCompatibleCount(model.id);

                return (
                  <motion.li
                    key={model.id}
                    layout={!prefersReducedMotion}
                    initial={prefersReducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                    transition={{
                      layout: { duration: 0.35, ease: EASE },
                      opacity: { duration: 0.2, ease: EASE },
                    }}
                    className="grid grid-cols-[40px_1fr] items-center gap-x-5 gap-y-2 text-start md:grid-cols-12 md:gap-x-6"
                  >
                    {/* Live hardware silhouette showing real cornerRadius & cameraLayout */}
                    <div className="row-span-2 w-[40px] md:row-span-1 md:col-span-1">
                      <PhoneCaseMockup
                        model={model}
                        className="w-full"
                        ariaLabel={`شكل جراب ${model.name}`}
                      />
                    </div>

                    {/* Model name + camera cutout label */}
                    <div className="min-w-0 md:col-span-4">
                      <h2 className="text-[18px] font-semibold leading-[1.35] text-[var(--charcoal)]">
                        <bdi dir="ltr">{model.name}</bdi>
                      </h2>
                      <p className="type-caption mt-0.5 text-[14px]">
                        {getCameraLayoutLabel(model.cameraLayout)}
                      </p>
                    </div>

                    {/* Geometry specs + compatible design count */}
                    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 md:col-span-4 md:justify-between">
                      <span className="type-caption tabular-nums text-[14px]" dir="ltr">
                        {Number(model.aspectRatio).toFixed(3)} / r:{model.cornerRadius}
                      </span>
                      <span className="text-[15px] font-medium tabular-nums text-[var(--charcoal)]">
                        {compatCount} تصميم
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex flex-wrap items-center gap-5 md:col-span-3 md:justify-end">
                      <button
                        type="button"
                        onClick={() => openEdit(model)}
                        className="btn-secondary !min-h-[44px] !text-[14px]"
                      >
                        عدّل
                      </button>
                      <InlineConfirmDelete
                        ariaTarget={model.name}
                        onConfirm={() => deleteModel(model.id)}
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
              مفيش موديل بالاسم ده لسه. امسح البحث أو ضيف الموديل للقايمة.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-6">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="btn-secondary"
                >
                  امسح البحث
                </button>
              ) : null}
              <button type="button" onClick={openCreate} className="btn-primary">
                ضيف موديل جديد
              </button>
            </div>
          </div>
        )}
      </div>

      <ModelEditorDrawer
        open={drawerOpen}
        model={editingModel}
        defaultBrand={activeBrand}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
