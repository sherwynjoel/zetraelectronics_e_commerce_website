"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { API_URL } from "@/lib/api";
import type { Product } from "@/lib/types";
import { useMounted } from "@/lib/use-mounted";
import { ProductCard } from "@/components/product-card";
import { useFavoriteIds } from "@/components/product/favorite-button";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function FavoritesPage() {
  const mounted = useMounted();
  const { ids } = useFavoriteIds();
  const [products, setProducts] = useState<Record<number, Product | null>>({});
  const key = ids.join(",");

  // Fetch fresh price and stock for each saved part; a deleted part resolves to null and is skipped.
  useEffect(() => {
    const missing = key ? key.split(",").map(Number).filter((id) => !(id in products)) : [];
    if (!missing.length) return;
    Promise.all(
      missing.map((id) =>
        fetch(`${API_URL}/products/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
          .then((p) => [id, p] as const),
      ),
    ).then((pairs) => setProducts((prev) => ({ ...prev, ...Object.fromEntries(pairs) })));
  }, [key, products]);

  const list = ids.map((id) => products[id]).filter(Boolean) as Product[];
  const loading = !mounted || ids.some((id) => !(id in products));

  return (
    <div className="mx-auto grid max-w-[1280px] gap-6 pb-16">
      <header>
        <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">Favourites</h1>
        <p className="mt-2 text-ink-2">Parts you’ve saved. Tap the heart on any part to add or remove it.</p>
      </header>
      {loading && ids.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {ids.map((id) => (
            <Skeleton key={id} className="aspect-[3/4] rounded-[var(--radius-tile)]" />
          ))}
        </div>
      ) : list.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No favourites yet"
          body="Save parts you want to come back to. They stay on this device, separately for each account."
          action={<ButtonLink href="/products">Browse parts</ButtonLink>}
        />
      )}
    </div>
  );
}
