"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { type Category, categoryHref } from "@/lib/store-data";
import { cn } from "@/lib/utils";

export function CategoryMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
          open ? "bg-brand text-brand-ink" : "text-ink-2 hover:bg-brand-soft hover:text-ink",
        )}
      >
        <LayoutGrid className="size-4" aria-hidden />
        Categories
        <ChevronDown className={cn("size-3.5 transition-transform duration-300", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <div className="glass glass-thick absolute left-0 top-[calc(100%+0.75rem)] z-50 w-[min(90vw,34rem)] rounded-[var(--radius-tile)] p-3 motion-safe:animate-[toast-in_.35s_var(--ease-liquid)]">
          {categories.length ? (
            <ul className="grid grid-cols-2 gap-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={categoryHref(c.name)}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-brand-soft"
                  >
                    {c.name}
                  </Link>
                  {!!c.children?.length && (
                    <ul className="mb-1 ml-3 border-l border-line pl-2">
                      {c.children.map((s) => (
                        <li key={s.id}>
                          <Link
                            href={categoryHref(s.name)}
                            onClick={() => setOpen(false)}
                            className="block rounded-lg px-2 py-1.5 text-sm text-ink-2 hover:bg-brand-soft hover:text-ink"
                          >
                            {s.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-4 text-sm text-ink-3">Categories will appear here once they are added.</p>
          )}
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-xl border-t border-line px-3 pt-3 text-sm font-semibold text-brand"
          >
            Browse every part
          </Link>
        </div>
      )}
    </div>
  );
}
