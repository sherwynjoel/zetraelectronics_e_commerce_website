"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { THEME_KEY, type ThemePref, applyTheme, nextPref } from "@/lib/theme";
import { cn } from "@/lib/utils";

const labels: Record<ThemePref, string> = {
  system: "Theme: match system",
  light: "Theme: light",
  dark: "Theme: dark",
};

const EVENT = "zetra-theme-change";

function read(): ThemePref {
  try {
    return (localStorage.getItem(THEME_KEY) as ThemePref) || "system";
  } catch {
    return "system";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function ThemeToggle({ className }: { className?: string }) {
  const pref = useSyncExternalStore(subscribe, read, () => "system" as ThemePref);

  // Follow the OS setting while the preference is "system".
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => read() === "system" && applyTheme("system");
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
        try {
          localStorage.setItem(THEME_KEY, p);
        } catch {}
        applyTheme(p);
        window.dispatchEvent(new Event(EVENT));
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
