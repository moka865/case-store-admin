import { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { CAMERA_LAYOUTS } from '../../data/adminMeta';
import { SlideOverDrawer } from '../common/SlideOverDrawer';
import { PhoneCaseMockup } from '../mockup/PhoneCaseMockup';

function buildModelDraft(model, defaultBrand) {
  if (model) {
    return {
      id: model.id,
      brand: model.brand,
      name: model.name,
      cameraLayout: model.cameraLayout,
      aspectRatio: model.aspectRatio,
      cornerRadius: model.cornerRadius,
    };
  }
  return {
    id: null,
    brand: defaultBrand || 'iPhone',
    name: '',
    cameraLayout: 'apple-pro-triple',
    aspectRatio: 0.478,
    cornerRadius: 34,
  };
}

/**
 * Add / Edit Phone Model Slide-Over Panel with live hardware geometry preview.
 */
export function ModelEditorDrawer({ open, model = null, defaultBrand = 'iPhone', onClose }) {
  const { phoneBrands, saveModel } = useAdmin();
  const [draft, setDraft] = useState(() => buildModelDraft(model, defaultBrand));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setDraft(buildModelDraft(model, defaultBrand));
      setErrors({});
    }
  }, [open, model, defaultBrand]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!draft.name.trim()) {
      nextErrors.name = 'اكتب اسم الموديل الأول (مثلاً iPhone 16 Pro Max).';
    }
    if (draft.aspectRatio < 0.42 || draft.aspectRatio > 0.56) {
      nextErrors.aspectRatio = 'نسبة الأبعاد لازم تكون بين 0.42 و 0.56.';
    }
    if (draft.cornerRadius < 6 || draft.cornerRadius > 48) {
      nextErrors.cornerRadius = 'انحناء الزوايا لازم يكون بين 6 و 48.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    saveModel(draft);
    onClose();
  };

  const title = model ? (
    <span>
      تعديل <bdi dir="ltr">{model.name}</bdi>
    </span>
  ) : (
    'ضيف موديل جديد'
  );

  return (
    <SlideOverDrawer
      open={open}
      onClose={onClose}
      title={title}
      widthClass="md:max-w-[760px]"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary !min-h-[44px] text-[var(--graphite)]"
          >
            إلغاء
          </button>
          <button type="submit" form="model-editor-form" className="btn-primary min-w-[176px]">
            {model ? 'احفظ التعديلات' : 'ضيف الموديل'}
          </button>
        </div>
      }
    >
      <form id="model-editor-form" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-12">
          {/* Live hardware geometry preview on --plaster */}
          <div className="sticky top-0 z-10 -mx-5 bg-[var(--plaster)] px-5 py-4 md:col-span-5 md:mx-0 md:rounded-[4px] md:p-6">
            <div className="flex flex-col items-center">
              <div className="w-[126px] sm:w-[152px] md:w-[196px]">
                <PhoneCaseMockup
                  model={draft}
                  artworkId="tokyo-driftline"
                  className="w-full"
                  ariaLabel={`معاينة مقاس ${draft.name || 'الموديل الجديد'}`}
                />
              </div>
              <p className="mt-3 text-[15px] font-semibold text-[var(--charcoal)]">
                <bdi dir="ltr">{draft.name.trim() || 'New Phone Model'}</bdi>
              </p>
              <p className="type-caption text-[13px] tabular-nums" dir="ltr">
                ratio {Number(draft.aspectRatio).toFixed(3)} / r:{draft.cornerRadius}
              </p>
            </div>
          </div>

          {/* Geometry & metadata controls */}
          <div className="space-y-6 md:col-span-7">
            {/* Brand */}
            <div>
              <span className="mb-2 block text-[14px] font-medium text-[var(--charcoal)]">
                الماركة
              </span>
              <div
                role="radiogroup"
                aria-label="ماركة الموبايل"
                className="flex flex-wrap gap-2"
              >
                {phoneBrands.map((brand) => {
                  const active = draft.brand === brand;
                  return (
                    <button
                      key={brand}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setDraft((prev) => ({ ...prev, brand }))}
                      className={`min-h-[42px] rounded-[4px] bg-[var(--plaster)]/60 px-3 text-[14px] font-semibold text-[var(--charcoal)] cursor-pointer ${
                        active ? 'is-selected' : 'hover:bg-[var(--plaster)]'
                      }`}
                    >
                      <bdi dir="ltr">{brand}</bdi>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="model-name-input"
                className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
              >
                اسم الموديل
              </label>
              <input
                id="model-name-input"
                type="text"
                dir="ltr"
                value={draft.name}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, name: e.target.value }));
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Galaxy S25 Ultra"
                aria-invalid={Boolean(errors.name)}
                className="field-input text-start"
              />
              {errors.name ? (
                <p className="mt-1.5 text-[13px] font-medium text-[var(--klein)]">{errors.name}</p>
              ) : null}
            </div>

            {/* Aspect ratio + Corner radius */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[14px]">
                  <label htmlFor="model-ratio-range" className="font-medium text-[var(--charcoal)]">
                    نسبة العرض للطول
                  </label>
                  <span className="type-caption tabular-nums" dir="ltr">
                    {Number(draft.aspectRatio).toFixed(3)}
                  </span>
                </div>
                <input
                  id="model-ratio-range"
                  type="range"
                  min="0.44"
                  max="0.52"
                  step="0.002"
                  value={draft.aspectRatio}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, aspectRatio: Number(e.target.value) }))
                  }
                  className="gallery-range"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-[14px]">
                  <label htmlFor="model-radius-range" className="font-medium text-[var(--charcoal)]">
                    انحناء الزوايا
                  </label>
                  <span className="type-caption tabular-nums" dir="ltr">
                    {draft.cornerRadius}
                  </span>
                </div>
                <input
                  id="model-radius-range"
                  type="range"
                  min="10"
                  max="44"
                  step="1"
                  value={draft.cornerRadius}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, cornerRadius: Number(e.target.value) }))
                  }
                  className="gallery-range"
                />
              </div>
            </div>

            {/* 10 Camera Layouts */}
            <div>
              <span className="mb-2 block text-[14px] font-medium text-[var(--charcoal)]">
                شكل فتحة الكاميرا
              </span>
              <div
                role="radiogroup"
                aria-label="شكل فتحة الكاميرا"
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                {CAMERA_LAYOUTS.map((layout) => {
                  const active = draft.cameraLayout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setDraft((prev) => ({ ...prev, cameraLayout: layout.id }))}
                      className={`flex min-h-[54px] flex-col items-start justify-center rounded-[4px] bg-[var(--plaster)]/55 px-3 py-2 text-start cursor-pointer ${
                        active ? 'is-selected' : 'hover:bg-[var(--plaster)]'
                      }`}
                    >
                      <span className="text-[14px] font-semibold text-[var(--charcoal)]">
                        {layout.labelAr}
                      </span>
                      <span className="type-caption text-[12px]">
                        <bdi dir="ltr">{layout.id}</bdi>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </form>
    </SlideOverDrawer>
  );
}
