# Design rules — Admin Catalog Workspace (`case-store-admin`)

## Source of truth
- Before writing or changing any UI (components, pages, styles, animations), read `DESIGN.md` in the project root and follow it strictly.
- Its tokens (colors, type, spacing, radius, motion) are the single source of truth. Define them once as CSS variables / Tailwind theme values. Never invent new colors, fonts, or radii.
- Never modify any file inside the sibling `../case-store` project.

## Arabic and RTL
- The workspace is Arabic and right-to-left (`lang="ar"`, `dir="rtl"`). Wrap English design names, phone brands/models, and slugs in `<bdi dir="ltr">`.
- Use logical CSS properties and Tailwind logical utilities only (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`). Mirror directional icons; never mirror phone mockups or logos.
- Never apply letter-spacing to Arabic text.
- Write all Arabic copy yourself in light Egyptian colloquial following "Voice and copy" in `DESIGN.md`, and double-check spelling.

## Plan before building
- Before building a new page or major section, write a short design plan: layout concept, one bold element per screen, RTL ASCII wireframes (desktop & mobile), and an Avoid-list check.
- If any part reads like a generic SaaS admin dashboard, revise it before coding.

## Build rules
- Stack: React + Tailwind CSS + Motion + `react-router-dom`. Don't add extra UI component or icon libraries.
- Motion is strictly user-triggered (`prefers-reduced-motion` respected). No scroll-reveals, no hover-lift on rows or mockups.
- All data reads and writes go exclusively through `src/services/adminService.js` + `AdminContext` using identical schemas to `case-store`, persisted in versioned `localStorage` keys so a shared API can swap in cleanly later.
- Never use `window.confirm` or `window.alert`; use inline confirmations and direct validation messages.

## Before you finish
- Run `npm run build` cleanly.
- Open the running app in the browser at `390px` and `1440px` wide in RTL and take screenshots of every section and drawer.
- Critique the screenshots against `DESIGN.md`, find the most generic-looking element, and fix it.
- Report what you changed in two or three lines.
