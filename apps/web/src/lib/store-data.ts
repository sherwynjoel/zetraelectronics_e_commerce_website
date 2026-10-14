import { API_URL } from "@/lib/api";

export type Category = {
  id: number;
  name: string;
  description?: string | null;
  parentId: number | null;
  children?: Category[];
};

export type Settings = Record<string, string>;

export function toSettings(rows: { key: string; value: string }[]): Settings {
  const s: Settings = {};
  for (const r of rows ?? []) if (r?.value?.trim()) s[r.key] = r.value.trim();
  return s;
}

/** Server-side fetch with ISR; returns {} on failure. Empty values are dropped. */
export async function getSettings(revalidate = 60): Promise<Settings> {
  try {
    const res = await fetch(`${API_URL}/settings`, { next: { revalidate } });
    if (!res.ok) return {};
    return toSettings(await res.json());
  } catch {
    return {};
  }
}

/** Server-side fetch with ISR; returns [] on failure. */
export async function getCategories(revalidate = 60): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate } });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/** Top-level categories, each with its children, sorted by name. */
export function categoryTree(all: Category[]): Category[] {
  const parents = all.filter((c) => c.parentId == null);
  return parents
    .map((p) => ({
      ...p,
      children: (p.children?.length ? p.children : all.filter((c) => c.parentId === p.id)).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function categoryHref(name: string) {
  return `/products?category=${encodeURIComponent(name)}`;
}
