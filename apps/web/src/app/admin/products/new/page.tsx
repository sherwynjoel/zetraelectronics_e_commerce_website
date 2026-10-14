"use client";

import { AdminHeader } from "@/components/admin/admin-shell";
import { ProductForm, emptyProduct } from "@/components/admin/product-form";

export default function CreateProductPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <AdminHeader title="New product" description="Add a part to the catalog." />
      <ProductForm initial={emptyProduct} />
    </div>
  );
}
