"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { API_URL } from "@/lib/api";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/ui/product-image";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

function useWide() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 640px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 640px)").matches,
    () => true,
  );
}

/**
 * Search combobox with live suggestions (top six matches, 300ms debounce).
 * Submitting goes to /search?q=.
 */
export function SearchBox({
  variant = "nav",
  autoFocus,
  initialQuery = "",
  onNavigate,
  className,
}: {
  variant?: "nav" | "hero";
  autoFocus?: boolean;
  initialQuery?: string;
  onNavigate?(): void;
  className?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const listId = useId();

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (res.ok) {
          const data: Product[] = await res.json();
          setResults(data.slice(0, 6));
          setActive(-1);
          setOpen(true);
        }
      } catch {
        /* aborted or offline: keep the field usable */
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  const go = (href: string) => {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && results[active]) return go(`/products/${results[active].id}`);
    if (query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const hero = variant === "hero";
  const wide = useWide();

  return (
    <div ref={root} className={cn("relative", className)}>
      <form role="search" onSubmit={submit}>
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search parts
        </label>
        <div
          className={cn(
            "glass flex items-center gap-2 rounded-full transition-shadow focus-within:shadow-[var(--glass-shadow-lift),var(--glass-inner),0_0_0_4px_var(--brand-soft)]",
            hero ? "glass-thick h-16 pl-6 pr-2" : "glass-thin h-11 pl-4 pr-1.5",
          )}
        >
          <Search className={cn("shrink-0 text-ink-3", hero ? "size-5" : "size-4")} aria-hidden />
          <input
            id={`${listId}-input`}
            type="search"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            onKeyDown={(e) => {
              if (!open || !results.length) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => (a + 1) % results.length);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => (a <= 0 ? results.length - 1 : a - 1));
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder={hero && wide ? "Search sensors, boards, modules…" : hero ? "Search" : "Search parts"}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-3 focus:outline-none [&::-webkit-search-cancel-button]:hidden",
              hero ? "text-lg" : "text-sm",
            )}
          />
          {loading && <Spinner className="size-4 text-brand" label="Searching" />}
          {query && !loading && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="grid size-8 place-items-center rounded-full text-ink-3 hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
          <button
            type="submit"
            aria-label="Search"
            className={cn(
              "grid shrink-0 place-items-center rounded-full bg-brand text-brand-ink transition-colors hover:bg-brand-hover",
              hero ? "h-12 px-4 text-sm font-semibold sm:px-6" : "size-8",
            )}
          >
            {hero ? "Search" : <ArrowRight className="size-4" aria-hidden />}
          </button>
        </div>
      </form>

      {open && (
        <div className="glass glass-thick absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-[var(--radius-tile)] p-2 motion-safe:animate-[toast-in_.35s_var(--ease-liquid)]">
          {results.length ? (
            <ul id={listId} role="listbox" aria-label="Matching parts" className="grid gap-0.5">
              {results.map((p, i) => (
                <li key={p.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={`/products/${p.id}`}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-brand-soft",
                      i === active && "bg-brand-soft",
                    )}
                  >
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-[var(--plate)]">
                      <ProductImage src={p.image} alt="" sizes="44px" className="p-1" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{p.name}</span>
                      <span className="block truncate text-xs text-ink-3">{p.category}</span>
                    </span>
                    <span className="tabular text-sm font-bold text-ink">{formatINR(Number(p.price))}</span>
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t border-line pt-1">
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-brand hover:bg-brand-soft"
                >
                  See all results for “{query.trim()}”
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </li>
            </ul>
          ) : (
            <p id={listId} className="px-3 py-6 text-center text-sm text-ink-3">
              No parts match “{query.trim()}”. Try a part family like “sensor” or “ESP32”.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
