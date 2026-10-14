"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { THEME_KEY, type ThemePref, applyTheme, nextPref } from "@/lib/theme";
import { cn } from "@/lib/utils";

const labels: Record<ThemePref, string> = {
  system: "Theme: match system",
  light: "Theme: light",
  dark: "Theme: dark",
};

export function ThemeToggle({ className }: { className?: string }) {
  const [pref, setPref] = useState<ThemePref>("system");

  useEffect(() => {
    try {
      setPref((localStorage.getItem(THEME_KEY) as ThemePref) || "system");
    } catch {}
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      try {
        if ((localStorage.getItem(THEME_KEY) || "system") === "system") applyTheme("system");
      } catch {}
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const Icon = pref === "light" ? Sun : pref === "dark" ? Moon : Monitor;

  return (
    <button
      type="button"
      aria-label={labels[pref]}
      title={labels[pref]}
      onClick={() => {
        const p = nextPref(pref);
        setPref(p);
        try {
          localStorage.setItem(THEME_KEY, p);
        } catch {}
        applyTheme(p);
      }}
      className={cn(
        "glass glass-thin grid size-10 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:text-ink",
        className,
      )}
    >
      <Icon className="size-[18px]" aria-hidden />
    </button>
  );
}
