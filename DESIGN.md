# DESIGN.md: Phone Case Store — Admin Catalog Workspace (`غلاف — إدارة الكتالوج`)

Read this file before writing any UI. Follow it strictly. If a choice isn't covered here, decide in the spirit of the concept below, never by falling back on generic SaaS dashboard defaults.

## Concept

The backroom studio ledger of a quiet gallery wall. Instead of a loud SaaS dashboard filled with KPI boxes, traffic-light badges, and bordered tables, the catalog workspace shares the exact calm plaster aesthetic of the `غلاف` storefront. The printed phone cases and live device silhouettes supply all visual color; the interface stays neutral plus a single accent. Confidence comes from clear Arabic typography, generous spacing, and live hardware previews — never from visual clutter.

## Language and direction

- The whole workspace is Arabic and right-to-left: `<html lang="ar" dir="rtl">`. Only English design names, phone brands/models, URL slugs, and technical layout identifiers are Latin.
- Wrap every English product name, phone model name, brand name, and slug in `<bdi dir="ltr">` so BiDi renders cleanly inside Arabic copy.
- Use logical CSS only: `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `text-align: start`. In Tailwind use `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`. Never use physical left/right.
- Mirror directional icons (chevrons, back/forward arrows). Do not mirror logos, phone mockups, or media/utility icons.
- Horizontal scrollers start at the right edge. Slide-over drawers enter from the `end` side (physical left in RTL).
- Digits are Western (`0-9`) for prices, counts, aspect ratios, radii, and shipping fees. Currency goes after the number: `295 ج.م`.

## Color tokens

```css
:root {
  --plaster: #E6E8E4;        /* page background */
  --gallery-white: #F6F6F3;  /* surfaces: drawers, popovers, inputs, form panels */
  --charcoal: #26282B;       /* text, headlines */
  --graphite: #5A5E63;       /* secondary text, captions, inactive metadata */
  --klein: #1236C9;          /* the only accent */
}
```

- Klein is for the primary CTA, active nav underline, selected states, and focus rings only. Keep it under ~5% of any screen.
- Text on klein is gallery-white.
- No gradients, no glassmorphism, no extra hues (no green/red/yellow SaaS status pills). The phone case artworks are the only colorful things.

## Typography

- One stack, two faces: `font-family: "Bricolage Grotesque", "Readex Pro", system-ui, sans-serif`. Bricolage Grotesque supplies Latin glyphs and Western digits; Readex Pro supplies all Arabic.
- Arabic rules: never apply letter-spacing (positive or negative) to Arabic text, it breaks letter joining. No italics, no text-transform. Arabic gets generous line-height.
- Scale (Arabic text):
  - H1: `clamp(32px, 4.5vw, 44px)` / 1.25, weight 700
  - H2: `clamp(24px, 3vw, 30px)` / 1.3, weight 700
  - H3: `20px–22px` / 1.4, weight 600
  - Body: `16px–17px` / 1.7, weight 400
  - Caption: `14px` / 1.5, weight 500, graphite
- Latin-only text (design names, model names, slugs) may use weight 500–700 and tight tracking (`-0.02em`) at larger sizes.
- Max line length 60 characters for explanatory copy.
- No small eyebrow labels above headings.

## Layout

- 12-column grid, max width `1320px`, page margins `clamp(16px, 4vw, 56px)`.
- Vertical rhythm between major sections: `64px–96px` desktop, `48px` mobile.
- Text aligns to the start (right). Vary spatial composition per section instead of repeating identical SaaS templates.
- **No cards, no KPI stat boxes, no bordered tables.** Catalog rows sit directly on `--plaster` separated cleanly by generous spacing (no boxes, no drop shadows, no zebra striping, no decorative hairlines).
- Spend boldness in **one place per screen**:
  - `/products`: vibrant live `PhoneCaseMockup` prints hanging in an open curatorial ledger + live preview stage in the slide-over editor.
  - `/categories`: oversized exhibition-scale Arabic category names (`28px–40px`) directly on plaster.
  - `/models`: real hardware silhouettes (`PhoneCaseMockup`) showing per-model camera cutouts & corner radii + live geometry morphing in the drawer.
  - `/shipping`: asymmetric sticky-spine split separating store pricing/materials from the open 16-governorate inline ledger.

## Shape and borders

- UI radius: `4px` (buttons, inputs, drawers, popovers, toggles). No decorative pill badges (keep status indicators purely typographic or `4px` outlined when interactive).
- Case mockups keep real device corner radii.
- `1px` border `rgba(38, 40, 43, 0.18)` ONLY on inputs and drop zones where needed. No decorative dividers or hairlines.
- No drop shadows on UI elements.

## Components

- **Shared Sticky Header (`غلاف — إدارة الكتالوج`):** sticky `--plaster` background. Inline-start (right): brand mark `غلاف` + quiet workspace label `إدارة الكتالوج` (architected so a future Operations workspace switch can slot beside it without refactor). Center-start: 4 `NavLink` items (`التصميمات`, `الأقسام`, `الموديلات`, `الشحن والخامات`) marked active with a `2px` Klein underline (`underline-offset-8`), never a fill. On mobile (`< 1024px`), nav collapses cleanly into a dedicated second row (`44px` touch targets). Inline-end (physical left): quiet underlined utility actions (`نزّل JSON`, `رجّع الأصل` with anchored inline confirmation popover).
- **Buttons:** primary = klein background, gallery-white text, `48px` high, `4px` radius. Secondary = text button with underline (`44px` minimum touch target). No arrows appended to labels. Labels are imperative Egyptian Arabic verbs (`ضيف تصميم جديد`, `احفظ التعديلات`, `عدّل`, `امسح`, `تأكيد المسح`).
- **Selected state:** `2px` klein outline with `2px` offset (`is-selected`). Never a color fill.
- **Slide-over Editor Drawers (Products & Models):** enter from `end-0` (physical left in RTL) on desktop (`--gallery-white` panel over solid matte charcoal scrim `rgba(38, 40, 43, 0.35)`, zero blur), full-height bottom sheet on mobile. Include a live `PhoneCaseMockup` preview stage on `--plaster` that updates immediately (`<= 150ms`) as fields change.
- **Inline Delete & Reset Confirmations:** never use `window.confirm` or blocking alert modals. Clicking `امسح` swaps cleanly inline to `متأكد؟` + `تأكيد المسح` + `إلغاء`. Deleting a category that still has linked products shows a direct non-apologetic inline explanation telling the admin to reassign or remove those designs first.

## Motion

- Easing `cubic-bezier(0.22, 1, 0.36, 1)`. Durations: fast `150ms`, base `250ms`, layout `350–400ms`.
- Motion is strictly user-triggered:
  - Slide-over drawers opening/closing from `end` side (`240ms`)
  - Route fade (`150ms` plain opacity)
  - Filter / reorder / CRUD list layout reflows (`350ms` Motion `layout`)
  - Live mockup preview updating in place (`<= 150ms`)
- No scroll-triggered reveals, no hover lift/scale on rows or mockups, no looping ambient animations.
- Respect `prefers-reduced-motion` via `<MotionConfig reducedMotion="user">`.

## Imagery and mockups

- Reuse the exact `PhoneCaseMockup` and `CaseArtworks` renderer from `case-store` so admin previews match the storefront pixel-for-pixel.
- Products support either a built-in `artworkId` from `CaseArtworks` OR an uploaded `customArtworkUrl` (image/SVG saved as data URL in the mock layer).
- Cases have no color variants; never show color swatches.

## Voice and copy

- Light, friendly Egyptian colloquial (`عامية مصرية بسيطة`), concise and direct for an Egyptian store owner / catalog manager.
- Imperative action verbs: `ضيف تصميم جديد`, `ارفع ملف التصميم`, `احفظ`, `عدّل`, `امسح`, `رجّع الأصل`, `نزّل JSON`.
- Validation errors explain plainly what is missing and how to fix it without apologizing (e.g., `"اكتب اسم التصميم بالإنجليزي الأول."`, `"السعر لازم يكون رقم أكبر من صفر."`).
- Empty states guide the next action directly: `"مفيش تصميمات مطابقة للبحث ده. امسح البحث أو ضيف تصميم جديد."`
- No lorem ipsum, no formal MSA stiffness, no emoji.

## Avoid (these read as generic AI SaaS dashboards)

- KPI summary cards row at the top of pages (`Total Products`, `Revenue`, etc.)
- Heavy dark sidebar + top bar chrome
- Bordered white card containers around every row or section, soft drop shadows, zebra-striped tables
- Colored traffic-light pills (green/red/amber/purple badges), icon buttons without labels, emoji
- Browser `window.confirm` / `alert` dialogs or centered generic popups
- Eyebrow labels above headings, `"01 / 02 / 03"` decorative numbering, middle-dot (`·`) strings, arrows on button labels
- Scroll-triggered fade-ups, hover elevation on rows, or physical `left`/`right` CSS in an RTL layout

## Quality floor

- Responsive from `360px` wide (`390px` and `1440px` verified in RTL), zero horizontal overflow, zero clipped Arabic ascenders.
- WCAG AA contrast, visible Klein focus ring, touch targets at least `44px`, strict RTL keyboard focus order.
- Full keyboard operability across header nav, search/filters, brand tabs, compatible-model checklists, slide-over drawers (`Escape` to close), and inline delete confirmations.
