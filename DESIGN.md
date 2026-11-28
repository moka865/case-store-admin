# DESIGN.md: Phone Case Store — Admin Operations & Catalog Workspace (`غلاف — إدارة المتجر`)

Read this file before writing any UI in `case-store-admin`. All design tokens, typography, brand assets, and data schemas inherit 1:1 from the official **غلاف** storefront.

## Concept

A unified brand-native backoffice for **غلاف**, built from the official `#010000` / `#FECE05` / `#D40C14` / `#F7F6F2` design system. Operational data sits cleanly on `--paper` inside crisp bordered `--surface` cards, with zero chart bloat, zero invented metrics, and live `PhoneCaseMockup` previews rendered on the exact storefront `.product-stage` (`#ECEAE4`).

## Language and Direction

- Strict Arabic RTL (`<html lang="ar" dir="rtl">`). Only English design names, phone brands/models, URL slugs, order IDs (`GH-YYYYMMDD-XXXX`), and request IDs (`MM-YYYYMMDD-XXXX`) are Latin.
- Wrap every Latin string, phone number, and signed fee (`+50`) in `<bdi dir="ltr">` so BiDi never flips `+50` into `50+` inside Arabic copy.
- Use logical CSS / Tailwind utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`) exclusively.
- Western digits (`0-9`) for prices, counts, aspect ratios, dates, and fees. Currency goes after the number (`295 ج.م`).
- **Zero tashkeel (no Arabic diacritics `[\u064B-\u065F\u0670]`) anywhere in UI strings.**

## Official Brand Color Tokens (`src/index.css`)

```css
:root {
  --brand-black: #010000;       /* Header bar matching official logo ground */
  --paper: #F7F6F2;             /* Main page background */
  --card-bg: #ECEAE4;           /* Unified .product-stage background & muted chips */
  --surface: #FFFFFF;           /* Cards, drawers, inputs, popovers */
  --surface-muted: #E6E3DC;     /* Secondary hover/muted divider surfaces */
  --ink: #111317;               /* Primary text */
  --ink-muted: #4E535C;         /* Secondary text & captions */
  --brand: #D40C14;             /* Primary Crimson CTA, focus rings on light surfaces, alerts */
  --brand-hover: #B30910;
  --brand-tint: #FCEBEC;
  --brand-yellow: #FECE05;      /* Official Logo Gold (always paired with #111317 / #010000) */
  --brand-yellow-hover: #F2C200;
  --brand-yellow-tint: #FEF7D6;
  --jade: #0E6F4F;              /* COD active & confirmed states */
  --jade-tint: #E3F4EE;
  --border-subtle: rgba(17, 19, 23, 0.10);
  --border-strong: rgba(17, 19, 23, 0.22);
  --shadow-panel: 0 14px 34px rgba(17, 19, 23, 0.14);
}
```

- Backwards-compatible aliases (`--plaster`, `--gallery-white`, `--charcoal`, `--graphite`, `--klein`, `--input-border`) map onto the tokens above so sibling CRUD pages stay consistent.
- Focus rings: `--brand-yellow` inside `.brand-dark-bar` (`#010000` header), `--brand` inside `.surface-light-panel` and general light surfaces.

## Typography

- Self-hosted subsetted WOFF2 files in `public/fonts/` (zero external CDN requests):
  - Display / Headlines (`--font-display`): `"Bricolage Grotesque", "Cairo", "Cairo Fallback", system-ui, sans-serif` (weights `700`/`800`, zero letter-spacing on Arabic)
  - Body / UI (`--font-sans`): `"Bricolage Grotesque", "IBM Plex Sans Arabic", "IBM Plex Sans Arabic Fallback", system-ui, sans-serif`
  - Latin companion & tabular digits (`--font-latin` / `.latin-title`): `"Bricolage Grotesque"` (`-0.015em` tracking)
  - Mockup preview faces: `Readex Pro`, `Reem Kufi`, `Lalezar`, `Aref Ruqaa`, `Syne`, `Caveat`, `Unbounded`.

## Shape, Layout & Dashboard Structure

- Max width `--max-page-width: 1440px`, margins `--page-margin: clamp(16px, 3vw, 44px)`.
- Radii: `--radius-ui: 8px` (buttons, inputs, tiles), `--radius-stage: 12px` (cards, `.product-stage`, slide-over sheets), `--radius-pill: 999px` (filter tabs).
- **Sticky Brand Header (`AdminHeader`):** `#010000` ground with official `<BrandLogo />`, workspace pill (`إدارة المتجر`), demo role switcher (`الكل (المدير)` / `التشغيل والطلبات` / `إدارة الكتالوج`), utilities (`نزل JSON`, `رجع الأصل`), role-filtered nav strip with `#FECE05` active bar and pending counts, finished with the signature `4px` Crimson (`2/3`) + Gold (`1/3`) bottom rule.
- **Dashboard (`/overview`):**
  1. Command header with `HandoffImportButton`, `إدارة الطلبات`, and manager-only `التصميمات`.
  2. 4 Operational KPI cards driven strictly by live `AdminContext` metrics (`مستني تأكيد`, `قيد الطباعة`, `مع الشحن (تحصيل كاش)`, `إجمالي المسلم`).
  3. 12-column operational workspace (`8 cols` start + `4 cols` end):
     - **Start (`OrderPipelineSection`):** Proportional 6-stage status bar, status tabs, priority-sorted order queue with live `PhoneCaseMockup` thumbnails, per-order policy chips (`موديل مستني تأكيد`, `ديبوزت مطلوب`, `طباعة اسم +50 ج.م`), one-click phone/WhatsApp links, stage advance (blocked cleanly if `pendingModel`), and direct `<OrderDetailDrawer />` inspection.
     - **End Stack:** `MissingModelsCard` (open requests + linked order indicator + quick `"تم التواصل"`), `CatalogCoverageCard` (active/hidden/hero counts, category distribution, uncovered models alert e.g. `Tecno Pop 8`), and `FulfillmentPolicyCard` (COD governorate counts, shipping fee bounds, `customCasePrice`, `+50 ج.م` name fee, `2–7` day execution SLA, `4+` pieces / custom deposit rule).
- Respect role boundaries cleanly (`ops` never renders links to catalog-only routes `/products`, `/categories`, `/models`, `/shipping`).

## Contracts & Policies Synced with Storefront

- Single source of config: `src/config/store.js` (`namePrintFee: 50`, `customCasePrice: 320`, `productionDays: 2`, `maxProductionDays: 7`, `depositMinItems: 4`, `contact`, `social`).
- Shared handoff contract `src/contracts/handoffSchema.js` validates Version `1` JSON envelopes (`orders` with optional per-item `namePrintFee` and `pricing.namePrintFees` + `missingModelRequests`).
- Re-use `<OrderDetailDrawer />` for full inspection (`سعر الجرابات`, `+طباعة الأسماء`, pending-model resolution, custom image/print-spec JSON downloads, internal notes).
