"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

export function useCartCount() {
  const count = useCartStore((s) => s.count());
  return useMounted() ? count : 0;
}

export function CartLink({ className }: { className?: string }) {
  const count = useCartCount();
  return (
    <Link
      href="/cart"
      aria-label={count ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart, empty"}
      className={cn(
        "glass glass-thin relative grid size-10 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:text-ink",
        className,
      )}
    >
      <ShoppingBag className="size-[18px]" aria-hidden />
      {count > 0 && <CountBadge count={count} />}
    </Link>
  );
}

export function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "tabular absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 text-[11px] font-bold text-white shadow-[0_2px_6px_rgba(240,60,54,.45)]",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
