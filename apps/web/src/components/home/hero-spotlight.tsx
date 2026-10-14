"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart";
import { FavoriteButton } from "@/components/product/favorite-button";
import { ButtonLink } from "@/components/ui/button";
import { Loupe } from "@/components/ui/loupe";
import { Price } from "@/components/ui/price";
import { ProductImage } from "@/components/ui/product-image";
import { StockPill } from "@/components/ui/stock-pill";
import { formatImageUrl, cn } from "@/lib/utils";

export type SpotlightPart = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string | null;
  shippingCost: number;
};

const AUTO_MS = 6500;

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
}

/**
 * The hero's product spotlight: one part large on the photo plate (with the Loupe),
 * price, stock and a working Add to cart, plus thumbnails to swap parts.
 * It advances on its own until the visitor hovers, focuses or picks a part.
 */
export function HeroSpotlight({ parts }: { parts: SpotlightPart[] }) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const [chosen, setChosen] = useState(false);
  const reduced = useReducedMotion();
  const n = parts.length;
  const autoplay = n > 1 && !held && !chosen && !reduced;

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % n), AUTO_MS);
    return () => clearTimeout(t);
  }, [autoplay, index, n]);

  const part = parts[index];
  const url = formatImageUrl(part.image);

  const pick = (i: number) => {
    setChosen(true);
    setIndex((i + n) % n);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured parts"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
      onTouchStart={() => setHeld(true)}
      className="glass glass-thick grid gap-4 rounded-[2rem] p-3 sm:p-4"
    >
      <div key={part.id} className="grid gap-4 motion-safe:animate-[swap-in_.6s_var(--ease-liquid)]">
        <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[1.5rem] bg-[var(--plate)] p-6">
          {url ? (
            <Loupe src={url} alt={part.name} className="relative max-h-full rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element -- the lens needs the exact rendered photo box */}
              <img
                src={url}
                alt={part.name}
                draggable={false}
                fetchPriority={index === 0 ? "high" : "auto"}
                className="block max-h-[min(42vh,20rem)] w-auto max-w-full select-none object-contain mix-blend-multiply"
              />
            </Loupe>
          ) : (
            <ProductImage src={null} alt={part.name} />
          )}
          <span className="absolute left-3 top-3">
            <StockPill stock={part.stock} />
          </span>
          <span className="absolute right-3 top-3">
            <FavoriteButton productId={part.id} name={part.name} />
          </span>
        </div>

        <div className="grid gap-3 px-1 sm:px-2">
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink-3">{part.category}</p>
              <Link href={`/products/${part.id}`} className="line-clamp-2 text-xl font-bold leading-snug tracking-tight text-ink hover:text-brand sm:text-2xl">
                {part.name}
              </Link>
            </div>
            <Price value={part.price} size="lg" className="sm:text-2xl" />
          </div>
          <div className="grid gap-2 min-[420px]:grid-cols-[1fr_auto]">
            <AddToCartButton product={part} size="lg" className="h-12" />
            <ButtonLink href={`/products/${part.id}`} variant="glass" size="lg" className="h-12">
              View part
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
        </div>
      </div>

      {n > 1 && (
        <div
          role="group"
          aria-label="Choose a featured part"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
          onKeyDown={(e) => {
            if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
            e.preventDefault();
            const next = index + (e.key === "ArrowRight" ? 1 : -1);
            pick(next);
            (e.currentTarget.querySelectorAll("button")[(next + n) % n] as HTMLButtonElement)?.focus();
          }}
        >
          {parts.map((p, i) => {
            const active = i === index;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                aria-label={`Show ${p.name}`}
                onClick={() => pick(i)}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-2xl bg-[var(--plate)] ring-2 transition-[box-shadow,transform] duration-300 sm:size-[4.5rem]",
                  active ? "ring-brand" : "ring-transparent hover:-translate-y-0.5 hover:ring-line",
                )}
              >
                <ProductImage src={p.image} alt="" sizes="72px" className="p-1.5" />
                {active && autoplay && (
                  <span
                    key={`${p.id}-${index}`}
                    aria-hidden
                    className="absolute inset-x-1.5 bottom-1 h-1 origin-left rounded-full bg-brand"
                    style={{ animation: `progress ${AUTO_MS}ms linear both` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {chosen ? `Showing ${part.name}, ${index + 1} of ${n}` : ""}
      </p>
    </section>
  );
}
