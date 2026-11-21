import { useEffect, useMemo, useRef, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { BUILTIN_ARTWORKS, SALON_SPANS } from '../../data/adminMeta';
import { SlideOverDrawer } from '../common/SlideOverDrawer';
import { SwitchToggle } from '../common/SwitchToggle';
import { UploadIcon } from '../icons/Icons';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';

function buildInitialDraft(product, categories, models, storeConfig) {
  if (product) {
    return {
      id: product.id,
      name: product.name || '',
      categoryId: product.categoryId || categories[0]?.id || '',
      price: String(product.price ?? 280),
      tagsText: (product.tags || []).join('، '),
      artworkMode: product.customArtworkUrl ? 'upload' : 'builtin',
      artworkId: product.artworkId || BUILTIN_ARTWORKS[0].id,
      customArtworkUrl: product.customArtworkUrl || null,
      customArtworkFileName: product.customArtworkFileName || null,
      featuredInHero: Boolean(product.featuredInHero),
      salonSpan: product.salonSpan || 4,
      salonOffset: product.salonOffset ?? 0,
      allModels:
        models.length > 0 &&
        models.every((m) => (product.compatibleModelIds || []).includes(m.id)),
      compatibleModelIds: [...(product.compatibleModelIds || [])],
      materialId: product.materialId || storeConfig.defaultMaterialId,
    };
  }

  return {
    id: null,
    name: '',
    categoryId: categories[0]?.id || '',
    price: '280',
    tagsText: '',
    artworkMode: 'builtin',
    artworkId: BUILTIN_ARTWORKS[0].id,
    customArtworkUrl: null,
    customArtworkFileName: null,
    featuredInHero: false,
    salonSpan: 4,
    salonOffset: 0,
    allModels: true,
    compatibleModelIds: models.map((m) => m.id),
    materialId: storeConfig.defaultMaterialId,
  };
}

/**
 * Add / Edit Design Slide-Over Panel with live PhoneCaseMockup preview.
 */
export function ProductEditorDrawer({ open, product = null, onClose }) {
  const { categories, phoneBrands, models, storeConfig, previewModel, saveProduct } = useAdmin();

  const [draft, setDraft] = useState(() =>
    buildInitialDraft(product, categories, models, storeConfig)
  );
  const [activeBrandTab, setActiveBrandTab] = useState(phoneBrands[0]);
  const [previewModelId, setPreviewModelId] = useState(previewModel.id);
  const [errors, setErrors] = useState({});
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setDraft(buildInitialDraft(product, categories, models, storeConfig));
      setActiveBrandTab(phoneBrands[0]);
      setPreviewModelId(previewModel.id);
      setErrors({});
    }
  }, [open, product, categories, models, storeConfig, phoneBrands, previewModel.id]);

  const activePreviewModel = useMemo(
    () => models.find((m) => m.id === previewModelId) || previewModel,
    [models, previewModelId, previewModel]
  );

  const brandModels = useMemo(
    () => models.filter((m) => m.brand === activeBrandTab),
    [models, activeBrandTab]
  );

  const effectiveCompatibleIds = draft.allModels
    ? models.map((m) => m.id)
    : draft.compatibleModelIds;

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.svg')) {
      setErrors((prev) => ({
        ...prev,
        artwork: 'اختار ملف صورة أو SVG (PNG / JPG / WebP / SVG).',
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDraft((prev) => ({
          ...prev,
          artworkMode: 'upload',
          customArtworkUrl: reader.result,
          customArtworkFileName: file.name,
        }));
        setErrors((prev) => ({ ...prev, artwork: undefined }));
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleSingleModel = (modelId) => {
    setDraft((prev) => {
      const current = prev.allModels ? models.map((m) => m.id) : prev.compatibleModelIds;
      const exists = current.includes(modelId);
      const nextIds = exists ? current.filter((id) => id !== modelId) : [...current, modelId];
      return {
        ...prev,
        allModels: nextIds.length === models.length,
        compatibleModelIds: nextIds,
      };
    });
  };

  const toggleAllInBrand = (selectAll) => {
    const idsInBrand = brandModels.map((m) => m.id);
    setDraft((prev) => {
      const current = prev.allModels ? models.map((m) => m.id) : prev.compatibleModelIds;
      const nextIds = selectAll
        ? [...new Set([...current, ...idsInBrand])]
        : current.filter((id) => !idsInBrand.includes(id));
      return {
        ...prev,
        allModels: nextIds.length === models.length,
        compatibleModelIds: nextIds,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!draft.name.trim()) {
      nextErrors.name = 'اكتب اسم التصميم بالإنجليزي الأول.';
    }
    const priceNum = Number(draft.price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      nextErrors.price = 'السعر لازم يكون رقم أكبر من صفر.';
    }
    if (!draft.categoryId) {
      nextErrors.categoryId = 'اختار قسم للتصميم.';
    }
    if (draft.artworkMode === 'upload' && !draft.customArtworkUrl) {
      nextErrors.artwork = 'ارفع ملف التصميم الأول أو اختار تصميم جاهز.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const parsedTags = draft.tagsText
      .split(/[,،]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    saveProduct({
      id: draft.id,
      name: draft.name.trim(),
      categoryId: draft.categoryId,
      price: priceNum,
      tags: parsedTags,
      artworkId: draft.artworkMode === 'builtin' ? draft.artworkId : null,
      customArtworkUrl: draft.artworkMode === 'upload' ? draft.customArtworkUrl : null,
      customArtworkFileName: draft.artworkMode === 'upload' ? draft.customArtworkFileName : null,
      featuredInHero: draft.featuredInHero,
      salonSpan: draft.salonSpan,
      salonOffset: draft.salonOffset,
      compatibleModelIds: effectiveCompatibleIds,
      materialId: draft.materialId,
    });

    onClose();
  };

  const drawerTitle = product ? (
    <span>
      تعديل <bdi dir="ltr">{product.name}</bdi>
    </span>
  ) : (
    'ضيف تصميم جديد'
  );

  return (
    <SlideOverDrawer
      open={open}
      onClose={onClose}
      title={drawerTitle}
      widthClass="md:max-w-[820px]"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary !min-h-[44px] text-[var(--graphite)]"
          >
            إلغاء
          </button>
          <button type="submit" form="product-editor-form" className="btn-primary min-w-[176px]">
            {product ? 'احفظ التعديلات' : 'ضيف التصميم'}
          </button>
        </div>
      }
    >
      <form id="product-editor-form" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-12">
          {/* Live PhoneCaseMockup preview stage on --plaster */}
          <div className="sticky top-0 z-10 -mx-5 bg-[var(--plaster)] px-5 py-4 md:top-0 md:col-span-5 md:mx-0 md:rounded-[4px] md:p-6">
            <div className="flex flex-col items-center">
              <div className="w-[120px] sm:w-[144px] md:w-[196px]">
                <PhoneCaseMockup
                  model={activePreviewModel}
                  artworkId={draft.artworkMode === 'builtin' ? draft.artworkId : null}
                  customImage={
                    draft.artworkMode === 'upload' && draft.customArtworkUrl
                      ? { url: draft.customArtworkUrl }
                      : null
                  }
                  className="w-full"
                  ariaLabel={`معاينة ${draft.name || 'التصميم الجديد'}`}
                />
              </div>

              <div className="mt-3 w-full text-center">
                <p className="truncate text-[15px] font-semibold text-[var(--charcoal)]">
                  <bdi dir="ltr">{draft.name.trim() || 'Untitled Design'}</bdi>
                </p>
                <p className="type-caption text-[13px] tabular-nums">
                  {Number(draft.price) > 0 ? `${draft.price} ${storeConfig.currencyLabel}` : '—'}
                </p>

                {/* Preview model switcher */}
                <div className="mt-3 hidden md:block">
                  <label htmlFor="preview-model-select" className="sr-only">
                    معاينة على موديل
                  </label>
                  <select
                    id="preview-model-select"
                    value={activePreviewModel.id}
                    onChange={(e) => setPreviewModelId(e.target.value)}
                    dir="ltr"
                    className="min-h-[40px] w-full rounded-[4px] border border-[rgba(38,40,43,0.18)] bg-[var(--gallery-white)] px-2.5 text-[13px] text-[var(--charcoal)]"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-6 md:col-span-7">
            {/* English product name */}
            <div>
              <label
                htmlFor="prod-name-input"
                className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
              >
                اسم التصميم (بالإنجليزي)
              </label>
              <input
                id="prod-name-input"
                type="text"
                dir="ltr"
                value={draft.name}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, name: e.target.value }));
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Cairo Neon 07"
                aria-invalid={Boolean(errors.name)}
                className="field-input text-start"
              />
              {errors.name ? (
                <p className="mt-1.5 text-[13px] font-medium text-[var(--klein)]">{errors.name}</p>
              ) : null}
            </div>

            {/* Category + Price */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="prod-category-select"
                  className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
                >
                  القسم
                </label>
                <select
                  id="prod-category-select"
                  value={draft.categoryId}
                  onChange={(e) => {
                    setDraft((prev) => ({ ...prev, categoryId: e.target.value }));
                    setErrors((prev) => ({ ...prev, categoryId: undefined }));
                  }}
                  className="field-input"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr}
                    </option>
                  ))}
                </select>
                {errors.categoryId ? (
                  <p className="mt-1.5 text-[13px] font-medium text-[var(--klein)]">
                    {errors.categoryId}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="prod-price-input"
                  className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
                >
                  السعر ({storeConfig.currencyLabel})
                </label>
                <input
                  id="prod-price-input"
                  type="number"
                  min="1"
                  step="5"
                  dir="ltr"
                  inputMode="numeric"
                  value={draft.price}
                  onChange={(e) => {
                    setDraft((prev) => ({ ...prev, price: e.target.value }));
                    setErrors((prev) => ({ ...prev, price: undefined }));
                  }}
                  aria-invalid={Boolean(errors.price)}
                  className="field-input text-start tabular-nums"
                />
                {errors.price ? (
                  <p className="mt-1.5 text-[13px] font-medium text-[var(--klein)]">
                    {errors.price}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="prod-tags-input"
                className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
              >
                الوسوم (افصل بينهم بفاصلة)
              </label>
              <input
                id="prod-tags-input"
                type="text"
                value={draft.tagsText}
                onChange={(e) => setDraft((prev) => ({ ...prev, tagsText: e.target.value }))}
                placeholder="مثلاً: anime، طوكيو، أحمر"
                className="field-input"
              />
            </div>

            {/* Artwork source selector: built-in SVG OR upload custom image/SVG */}
            <div>
              <span className="mb-2 block text-[14px] font-medium text-[var(--charcoal)]">
                صورة التصميم
              </span>
              <div className="flex items-center gap-3" role="tablist" aria-label="مصدر التصميم">
                {[
                  { id: 'builtin', label: 'تصميم جاهز (SVG)' },
                  { id: 'upload', label: 'ارفع ملف صورة أو SVG' },
                ].map((mode) => {
                  const active = draft.artworkMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() =>
                        setDraft((prev) => ({ ...prev, artworkMode: mode.id }))
                      }
                      className={`min-h-[44px] rounded-[4px] bg-[var(--plaster)]/65 px-3.5 text-[14px] font-medium text-[var(--charcoal)] cursor-pointer ${
                        active ? 'is-selected font-semibold' : 'hover:bg-[var(--plaster)]'
                      }`}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {draft.artworkMode === 'builtin' ? (
                <div
                  role="radiogroup"
                  aria-label="اختار تصميم جاهز"
                  className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4"
                >
                  {BUILTIN_ARTWORKS.map((art) => {
                    const selected = draft.artworkId === art.id;
                    return (
                      <button
                        key={art.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setDraft((prev) => ({ ...prev, artworkId: art.id }))}
                        className={`flex flex-col items-center gap-1.5 rounded-[4px] bg-[var(--plaster)]/55 p-2 text-center cursor-pointer ${
                          selected ? 'is-selected' : 'hover:bg-[var(--plaster)]'
                        }`}
                      >
                        <div className="w-[40px]">
                          <PhoneCaseMockup
                            model={activePreviewModel}
                            artworkId={art.id}
                            className="w-full"
                          />
                        </div>
                        <bdi
                          dir="ltr"
                          className="block w-full truncate text-center text-[11px] font-medium text-[var(--charcoal)]"
                        >
                          {art.label}
                        </bdi>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    handleFile(e.dataTransfer?.files?.[0]);
                  }}
                  className={`mt-3 rounded-[4px] border border-dashed p-4 ${
                    isDraggingFile
                      ? 'border-[var(--klein)] is-selected'
                      : 'border-[rgba(38,40,43,0.28)]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.svg"
                    onChange={(e) => {
                      handleFile(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                    className="sr-only"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UploadIcon className="h-5 w-5 shrink-0 text-[var(--charcoal)]" />
                      <div>
                        <p className="text-[14px] font-medium text-[var(--charcoal)]">
                          {draft.customArtworkFileName || 'اسحب ملف التصميم هنا أو اختاره'}
                        </p>
                        <p className="type-caption text-[12px]">PNG أو JPG أو WebP أو SVG</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary !min-h-[44px] !text-[14px]"
                    >
                      {draft.customArtworkUrl ? 'غيّر الملف' : 'اختار ملف'}
                    </button>
                  </div>
                </div>
              )}

              {errors.artwork ? (
                <p className="mt-1.5 text-[13px] font-medium text-[var(--klein)]">
                  {errors.artwork}
                </p>
              ) : null}
            </div>

            {/* Hero featured + Salon hang layout controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label
                    htmlFor="prod-hero-switch"
                    className="block text-[15px] font-semibold text-[var(--charcoal)]"
                  >
                    عرض في الواجهة الرئيسية (Hero)
                  </label>
                  <p className="type-caption text-[13px]">
                    التصميمات المفعّلة بتظهر في العرض المتبادل في أول الصفحة الرئيسية.
                  </p>
                </div>
                <SwitchToggle
                  id="prod-hero-switch"
                  checked={draft.featuredInHero}
                  onChange={(val) => setDraft((prev) => ({ ...prev, featuredInHero: val }))}
                  label="عرض التصميم في الواجهة الرئيسية"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]">
                    عرض الجراب في الجدار (أعمدة)
                  </span>
                  <div
                    role="radiogroup"
                    aria-label="عرض الجراب بالأعمدة"
                    className="grid grid-cols-3 gap-2"
                  >
                    {SALON_SPANS.map((span) => {
                      const active = draft.salonSpan === span;
                      return (
                        <button
                          key={span}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setDraft((prev) => ({ ...prev, salonSpan: span }))}
                          className={`min-h-[44px] rounded-[4px] bg-[var(--plaster)]/65 text-[14px] font-semibold tabular-nums text-[var(--charcoal)] cursor-pointer ${
                            active ? 'is-selected' : 'hover:bg-[var(--plaster)]'
                          }`}
                        >
                          {span} أعمدة
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[14px]">
                    <label htmlFor="prod-offset-range" className="font-medium text-[var(--charcoal)]">
                      إزاحة رأسية في العرض
                    </label>
                    <span className="type-caption tabular-nums" dir="ltr">
                      {draft.salonOffset}px
                    </span>
                  </div>
                  <input
                    id="prod-offset-range"
                    type="range"
                    min="0"
                    max="80"
                    step="4"
                    value={draft.salonOffset}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, salonOffset: Number(e.target.value) }))
                    }
                    className="gallery-range mt-3"
                  />
                </div>
              </div>
            </div>

            {/* Compatible Phone Models */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label
                    htmlFor="prod-all-models-switch"
                    className="block text-[15px] font-semibold text-[var(--charcoal)]"
                  >
                    كل الموديلات ({effectiveCompatibleIds.length} من {models.length})
                  </label>
                  <p className="type-caption text-[13px]">
                    اقفل الاختيار ده لو عايز تحدد موديلات معينة بس.
                  </p>
                </div>
                <SwitchToggle
                  id="prod-all-models-switch"
                  checked={draft.allModels}
                  onChange={(val) =>
                    setDraft((prev) => ({
                      ...prev,
                      allModels: val,
                      compatibleModelIds: val ? models.map((m) => m.id) : prev.compatibleModelIds,
                    }))
                  }
                  label="متاح لكل الموديلات"
                />
              </div>

              {!draft.allModels ? (
                <div className="space-y-3 pt-1">
                  {/* Brand tabs */}
                  <div
                    role="tablist"
                    aria-label="ماركات الموديلات المتوافقة"
                    className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1"
                  >
                    {phoneBrands.map((brand) => {
                      const active = activeBrandTab === brand;
                      const countInBrand = models.filter(
                        (m) => m.brand === brand && effectiveCompatibleIds.includes(m.id)
                      ).length;
                      return (
                        <button
                          key={brand}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setActiveBrandTab(brand)}
                          className={`min-h-[40px] shrink-0 rounded-[4px] px-2.5 text-[14px] font-semibold cursor-pointer ${
                            active
                              ? 'is-selected text-[var(--charcoal)]'
                              : 'text-[var(--graphite)] hover:text-[var(--charcoal)]'
                          }`}
                        >
                          <bdi dir="ltr">{brand}</bdi>{' '}
                          <span className="text-[12px] tabular-nums text-[var(--graphite)]">
                            ({countInBrand})
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick select / clear brand */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => toggleAllInBrand(true)}
                      className="btn-secondary !min-h-[36px] !text-[13px]"
                    >
                      حدد كل <bdi dir="ltr">{activeBrandTab}</bdi>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllInBrand(false)}
                      className="btn-secondary !min-h-[36px] !text-[13px] text-[var(--graphite)]"
                    >
                      امسح الكل
                    </button>
                  </div>

                  {/* Per-model 2px Klein outline checklist */}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {brandModels.map((model) => {
                      const checked = effectiveCompatibleIds.includes(model.id);
                      return (
                        <button
                          key={model.id}
                          type="button"
                          aria-pressed={checked}
                          onClick={() => toggleSingleModel(model.id)}
                          className={`flex min-h-[44px] items-center justify-between rounded-[4px] bg-[var(--plaster)]/55 px-3 text-start text-[14px] text-[var(--charcoal)] cursor-pointer ${
                            checked ? 'is-selected font-semibold' : 'hover:bg-[var(--plaster)]'
                          }`}
                        >
                          <bdi dir="ltr">{model.name}</bdi>
                          <span className="type-caption text-[12px]">
                            {checked ? 'متاح' : 'غير متاح'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </form>
    </SlideOverDrawer>
  );
}
