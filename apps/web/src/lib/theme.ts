export type ThemePref = "system" | "light" | "dark";
export const THEME_KEY = "zetra-theme";

export function resolveTheme(pref: ThemePref, systemDark: boolean): "light" | "dark" {
  if (pref === "system") return systemDark ? "dark" : "light";
  return pref;
}

/** The theme a tap switches to: the opposite of what is on screen now. */
export function nextPref(shown: "light" | "dark"): "light" | "dark" {
  return shown === "dark" ? "light" : "dark";
}

export function applyTheme(pref: ThemePref) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = resolveTheme(pref, systemDark) === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}
