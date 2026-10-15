"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_KEY, type ThemePref, applyTheme, nextPref } from "@/lib/theme";
import { cn } from "@/lib/utils";

function readPref(): ThemePref {
  try {
    return (localStorage.getItem(THEME_KEY) as ThemePref) || "system";
  } catch {
    return "system";
  }
}

/** What is on screen right now, read from the class the boot script and applyTheme set. */
function subscribeShown(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
const readShown = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");

/**
 * One tap flips light and dark. Until someone taps, the site follows the device setting;
 * after that it keeps their choice.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const shown = useSyncExternalStore(subscribeShown, readShown, () => "light" as const);

  // Keep following the device while nobody has picked a theme.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => readPref() === "system" && applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const next = nextPref(shown);
  const label = next === "dark" ? "Switch to dark theme" : "Switch to light theme";
  const Icon = next === "dark" ? Moon : Sun;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch {}
        applyTheme(next);
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
