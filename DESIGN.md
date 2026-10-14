---
name: Zetra Electronics
description: A maker's bench seen through glass. Liquid-glass panes over a slow Zetra-blue field, light and dark.
colors:
  field-bg: "#eaf0fa"
  ink: "#0b1a33"
  ink-2: "#33435f"
  ink-3: "#56657f"
  brand: "#1653a6"
  brand-hover: "#0f4590"
  brand-ink: "#ffffff"
  brand-soft: "rgba(22, 83, 166, 0.1)"
  ember: "#f03c36"
  danger: "#b8241e"
  danger-soft: "rgba(184, 36, 30, 0.1)"
  ok: "#0d7148"
  ok-soft: "rgba(13, 113, 72, 0.12)"
  warn: "#935300"
  warn-soft: "rgba(201, 125, 0, 0.14)"
  line: "rgba(11, 26, 51, 0.1)"
  field: "rgba(255, 255, 255, 0.72)"
  glass-thin: "rgba(255, 255, 255, 0.46)"
  glass-regular: "rgba(255, 255, 255, 0.6)"
  glass-thick: "rgba(255, 255, 255, 0.82)"
  glass-solid: "#f6f8fc"
  plate: "#f3f6fb"
  plate-ink: "#56657f"
  chart: "#1653a6"
  ambient-blue: "#7aaeff"
  ambient-cyan: "#6fe0ee"
  ambient-ember: "#ffa395"
  footer-warm-dot: "#2f74e0"
typography:
  display:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.6rem / 3.75rem (sm) / 5.25rem (lg)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem / 3rem (sm)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "normal"
  price:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  data:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.875rem"
    fontWeight: 600
    fontFeature: "tnum"
rounded:
  control: "14px"
  tile: "20px"
  pane: "28px"
  pill: "9999px"
spacing:
  control-height: "44px"
  nav-height: "64px"
  card-inset: "10px"
  pane-padding: "24px"
  section-gap: "64px"
  section-gap-lg: "96px"
  container: "1280px"
  admin-container: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
    textColor: "{colors.brand-ink}"
  button-glass:
    backgroundColor: "{colors.glass-thin}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-glass-hover:
    backgroundColor: "{colors.glass-thin}"
    textColor: "{colors.brand}"
  button-ghost-hover:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.ink}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  input-field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "44px"
  badge-ok:
    backgroundColor: "{colors.ok-soft}"
    textColor: "{colors.ok}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-warn:
    backgroundColor: "{colors.warn-soft}"
    textColor: "{colors.warn}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  cart-count-badge:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.pill}"
    height: "20px"
  nav-pill:
    backgroundColor: "{colors.glass-thin}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "64px"
  product-card:
    backgroundColor: "{colors.glass-regular}"
    rounded: "{rounded.tile}"
    padding: "10px"
  photo-plate:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.plate-ink}"
    rounded: "{rounded.tile}"
  table-shell:
    backgroundColor: "{colors.glass-thick}"
    rounded: "{rounded.tile}"
---

# Design System: Zetra Electronics

## Overview

**Creative North Star: "Bench Glass"**

Zetra is a maker's bench seen through glass. Every surface is a liquid-glass pane floating over a slow, luminous field of drifting blue, cyan and faint ember light with a fine grain. Panes come in three tiers of thickness, each with a 1px specular edge, an inner highlight and a soft blue-tinted offset shadow. The parts themselves never sit on glass directly: every product photo rests on a light, opaque photo plate, so components read the same in both themes, the way they would on a white bench mat.

The system is dense where people work and generous where they decide. The storefront uses large panes, a big headline and a tilted stack of thick-glass part tags; account, checkout and the admin shell use the same materials more calmly, leaning on thick glass for forms, tables and summaries. One signature interaction carries the world: the Loupe, a red-ringed glass magnifier that reads chip markings off a product photo.

Colour is disciplined. Brand blue does the work (primary actions, active states, focus, the cart count). Logo red appears as a single ring on the Loupe. Status colours (green, amber, deep red) speak only for stock and errors. Type is one family, Hanken Grotesk, from 84px headlines to 11px tab labels; JetBrains Mono appears only where a value is data.

