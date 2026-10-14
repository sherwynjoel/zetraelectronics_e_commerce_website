"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavoriteIds } from "@/components/product/favorite-button";
import { CountBadge } from "./cart-link";
import { cn } from "@/lib/utils";

export function FavoritesLink({ className }: { className?: string }) {
  const { ids } = useFavoriteIds();
  const n = ids.length;
  return (
    <Link
      href="/favorites"
      aria-label={n ? `Favourites, ${n} saved` : "Favourites"}
      className={cn(
        "glass glass-thin relative grid size-10 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:text-brand",
        className,
      )}
    >
      <Heart className={cn("size-[18px]", n > 0 && "fill-current text-brand")} aria-hidden />
      {n > 0 && <CountBadge count={n} />}
    </Link>
  );
}
