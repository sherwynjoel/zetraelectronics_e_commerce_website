# Zetra Electronics: Liquid Glass Frontend Redesign

Date: 2026-10-14
Scope: every route and shared component in `apps/web` (storefront, account, checkout, admin).
Product truth: `PRODUCT.md`. Build path: code-first (`.impeccable/config.json`).

## 1. Decisions already made

| Question | Answer |
|---|---|
| Glass coverage | Glass everywhere: navigation, cards, product tiles, forms, panels, dialogs |
| Theme | Light and dark, following the system setting, with a manual toggle |
| Admin | Same family, calmer: shared tokens and glass shell, dense near-opaque tables and forms, real mobile layout |
| Audit fixes | Included |
| Brand | Keep logo, build palette on the logo blue, red ring as sparing accent, keep the tagline |
| Buyers | Makers and students, mostly on phones |

## 2. Approach

Three ways to do this were considered.

1. **Token-first system, then rebuild every page on it (chosen).** Write the glass material, color, type and motion as tokens, build a small component kit on them, then rebuild each route against the kit. Consistent, themeable, and it fixes the audit's root cause: no shared form or feedback components.
2. **Restyle in place.** Swap Tailwind classes page by page. Faster to start, but repeats today's drift: 410 raw color classes and 60 unlinked labels would just change color.
3. **Adopt a third-party kit with a glass theme.** Adds dependencies and a generic look; the signature interaction would still be custom.

## 3. Visual world: "Bench Glass"

THESIS: Zetra is a maker's bench seen through glass. Every surface is a pane of liquid glass floating over a slow, luminous field in Zetra blue. It refuses the category default of a white grid of identical product tiles on a flat page.

Signature interaction: **the Loupe.** Makers read chip markings through a magnifier. On product images, a round liquid-glass lens edged in the logo's red ring follows the pointer (or appears on press-and-drag on touch) and magnifies the part 2.5x. The ring is the brand mark made useful.

### Material

- **Ambient field.** A fixed full-viewport background: three large, soft, slowly drifting color fields (Zetra blue, cyan, and a faint red ember) plus a fine grain. It gives the glass something to refract. Light theme: cool porcelain ground. Dark theme: deep blue-black ink ground.
- **Glass tiers.** One material, three thicknesses, all tokens:
  - `glass-thin`: navigation, chips, toasts, floating controls. High translucency.
  - `glass-regular`: cards, product tiles, panels. Medium translucency.
  - `glass-thick`: forms, tables, checkout summary, dialogs, admin work areas. Near-opaque so body text always clears 4.5:1 contrast.
- **Glass anatomy.** Backdrop blur with a saturation boost, a 1px specular edge (bright top-left, fading bottom-right, drawn with a gradient border mask), an inner top highlight, and a soft offset drop shadow. Hover lifts the pane and brightens the specular edge.
- **Liquid motion.** Controls morph rather than jump: the active nav pill and segmented controls slide a glass droplet between options; buttons compress slightly on press and spring back.
- **Fallbacks.** No backdrop-filter support, `prefers-reduced-transparency`, or forced colors: glass becomes solid tinted surfaces. `prefers-reduced-motion`: the field stops drifting, morphs become crossfades, the Loupe still works without easing.

### Color (both themes from one token set)

- Primary: Zetra blue sampled from the logo, with a lighter tint for dark theme.
- Accent: logo red, used only for the Loupe ring, low-stock and out-of-stock states and destructive actions.
- Neutrals tinted toward blue, never flat gray.
- State colors: success green, warning amber, danger red, info blue, each with a glass-tinted background.
- Theme switching: class on `<html>` set before paint by an inline script, so there is no flash.

### Type

- UI and display: **Hanken Grotesk** via `next/font`. Display sizes tight-tracked, weights 400 to 800.
- Data: **JetBrains Mono** only for part numbers, spec values, order IDs, quantities and table figures, with tabular numerals.
- Outfit, Geist and Arial are removed.

