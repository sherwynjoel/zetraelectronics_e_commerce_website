"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type CartProduct = { id: number; name: string; price: number | string; stock: number; image?: string | null; shippingCost?: number | string };

/**
 * Add-to-cart control. Once the part is in the cart it becomes a quantity stepper.
 * `size="icon"` is the compact card version; any other size is the full-width detail version.
 */
export function AddToCartButton({
  product,
  size = "lg",
  className,
}: {
  product: CartProduct;
  size?: "icon" | "sm" | "md" | "lg" | "default";
  className?: string;
}) {
  const { addItem, removeItem, updateQuantity, items } = useCartStore();
  const mounted = useMounted();
  const quantity = mounted ? (items.find((i) => i.id === product.id)?.quantity ?? 0) : 0;
  const soldOut = Number(product.stock) <= 0;
  const atCap = quantity >= Number(product.stock);
  const compact = size === "icon";

  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const add = (e: React.MouseEvent) => {
    stop(e);
    addItem({ ...product, price: Number(product.price), shippingCost: Number(product.shippingCost ?? 0) });
    if (quantity === 0) toast.success("Added to cart", product.name);
  };
  const decrease = (e: React.MouseEvent) => {
    stop(e);
    if (quantity <= 1) removeItem(product.id);
    else updateQuantity(product.id, quantity - 1);
  };

  if (quantity > 0) {
    return (
      <div
        role="group"
        aria-label={`Quantity of ${product.name} in cart`}
        onClick={stop}
        className={cn(
          "glass glass-thin inline-flex items-center justify-between rounded-full p-1",
          compact ? "h-10" : "h-13 w-full",
          className,
        )}
      >
        <button
          type="button"
          onClick={decrease}
          aria-label={quantity <= 1 ? `Remove ${product.name} from cart` : "Decrease quantity"}
          className={cn("grid place-items-center rounded-full text-ink-2 hover:bg-brand-soft hover:text-ink", compact ? "size-8" : "size-11")}
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <span className={cn("tabular min-w-8 text-center font-bold text-ink", compact ? "text-sm" : "text-lg")} aria-live="polite">
          {quantity}
          {!compact && <span className="ml-1 text-sm font-medium text-ink-3">in cart</span>}
        </span>
        <button
          type="button"
          onClick={add}
          disabled={atCap}
          aria-label="Increase quantity"
          title={atCap ? "No more in stock" : undefined}
          className={cn(
            "grid place-items-center rounded-full bg-brand text-brand-ink hover:bg-brand-hover disabled:opacity-40",
            compact ? "size-8" : "size-11",
          )}
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={add}
        disabled={soldOut}
        aria-label={soldOut ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
        className={cn(
          "grid size-10 place-items-center rounded-full bg-brand text-brand-ink shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_8px_18px_-8px_var(--brand)] transition-transform hover:bg-brand-hover active:scale-95 disabled:bg-[var(--line)] disabled:text-ink-3 disabled:shadow-none",
          className,
        )}
      >
        <Plus className="size-5" aria-hidden />
      </button>
    );
  }

  return (
    <Button size="lg" onClick={add} disabled={soldOut} className={cn("h-13 w-full", className)}>
      <ShoppingBag className="size-5" aria-hidden />
      {soldOut ? "Out of stock" : "Add to cart"}
    </Button>
  );
}
