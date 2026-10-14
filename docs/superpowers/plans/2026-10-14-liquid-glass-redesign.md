# Liquid Glass Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every route and shared component of `apps/web` on a token-driven liquid-glass design system ("Bench Glass") with light and dark themes, the Loupe signature interaction, and the audit's accessibility and honesty fixes.

**Architecture:** Foundations first (tokens, glass material, fonts, theme), then a small tested component kit in `src/components/ui`, then the storefront and admin shells, then each route rebuilt on the kit. API calls, Zustand stores, auth and Razorpay logic are preserved verbatim; only presentation and the listed audit fixes change.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, Zustand 5, lucide-react, framer-motion, recharts. New dev deps: vitest, @vitejs/plugin-react, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom.

**Spec:** `docs/superpowers/specs/2026-10-14-liquid-glass-redesign-design.md`

## Global Constraints

- Brand blue `#1653A6` (sampled from `public/logo.png`); logo red `#F03C36` used only for the Loupe ring, stock warnings and destructive actions.
- Fonts: Hanken Grotesk (UI and display), JetBrains Mono (data only). No Outfit, Geist, Inter or Arial.
- Glass everywhere, in three tiers: `glass-thin`, `glass-regular`, `glass-thick`. Body text on any glass clears 4.5:1.
- Light and dark themes from one token set; theme class on `<html>` set before paint; storage key `zetra-theme`.
- Respect `prefers-reduced-motion`, `prefers-reduced-transparency`, `forced-colors`, and missing `backdrop-filter`.
- No `alert()` or `confirm()` anywhere in `apps/web/src`. No unlinked `<label>`. No raw hex colors or raw Tailwind palette colors (`slate-*`, `blue-*`, etc.) in components; tokens only.
- Never render invented store data: empty settings hide the field.
- No eyebrow/kicker labels above headings, no gradient text, no colored side borders on cards.
- Preserve every API endpoint, request shape and store interaction exactly.
- Work on branch `redesign/liquid-glass`. Commit after each task.

## Deviation note

Route tasks (Tasks 7 to 15) rebuild existing pages. Their steps give the exact composition, kit components, states and acceptance checks, and point at the existing file for behavior to preserve, instead of repeating 7,500 lines of page code in this document. Foundation and kit tasks (Tasks 1 to 6) carry full code and tests.

## File Map

Create:
- `apps/web/vitest.config.ts`, `apps/web/src/test/setup.ts`
- `apps/web/src/lib/format.ts` (+ test), `apps/web/src/lib/status.ts` (+ test), `apps/web/src/lib/theme.ts` (+ test)
- `apps/web/src/components/ui/`: `glass-panel.tsx`, `button.tsx` (replace), `field.tsx` (+ test), `badge.tsx`, `stock-pill.tsx`, `price.tsx`, `spinner.tsx`, `skeleton.tsx`, `empty-state.tsx`, `product-image.tsx`, `toast.tsx` (+ test), `confirm-dialog.tsx` (+ test), `sheet.tsx`, `segmented.tsx`, `table.tsx`, `theme-toggle.tsx`, `theme-script.tsx`, `loupe.tsx` (+ `loupe-math.ts` + test)
- `apps/web/src/components/layout/ambient-field.tsx`, `mobile-tab-bar.tsx`
- `apps/web/src/components/admin/admin-shell.tsx`

Modify: `globals.css`, `app/layout.tsx`, every file under `app/` and `components/`.
Delete: `components/cookie-consent.tsx`, `components/client-auth-buttons.tsx` if unused after Task 7.

---

### Task 1: Test harness and formatting helpers

**Files:**
- Create: `apps/web/vitest.config.ts`, `apps/web/src/test/setup.ts`, `apps/web/src/lib/format.ts`, `apps/web/src/lib/format.test.ts`, `apps/web/src/lib/status.ts`, `apps/web/src/lib/status.test.ts`
- Modify: `apps/web/package.json` (scripts, devDependencies)

**Interfaces:**
- Produces: `formatINR(value: number): string`, `formatDate(value: string | Date): string`, `statusTone(status: string): Tone`, `type Tone = "neutral" | "brand" | "ok" | "warn" | "danger"`.

- [ ] **Step 1: Install test tooling**

Run (in `apps/web`): `npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom`
Add script: `"test": "vitest run"`.

- [ ] **Step 2: Config**

```ts
// apps/web/vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { environment: "jsdom", setupFiles: ["./src/test/setup.ts"], globals: true },
});
```

```ts
// apps/web/src/test/setup.ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Write failing tests**

```ts
// apps/web/src/lib/format.test.ts
import { formatINR, formatDate } from "./format";

test("formats rupees with Indian grouping and two decimals", () => {
  expect(formatINR(1234.5)).toBe("₹1,234.50");
  expect(formatINR(123456)).toBe("₹1,23,456.00");
  expect(formatINR(0)).toBe("₹0.00");
});

test("formats dates in en-IN short form", () => {
  expect(formatDate("2026-10-14T10:00:00Z")).toBe("14 Oct 2026");
});
```

```ts
// apps/web/src/lib/status.test.ts
import { statusTone } from "./status";

test("maps order statuses to tones", () => {
  expect(statusTone("PAID")).toBe("brand");
  expect(statusTone("SHIPPED")).toBe("brand");
  expect(statusTone("DELIVERED")).toBe("ok");
  expect(statusTone("PENDING")).toBe("warn");
  expect(statusTone("CANCELLED")).toBe("danger");
  expect(statusTone("whatever")).toBe("neutral");
});
```

- [ ] **Step 4: Run, expect failure** — `npm test` → FAIL, modules not found.

- [ ] **Step 5: Implement**

```ts
// apps/web/src/lib/format.ts
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export function formatINR(value: number): string {
  return inr.format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value: string | Date): string {
  return day.format(typeof value === "string" ? new Date(value) : value);
}
```

```ts
// apps/web/src/lib/status.ts
export type Tone = "neutral" | "brand" | "ok" | "warn" | "danger";

const map: Record<string, Tone> = {
  PENDING: "warn",
  PAID: "brand",
  PROCESSING: "brand",
  SHIPPED: "brand",
  DELIVERED: "ok",
  CANCELLED: "danger",
};

export function statusTone(status: string): Tone {
  return map[status?.toUpperCase()] ?? "neutral";
}
```

- [ ] **Step 6: Run, expect pass** — `npm test` → PASS.
- [ ] **Step 7: Commit** — `git commit -m "test: add vitest harness and formatting helpers"`

---

### Task 2: Design tokens, glass material, fonts, theme, ambient field

**Files:**
- Modify: `apps/web/src/app/globals.css` (replace), `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/lib/theme.ts`, `apps/web/src/lib/theme.test.ts`, `apps/web/src/components/ui/theme-script.tsx`, `apps/web/src/components/ui/theme-toggle.tsx`, `apps/web/src/components/layout/ambient-field.tsx`

**Interfaces:**
- Produces: CSS classes `glass`, `glass-thin`, `glass-regular`, `glass-thick`, `glass-lift`; Tailwind colors `bg`, `ink`, `ink-2`, `ink-3`, `brand`, `brand-hover`, `brand-ink`, `brand-soft`, `ember`, `ember-text`, `ok`, `warn`, `danger` (+ `-soft` variants), `line`, `field`; fonts `font-sans`, `font-mono`; `resolveTheme(pref: ThemePref, systemDark: boolean): "light" | "dark"`; `type ThemePref = "system" | "light" | "dark"`; `<ThemeScript/>`, `<ThemeToggle/>`, `<AmbientField/>`.
- Legacy aliases (`primary`, `muted-foreground`, `background`, `foreground`, `border`, `card`, `muted`, `secondary`, `accent`, `destructive`, `input`, `ring`) stay mapped to new tokens until Task 16 removes them, so unconverted pages keep rendering.

- [ ] **Step 1: Failing theme test**

```ts
// apps/web/src/lib/theme.test.ts
import { resolveTheme, nextPref } from "./theme";

