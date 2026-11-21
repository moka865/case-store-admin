import { useEffect, useState } from 'react';
import { InlineConfirmDelete } from '../components/common/InlineConfirmDelete';
import { PageHeading } from '../components/common/PageHeading';
import { SwitchToggle } from '../components/common/SwitchToggle';
import { useAdmin } from '../context/AdminContext';

function GovernorateLedgerRow({ gov, currencyLabel, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [fee, setFee] = useState(String(gov.shippingFee));
  const [days, setDays] = useState(gov.estimatedDays);
  const [cod, setCod] = useState(gov.codAvailable);
  const [error, setError] = useState('');

  useEffect(() => {
    setFee(String(gov.shippingFee));
    setDays(gov.estimatedDays);
    setCod(gov.codAvailable);
  }, [gov.shippingFee, gov.estimatedDays, gov.codAvailable]);

  const handleSave = (e) => {
    e.preventDefault();
    const numFee = Number(fee);
    if (!Number.isFinite(numFee) || numFee < 0) {
      setError('مصاريف الشحن لازم تكون رقم صفر أو أكتر.');
      return;
    }
    if (!days.trim()) {
      setError('اكتب مدة التوصيل (مثلاً 2-3).');
      return;
    }
    setError('');
    onSave({
      id: gov.id,
      nameAr: gov.nameAr,
      shippingFee: numFee,
      estimatedDays: days.trim(),
      codAvailable: cod,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <li className="rounded-[4px] bg-[var(--gallery-white)] p-4 text-start sm:p-5">
        <form onSubmit={handleSave} noValidate className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[18px] font-bold text-[var(--charcoal)]">{gov.nameAr}</span>
            <div className="flex items-center gap-2.5">
              <SwitchToggle
                id={`gov-cod-${gov.id}`}
                checked={cod}
                onChange={setCod}
                label={`الدفع عند الاستلام في ${gov.nameAr}`}
              />
              <span className="type-caption text-[13px]">{cod ? 'الدفع عند الاستلام' : 'موقوف'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-12 sm:items-end">
            <div className="sm:col-span-4">
              <label htmlFor={`gov-fee-${gov.id}`} className="type-caption mb-1 block text-[12px]">
                مصاريف الشحن ({currencyLabel})
              </label>
              <input
                id={`gov-fee-${gov.id}`}
                type="number"
                min="0"
                step="5"
                dir="ltr"
                inputMode="numeric"
                value={fee}
                onChange={(e) => {
                  setFee(e.target.value);
                  setError('');
                }}
                className="field-input !min-h-[44px] text-start tabular-nums"
              />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor={`gov-days-${gov.id}`} className="type-caption mb-1 block text-[12px]">
                مدة التوصيل (أيام)
              </label>
              <input
                id={`gov-days-${gov.id}`}
                type="text"
                dir="ltr"
                value={days}
                onChange={(e) => {
                  setDays(e.target.value);
                  setError('');
                }}
                className="field-input !min-h-[44px] text-start tabular-nums"
              />
            </div>

            <div className="col-span-2 flex items-center gap-4 sm:col-span-4 sm:justify-end">
              <button type="submit" className="btn-primary !min-h-[44px] !px-5">
                احفظ
              </button>
              <button
                type="button"
                onClick={() => {
                  setFee(String(gov.shippingFee));
                  setDays(gov.estimatedDays);
                  setCod(gov.codAvailable);
                  setError('');
                  setEditing(false);
                }}
                className="btn-secondary !text-[14px] text-[var(--graphite)]"
              >
                إلغاء
              </button>
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-[13px] font-medium text-[var(--klein)]">
              {error}
            </p>
          ) : null}
        </form>
      </li>
    );
  }

  return (
    <li className="grid grid-cols-1 items-baseline gap-2 text-start sm:grid-cols-12 sm:gap-4">
      <div className="sm:col-span-3">
        <span className="text-[18px] font-semibold text-[var(--charcoal)]">{gov.nameAr}</span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 sm:col-span-5 sm:justify-between">
        <span className="text-[16px] font-bold tabular-nums text-[var(--charcoal)]">
          {gov.shippingFee} {currencyLabel}
        </span>
        <span className="type-caption tabular-nums text-[14px]">خلال {gov.estimatedDays} أيام</span>
        <span
          className={`text-[14px] font-medium ${
            gov.codAvailable ? 'text-[var(--charcoal)]' : 'text-[var(--graphite)]'
          }`}
        >
          {gov.codAvailable ? 'استلام متاح' : 'موقوف'}
        </span>
      </div>

      <div className="flex items-center gap-5 sm:col-span-4 sm:justify-end">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="btn-secondary !min-h-[44px] !text-[14px]"
        >
          عدّل
        </button>
        <InlineConfirmDelete ariaTarget={gov.nameAr} onConfirm={() => onDelete(gov.id)} />
      </div>
    </li>
  );
}

/**
 * `/shipping`:
 * Asymmetric sticky-spine studio ledger directly on --plaster (no white SaaS form cards):
 * - Start sticky spine (4 cols): Custom print price + Materials CRUD
 * - End open column (7 cols): 16 Egyptian governorates displayed cleanly on plaster with inline edit
 */
export function ShippingPage() {
  const {
    storeConfig,
    governorates,
    materials,
    updateStoreConfig,
    saveGovernorate,
    deleteGovernorate,
    saveMaterial,
    deleteMaterial,
  } = useAdmin();

  const [customPrice, setCustomPrice] = useState(String(storeConfig.customCasePrice));
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    setCustomPrice(String(storeConfig.customCasePrice));
  }, [storeConfig.customCasePrice]);

  const [editingMatId, setEditingMatId] = useState(null);
  const [matDraft, setMatDraft] = useState({ nameAr: '', descriptionAr: '', priceDelta: '0' });
  const [matError, setMatError] = useState('');
  const [showAddMat, setShowAddMat] = useState(false);

  const [showAddGov, setShowAddGov] = useState(false);
  const [newGov, setNewGov] = useState({
    nameAr: '',
    shippingFee: '80',
    estimatedDays: '3-5',
    codAvailable: true,
  });
  const [govAddError, setGovAddError] = useState('');

  const handleSaveCustomPrice = (e) => {
    e.preventDefault();
    const num = Number(customPrice);
    if (!Number.isFinite(num) || num <= 0) {
      setPriceError('سعر الطباعة المخصصة لازم يكون رقم أكبر من صفر.');
      return;
    }
    setPriceError('');
    updateStoreConfig({ customCasePrice: num });
  };

  const handleSaveNewMaterial = (e) => {
    e.preventDefault();
    if (!matDraft.nameAr.trim()) {
      setMatError('اكتب اسم الخامة الأول.');
      return;
    }
    saveMaterial({
      nameAr: matDraft.nameAr.trim(),
      descriptionAr: matDraft.descriptionAr.trim(),
      priceDelta: Number(matDraft.priceDelta) || 0,
      active: true,
      isDefault: false,
    });
    setMatDraft({ nameAr: '', descriptionAr: '', priceDelta: '0' });
    setMatError('');
    setShowAddMat(false);
  };

  const handleSaveMaterialEdit = (e, mat) => {
    e.preventDefault();
    if (!matDraft.nameAr.trim()) {
      setMatError('اسم الخامة ما ينفعش يكون فاضي.');
      return;
    }
    saveMaterial({
      ...mat,
      nameAr: matDraft.nameAr.trim(),
      descriptionAr: matDraft.descriptionAr.trim(),
      priceDelta: Number(matDraft.priceDelta) || 0,
    });
    setEditingMatId(null);
    setMatError('');
  };

  const handleAddGovernorate = (e) => {
    e.preventDefault();
    if (!newGov.nameAr.trim()) {
      setGovAddError('اكتب اسم المحافظة الأول.');
      return;
    }
    const feeNum = Number(newGov.shippingFee);
    if (!Number.isFinite(feeNum) || feeNum < 0) {
      setGovAddError('مصاريف الشحن لازم تكون رقم صحيح.');
      return;
    }
    if (!newGov.estimatedDays.trim()) {
      setGovAddError('حدد مدة التوصيل (مثلاً 3-5).');
      return;
    }

    saveGovernorate({
      nameAr: newGov.nameAr.trim(),
      shippingFee: feeNum,
      estimatedDays: newGov.estimatedDays.trim(),
      codAvailable: newGov.codAvailable,
    });
    setNewGov({ nameAr: '', shippingFee: '80', estimatedDays: '3-5', codAvailable: true });
    setGovAddError('');
    setShowAddGov(false);
  };

  return (
    <div className="pt-6 md:pt-10">
      <div className="page-container">
        <PageHeading
          title="الشحن والخامات"
          description="تحكّم في مصاريف الشحن لكل محافظة، الخامات المتاحة، وسعر الطباعة المخصصة."
        />

        <div className="mt-10 grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-10">
          {/* START STICKY SPINE (4 cols): Open on --plaster (no SaaS settings card) */}
          <div className="space-y-12 text-start lg:sticky lg:top-[104px] lg:col-span-4">
            <form onSubmit={handleSaveCustomPrice} noValidate>
              <h2 className="type-h2 text-[var(--charcoal)]">التسعير الأساسي</h2>
              <p className="type-caption mt-1">السعر اللي بيظهر في صفحة صمّم جرابك بنفسك.</p>

              <div className="mt-4">
                <label
                  htmlFor="custom-case-price-input"
                  className="mb-1.5 block text-[14px] font-medium text-[var(--charcoal)]"
                >
                  سعر الطباعة المخصصة ({storeConfig.currencyLabel})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="custom-case-price-input"
                    type="number"
                    min="1"
                    step="5"
                    dir="ltr"
                    inputMode="numeric"
                    value={customPrice}
                    onChange={(e) => {
                      setCustomPrice(e.target.value);
                      setPriceError('');
                    }}
                    className="field-input flex-1 text-start tabular-nums"
                  />
                  <button type="submit" className="btn-primary shrink-0 !px-5">
                    احفظ
                  </button>
                </div>
                {priceError ? (
                  <p role="alert" className="mt-2 text-[13px] font-medium text-[var(--klein)]">
                    {priceError}
                  </p>
                ) : null}
              </div>
            </form>

            {/* Materials management */}
            <section aria-labelledby="materials-heading" className="space-y-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 id="materials-heading" className="type-h2 text-[var(--charcoal)]">
                  الخامات
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMat((prev) => !prev);
                    setEditingMatId(null);
                    setMatDraft({ nameAr: '', descriptionAr: '', priceDelta: '0' });
                    setMatError('');
                  }}
                  className="btn-secondary !min-h-[44px] !text-[14px]"
                >
                  {showAddMat ? 'إلغاء' : 'ضيف خامة'}
                </button>
              </div>

              {showAddMat ? (
                <form
                  onSubmit={handleSaveNewMaterial}
                  noValidate
                  className="space-y-3 rounded-[4px] bg-[var(--gallery-white)] p-5"
                >
                  <div>
                    <label htmlFor="new-mat-name" className="mb-1 block text-[14px] font-medium">
                      اسم الخامة
                    </label>
                    <input
                      id="new-mat-name"
                      type="text"
                      value={matDraft.nameAr}
                      onChange={(e) => setMatDraft((p) => ({ ...p, nameAr: e.target.value }))}
                      placeholder="مثلاً: سيليكون مبطّن"
                      className="field-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-mat-desc" className="mb-1 block text-[14px] font-medium">
                      وصف مختصر
                    </label>
                    <input
                      id="new-mat-desc"
                      type="text"
                      value={matDraft.descriptionAr}
                      onChange={(e) =>
                        setMatDraft((p) => ({ ...p, descriptionAr: e.target.value }))
                      }
                      placeholder="خامة مرنة بحماية إضافية للحواف"
                      className="field-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-mat-delta" className="mb-1 block text-[14px] font-medium">
                      فرق السعر ({storeConfig.currencyLabel})
                    </label>
                    <input
                      id="new-mat-delta"
                      type="number"
                      step="5"
                      dir="ltr"
                      value={matDraft.priceDelta}
                      onChange={(e) => setMatDraft((p) => ({ ...p, priceDelta: e.target.value }))}
                      className="field-input text-start tabular-nums"
                    />
                  </div>
                  {matError ? (
                    <p role="alert" className="text-[13px] font-medium text-[var(--klein)]">
                      {matError}
                    </p>
                  ) : null}
                  <button type="submit" className="btn-primary w-full">
                    ضيف الخامة
                  </button>
                </form>
              ) : null}

              <ul className="space-y-6">
                {materials.map((mat) => {
                  const isEditing = editingMatId === mat.id;
                  return (
                    <li key={mat.id} className="space-y-2">
                      {isEditing ? (
                        <form
                          onSubmit={(e) => handleSaveMaterialEdit(e, mat)}
                          noValidate
                          className="space-y-3 rounded-[4px] bg-[var(--gallery-white)] p-4"
                        >
                          <input
                            type="text"
                            aria-label="اسم الخامة"
                            value={matDraft.nameAr}
                            onChange={(e) =>
                              setMatDraft((p) => ({ ...p, nameAr: e.target.value }))
                            }
                            className="field-input"
                          />
                          <input
                            type="text"
                            aria-label="وصف الخامة"
                            value={matDraft.descriptionAr}
                            onChange={(e) =>
                              setMatDraft((p) => ({ ...p, descriptionAr: e.target.value }))
                            }
                            className="field-input"
                          />
                          <input
                            type="number"
                            aria-label="فرق السعر"
                            dir="ltr"
                            value={matDraft.priceDelta}
                            onChange={(e) =>
                              setMatDraft((p) => ({ ...p, priceDelta: e.target.value }))
                            }
                            className="field-input text-start tabular-nums"
                          />
                          {matError ? (
                            <p role="alert" className="text-[13px] font-medium text-[var(--klein)]">
                              {matError}
                            </p>
                          ) : null}
                          <div className="flex items-center gap-4">
                            <button type="submit" className="btn-primary !min-h-[42px] !px-5">
                              احفظ
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingMatId(null)}
                              className="btn-secondary !text-[14px] text-[var(--graphite)]"
                            >
                              إلغاء
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-[17px] font-semibold text-[var(--charcoal)]">
                                {mat.nameAr}
                              </h3>
                              {mat.descriptionAr ? (
                                <p className="type-caption mt-0.5 text-[14px]">
                                  {mat.descriptionAr}
                                </p>
                              ) : null}
                              <p className="type-caption mt-1 text-[13px] tabular-nums">
                                {mat.priceDelta > 0
                                  ? `+${mat.priceDelta} ${storeConfig.currencyLabel}`
                                  : 'بدون فرق سعر'}
                                {mat.isDefault ? ' — الخامة الأساسية' : ''}
                              </p>
                            </div>

                            <SwitchToggle
                              checked={mat.active}
                              onChange={(active) => saveMaterial({ ...mat, active })}
                              label={`تفعيل خامة ${mat.nameAr}`}
                            />
                          </div>

                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMatId(mat.id);
                                setShowAddMat(false);
                                setMatDraft({
                                  nameAr: mat.nameAr,
                                  descriptionAr: mat.descriptionAr || '',
                                  priceDelta: String(mat.priceDelta || 0),
                                });
                                setMatError('');
                              }}
                              className="btn-secondary !min-h-[44px] !text-[14px]"
                            >
                              عدّل
                            </button>

                            {!mat.isDefault ? (
                              <InlineConfirmDelete
                                ariaTarget={mat.nameAr}
                                onConfirm={() => deleteMaterial(mat.id)}
                              />
                            ) : null}
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          {/* END OPEN COLUMN (7 cols): Quiet plaster ledger for 16 Egyptian governorates */}
          <section
            aria-labelledby="governorates-heading"
            className="text-start lg:col-span-7 lg:col-start-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-2.5">
                <h2 id="governorates-heading" className="type-h2 text-[var(--charcoal)]">
                  المحافظات ومصاريف الشحن
                </h2>
                <span className="type-caption tabular-nums text-[15px]">{governorates.length}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddGov((prev) => !prev);
                  setGovAddError('');
                }}
                className="btn-secondary !min-h-[44px] !text-[15px]"
              >
                {showAddGov ? 'إلغاء' : 'ضيف محافظة'}
              </button>
            </div>

            {showAddGov ? (
              <form
                onSubmit={handleAddGovernorate}
                noValidate
                className="mt-5 rounded-[4px] bg-[var(--gallery-white)] p-5"
              >
                <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-4">
                    <label htmlFor="new-gov-name" className="mb-1.5 block text-[14px] font-medium">
                      اسم المحافظة
                    </label>
                    <input
                      id="new-gov-name"
                      type="text"
                      value={newGov.nameAr}
                      onChange={(e) => setNewGov((p) => ({ ...p, nameAr: e.target.value }))}
                      placeholder="مثلاً: مطروح"
                      className="field-input"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="new-gov-fee" className="mb-1.5 block text-[14px] font-medium">
                      الشحن ({storeConfig.currencyLabel})
                    </label>
                    <input
                      id="new-gov-fee"
                      type="number"
                      min="0"
                      step="5"
                      dir="ltr"
                      value={newGov.shippingFee}
                      onChange={(e) => setNewGov((p) => ({ ...p, shippingFee: e.target.value }))}
                      className="field-input text-start tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="new-gov-days" className="mb-1.5 block text-[14px] font-medium">
                      الأيام
                    </label>
                    <input
                      id="new-gov-days"
                      type="text"
                      dir="ltr"
                      value={newGov.estimatedDays}
                      onChange={(e) => setNewGov((p) => ({ ...p, estimatedDays: e.target.value }))}
                      placeholder="3-5"
                      className="field-input text-start tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <button type="submit" className="btn-primary w-full !px-4">
                      ضيف
                    </button>
                  </div>
                </div>
                {govAddError ? (
                  <p role="alert" className="mt-2.5 text-[13px] font-medium text-[var(--klein)]">
                    {govAddError}
                  </p>
                ) : null}
              </form>
            ) : null}

            <ul className="mt-8 space-y-6">
              {governorates.map((gov) => (
                <GovernorateLedgerRow
                  key={gov.id}
                  gov={gov}
                  currencyLabel={storeConfig.currencyLabel}
                  onSave={saveGovernorate}
                  onDelete={deleteGovernorate}
                />
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
