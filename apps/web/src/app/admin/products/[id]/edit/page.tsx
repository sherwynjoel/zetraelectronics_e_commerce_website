"use client";

import { use, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { AdminHeader } from "@/components/admin/admin-shell";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState<ProductFormValues | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/products/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) =>
        setInitial({
          name: d.name ?? "",
          category: d.category ?? "",
          price: String(d.price ?? ""),
          stock: String(d.stock ?? ""),
          shippingCost: String(d.shippingCost ?? 0),
          image: d.image ?? "",
          description: d.description ?? "",
          datasheet: d.datasheet ?? "",
          specs: d.specs ?? "",
        }),
      )
      .catch(() => setMissing(true));
  }, [id]);

  if (missing)
    return (
      <EmptyState
        title="This product couldn’t be loaded"
        body="It may have been deleted."
        action={<ButtonLink href="/admin/products">Back to products</ButtonLink>}
      />
    );

  return (
    <div className="mx-auto max-w-3xl">
      <AdminHeader title="Edit product" description={initial?.name} />
      {initial ? <ProductForm initial={initial} productId={Number(id)} /> : <Skeleton className="h-[32rem] rounded-[var(--radius-pane)]" />}
    </div>
  );
}