test("resolves system preference", () => {
  expect(resolveTheme("system", true)).toBe("dark");
  expect(resolveTheme("system", false)).toBe("light");
  expect(resolveTheme("light", true)).toBe("light");
  expect(resolveTheme("dark", false)).toBe("dark");
});

test("cycles system → light → dark → system", () => {
  expect(nextPref("system")).toBe("light");
  expect(nextPref("light")).toBe("dark");
  expect(nextPref("dark")).toBe("system");
});
```

- [ ] **Step 2: Run, expect FAIL.**

- [ ] **Step 3: Implement theme helpers**

```ts
// apps/web/src/lib/theme.ts
export type ThemePref = "system" | "light" | "dark";
export const THEME_KEY = "zetra-theme";

export function resolveTheme(pref: ThemePref, systemDark: boolean): "light" | "dark" {
  if (pref === "system") return systemDark ? "dark" : "light";
  return pref;
}

export function nextPref(pref: ThemePref): ThemePref {
  return pref === "system" ? "light" : pref === "light" ? "dark" : "system";
}

export function applyTheme(pref: ThemePref) {
  const dark = resolveTheme(pref, window.matchMedia("(prefers-color-scheme: dark)").matches) === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}
```

```tsx
// apps/web/src/components/ui/theme-script.tsx
const code = `(function(){try{var p=localStorage.getItem('zetra-theme')||'system';var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light'}catch(_){}})()`;
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
```

```tsx
// apps/web/src/components/ui/theme-toggle.tsx
"use client";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { THEME_KEY, ThemePref, applyTheme, nextPref } from "@/lib/theme";
import { cn } from "@/lib/utils";

const labels: Record<ThemePref, string> = { system: "Theme: match system", light: "Theme: light", dark: "Theme: dark" };

