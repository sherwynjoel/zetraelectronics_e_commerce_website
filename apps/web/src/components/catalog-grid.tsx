import type { ReactNode } from "react";
import { PackageSearch } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui/empty-state";

export function CatalogGrid({ products, empty }: { products: Product[]; empty?: { title: string; body?: string; action?: ReactNode } }) {
  if (!products.length) {
    return (
      <EmptyState
        icon={PackageSearch}
        title={empty?.title ?? "No parts match these filters"}
        body={empty?.body ?? "Try another category or widen the price range."}
        action={empty?.action}
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 2xl:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
