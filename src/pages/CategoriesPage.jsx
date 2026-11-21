import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { InlineConfirmDelete } from '../components/common/InlineConfirmDelete';
import { PageHeading } from '../components/common/PageHeading';
import { ChevronDownIcon, ChevronUpIcon } from '../components/icons/Icons';
import { useAdmin } from '../context/AdminContext';

const EASE = [0.22, 1, 0.36, 1];

/**
 * `/categories`:
 * Exhibition-scale Arabic category names directly on --plaster.
 * Supports add, inline edit, up/down sortOrder reordering, and protected deletion.
 */
export function CategoriesPage() {
  const { categories, products, saveCategory, reorderCategory, deleteCategory } = useAdmin();
  const prefersReducedMotion = useReducedMotion();

  const [newNameAr, setNewNameAr] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [addError, setAddError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editNameAr, setEditNameAr] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editError, setEditError] = useState('');

  const [deleteWarningById, setDeleteWarningById] = useState({});

  const getProductCount = (catId) => products.filter((p) => p.categoryId === catId).length;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newNameAr.trim()) {
      setAddError('اكتب اسم القسم بالعربي الأول.');
      return;
    }
    if (!newSlug.trim() || !/^[a-z0-9-]+$/i.test(newSlug.trim())) {
      setAddError('اكتب رابط إنجليزي بسيط بحروف وأرقام وشرطة بس (مثلاً street-art).');
      return;
    }
    const res = saveCategory({ nameAr: newNameAr.trim(), slug: newSlug.trim().toLowerCase() });
    if (!res.ok) {
      setAddError(res.error);
      return;
    }
    setNewNameAr('');
    setNewSlug('');
    setAddError('');
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditNameAr(cat.nameAr);
    setEditSlug(cat.slug);
    setEditError('');
    setDeleteWarningById({});
  };

  const handleSaveEdit = (e, catId) => {
    e.preventDefault();
    if (!editNameAr.trim()) {
      setEditError('اسم القسم ما ينفعش يكون فاضي.');
      return;
    }
    if (!editSlug.trim() || !/^[a-z0-9-]+$/i.test(editSlug.trim())) {
      setEditError('الرابط (slug) لازم يكون بحروف إنجليزي أو أرقام وشرطة بس.');
      return;
    }
    const res = saveCategory({
      id: catId,
      nameAr: editNameAr.trim(),
      slug: editSlug.trim().toLowerCase(),
    });
    if (!res.ok) {
      setEditError(res.error);
      return;
    }
    setEditingId(null);
    setEditError('');
  };

  const handleDeleteAttempt = (catId) => {
    const res = deleteCategory(catId);
    if (!res.ok) {
      setDeleteWarningById((prev) => ({ ...prev, [catId]: res.error }));
    } else {
      setDeleteWarningById((prev) => {
        const next = { ...prev };
        delete next[catId];
        return next;
      });
    }
  };

  return (
    <div className="pt-6 md:pt-10">
      <div className="page-container">
        <PageHeading
          title="الأقسام"
          count={categories.length}
          description="رتّب الأقسام أو ضيف قسم جديد، والترتيب بيظهر بنفس الشكل في المتجر."
        />

        {/* Inline add category panel on --gallery-white */}
        <form
          onSubmit={handleAdd}
          noValidate
          className="mt-8 rounded-[4px] bg-[var(--gallery-white)] p-5 text-start sm:p-7 lg:max-w-[780px]"
        >
          <h2 className="type-h3 text-[var(--charcoal)]">ضيف قسم جديد</h2>
          <div className="mt-4 grid grid-cols-1 items-end gap-4 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <label
                htmlFor="new-cat-name"
                className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
              >
                الاسم بالعربي
              </label>
              <input
                id="new-cat-name"
                type="text"
                value={newNameAr}
                onChange={(e) => {
                  setNewNameAr(e.target.value);
                  setAddError('');
                }}
                placeholder="مثلاً: فنون الشارع"
                className="field-input"
              />
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="new-cat-slug"
                className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
              >
                الرابط (slug)
              </label>
              <input
                id="new-cat-slug"
                type="text"
                dir="ltr"
                value={newSlug}
                onChange={(e) => {
                  setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                  setAddError('');
                }}
                placeholder="street-art"
                className="field-input text-start"
              />
            </div>

            <div className="sm:col-span-3">
              <button type="submit" className="btn-primary w-full">
                ضيف القسم
              </button>
            </div>
          </div>

          {addError ? (
            <p role="alert" className="mt-3 text-[14px] font-medium text-[var(--klein)]">
              {addError}
            </p>
          ) : null}
        </form>

        {/* Exhibition-scale open plaster list ordered by sortOrder */}
        <ol className="mt-12 space-y-8 md:space-y-9">
          {categories.map((cat, index) => {
            const linkedCount = getProductCount(cat.id);
            const isEditing = editingId === cat.id;
            const warning = deleteWarningById[cat.id];

            return (
              <motion.li
                key={cat.id}
                layout={!prefersReducedMotion}
                transition={{ layout: { duration: 0.35, ease: EASE } }}
                className="text-start"
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => handleSaveEdit(e, cat.id)}
                    noValidate
                    className="rounded-[4px] bg-[var(--gallery-white)] p-5 lg:max-w-[780px]"
                  >
                    <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-12">
                      <div className="sm:col-span-5">
                        <label
                          htmlFor={`edit-cat-name-${cat.id}`}
                          className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
                        >
                          الاسم بالعربي
                        </label>
                        <input
                          id={`edit-cat-name-${cat.id}`}
                          type="text"
                          value={editNameAr}
                          onChange={(e) => {
                            setEditNameAr(e.target.value);
                            setEditError('');
                          }}
                          className="field-input"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label
                          htmlFor={`edit-cat-slug-${cat.id}`}
                          className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
                        >
                          الرابط (slug)
                        </label>
                        <input
                          id={`edit-cat-slug-${cat.id}`}
                          type="text"
                          dir="ltr"
                          value={editSlug}
                          onChange={(e) => {
                            setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                            setEditError('');
                          }}
                          className="field-input text-start"
                        />
                      </div>
                      <div className="flex items-center gap-3 sm:col-span-3">
                        <button type="submit" className="btn-primary flex-1 !px-4">
                          احفظ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditError('');
                          }}
                          className="btn-secondary !text-[14px] text-[var(--graphite)]"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                    {editError ? (
                      <p role="alert" className="mt-2 text-[13px] font-medium text-[var(--klein)]">
                        {editError}
                      </p>
                    ) : null}
                  </form>
                ) : (
                  <div className="grid grid-cols-1 items-baseline gap-3 md:grid-cols-12 md:gap-6">
                    {/* Oversized exhibition-scale Arabic category name */}
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 md:col-span-6">
                      <span className="text-[28px] leading-[1.3] font-bold text-[var(--charcoal)] sm:text-[36px]">
                        {cat.nameAr}
                      </span>
                      <span className="type-caption text-[14px]">
                        <bdi dir="ltr">/{cat.slug}</bdi>
                      </span>
                      <span className="type-caption tabular-nums text-[14px]">
                        {linkedCount} تصميمات
                      </span>
                    </div>

                    {/* Reorder + Edit + Protected Delete */}
                    <div className="flex flex-wrap items-center gap-4 md:col-span-6 md:justify-end">
                      <button
                        type="button"
                        disabled={index === 0}
                        aria-label={`ارفع قسم ${cat.nameAr} لفوق`}
                        onClick={() => reorderCategory(cat.id, 'up')}
                        className="btn-secondary !min-h-[44px] !text-[14px]"
                      >
                        <ChevronUpIcon className="h-4 w-4" />
                        <span>فوق</span>
                      </button>

                      <button
                        type="button"
                        disabled={index === categories.length - 1}
                        aria-label={`نزّل قسم ${cat.nameAr} لتحت`}
                        onClick={() => reorderCategory(cat.id, 'down')}
                        className="btn-secondary !min-h-[44px] !text-[14px]"
                      >
                        <ChevronDownIcon className="h-4 w-4" />
                        <span>تحت</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="btn-secondary !min-h-[44px] !text-[14px]"
                      >
                        عدّل
                      </button>

                      {linkedCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteAttempt(cat.id)}
                          className="btn-secondary !min-h-[44px] !text-[14px] text-[var(--graphite)]"
                        >
                          امسح
                        </button>
                      ) : (
                        <InlineConfirmDelete
                          ariaTarget={cat.nameAr}
                          onConfirm={() => handleDeleteAttempt(cat.id)}
                        />
                      )}
                    </div>
                  </div>
                )}

                {warning ? (
                  <p
                    role="alert"
                    className="mt-2 max-w-[54ch] text-[14px] font-medium text-[var(--klein)]"
                  >
                    {warning}
                  </p>
                ) : null}
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
