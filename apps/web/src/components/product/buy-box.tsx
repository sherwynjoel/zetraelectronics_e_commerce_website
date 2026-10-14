"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { useCartStore } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

type BuyProduct = { id: number; name: string; price: number; stock: number; image?: string | null; shippingCost: number };

export function BuyBox({ product }: { product: BuyProduct }) {
  const router = useRouter();
  const { addItem, items } = useCartStore();
  const mounted = useMounted();
  const inCart = mounted && items.some((i) => i.id === product.id);
  const soldOut = product.stock <= 0;
  const inline = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);

  // Phone: the sticky bar appears only once the inline buttons have scrolled away,
  // and the tab bar steps aside while it is up, so one fixed bar is on screen at a time.
  useEffect(() => {
    const el = inline.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (showBar) root.dataset.buybar = "on";
    else delete root.dataset.buybar;
    return () => {
      delete root.dataset.buybar;
    };
  }, [showBar]);

  const buyNow = () => {
    if (!inCart) addItem(product);
    router.push("/checkout");
  };

  return (
    <>
      <div ref={inline} className="grid gap-3 sm:grid-cols-2">
        <AddToCartButton product={product} size="lg" />
        <Button variant="glass" size="lg" className="h-13" onClick={buyNow} disabled={soldOut}>
          <Zap className="size-5" aria-hidden />
          Buy now
        </Button>
      </div>

      <div
        aria-hidden={!showBar}
        inert={!showBar}
        className={cn(
          "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 transition-[transform,opacity] duration-500 ease-[var(--ease-liquid)] lg:hidden",
          showBar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[130%] opacity-0",
        )}
      >
        <div className="glass glass-thick flex items-center gap-3 rounded-full py-2 pl-5 pr-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink-3">{product.name}</p>
            <Price value={product.price} size="md" />
          </div>
          <div className="w-44 shrink-0">
            <AddToCartButton product={product} size="lg" className="h-11 rounded-full text-sm" />
          </div>
        </div>
      </div>
    </>
  );
}