**Key Characteristics:**
- Three glass tiers (thin chrome, regular cards, thick forms/tables/summaries) with honest fallbacks for no backdrop-filter, reduced transparency, forced colours and reduced motion.
- A slow ambient field (three drifting radial lights plus grain) behind everything, fixed and non-interactive.
- A light photo plate under every product photo, in both themes.
- Pill and generously rounded silhouettes; glass droplets slide between active options.
- Light and dark themes defined token-for-token; dark is a deep navy field, not grey.

## Colors

A cool, blue-led palette: one working blue, one reserved red, three quiet status hues and a ladder of navy inks. Frontmatter carries light-theme values; every token is redefined under `.dark` (dark values in the sidecar).

### Primary
- **Logo Blue** (brand; dark theme #6aa5ff): primary buttons, links, focus outline (2px, 3px offset), caret, selection tint, active tab and admin nav icons, the cart count badge. Hover deepens to Pressed Blue (brand-hover).
- **Blue Wash** (brand-soft): hover ground for ghost buttons, table rows and admin nav items; neutral and brand badge ground; focus ring halo on fields.

### Secondary
- **Logo Red / Ember** (ember; dark #ff5a4f): the Loupe's 3px lens ring and nothing else in the shipped build.

### Tertiary (status)
- **Bench Green** (ok): "In stock" pill, success toasts.
- **Solder Amber** (warn): "Only N left" low-stock pill.
- **Fault Red** (danger): destructive buttons, sign-out, field errors, "Out of stock" pill. Deeper than ember so it carries text contrast.

### Neutral
- **Morning Field** (field-bg; dark #050a16): page ground under the ambient field; also the browser theme colour.
- **Navy Ink / Slate Ink / Mist Ink** (ink, ink-2, ink-3): headings and values / body and labels / meta, hints, placeholders, inactive tabs.
- **Hairline** (line): 1px dividers, field borders, table rules.
- **Glass grounds** (glass-thin, glass-regular, glass-thick, glass-solid): tier fills; glass-solid is the opaque fallback and the sticky table-header ground.
- **Photo Plate** (plate, plate-ink): the opaque ground under every product photo and the Loupe lens; plate-ink colours the "No photo yet" placeholder.
- **Ambient lights** (ambient-blue, ambient-cyan, ambient-ember): the three drifting field blobs at 70%, 55% and 35% opacity.
- **Chart Blue** (chart; dark #4d8ff5): the admin revenue series stroke and its fading area fill. Set per theme rather than aliased to brand.

### Named Rules
**The One Ring Rule.** Ember (#f03c36) is the Loupe ring. Destructive actions and out-of-stock use Fault Red (danger), low stock uses Solder Amber; no other surface takes the logo red.

**The Blue Does The Work Rule.** Every primary action, active state, focus indicator and the cart count are brand blue. There is no second accent.

**The Plate Rule.** Every product photo, thumbnail and the Loupe lens sit on the Photo Plate, in both themes. The dark-theme plate (#dde3ec) stays light so cut-out photos multiply cleanly.

## Typography

**Display Font:** Hanken Grotesk (ui-sans-serif, system-ui fallback), weights 400 to 800
**Body Font:** Hanken Grotesk
**Label/Mono Font:** JetBrains Mono (ui-monospace, SFMono-Regular fallback), weights 400 to 600, data only

**Character:** One confident grotesk carries everything, tightened as it grows (h1 to h3 at -0.025em by default, display at -0.04em). Mono is a measuring instrument, not a voice.

### Hierarchy
- **Display** (800, 41.6px / 60px sm / 84px lg, 0.98): the home hero headline only.
- **Headline** (800, 36px / 48px sm, -0.035em): page titles. Product, admin, auth and order-confirmed titles step down to 30px / 36px sm at -0.03em.
- **Title** (700, 18 to 20px): section and dialog headings.
- **Body** (400, 15px fields and card names at 600; 18px relaxed for the hero promise, held to 34rem): running text and controls.
- **Label** (600, 12 to 14px, sentence case): field labels, badges, table headers, tab labels (11px). Never uppercase or letter-spaced.
- **Price** (700, tabular figures, -0.025em; 14px to 36px): prices are Hanken, not mono.
- **Data** (JetBrains Mono, 400 to 600, tabular): spec values, order IDs (#ORD-n), payment IDs, stock and order quantities in admin.

### Named Rules
**The Data Only Rule.** JetBrains Mono appears only on values a person might copy, compare or count: spec values, order and payment IDs, quantities. Headings, labels, prices and UI never use it.

**The Sentence Case Rule.** No uppercase tracked labels anywhere, including the footer.

## Layout

Content sits in a centred 1280px container (admin main column 1200px) with 12px side gutters on phones and 24px on desktop. The storefront home stacks full-width panes with 64px gaps (96px on large screens); the hero is a two-column glass stage (1.25fr / 1fr) that collapses to one column on phones.

Chrome floats. On desktop a 64px glass pill navbar is fixed 12 to 16px from the top. Below `lg` (1024px) the navbar sheds categories, search field and account into icons, and a glass bottom tab bar (Shop, Search, Cart, Account) sits above the safe area; it steps aside while the product page's sticky buy bar is up. The admin shell is a two-column grid with a 16.5rem sticky thick-glass sidebar on desktop and a thin-glass pill header with a sheet menu on phones.

Tables reflow below `md` (768px): the header row hides and each row becomes a two-column card whose cells carry their own 11px labels. Controls are 44px tall; icon buttons are 40 to 44px circles.

## Elevation & Depth

Depth is material, not stacked shadow. Each pane is translucent glass blurred and saturated (175%) over the ambient field, edged by a 1px gradient specular rim (bright at the corners, clear across the middle) and lit from above by an inner highlight. A soft, layered shadow with a blue under-glow places it off the field. Interactive panes lift 3px on hover with a deeper shadow and a fully lit rim.

### Shadow Vocabulary
- **Glass rest** (`--glass-shadow`, light: `0 1px 2px rgba(11,26,51,.05), 0 10px 30px -10px rgba(11,26,51,.18), 0 30px 60px -24px rgba(22,83,166,.18)`): every pane at rest, the footer frame, and the sliding droplets.
- **Glass lift** (`--glass-shadow-lift`): hover state for lifting panes (product cards, hero part tags).
- **Inner light** (`--glass-inner`: `inset 0 1px 0 rgba(255,255,255,.75), inset 0 -1px 0 rgba(11,26,51,.03)`): always paired with the outer shadow.
- **Primary glow** (`inset 0 1px 0 rgba(255,255,255,.35), 0 10px 24px -10px var(--brand)`): primary buttons only.
- **Loupe lens** (`0 22px 44px -12px rgba(0,0,0,.45)` plus inner top light and bottom shade): the magnifier only.

### Named Rules
**The Three Tiers Rule.** Thin (46% fill, 18px blur) for chrome: navbar, icon buttons, segmented controls, glass buttons, the Magnify chip. Regular (60%, 24px) for cards, the hero stage and the mobile tab bar. Thick (82%, 28px) for forms, tables, summaries, dialogs, sheets, toasts and the admin sidebar.

**The Honest Fallback Rule.** Without backdrop-filter, or under prefers-reduced-transparency, glass becomes opaque glass-solid with no blur. Under forced-colors the rim is replaced by a 1px CanvasText border. Under reduced motion panes do not move, the hero does not rise in, the field does not drift and droplets jump instead of slide.

## Shapes

Generous, soft and continuous. Four radii: panes 28px (hero stage up to 36px), tiles and tables 20px, controls 14px, and full pills for the navbar, tab bar, segmented controls, badges, icon buttons and the Loupe. Nested shapes subtract their inset (a card's plate is the tile radius minus 6.4px; the product stage plate is the pane radius minus 8px). Borders are hairlines or the gradient rim; there are no heavy outlines. The only deliberate rotation is the hero's three part tags (-4deg, 3deg, -1.5deg on desktop, flattened under reduced motion).

## Components

### Buttons
Liquid and pressable: every button scales to 97% on press and eases on the liquid curve (cubic-bezier(0.22, 1, 0.36, 1), 300ms).
- **Shape:** 14px radius at sm (36px) and md (44px); 17.6px at lg (52px); icon buttons are 44px circles.
- **Primary:** brand fill, white text (navy in dark), 600 weight, with the primary glow. Hover moves to brand-hover.
- **Glass:** thin glass, ink text, turns brand on hover. Used for secondary actions such as "Browse all parts" (pill-shaped there).
- **Ghost:** ink-2 text; blue wash on hover.
- **Danger:** Fault Red fill, white text (page-ground navy text in dark), brightens on hover. Destructive confirmations only.
- **Link:** brand text, underline on hover.
- Loading shows a spinner and sets aria-busy; disabled drops to 50%.

### Chips (Badges and stock pills)
- **Style:** pill, 12px 600 sentence case, soft tinted ground with matching text; stock pills add a 6px dot.
- **State:** In stock (ok), Only N left (warn, at 5 or fewer), Out of stock (danger).

### Cards / Containers
- **Corner Style:** tile radius for product cards and tables; pane radius for panels, dialogs and the product stage.
- **Background:** regular glass for product cards; thick glass for tables, dialogs, sheets and toasts.
- **Shadow Strategy:** glass rest; product cards and hero tags lift on hover.
- **Internal Padding:** 10px around a product card's square plate, 12px around the text block; 16px toasts; 24px dialogs.

### Inputs / Fields
- **Style:** 44px tall, 14px radius, hairline border, translucent field fill, 15px text, faint inset top shadow, 600 label in ink-2 above, 12px hint in ink-3 below.
- **Focus:** border turns brand with a 4px blue-wash ring.
- **Error / Disabled:** danger border and danger-soft ring, 12px 600 error text below; disabled at 60% with a not-allowed cursor.

### Navigation
- **Desktop:** fixed thin-glass pill (64px) holding the logo disc and wordmark (Zetra 800, Electronics 600 ink-3), category menu, search combobox, theme toggle, cart and account as 40px glass circles.
- **Phone:** regular-glass bottom tab bar of four 56px tabs (20px icon, 11px 600 label). A thick-glass droplet slides under the active tab on the spring curve (cubic-bezier(0.2, 0.9, 0.1, 1), 500ms); active tab text is brand.
- **Cart count:** 20px brand pill with tabular 11px 700 figures and a blue glow, capped at 99+.
- **Admin:** thick-glass sidebar list with brand icons on the active item and blue-wash hover; sign-out in danger.

### Segmented Control
A thin-glass pill track with the same sliding thick-glass droplet as the tab bar; arrow keys move between options.

### Product Stage and the Loupe (signature)
The product photo sits on an inset Photo Plate inside a square regular-glass pane. On desktop the Loupe follows the pointer: a 168px circular lens at 2.5x zoom, ringed in 3px ember, filled with the plate colour and shaded like a glass bead; the cursor hides while it is up. On touch a thin-glass "Magnify" chip (top right) arms the lens so dragging moves it instead of scrolling; it reads "Done magnifying" while armed.

### Halftone Footer
A full-width canvas wordmark ("zetra", Hanken 800) printed as halftone dots, framed at pane radius with the glass rest shadow and a hairline ring, height clamp(460px, 46vw, 600px), grain 0.4. Palette: light uses the glass-solid ground, navy ink and dots that warm toward blue #2f74e0 under the pointer; dark uses #0e1729, #eaf1ff and #6aa5ff. The footer type is overridden to Hanken at 13.5px, sentence case, no tracking, with headings at 700 in ink-2. Red never enters the footer.

## Do's and Don'ts

### Do:
- **Do** pick a glass tier by role: thin for chrome, regular for cards and stages, thick for anything a person reads or fills in at length.
- **Do** put every product photo on the Photo Plate (plate token) in both themes, with the photo multiplied onto it.
- **Do** use brand blue for primary actions, focus, active states and the cart count.
- **Do** keep the ember ring on the Loupe, and use danger for destructive actions and out-of-stock, warn for low stock.
- **Do** set spec values, order IDs, payment IDs and quantities in JetBrains Mono with tabular figures.
- **Do** honour the four fallbacks (no backdrop-filter, reduced transparency, forced colours, reduced motion) on any new glass surface by using the shared glass material.
- **Do** move selection with a sliding glass droplet on the spring curve, and lift interactive panes 3px on the liquid curve.

### Don't:
- **Don't** use logo red (ember) for buttons, badges, prices, links, the footer or decoration.
- **Don't** put product photos directly on glass or on the dark field.
- **Don't** set headings, labels, prices or navigation in mono.
- **Don't** use uppercase, letter-spaced labels or eyebrows above headings.
- **Don't** introduce a second accent colour; status hues are for status only.
- **Don't** hand-roll a translucent surface with its own blur; it will skip the fallbacks.
