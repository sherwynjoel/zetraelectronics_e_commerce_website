type CategoryLike = { id: number; name: string; parentId: number | null };
type PartLike = { id: number; category: string; stock: number; image?: string | null };

const key = (s: string | null | undefined) => String(s ?? "").trim().toLowerCase();

/** In-stock parts with a photo first, then in-stock without one, then out of stock. Stable otherwise. */
const rank = (p: PartLike) => (p.stock > 0 ? (p.image ? 0 : 1) : 2);
const byRank = <T extends PartLike>(list: T[]) =>
  list.map((p, i) => ({ p, i })).sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i).map((x) => x.p);

/**
 * Parts to show under a product: the same category first, then the other categories in its
 * group (siblings under the same parent, the parent itself, or its children). If that gives
 * fewer than `min`, it is topped up from the rest of the catalogue.
 */
export function pickRelated<T extends PartLike>(
  current: PartLike,
  all: T[],
  categories: CategoryLike[],
  { max = 8, min = 4 }: { max?: number; min?: number } = {},
): T[] {
  const others = all.filter((p) => p.id !== current.id);
  const here = key(current.category);
  const cat = categories.find((c) => key(c.name) === here);

  const group = new Set<string>();
  if (cat) {
    const root = cat.parentId ?? cat.id;
    for (const c of categories) if (c.id === root || c.parentId === root) group.add(key(c.name));
  }
  group.delete(here);

  const same = byRank(others.filter((p) => key(p.category) === here));
  const near = byRank(others.filter((p) => group.has(key(p.category))));
  const picked = [...same, ...near].slice(0, max);

  if (picked.length < min) {
    const taken = new Set(picked.map((p) => p.id));
    const rest = byRank(others.filter((p) => !taken.has(p.id)));
    picked.push(...rest.slice(0, min - picked.length));
  }
  return picked;
}
