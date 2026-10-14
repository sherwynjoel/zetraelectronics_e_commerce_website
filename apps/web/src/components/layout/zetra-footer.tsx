"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import HalftoneWordmarkFooter, { type FooterColumn } from "@/components/ui/halftone-wordmark-footer";

// Palettes are hex because the halftone canvas mixes them per dot.
// Light: glass-solid ground and ink; pushed dots warm toward brand blue (red stays reserved). Dark: the dark tokens.
const LIGHT = { background: "#f6f8fc", ink: "#0b1a33", warm: "#2f74e0" };
const DARK = { background: "#0e1729", ink: "#eaf1ff", warm: "#6aa5ff" };

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}

function useDarkTheme() {
  return useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

/** next/font hashes the family name; read the real one so the canvas prints in Hanken Grotesk. */
function useHankenFamily() {
  const [family, setFamily] = useState<string | undefined>(undefined);
  useEffect(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--font-hanken").trim();
    if (v) queueMicrotask(() => setFamily(`${v}, system-ui, sans-serif`));
  }, []);
  return family;
}

export function ZetraFooter({ columns, year }: { columns: FooterColumn[]; year: number }) {
  const dark = useDarkTheme();
  const family = useHankenFamily();

  return (
    <div className="zetra-footer px-3 pb-28 pt-10 lg:px-6 lg:pb-6">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[var(--radius-pane)] shadow-[var(--glass-shadow)] ring-1 ring-line">
        <HalftoneWordmarkFooter
          wordmark="zetra"
          label="Zetra Electronics"
          meta={`© ${year} · Electrify Your Needs With Us · Site by The00a0Ark00a0Tech`}
          columns={columns}
          palette={dark ? DARK : LIGHT}
          fontFamily={family}
          fontWeight={800}
          monoFamily="var(--font-hanken), system-ui, sans-serif"
          height="clamp(460px, 46vw, 600px)"
          grain={0.4}
        />
      </div>
    </div>
  );
}
