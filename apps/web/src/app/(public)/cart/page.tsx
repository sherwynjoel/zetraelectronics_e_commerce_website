"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { addItemToBackend, clearBackendCart, removeItemFromBackend } from "@/lib/cart-api";
import { calcTotals, useCheckoutSettings } from "@/lib/checkout";
import { useMounted } from "@/lib/use-mounted";
import { formatINR } from "@/lib/format";
import { OrderSummary } from "@/components/checkout/order-summary";
import { ButtonLink, Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import { confirmAction } from "@/components/ui/confirm-dialog";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { token } = useAuthStore();
  const settings = useCheckoutSettings();
  const mounted = useMounted();

  const remove = (id: number) => {
    removeItem(id);
    if (token) removeItemFromBackend(token, id);
  };
  const setQty = (id: number, quantity: number) => {
    if (quantity < 1) return remove(id);
    updateQuantity(id, quantity);
    if (token) addItemToBackend(token, id, quantity);
  };
  const clearAll = async () => {
    const ok = await confirmAction({
      title: "Empty your cart?",
      body: "All parts will be removed from your cart.",
      confirmLabel: "Empty cart",
      tone: "danger",
    });
    if (!ok) return;
    clearCart();
    if (token) clearBackendCart(token);
  };

  if (!mounted) {
    return (
      <div className="mx-auto grid max-w-[1280px] gap-4 pb-16">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <EmptyState
          headingLevel="h1"
          icon={ShoppingBag}
          title="Your cart is empty"
          body="Find the sensors, boards and modules for your next build."
          action={<ButtonLink href="/products">Browse parts</ButtonLink>}
        />
      </div>
    );
  }

  const totals = calcTotals(items, settings);
  const count = items.reduce((a, i) => a + i.quantity, 0);

  return (
    <div className="mx-auto max-w-[1280px] pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
        <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">Your cart</h1>
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-danger hover:text-danger">
          <Trash2 className="size-4" aria-hidden />
          Empty cart
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
        <ul className="grid gap-3" aria-label="Parts in your cart">
          {items.map((item) => {
            const atCap = item.quantity >= item.stock;
            return (
              <li key={item.id} className="glass glass-regular flex gap-4 rounded-[var(--radius-tile)] p-3 sm:items-center sm:p-4">
                <Link href={`/products/${item.id}`} className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-[var(--plate)] sm:size-24">
                  <ProductImage src={item.image} alt={item.name} sizes="96px" className="p-2 mix-blend-multiply" />
                </Link>
                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6">
                  <div className="min-w-0">
                    <Link href={`/products/${item.id}`} className="line-clamp-2 font-semibold text-ink hover:text-brand">
                      {item.name}
                    </Link>
                    <p className="tabular mt-1 text-sm text-ink-3">{formatINR(item.price)} each</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:contents">
                    <div role="group" aria-label={`Quantity of ${item.name}`} className="glass glass-thin inline-flex h-10 items-center rounded-full p-1">
                      <button
                        type="button"
                        onClick={() => setQty(item.id, item.quantity - 1)}
                        aria-label={item.quantity === 1 ? `Remove ${item.name}` : "Decrease quantity"}
                        className="grid size-8 place-items-center rounded-full text-ink-2 hover:bg-brand-soft hover:text-ink"
                      >
                        <Minus className="size-4" aria-hidden />
                      </button>
                      <span className="tabular min-w-8 text-center text-sm font-bold text-ink" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(item.id, item.quantity + 1)}
                        disabled={atCap}
                        aria-label="Increase quantity"
                        title={atCap ? "No more in stock" : undefined}
                        className="grid size-8 place-items-center rounded-full text-ink-2 hover:bg-brand-soft hover:text-ink disabled:opacity-40"
                      >
                        <Plus className="size-4" aria-hidden />
                      </button>
                    </div>
                    <span className="tabular text-right text-lg font-bold text-ink sm:w-28">{formatINR(item.price * item.quantity)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="grid size-9 shrink-0 place-items-center self-start rounded-full text-ink-3 hover:bg-danger-soft hover:text-danger sm:self-center"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>

        <OrderSummary totals={totals} taxRate={settings.taxRate} itemCount={count} className="lg:sticky lg:top-28">
          <ButtonLink href="/checkout" size="lg" className="h-13 w-full">
            Checkout
            <ArrowRight className="size-5" aria-hidden />
          </ButtonLink>
          <Link href="/products" className="text-center text-sm font-semibold text-ink-2 hover:text-brand">
            Keep shopping
          </Link>
        </OrderSummary>
      </div>
    </div>
  );
}
