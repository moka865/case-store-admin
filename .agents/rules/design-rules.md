# Design rules — Admin Operations & Catalog Workspace (`case-store-admin`)

## Source of truth
- Before writing or changing any UI (components, pages, styles, animations), read `DESIGN.md` in `case-store-admin` and follow it strictly.
- Brand tokens in `src/index.css` (`#010000`, `#F7F6F2`, `#ECEAE4`, `#FFFFFF`, `#111317`, `#4E535C`, `#D40C14`, `#FECE05`, `#0E6F4F`), `8px`/`12px`/`999px` radii, and self-hosted `Cairo` + `IBM Plex Sans Arabic` + `Bricolage Grotesque` fonts match the official **غلاف** storefront 1:1.
- Never modify any code files inside the sibling `../case-store` project.

## Arabic and RTL
- The workspace is Arabic and right-to-left (`lang="ar"`, `dir="rtl"`). Wrap English design names, phone brands/models, order IDs (`GH-...`), request IDs (`MM-...`), mobile numbers, and signed fees (`+50`) in `<bdi dir="ltr">`.
- Use logical CSS properties and Tailwind logical utilities only (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`). Mirror directional icons; never mirror logos or phone mockups.
- Never apply letter-spacing to Arabic text.
- Write all UI copy in friendly Egyptian Arabic (`عامية مصرية بسيطة`) with **zero Arabic diacritics (tashkeel `[\u064B-\u065F\u0670]`)**.

## Dashboard & Operations Integrity
- Derive every KPI, count, revenue sum, model coverage alert, and shipping figure strictly from `AdminContext` + `src/utils/dashboardMetrics.js`. Never display hardcoded or synthetic trend percentages.
- Respect role guards from `AdminLayout.jsx`: hide Catalog links (`/products`, `/categories`, `/models`, `/shipping`) when viewing as `ops`.
- Motion is strictly user-triggered (`prefers-reduced-motion` respected). Avoid heavy `backdrop-filter: blur` overlays.
- All data reads and writes go exclusively through `src/services/adminService.js` + `AdminContext` synced with the `case-store` Version 1 handoff schema.
- Never use `window.confirm` or `window.alert`; use inline confirmations and direct validation messages.

## Before finishing any UI change
- Verify zero tashkeel in modified/added source files and run `npm run build` cleanly.
- Verify the running app in Playwright/Chrome at `390px` (mobile) and `1440px` (desktop) in RTL with zero horizontal overflow and zero console errors.
