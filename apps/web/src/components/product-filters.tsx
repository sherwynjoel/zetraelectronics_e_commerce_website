"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Sheet } from "@/components/ui/sheet";
import type { Category } from "@/lib/store-data";
import { cn } from "@/lib/utils";

const priceRanges = [
  { label: "Under ₹500", min: "", max: "500" },
  { label: "₹500 – ₹2,000", min: "500", max: "2000" },
  { label: "₹2,000 – ₹5,000", min: "2000", max: "5000" },
  { label: "Over ₹5,000", min: "5000", max: "" },
];

function useFilterState() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const category = params.get("category");
  const minPrice = params.get("minPrice") ?? "";
  const maxPrice = params.get("maxPrice") ?? "";

  const push = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const q = p.toString();
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  return { category, minPrice, maxPrice, push };
}

function FilterForm({ categories, onDone }: { categories: Category[]; onDone?(): void }) {
  const { category, minPrice, maxPrice, push } = useFilterState();
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  const pick = (patch: Record<string, string | null>) => {
    push(patch);
    onDone?.();
  };

  const radio = (active: boolean) =>
    cn(
      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
      active ? "bg-brand text-brand-ink font-semibold" : "text-ink-2 hover:bg-brand-soft hover:text-ink",
    );

  return (
    <div className="grid gap-7">
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-ink">Category</legend>
        <ul className="grid gap-0.5">
          <li>
            <button type="button" aria-pressed={!category} className={radio(!category)} onClick={() => pick({ category: null })}>
              All parts
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button type="button" aria-pressed={category === c.name} className={radio(category === c.name)} onClick={() => pick({ category: c.name })}>
                {c.name}
              </button>
              {!!c.children?.length && (
                <ul className="ml-3 grid gap-0.5 border-l border-line pl-2">
                  {c.children.map((s) => (
                    <li key={s.id}>
                      <button type="button" aria-pressed={category === s.name} className={radio(category === s.name)} onClick={() => pick({ category: s.name })}>
                        {s.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-bold text-ink">Price</legend>
        <div className="grid grid-cols-2 gap-2">
          {priceRanges.map((r) => {
            const active = minPrice === r.min && maxPrice === r.max;
            return (
              <button
                key={r.label}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setMin(r.min);
                  setMax(r.max);
                  pick(active ? { minPrice: null, maxPrice: null } : { minPrice: r.min || null, maxPrice: r.max || null });
                }}
                className={cn(
                  "rounded-xl px-2 py-2.5 text-xs font-semibold transition-colors",
                  active ? "bg-brand text-brand-ink" : "glass glass-thin text-ink-2 hover:text-ink",
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>
        <form
          className="mt-4 grid grid-cols-[1fr_1fr] items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            pick({ minPrice: min || null, maxPrice: max || null });
          }}
        >
          <TextField label="Min ₹" inputMode="numeric" type="number" min={0} value={min} onChange={(e) => setMin(e.target.value)} placeholder="0" />
          <TextField label="Max ₹" inputMode="numeric" type="number" min={0} value={max} onChange={(e) => setMax(e.target.value)} placeholder="Any" />
          <Button type="submit" variant="glass" size="sm" className="col-span-2">
            Apply price
          </Button>
        </form>
      </fieldset>
    </div>
  );
}

/** Active filter chips, each removable. */
export function ActiveFilters() {
  const { category, minPrice, maxPrice, push } = useFilterState();
  if (!category && !minPrice && !maxPrice) return null;
  const chip = "glass glass-thin inline-flex items-center gap-1.5 rounded-full py-1.5 pl-3 pr-1.5 text-xs font-semibold text-ink";
  const x = "grid size-6 place-items-center rounded-full text-ink-3 hover:bg-brand-soft hover:text-ink";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {category && (
        <span className={chip}>
          {category}
          <button type="button" className={x} aria-label={`Remove ${category} filter`} onClick={() => push({ category: null })}>
            <X className="size-3.5" aria-hidden />
          </button>
        </span>
      )}
      {(minPrice || maxPrice) && (
        <span className={chip}>
          {minPrice ? `₹${minPrice}` : "₹0"} – {maxPrice ? `₹${maxPrice}` : "any"}
          <button type="button" className={x} aria-label="Remove price filter" onClick={() => push({ minPrice: null, maxPrice: null })}>
            <X className="size-3.5" aria-hidden />
          </button>
        </span>
      )}
      <button type="button" className="px-2 text-xs font-semibold text-ink-3 underline hover:text-ink" onClick={() => push({ category: null, minPrice: null, maxPrice: null })}>
        Clear all
      </button>
    </div>
  );
}

export function ProductFilters({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const { category, minPrice, maxPrice } = useFilterState();
  const count = (category ? 1 : 0) + (minPrice || maxPrice ? 1 : 0);

  return (
    <>
      <aside aria-label="Filters" className="glass glass-thick sticky top-28 hidden max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-[var(--radius-tile)] p-5 lg:block">
        <FilterForm categories={categories} />
      </aside>
      <div className="lg:hidden">
        <Button variant="glass" onClick={() => setOpen(true)} className="rounded-full">
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters
          {count > 0 && <span className="tabular grid size-5 place-items-center rounded-full bg-brand text-[11px] text-brand-ink">{count}</span>}
        </Button>
        <Sheet open={open} onClose={() => setOpen(false)} side="bottom" title="Filter parts">
          <FilterForm categories={categories} onDone={() => setOpen(false)} />
        </Sheet>
      </div>
    </>
  );
}