export function ThemeToggle({ className }: { className?: string }) {
  const [pref, setPref] = useState<ThemePref>("system");
  useEffect(() => {
    try { setPref((localStorage.getItem(THEME_KEY) as ThemePref) || "system"); } catch {}
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { try { if ((localStorage.getItem(THEME_KEY) || "system") === "system") applyTheme("system"); } catch {} };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const Icon = pref === "light" ? Sun : pref === "dark" ? Moon : Monitor;
  return (
    <button
      type="button"
      aria-label={labels[pref]}
      title={labels[pref]}
      onClick={() => { const p = nextPref(pref); setPref(p); try { localStorage.setItem(THEME_KEY, p); } catch {} applyTheme(p); }}
      className={cn("glass glass-thin grid size-10 place-items-center rounded-full text-ink-2 transition hover:text-ink", className)}
    >
      <Icon className="size-[18px]" aria-hidden />
    </button>
  );
}
```

- [ ] **Step 4: Replace `globals.css`**

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-bg: var(--bg);
  --color-ink: var(--ink);
  --color-ink-2: var(--ink-2);
  --color-ink-3: var(--ink-3);
  --color-brand: var(--brand);
  --color-brand-hover: var(--brand-hover);
  --color-brand-ink: var(--brand-ink);
  --color-brand-soft: var(--brand-soft);
  --color-ember: var(--ember);
  --color-ember-text: var(--ember-text);
  --color-ember-soft: var(--ember-soft);
  --color-ok: var(--ok);
  --color-ok-soft: var(--ok-soft);
  --color-warn: var(--warn);
  --color-warn-soft: var(--warn-soft);
  --color-danger: var(--danger);
  --color-danger-soft: var(--danger-soft);
  --color-line: var(--line);
  --color-field: var(--field);

  /* legacy aliases, removed in Task 16 */
  --color-background: var(--bg);
  --color-foreground: var(--ink);
  --color-primary: var(--brand);
  --color-primary-foreground: var(--brand-ink);
  --color-secondary: var(--brand-soft);
  --color-secondary-foreground: var(--brand);
  --color-muted: var(--brand-soft);
  --color-muted-foreground: var(--ink-3);
  --color-accent: var(--brand-soft);
  --color-accent-foreground: var(--ink);
  --color-destructive: var(--danger);
  --color-destructive-foreground: #fff;
  --color-card: var(--glass-thick-bg);
  --color-card-foreground: var(--ink);
  --color-border: var(--line);
  --color-input: var(--line);
  --color-ring: var(--brand);

  --font-sans: var(--font-hanken), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), ui-monospace, SFMono-Regular, monospace;

  --radius-pane: 1.75rem;
  --radius-tile: 1.25rem;
  --radius-control: 0.875rem;

  --ease-liquid: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

:root {
  --bg: #eaf0fa;
  --ink: #0b1a33;
  --ink-2: #33435f;
  --ink-3: #56657f;
  --brand: #1653a6;
  --brand-hover: #0f4590;
  --brand-ink: #ffffff;
  --brand-soft: rgba(22, 83, 166, 0.1);
  --ember: #f03c36;
  --ember-text: #b4261f;
  --ember-soft: rgba(240, 60, 54, 0.12);
  --ok: #0d7148;
  --ok-soft: rgba(13, 113, 72, 0.12);
  --warn: #935300;
  --warn-soft: rgba(201, 125, 0, 0.14);
  --danger: #b8241e;
  --danger-soft: rgba(184, 36, 30, 0.1);
  --line: rgba(11, 26, 51, 0.1);
  --field: rgba(255, 255, 255, 0.72);

  --glass-thin-bg: rgba(255, 255, 255, 0.46);
  --glass-regular-bg: rgba(255, 255, 255, 0.6);
  --glass-thick-bg: rgba(255, 255, 255, 0.82);
  --glass-solid: #f6f8fc;
  --glass-edge-hi: rgba(255, 255, 255, 0.95);
  --glass-edge-lo: rgba(255, 255, 255, 0.2);
  --glass-inner: inset 0 1px 0 rgba(255, 255, 255, 0.75), inset 0 -1px 0 rgba(11, 26, 51, 0.03);
  --glass-shadow: 0 1px 2px rgba(11, 26, 51, 0.05), 0 10px 30px -10px rgba(11, 26, 51, 0.18), 0 30px 60px -24px rgba(22, 83, 166, 0.18);
  --glass-shadow-lift: 0 2px 4px rgba(11, 26, 51, 0.06), 0 18px 40px -12px rgba(11, 26, 51, 0.22), 0 40px 80px -28px rgba(22, 83, 166, 0.26);

  --field-a: #7aaeff;
  --field-b: #6fe0ee;
  --field-c: #ffa395;
  --grain-opacity: 0.05;
  color-scheme: light;
}

.dark {
  --bg: #050a16;
  --ink: #eaf1ff;
  --ink-2: #bccae3;
  --ink-3: #93a3c2;
  --brand: #6aa5ff;
  --brand-hover: #8cbaff;
  --brand-ink: #03112a;
  --brand-soft: rgba(106, 165, 255, 0.14);
  --ember: #ff5a4f;
  --ember-text: #ff8a80;
  --ember-soft: rgba(255, 90, 79, 0.16);
  --ok: #4fd69a;
  --ok-soft: rgba(79, 214, 154, 0.14);
  --warn: #f5b84a;
  --warn-soft: rgba(245, 184, 74, 0.14);
  --danger: #ff7a70;
  --danger-soft: rgba(255, 122, 112, 0.14);
  --line: rgba(234, 241, 255, 0.1);
  --field: rgba(10, 18, 36, 0.6);

  --glass-thin-bg: rgba(18, 28, 52, 0.42);
  --glass-regular-bg: rgba(16, 26, 48, 0.56);
  --glass-thick-bg: rgba(13, 21, 40, 0.8);
  --glass-solid: #0e1729;
  --glass-edge-hi: rgba(255, 255, 255, 0.26);
  --glass-edge-lo: rgba(255, 255, 255, 0.04);
  --glass-inner: inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
  --glass-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 12px 32px -10px rgba(0, 0, 0, 0.55), 0 30px 70px -24px rgba(20, 70, 170, 0.35);
  --glass-shadow-lift: 0 2px 6px rgba(0, 0, 0, 0.45), 0 20px 44px -12px rgba(0, 0, 0, 0.6), 0 40px 90px -26px rgba(40, 100, 220, 0.45);

  --field-a: #1d55cf;
  --field-b: #087f9a;
  --field-c: #9c2a24;
  --grain-opacity: 0.07;
  color-scheme: dark;
}

@layer base {
  html { background: var(--bg); }
  body {
    min-height: 100dvh;
    background: transparent;
    color: var(--ink);
    font-family: var(--font-sans);
    font-feature-settings: "ss01", "cv11";
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  ::selection { background: color-mix(in srgb, var(--brand) 28%, transparent); color: var(--ink); }
  input, textarea { caret-color: var(--brand); }
  :focus-visible { outline: 2px solid var(--brand); outline-offset: 3px; border-radius: 0.6rem; }
  a { text-underline-offset: 0.22em; text-decoration-thickness: 1px; }
  h1, h2, h3 { text-wrap: balance; letter-spacing: -0.025em; }
  .tabular { font-variant-numeric: tabular-nums; }
  * { scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--ink-3) 45%, transparent) transparent; }
}

@layer components {
  .glass {
    position: relative;
    isolation: isolate;
    background: var(--glass-bg, var(--glass-regular-bg));
    -webkit-backdrop-filter: blur(var(--glass-blur, 22px)) saturate(175%);
    backdrop-filter: blur(var(--glass-blur, 22px)) saturate(175%);
    box-shadow: var(--glass-shadow), var(--glass-inner);
  }
  .glass::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(140deg, var(--glass-edge-hi), var(--glass-edge-lo) 38%, transparent 55%, var(--glass-edge-lo) 82%, var(--glass-edge-hi));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
    pointer-events: none;
  }
  .glass-thin { --glass-bg: var(--glass-thin-bg); --glass-blur: 18px; }
  .glass-regular { --glass-bg: var(--glass-regular-bg); --glass-blur: 24px; }
  .glass-thick { --glass-bg: var(--glass-thick-bg); --glass-blur: 28px; }
  .glass-lift { transition: transform 420ms var(--ease-liquid), box-shadow 420ms var(--ease-liquid); }
  .glass-lift:hover { transform: translateY(-3px); box-shadow: var(--glass-shadow-lift), var(--glass-inner); }
  .glass-lift:hover::before { --glass-edge-lo: var(--glass-edge-hi); }
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass { background: var(--glass-solid); }
}
@media (prefers-reduced-transparency: reduce) {
  .glass { background: var(--glass-solid); -webkit-backdrop-filter: none; backdrop-filter: none; }
}
@media (forced-colors: active) {
  .glass { border: 1px solid CanvasText; }
  .glass::before { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .glass-lift, .glass-lift:hover { transform: none; transition: box-shadow 200ms linear; }
}

@keyframes drift-a { 0%,100% { transform: translate3d(-8%, -6%, 0) scale(1); } 50% { transform: translate3d(6%, 8%, 0) scale(1.12); } }
@keyframes drift-b { 0%,100% { transform: translate3d(10%, 4%, 0) scale(1.05); } 50% { transform: translate3d(-6%, -8%, 0) scale(0.95); } }
@keyframes drift-c { 0%,100% { transform: translate3d(0, 10%, 0) scale(0.9); } 50% { transform: translate3d(-10%, -4%, 0) scale(1.08); } }
```

- [ ] **Step 5: Ambient field**

```tsx
// apps/web/src/components/layout/ambient-field.tsx
const grain = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export function AmbientField() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div className="absolute -left-[20vw] -top-[25vh] h-[80vh] w-[80vw] rounded-full opacity-70 motion-safe:animate-[drift-a_38s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(closest-side, var(--field-a), transparent)" }} />
      <div className="absolute -right-[15vw] top-[10vh] h-[75vh] w-[65vw] rounded-full opacity-55 motion-safe:animate-[drift-b_46s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(closest-side, var(--field-b), transparent)" }} />
      <div className="absolute bottom-[-30vh] left-[20vw] h-[70vh] w-[60vw] rounded-full opacity-35 motion-safe:animate-[drift-c_54s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(closest-side, var(--field-c), transparent)" }} />
      <div className="absolute inset-0 mix-blend-overlay" style={{ backgroundImage: grain, opacity: "var(--grain-opacity)" }} />
    </div>
  );
}
```

- [ ] **Step 6: Root layout** — replace fonts with `Hanken_Grotesk` (variable `--font-hanken`, weights 400–800) and `JetBrains_Mono` (variable `--font-jetbrains`) from `next/font/google`; add `<head><ThemeScript/></head>`, `suppressHydrationWarning` on `<html>`, render `<AmbientField/>` first in `<body>`, then children, `<CartSyncProvider/>`, `<Toaster/>` and `<ConfirmHost/>` (added in Task 4; leave out until then). Remove `<CookieConsent/>` and delete `components/cookie-consent.tsx`. Keep `metadata` unchanged. Add `export const viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#eaf0fa" }, { media: "(prefers-color-scheme: dark)", color: "#050a16" }] }`.

- [ ] **Step 7: Verify** — `npm test` PASS; `npx tsc --noEmit` clean; load `/` in light and dark (toggle `dark` class) and confirm the field renders behind content.
- [ ] **Step 8: Commit** — `git commit -m "feat(web): liquid glass tokens, fonts, theme and ambient field"`

---

### Task 3: Core kit (panel, button, field, badges, price, placeholders)

**Files:**
- Create: `components/ui/glass-panel.tsx`, `field.tsx`, `field.test.tsx`, `badge.tsx`, `stock-pill.tsx`, `price.tsx`, `spinner.tsx`, `skeleton.tsx`, `empty-state.tsx`, `product-image.tsx`
- Replace: `components/ui/button.tsx`

**Interfaces:**
- Produces:
  - `GlassPanel({ tier?: "thin"|"regular"|"thick", as?: ElementType, interactive?: boolean, className?, children, ...rest })`
  - `Button({ variant?: "primary"|"glass"|"ghost"|"danger"|"link", size?: "sm"|"md"|"lg"|"icon", loading?: boolean, ...buttonProps })`, `ButtonLink({ href, variant?, size?, ...anchorProps })`, `buttonClasses({ variant, size, className })`
  - `TextField(props: InputProps & { label: string; hint?: string; error?: string })`, `TextareaField(...)`, `SelectField(... & { children })`
  - `Badge({ tone?: Tone, children })`, `StockPill({ stock: number, lowAt?: number })`, `Price({ value: number, size?: "sm"|"md"|"lg"|"xl", className? })`
  - `Spinner({ className? })`, `Skeleton({ className? })`, `EmptyState({ icon?: LucideIcon, title, body?, action? })`, `ProductImage({ src?: string|null, alt, sizes?, className?, priority? })`

- [ ] **Step 1: Failing field test**

```tsx
// apps/web/src/components/ui/field.test.tsx
import { render, screen } from "@testing-library/react";
import { TextField } from "./field";

test("label is linked to its input", () => {
  render(<TextField label="Email" name="email" />);
  expect(screen.getByLabelText("Email")).toHaveAttribute("name", "email");
});

test("error marks the input invalid and describes it", () => {
  render(<TextField label="PIN code" name="zip" error="Enter a 6-digit PIN code" hint="Used for delivery" />);
  const input = screen.getByLabelText("PIN code");
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAccessibleDescription("Used for delivery Enter a 6-digit PIN code");
});
```

- [ ] **Step 2: Run, expect FAIL.**

- [ ] **Step 3: Implement**

```tsx
// apps/web/src/components/ui/glass-panel.tsx
import { ElementType, ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type Props<T extends ElementType> = { as?: T; tier?: "thin" | "regular" | "thick"; interactive?: boolean; className?: string } & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function GlassPanel<T extends ElementType = "div">({ as, tier = "regular", interactive, className, ...rest }: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  return <Tag className={cn("glass rounded-[var(--radius-pane)]", `glass-${tier}`, interactive && "glass-lift", className)} {...rest} />;
}
```

```tsx
// apps/web/src/components/ui/button.tsx
import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export const buttonClasses = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[transform,background-color,box-shadow,color] duration-300 ease-[var(--ease-liquid)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand text-brand-ink shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_8px_20px_-8px_color-mix(in_srgb,var(--brand)_70%,transparent)] hover:bg-brand-hover",
        glass: "glass glass-thin text-ink hover:text-brand",
        ghost: "text-ink-2 hover:bg-brand-soft hover:text-ink",
        danger: "bg-danger text-white hover:brightness-110",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 rounded-[var(--radius-control)] px-3.5 text-sm",
        md: "h-11 rounded-[var(--radius-control)] px-5 text-sm",
        lg: "h-13 rounded-[1.1rem] px-7 text-base",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Variants = VariantProps<typeof buttonClasses>;

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & Variants & { loading?: boolean }>(
  ({ className, variant, size, loading, disabled, children, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={cn(buttonClasses({ variant, size }), className)} {...props}>
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export function ButtonLink({ className, variant, size, ...props }: React.ComponentProps<typeof Link> & Variants) {
  return <Link className={cn(buttonClasses({ variant, size }), className)} {...props} />;
}
```

```tsx
// apps/web/src/components/ui/field.tsx
import { useId, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Base = { label: string; hint?: string; error?: string; className?: string };
export const controlClasses = "w-full rounded-[var(--radius-control)] border border-line bg-field px-3.5 text-[15px] text-ink placeholder:text-ink-3 shadow-[inset_0_1px_2px_rgba(11,26,51,.06)] transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-soft aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger-soft disabled:opacity-60";

function useFieldIds(hint?: string, error?: string) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return { id, describedBy: [hintId, errorId].filter(Boolean).join(" ") || undefined, hintId, errorId };
}

function Frame({ id, label, hint, error, hintId, errorId, className, children }: Base & { id: string; hintId?: string; errorId?: string; children: ReactNode }) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink-2">{label}</label>
      {children}
      {hint && <p id={hintId} className="text-xs text-ink-3">{hint}</p>}
      {error && <p id={errorId} className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

export function TextField({ label, hint, error, className, ...input }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const ids = useFieldIds(hint, error);
  return (
    <Frame id={ids.id} label={label} hint={hint} error={error} hintId={ids.hintId} errorId={ids.errorId} className={className}>
      <input id={ids.id} aria-invalid={error ? true : undefined} aria-describedby={ids.describedBy} className={cn(controlClasses, "h-11")} {...input} />
    </Frame>
  );
}

export function TextareaField({ label, hint, error, className, ...input }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ids = useFieldIds(hint, error);
  return (
    <Frame id={ids.id} label={label} hint={hint} error={error} hintId={ids.hintId} errorId={ids.errorId} className={className}>
      <textarea id={ids.id} aria-invalid={error ? true : undefined} aria-describedby={ids.describedBy} className={cn(controlClasses, "min-h-28 py-3")} {...input} />
    </Frame>
  );
}

export function SelectField({ label, hint, error, className, children, ...input }: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  const ids = useFieldIds(hint, error);
  return (
    <Frame id={ids.id} label={label} hint={hint} error={error} hintId={ids.hintId} errorId={ids.errorId} className={className}>
      <select id={ids.id} aria-invalid={error ? true : undefined} aria-describedby={ids.describedBy} className={cn(controlClasses, "h-11 appearance-none pr-9")} {...input}>{children}</select>
    </Frame>
  );
}
```

```tsx
// apps/web/src/components/ui/badge.tsx
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/status";

const tones: Record<Tone, string> = {
  neutral: "bg-brand-soft text-ink-2",
  brand: "bg-brand-soft text-brand",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>{children}</span>;
}
```

```tsx
// apps/web/src/components/ui/stock-pill.tsx
import { Badge } from "./badge";

export function StockPill({ stock, lowAt = 5 }: { stock: number; lowAt?: number }) {
  if (stock <= 0) return <Badge tone="danger"><Dot />Out of stock</Badge>;
  if (stock <= lowAt) return <Badge tone="warn"><Dot />Only {stock} left</Badge>;
  return <Badge tone="ok"><Dot />In stock</Badge>;
}
function Dot() { return <span aria-hidden className="size-1.5 rounded-full bg-current" />; }
```

```tsx
// apps/web/src/components/ui/price.tsx
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

const sizes = { sm: "text-sm", md: "text-base", lg: "text-xl", xl: "text-3xl md:text-4xl" };
export function Price({ value, size = "md", className }: { value: number; size?: keyof typeof sizes; className?: string }) {
  return <span className={cn("font-bold tracking-tight text-ink tabular", sizes[size], className)}>{formatINR(value)}</span>;
}
```

```tsx
// apps/web/src/components/ui/spinner.tsx
import { cn } from "@/lib/utils";
export function Spinner({ className }: { className?: string }) {
  return <span role="status" aria-label="Loading" className={cn("inline-block size-5 animate-spin rounded-full border-2 border-current border-r-transparent", className)} />;
}
```

```tsx
// apps/web/src/components/ui/skeleton.tsx
import { cn } from "@/lib/utils";
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-[var(--radius-control)] bg-brand-soft motion-reduce:animate-none", className)} />;
}
```

```tsx
// apps/web/src/components/ui/empty-state.tsx
import type { LucideIcon } from "lucide-react";
import { GlassPanel } from "./glass-panel";

export function EmptyState({ icon: Icon, title, body, action }: { icon?: LucideIcon; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <GlassPanel tier="regular" className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      {Icon && <span className="glass glass-thin grid size-14 place-items-center rounded-full text-brand"><Icon className="size-6" aria-hidden /></span>}
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {body && <p className="max-w-sm text-sm text-ink-3">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </GlassPanel>
  );
}
```

```tsx
// apps/web/src/components/ui/product-image.tsx
"use client";
import Image from "next/image";
import { useState } from "react";
import { Cpu } from "lucide-react";
import { formatImageUrl, cn } from "@/lib/utils";

export function ProductImage({ src, alt, sizes = "(min-width:1024px) 25vw, 50vw", className, priority }: { src?: string | null; alt: string; sizes?: string; className?: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  const url = src ? formatImageUrl(src) : null;
  if (!url || failed) {
    return (
      <div className={cn("grid size-full place-items-center text-ink-3", className)}>
        <div className="flex flex-col items-center gap-2"><Cpu className="size-8" aria-hidden /><span className="text-xs font-medium">No photo yet</span></div>
      </div>
    );
  }
  return <Image src={url} alt={alt} fill sizes={sizes} priority={priority} unoptimized={url.startsWith("/uploads")} onError={() => setFailed(true)} className={cn("object-contain", className)} />;
}
```

Also change `formatImageUrl` in `lib/utils.ts` to return `""` instead of `"/placeholder-product.png"` for empty input, and make `ProductImage` treat `""` as missing.

- [ ] **Step 4: Run, expect PASS** — `npm test`.
- [ ] **Step 5: Commit** — `git commit -m "feat(web): core glass component kit"`

---

### Task 4: Feedback kit (toast, confirm dialog, sheet, segmented, table)

**Files:**
- Create: `components/ui/toast.tsx`, `toast.test.tsx`, `confirm-dialog.tsx`, `confirm-dialog.test.tsx`, `sheet.tsx`, `segmented.tsx`, `table.tsx`
- Modify: `app/layout.tsx` (mount `<Toaster/>` and `<ConfirmHost/>`)

**Interfaces:**
- Produces:
  - `toast(input: { title: string; description?: string; tone?: "info"|"success"|"error" }): void`, `toast.success(title, description?)`, `toast.error(title, description?)`, `<Toaster/>`
  - `confirmAction(input: { title: string; body?: string; confirmLabel?: string; tone?: "danger"|"primary" }): Promise<boolean>`, `<ConfirmHost/>`
  - `Sheet({ open: boolean; onClose(): void; side?: "left"|"right"|"bottom"; title: string; children })`
  - `Segmented<T extends string>({ options: { value: T; label: string }[]; value: T; onChange(v: T): void; ariaLabel: string })`
  - `DataTable` primitives: `TableShell({ children })`, `Th`, `Td`, `Tr` plus responsive behavior via `data-label` on `Td` for stacked mobile rows.

- [ ] **Step 1: Failing tests**

```tsx
// apps/web/src/components/ui/toast.test.tsx
import { render, screen, act } from "@testing-library/react";
import { Toaster, toast } from "./toast";

test("toast appears in a polite live region", () => {
  render(<Toaster />);
  act(() => toast.success("Added to cart", "Arduino Uno R3"));
  expect(screen.getByRole("status")).toHaveTextContent("Added to cart");
  expect(screen.getByText("Arduino Uno R3")).toBeInTheDocument();
});
```

```tsx
// apps/web/src/components/ui/confirm-dialog.test.tsx
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmHost, confirmAction } from "./confirm-dialog";

test("resolves true when confirmed and false when cancelled", async () => {
  render(<ConfirmHost />);
  let p!: Promise<boolean>;
  act(() => { p = confirmAction({ title: "Delete product?", confirmLabel: "Delete", tone: "danger" }); });
  await userEvent.click(await screen.findByRole("button", { name: "Delete" }));
  await expect(p).resolves.toBe(true);

  act(() => { p = confirmAction({ title: "Cancel order?" }); });
  await userEvent.click(await screen.findByRole("button", { name: "Keep it" }));
  await expect(p).resolves.toBe(false);
});
```

- [ ] **Step 2: Run, expect FAIL.**

- [ ] **Step 3: Implement**

```tsx
// apps/web/src/components/ui/toast.tsx
"use client";
import { create } from "zustand";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "error";
type Item = { id: number; title: string; description?: string; tone: Tone };
const useToasts = create<{ items: Item[]; push(i: Omit<Item, "id">): void; drop(id: number): void }>((set) => ({
  items: [],
  push: (i) => { const id = Date.now() + Math.random(); set((s) => ({ items: [...s.items.slice(-3), { ...i, id }] })); setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), i.tone === "error" ? 7000 : 4000); },
  drop: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

export function toast(input: { title: string; description?: string; tone?: Tone }) { useToasts.getState().push({ tone: "info", ...input }); }
toast.success = (title: string, description?: string) => toast({ title, description, tone: "success" });
toast.error = (title: string, description?: string) => toast({ title, description, tone: "error" });

const icons = { info: Info, success: CheckCircle2, error: XCircle };
const tones = { info: "text-brand", success: "text-ok", error: "text-danger" };

export function Toaster() {
  const { items, drop } = useToasts();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-6 md:right-6 md:left-auto md:items-end">
      <div role="status" aria-live="polite" className="contents">
        {items.map((t) => { const Icon = icons[t.tone]; return (
          <div key={t.id} className="glass glass-thick pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[1.25rem] p-4 motion-safe:animate-[toast-in_.45s_var(--ease-spring)]">
            <Icon className={cn("mt-0.5 size-5 shrink-0", tones[t.tone])} aria-hidden />
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-ink">{t.title}</p>{t.description && <p className="mt-0.5 text-sm text-ink-3">{t.description}</p>}</div>
            <button type="button" onClick={() => drop(t.id)} aria-label="Dismiss" className="rounded-full p-1 text-ink-3 hover:text-ink"><X className="size-4" /></button>
          </div>
        ); })}
      </div>
    </div>
  );
}
```

Add to `globals.css`: `@keyframes toast-in { from { opacity: 0; transform: translateY(12px) scale(.96); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }` and `@keyframes sheet-in-left/right/bottom` (translate from the edge, 0.5s `--ease-liquid`).

```tsx
// apps/web/src/components/ui/confirm-dialog.tsx
"use client";
import { create } from "zustand";
import { useEffect, useRef } from "react";
import { Button } from "./button";

type Req = { title: string; body?: string; confirmLabel?: string; tone?: "danger" | "primary"; resolve(v: boolean): void };
const useConfirm = create<{ req: Req | null; set(r: Req | null): void }>((set) => ({ req: null, set: (req) => set({ req }) }));

export function confirmAction(input: Omit<Req, "resolve">): Promise<boolean> {
  return new Promise((resolve) => useConfirm.getState().set({ ...input, resolve }));
}

export function ConfirmHost() {
  const { req, set } = useConfirm();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (!d) return; if (req && !d.open) d.showModal?.(); if (!req && d.open) d.close(); }, [req]);
  const done = (v: boolean) => { req?.resolve(v); set(null); };
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); done(false); }} aria-labelledby="confirm-title"
      className="glass glass-thick m-auto w-[min(92vw,26rem)] rounded-[var(--radius-pane)] p-6 text-ink backdrop:bg-[color-mix(in_srgb,var(--bg)_55%,transparent)] backdrop:backdrop-blur-sm">
      {req && (<>
        <h2 id="confirm-title" className="text-lg font-bold">{req.title}</h2>
        {req.body && <p className="mt-2 text-sm text-ink-3">{req.body}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => done(false)}>Keep it</Button>
          <Button variant={req.tone === "danger" ? "danger" : "primary"} onClick={() => done(true)} autoFocus>{req.confirmLabel ?? "Confirm"}</Button>
        </div>
      </>)}
    </dialog>
  );
}
```

Note: jsdom lacks `showModal`; the optional call keeps tests working, and the content renders because it is tied to `req`, not `open`.

```tsx
// apps/web/src/components/ui/sheet.tsx
"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const sides = {
  left: "mr-auto ml-0 h-dvh max-h-dvh w-[min(88vw,22rem)] rounded-r-[var(--radius-pane)] motion-safe:animate-[sheet-in-left_.5s_var(--ease-liquid)]",
  right: "ml-auto mr-0 h-dvh max-h-dvh w-[min(92vw,26rem)] rounded-l-[var(--radius-pane)] motion-safe:animate-[sheet-in-right_.5s_var(--ease-liquid)]",
  bottom: "mt-auto mb-0 max-h-[85dvh] w-full max-w-none rounded-t-[var(--radius-pane)] motion-safe:animate-[sheet-in-bottom_.5s_var(--ease-liquid)]",
};

export function Sheet({ open, onClose, side = "right", title, children }: { open: boolean; onClose(): void; side?: keyof typeof sides; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal?.(); if (!open && d.open) d.close(); }, [open]);
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === ref.current) onClose(); }} aria-label={title}
      className={cn("glass glass-thick overflow-y-auto p-0 text-ink backdrop:bg-[color-mix(in_srgb,var(--bg)_50%,transparent)] backdrop:backdrop-blur-[2px]", sides[side])}>
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 pb-3 pt-5">
        <h2 className="text-lg font-bold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="glass glass-thin grid size-9 place-items-center rounded-full"><X className="size-4" /></button>
      </div>
      <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
    </dialog>
  );
}
```

```tsx
// apps/web/src/components/ui/segmented.tsx
"use client";
import { cn } from "@/lib/utils";

export function Segmented<T extends string>({ options, value, onChange, ariaLabel, className }: { options: { value: T; label: string }[]; value: T; onChange(v: T): void; ariaLabel: string; className?: string }) {
  const i = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("glass glass-thin relative grid rounded-full p-1", className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      <span aria-hidden className="absolute inset-y-1 left-1 rounded-full bg-[var(--glass-thick-bg)] shadow-[var(--glass-shadow)] transition-transform duration-500 ease-[var(--ease-spring)] motion-reduce:transition-none"
        style={{ width: `calc((100% - .5rem) / ${options.length})`, transform: `translateX(${i * 100}%)` }} />
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={o.value === value} onClick={() => onChange(o.value)}
          className={cn("relative z-10 h-9 rounded-full px-3 text-sm font-semibold transition-colors", o.value === value ? "text-ink" : "text-ink-3 hover:text-ink-2")}>{o.label}</button>
      ))}
    </div>
  );
}
```

```tsx
// apps/web/src/components/ui/table.tsx
import { cn } from "@/lib/utils";

export function TableShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("glass glass-thick overflow-hidden rounded-[var(--radius-tile)]", className)}>
      <table className="w-full text-sm max-md:block [&_tbody]:max-md:block [&_thead]:max-md:hidden">{children}</table>
    </div>
  );
}
export function Th({ children, className, ...p }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" className={cn("sticky top-0 border-b border-line bg-[var(--glass-thick-bg)] px-4 py-3 text-left text-xs font-semibold text-ink-3", className)} {...p}>{children}</th>;
}
export function Tr({ children, className, ...p }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-line last:border-0 transition-colors hover:bg-brand-soft max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-1 max-md:p-4", className)} {...p}>{children}</tr>;
}
export function Td({ children, className, label, ...p }: React.TdHTMLAttributes<HTMLTableCellElement> & { label?: string }) {
  return <td data-label={label} className={cn("px-4 py-3 align-middle text-ink-2 max-md:p-0 max-md:before:block max-md:before:text-[11px] max-md:before:font-semibold max-md:before:text-ink-3 max-md:before:content-[attr(data-label)]", className)} {...p}>{children}</td>;
}
```

- [ ] **Step 4: Mount** `<Toaster/>` and `<ConfirmHost/>` in `app/layout.tsx` after `<CartSyncProvider/>`.
- [ ] **Step 5: Run, expect PASS** — `npm test`.
- [ ] **Step 6: Commit** — `git commit -m "feat(web): toasts, confirm dialog, sheet, segmented control and table"`

---

### Task 5: The Loupe

**Files:**
- Create: `components/ui/loupe-math.ts`, `loupe-math.test.ts`, `loupe.tsx`

**Interfaces:**
- Produces: `lensBackground({ x, y, width, height, zoom, lens }): { size: string; position: string }`, `<Loupe src={string} alt={string} zoom?={number} lens?={number}>{image}</Loupe>`.

- [ ] **Step 1: Failing test**

```ts
// apps/web/src/components/ui/loupe-math.test.ts
import { lensBackground } from "./loupe-math";

test("centres the magnified point under the lens", () => {
  const r = lensBackground({ x: 100, y: 50, width: 400, height: 300, zoom: 2.5, lens: 160 });
  expect(r.size).toBe("1000px 750px");
  expect(r.position).toBe("-170px -45px");
});

test("clamps pointer to the image bounds", () => {
  const r = lensBackground({ x: -40, y: 900, width: 400, height: 300, zoom: 2, lens: 100 });
  expect(r.position).toBe("50px -550px");
});
```

- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement**

```ts
// apps/web/src/components/ui/loupe-math.ts
export function lensBackground({ x, y, width, height, zoom, lens }: { x: number; y: number; width: number; height: number; zoom: number; lens: number }) {
  const cx = Math.min(Math.max(x, 0), width);
  const cy = Math.min(Math.max(y, 0), height);
  return { size: `${width * zoom}px ${height * zoom}px`, position: `${-(cx * zoom - lens / 2)}px ${-(cy * zoom - lens / 2)}px` };
}
```

```tsx
// apps/web/src/components/ui/loupe.tsx
"use client";
import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { lensBackground } from "./loupe-math";
import { cn } from "@/lib/utils";

export function Loupe({ src, alt, zoom = 2.5, lens = 168, children, className }: { src: string; alt: string; zoom?: number; lens?: number; children: React.ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null);
  const [touchMode, setTouchMode] = useState(false);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" && !touchMode) return;
    const r = box.current!.getBoundingClientRect();
    setPt({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const r = box.current?.getBoundingClientRect();
  const bg = pt && r ? lensBackground({ ...pt, width: r.width, height: r.height, zoom, lens }) : null;
  return (
    <div ref={box} className={cn("relative overflow-hidden", touchMode && "touch-none", className)}
      onPointerMove={move} onPointerDown={move} onPointerLeave={() => setPt(null)} onPointerCancel={() => setPt(null)}>
      {children}
      {bg && pt && (
        <div aria-hidden className="pointer-events-none absolute rounded-full ring-[3px] ring-ember shadow-[0_18px_40px_-10px_rgba(0,0,0,.45),inset_0_2px_6px_rgba(255,255,255,.6)]"
          style={{ width: lens, height: lens, left: pt.x - lens / 2, top: pt.y - lens / 2, backgroundImage: `url("${src}")`, backgroundRepeat: "no-repeat", backgroundSize: bg.size, backgroundPosition: bg.position, backgroundColor: "var(--glass-solid)" }} />
      )}
      <button type="button" onClick={() => { setTouchMode((v) => !v); setPt(null); }} aria-pressed={touchMode}
        className="glass glass-thin absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink md:hidden">
        <Search className="size-3.5" aria-hidden />{touchMode ? "Done" : "Magnify"}
      </button>
      <span className="sr-only">{`Hover the photo of ${alt} to magnify it.`}</span>
    </div>
  );
}
```

Image must use `object-contain` filling the box; the lens samples the raw URL at `background-size` equal to the box times zoom, which matches when the photo fills the box. Product images are shown on a square stage so this holds; letterboxing is acceptable.

- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** — `git commit -m "feat(web): Loupe signature magnifier"`

---

### Task 6: Storefront shell (navbar, tab bar, footer, layout)

**Files:**
- Replace: `components/layout/Navbar.tsx`, `components/layout/Footer.tsx`, `components/layout/SearchBar.tsx`, `components/layout/HeroSearchBar.tsx`, `components/client-cart-badge.tsx`
- Create: `components/layout/mobile-tab-bar.tsx`
- Modify: `app/(public)/layout.tsx`
- Delete: `components/client-auth-buttons.tsx` once nothing imports it

**Requirements (read the current Navbar for its data: settings fetch, categories with subcategories, auth store, cart count, search behaviour):**
- Desktop (≥1024px): a floating glass bar (`glass-thin`, `rounded-full`, max width 1280px, 12px from top, sticky). Left: logo image (40px) + wordmark "Zetra". Centre: category menu button opening a glass dropdown of real categories from `GET /categories` (parents with children indented), then the search field (glass pill, `/search?q=`). Right: `ThemeToggle`, cart button with count badge (a `Link`, not a link-wrapped button), account button (Login, or initials menu with Profile, Orders, Admin when role is ADMIN, Log out).
- Tablet and phone (<1024px): compact top bar (logo, search icon that expands an inline search field, theme toggle) plus `MobileTabBar` fixed at the bottom: Shop `/products`, Search `/search`, Cart `/cart` with badge, Account `/profile` or `/login`. Active tab shows a sliding glass droplet. Pad page bottom by the tab bar height plus safe-area inset.
- No wishlist button. No top info strip with fallback text; if `STORE_PHONE` or `STORE_EMAIL` exist, show them in the footer only.
- Footer: one `glass-regular` slab with logo and tagline "Electrify Your Needs With Us", a Shop column built from the first six real categories (`/products?category=<name>`), a Help column (Track order, Help center, Contact, Privacy, Terms), and a contact column rendered only for settings that exist. Social icons render only for set URLs. Bottom row: copyright with current year and the existing "Powered by The Ark Tech" credit.
- Public layout keeps the skip link, wraps `<main id="main-content">` with `pt-24 lg:pt-28 pb-28 lg:pb-16`.

**Acceptance:** keyboard reaches every nav item in order; menu closes on Escape and outside click; categories list reflects the API; at 390px no element overflows; `grep -rn "Heart\|Wishlist" components/layout` returns nothing.

- [ ] Steps: rebuild files → `npx tsc --noEmit` → screenshot `/` at 1440 and 390, light and dark → commit `feat(web): glass storefront shell`.

---

### Task 7: Home page and product card

**Files:** Replace `app/(public)/page.tsx`, `components/product-card.tsx`.

**Requirements (keep the existing server fetches for products, settings and categories, and the JSON-LD script):**
- First viewport: a large `glass-regular` stage. Left two-thirds: headline "Parts for what you're building next." set at 56–88px, 800 weight, tight tracking; one sentence of supporting copy built from PRODUCT.md positioning (genuine, tested parts; fast India shipping; datasheets; GST invoice); the working `HeroSearchBar` as the primary action (submits to `/search?q=`), with a secondary `ButtonLink` "Browse all parts". Right third: the four promises as a vertical stack of compact glass chips with lucide icons (ShieldCheck, Truck, FileText, ReceiptIndianRupee), each one line. When `HOME_HERO_IMAGE` exists, it sits behind the right column inside the glass with the Loupe; when it does not, the right column shows the promises only.
- Category rail: horizontally scrollable glass chips of real categories with snap scrolling; each links to `/products?category=`.
- Products: "New on the bench" grid of `ProductCard` (2 columns on phone, 3 on tablet, 4 on desktop). Empty state: `EmptyState` with Cpu icon, "The shelves are being stocked", body "New parts are being added. Check back soon or ask us for a specific part.", action `ButtonLink` to `/contact`.
- `ProductCard`: `GlassPanel tier="regular" interactive` as an `<article>` with a square image stage (`ProductImage`), category in `text-ink-3`, name (2-line clamp), `Price`, `StockPill`, and `AddToCart` as a compact icon button. Whole card links to `/products/[id]` via a stretched link on the name; the cart button sits above it with `relative z-10`.

**Acceptance:** no eyebrow labels; one h1; first viewport shows search at 390px without scrolling; product grid has no nested glass inside glass beyond the card itself.

- [ ] Steps: rebuild → tsc → screenshot → commit `feat(web): glass home and product card`.

---

### Task 8: Catalog, category and search

**Files:** Replace `app/(public)/products/page.tsx`, `app/(public)/category/[slug]/page.tsx`, `app/(public)/search/page.tsx`, `components/product-filters.tsx`.

**Requirements (keep existing query params: `category`, `minPrice`, `maxPrice`, `search`, and the server fetches):**
- Desktop: sticky `glass-thick` filter rail on the left (categories as a radio list, price presets as a `Segmented`-style chip group, custom min/max as `TextField`s with ₹ hint and an Apply `Button`), results on the right with a header row: title, result count, active-filter chips with remove buttons.
- Phone: a "Filters" glass button opens `Sheet side="bottom"` holding the same filter form; results count and active chips stay visible above the grid.
- Search page: large glass search field pre-filled with `q`, results grid, empty state "No parts match "<q>"" with a link to browse all.
- Category page reuses the catalog layout with the category preselected.

**Acceptance:** all filter inputs have linked labels; empty result renders `EmptyState`; URL state round-trips on refresh.

- [ ] Steps: rebuild → tsc → screenshot catalog at 1440 and 390 with filters sheet open → commit `feat(web): glass catalog, filters and search`.

---

### Task 9: Product detail with the Loupe

**Files:** Replace `app/(public)/products/[id]/page.tsx`, `components/add-to-cart.tsx`.

**Requirements (keep `generateMetadata`, JSON-LD, the product fetch and spec/datasheet parsing):**
- Two-column on desktop: left a square `glass-regular` stage with `Loupe` wrapping `ProductImage priority`; right a `glass-thick` buy panel: breadcrumb (Home / Category / Name), h1 name, `Price size="xl"`, `StockPill`, shipping cost line ("Free shipping" or "+ ₹X shipping per unit"), GST note "GST invoice included", quantity stepper and Add to cart (primary, full width) plus Buy now (glass) that adds then routes to `/checkout`.
- Below: specs as a two-column definition list in `font-mono` values inside `glass-regular`; datasheet as a `ButtonLink` with FileDown icon when present; description in readable measure (max 68ch).
- `AddToCart`: stepper with − and + buttons (aria-labels "Decrease quantity", "Increase quantity"), caps at stock, disabled when out of stock with label "Out of stock"; on add, `toast.success("Added to cart", name)` replaces any alert.
- Phone: buy panel becomes a sticky bottom `glass-thick` bar above the tab bar with price and Add to cart.

**Acceptance:** Loupe follows the mouse on desktop and works through the Magnify toggle on touch; no alert calls; JSON-LD unchanged.

- [ ] Steps: rebuild → tsc → seed one product locally through the admin API or UI for screenshots → screenshot → commit `feat(web): product detail with Loupe`.

---

### Task 10: Cart, checkout and success

**Files:** Replace `app/(public)/cart/page.tsx`, `app/(public)/checkout/page.tsx`, `app/(public)/checkout/success/page.tsx`.

**Requirements (preserve verbatim: cart store usage, settings fetch for GST and shipping, PIN-code lookup, order POST body, Razorpay options and handler, verify-payment call, cart clearing, redirects):**
- Cart: list of `glass-regular` line rows (image, name link, unit price, stepper, line total, remove icon button with aria-label "Remove <name>"); summary `glass-thick` panel with subtotal, shipping, GST, total using `Price`, and Checkout primary button. Empty: `EmptyState` (ShoppingCart icon) "Your cart is empty" with Browse parts.
- Checkout: guest check happens on page load. If not logged in, show a `glass-thick` panel "Sign in to check out" with Login and Create account buttons that return to `/checkout` afterwards (pass `?next=/checkout`; login and register pages honour `next`). Logged in: two-step layout, Address (all inputs via `TextField`, PIN code with inline lookup state "Checking PIN…" / city filled / error) and Review & pay; summary panel sticky on desktop, collapsible on phone.
- Replace all six `alert()` calls: validation and API errors become inline `role="alert"` messages in a danger-tinted glass strip plus `toast.error`; payment failure shows the Razorpay description with a "Try payment again" button that reopens Razorpay for the same order.
- Success: glass panel with animated check (one spring), order id in mono, links to Track order and Continue shopping.

**Acceptance:** `grep -n "alert(" app/(public)/checkout app/(public)/cart` returns nothing; totals match the old calculation for the same cart; Razorpay script tag unchanged.

- [ ] Steps: rebuild → tsc → screenshot cart and checkout (empty and filled) → commit `feat(web): glass cart and checkout`.

---

### Task 11: Auth pages

**Files:** Replace `login`, `register`, `forgot-password`, `reset-password`, `verify-email` pages under `app/(public)`.

**Requirements (preserve API calls, Google/Firebase popup and redirect flow, token handling and store `login()`):**
- Shared layout pattern: centred `glass-thick` card (max 26rem) with logo, h1, short sentence, form built from `TextField`, primary submit with `loading`, inline error strip with `role="alert"`.
- Login: email, password (show/hide toggle button with aria-pressed), Sign in, divider "or", Continue with Google (glass button with the Google mark SVG kept from the current page), links to Forgot password and Create account. Honour `?next=`.
- Register: name, email, password with hint "At least 6 characters" (matches API), success state telling the user to check their email.
- Forgot, reset, verify: same card; reset validates matching passwords inline; verify shows spinner, then success or error state with next action.

**Acceptance:** every input labelled; errors announced; works at 390px with the keyboard open (card scrolls, no fixed heights).

- [ ] Steps: rebuild → tsc → screenshot login and register → commit `feat(web): glass auth pages`.

---

### Task 12: Account pages (profile, track order)

**Files:** Replace `app/(public)/profile/page.tsx`, `app/(public)/track-order/page.tsx`.

**Requirements (preserve fetches, profile PATCH, invoice download, order cancel POST):**
- Profile: `Segmented` tabs "Profile" / "Security" / "Orders". Profile tab: name field and save. Security tab: current and new password. Orders tab: order list (shared with track order).
- Order list items: `glass-regular` rows with order id (mono), date (`formatDate`), status `Badge` with `statusTone`, total `Price`, item thumbnails via `ProductImage`, actions: Download invoice, Track (opens tracking URL when set), Cancel (only PENDING) guarded by `confirmAction({ title: "Cancel this order?", body: "Stock will be released and you will not be charged.", confirmLabel: "Cancel order", tone: "danger" })`.
- Status timeline on track-order: Pending, Paid, Shipped, Delivered as a horizontal glass progress rail (vertical on phone).
- Replace the four `alert()` calls with toasts.

- [ ] Steps: rebuild → tsc → screenshot logged-in profile → commit `feat(web): glass account pages`.

---

### Task 13: Content pages (help, contact, privacy, terms)

**Files:** Replace the four pages.

**Requirements:**
- Help: search-free FAQ as native `<details>` accordions styled as glass rows, keep the current questions and answers; remove framer-motion stagger, use the shared reveal only.
- Contact: contact methods render only for settings that exist; if none exist, show the form alone. Form via `TextField` / `TextareaField`; success and error inline plus toast; no alert.
- Privacy and terms: reading layout in `glass-thick`, 68ch measure. Privacy gains one paragraph: "We do not use tracking or advertising cookies. Your cart, sign-in session and theme choice are kept in your browser's local storage so the site works."

- [ ] Steps: rebuild → tsc → screenshot contact with empty settings → commit `feat(web): glass content pages`.

---

### Task 14: Admin shell and dashboard

**Files:** Replace `app/admin/layout.tsx`, `app/admin/page.tsx`, `components/admin/sales-chart.tsx`. Create `components/admin/admin-shell.tsx`.

**Requirements (preserve the ADMIN role guard and rehydration wait):**
- Desktop: `glass-thick` sidebar (264px) with logo, nav (Dashboard, Products, Inventory, Categories, Orders, Customers, Settings) where the active item has a sliding glass droplet; footer with ThemeToggle, "View store" link and Log out. Content area has a glass top bar with page title and primary page action slot.
- Phone/tablet (<1024px): top bar with menu button opening `Sheet side="left"` containing the same nav; no fixed left margin.
- Dashboard: stat row of four `glass-regular` tiles (Revenue, Orders, Customers, Low stock) with figures in mono; sales chart in `glass-thick` with recharts colors from CSS variables (`var(--brand)`, `var(--line)`, `var(--ink-3)`), loaded with `next/dynamic` and a `Skeleton`; recent orders via `TableShell` with status badges.

**Acceptance:** at 390px the admin has no horizontal scroll; the ADMIN guard still redirects non-admins.

- [ ] Steps: rebuild → tsc → log in as a local admin and screenshot at 1440 and 390 → commit `feat(web): glass admin shell and dashboard`.

---

### Task 15: Admin catalog and operations pages

**Files:** Replace `app/admin/products/page.tsx`, `products/new/page.tsx`, `products/[id]/edit/page.tsx`, `inventory/page.tsx`, `categories/page.tsx`, `orders/page.tsx`, `orders/[id]/page.tsx`, `customers/page.tsx`, `settings/page.tsx`, `components/admin/fulfill-order.tsx`, `image-upload.tsx`, `product-actions.tsx`.

**Requirements (preserve every API call and payload):**
- Lists use `TableShell` with stacked rows on phone, a toolbar with search field and primary action, `Badge` statuses, `Price` figures.
- Forms (new/edit product, settings, categories, fulfil order) use `TextField`, `TextareaField`, `SelectField`, grouped into `glass-thick` sections with h2 headings, sticky save bar on phone.
- `ImageUpload`: glass drop zone with preview via `ProductImage`, upload progress with `Spinner`, errors inline.
- Destructive actions (delete product, delete category, delete order) go through `confirmAction` with danger tone. All 21 admin `alert()`/`confirm()` calls become toasts or `confirmAction`.
- Orders page status filter uses `Segmented` (All, Pending, Paid, Shipped, Delivered, Cancelled).
- Remove the Arial font usage in admin orders.

**Acceptance:** `grep -rnE "\b(alert|confirm)\(" apps/web/src` returns only `confirmAction` usages; every admin form input is labelled.

- [ ] Steps: rebuild → tsc → screenshots of products list, product form, orders → commit `feat(web): glass admin catalog and operations`.

---

### Task 16: Cleanup and token enforcement

**Files:** `globals.css`, any file still using legacy names or raw palette classes.

- [ ] **Step 1:** `grep -rnE "(text|bg|border|ring|from|to|via)-(slate|gray|zinc|neutral|blue|red|green|amber|yellow|indigo|emerald|sky)-[0-9]+|#[0-9a-fA-F]{6}\b" apps/web/src --include=*.tsx` → rewrite every hit to tokens (hex allowed only in `globals.css`, the Google mark SVG and the theme meta colours).
- [ ] **Step 2:** `grep -rnE "\b(primary|muted-foreground|foreground|background|card|secondary|accent|destructive)\b" apps/web/src --include=*.tsx` → rename to new tokens; then delete the legacy alias block from `globals.css`.
- [ ] **Step 3:** Remove unused deps if no longer imported (`firebase` stays; check `framer-motion` usage, keep if used).
- [ ] **Step 4:** `npm test`, `npx tsc --noEmit`, `npx eslint src`, `npm run build` all pass.
- [ ] **Step 5:** Commit `refactor(web): enforce design tokens and remove legacy aliases`.

---

### Task 17: Verification and finish

- [ ] **Step 1:** Seed local demo content for screenshots only (two categories, four products with real component names and images where available) through the admin UI or API; note it as local test data.
- [ ] **Step 2:** One batched screenshot round into `.impeccable/review/`: `desktop.png` (1440, full page home), `mobile.png` (390 home), plus product, catalog, cart, checkout, login, admin dashboard, admin orders at both widths, each in light and dark.
- [ ] **Step 3:** Run `impeccable detect --json apps/web/src`; fix mechanical findings.
- [ ] **Step 4:** Write the direction contract surface brief with `impeccable surface-brief write`.
- [ ] **Step 5:** Spawn `impeccable-finish-reviewer` with the request, answers, artifact paths, screenshots, contract and detector output; act on its disposition (fix batch, at most two rounds).
- [ ] **Step 6:** Spawn `impeccable-documenter` to write `DESIGN.md` and `.impeccable/design.json`.
- [ ] **Step 7:** Final `npm test`, `npx tsc --noEmit`, `npm run build`; commit `docs: record Bench Glass design system`.
