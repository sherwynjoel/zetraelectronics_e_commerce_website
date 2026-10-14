"use client";

import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { useCartStore } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";

type BuyProduct = { id: number; name: string; price: number; stock: number; image?: string | null; shippingCost: number };

export function BuyBox({ product }: { product: BuyProduct }) {
  const router = useRouter();
  const { addItem, items } = useCartStore();
  const mounted = useMounted();
  const inCart = mounted && items.some((i) => i.id === product.id);
  const soldOut = product.stock <= 0;

  const buyNow = () => {
    if (!inCart) addItem(product);
    router.push("/checkout");
  };

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <AddToCartButton product={product} size="lg" />
        <Button variant="glass" size="lg" className="h-13" onClick={buyNow} disabled={soldOut}>
          <Zap className="size-5" aria-hidden />
          Buy now
        </Button>
      </div>

      {/* Phone: price and action stay in reach above the tab bar */}
      <div className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-30 lg:hidden">
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