## 4. Architecture

### Foundations (`globals.css`)
- Color, glass, radius, shadow, motion and z-index tokens for light and dark, wired into Tailwind v4 `@theme`.
- The three glass tiers as utilities (`glass-thin`, `glass-regular`, `glass-thick`) with fallbacks.
- Browser surfaces themed: selection, caret, scrollbars, focus ring, link underline offset.

### Component kit (`src/components/ui`)
Each file has one job and no data fetching.
- `glass-panel.tsx`: the material as a component (tier, padding, interactive lift).
- `button.tsx`: rebuilt (primary, glass, ghost, danger, link; sizes; loading state; a `ButtonLink` for navigation).
- `field.tsx`: label, input, hint and error wired with `useId` and `aria-describedby`; also `TextareaField` and `SelectField`.
- `segmented.tsx`: liquid droplet segmented control.
- `badge.tsx`, `stock-pill.tsx`, `price.tsx` (INR formatting, tabular numerals).
- `toast.tsx`: glass toasts with a `toast()` helper; replaces every `alert()`.
- `confirm-dialog.tsx`: replaces every `confirm()`.
- `sheet.tsx`: glass side and bottom sheets (mobile menu, filters, admin nav).
- `skeleton.tsx`, `empty-state.tsx`, `spinner.tsx`, `product-image.tsx` (image with designed no-image fallback).
- `table.tsx`: admin data table shell with sticky header and stacked mobile rows.
- `theme-toggle.tsx` and `theme-script.tsx`.
- `loupe.tsx`: the signature magnifier.

### Shell
- `ambient-field.tsx`: the background.
- Storefront: floating glass navbar (logo, category menu, search, theme, cart, account). Mobile gets a compact top bar plus a bottom glass tab bar (Shop, Search, Cart, Account). Categories come from the API, not a hard-coded list.
- Footer: glass slab; shows store contact details only when settings contain them; category links built from real categories.
- Admin: glass sidebar on desktop, sheet on mobile, glass top bar with page title.

### Routes rebuilt (all 31)
Storefront: home, products, category, search, product detail, cart, checkout, checkout success, track order, profile, login, register, forgot password, reset password, verify email, help, contact, privacy, terms.
Admin: layout, dashboard, products, new product, edit product, inventory, categories, orders, order detail, customers, settings.

API calls, stores, auth flows and Razorpay integration stay as they are. Presentation changes, plus the audit fixes below.

## 5. Audit fixes folded in
1. Every input gets a linked label via `Field`.
2. All 36 `alert()` and `confirm()` calls become toasts, inline errors or the confirm dialog.
3. Empty store settings hide the field instead of showing invented values.
4. Fake wishlist button removed; footer and nav categories come from the API.
5. Cookie banner removed: the site sets no tracking cookies, only functional local storage for cart and login. The privacy page states this.
6. Reduced motion and reduced transparency honored.
7. Link-wrapping-button nesting removed.
8. Missing `/placeholder-product.png` replaced by the `product-image` fallback.
9. Dead dark-mode classes replaced by real tokens.

## 6. Error handling and states
Every data view ships loading (skeleton), empty, error (glass panel with retry) and success states. Forms show inline field errors from the API message plus a toast for network failures. Checkout keeps payment errors on the page with a retry action.

## 7. Verification
- Type check and lint on every touched file; `next build` passes.
- Screenshot rounds at 1440px and 390px, light and dark, for storefront routes and representative admin routes (admin through a local test login).
- Impeccable detector run once at the end; findings fixed.
- Fresh-context finish review by impeccable's reviewer agent against this direction; then DESIGN.md and `.impeccable/design.json` written by its documenter agent.
- Performance guard: grids and tables do not stack nested backdrop-filter layers; blur radius capped; the ambient field animates transform only.

## 8. Out of scope
Backend changes (including the order-quantity and webhook security fixes found earlier), new features such as wishlist or reviews, product photography, and copywriting beyond labels, errors and empty states.
