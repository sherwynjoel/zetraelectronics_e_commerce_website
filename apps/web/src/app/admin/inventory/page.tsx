"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Boxes, Pencil } from "lucide-react";
import { useAdminGet } from "@/lib/admin-api";
import type { Product } from "@/lib/types";
import { AdminHeader } from "@/components/admin/admin-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductImage } from "@/components/ui/product-image";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { StockPill } from "@/components/ui/stock-pill";
import { TableShell, Td, Th, Tr } from "@/components/ui/table";

type Filter = "all" | "low" | "out";
const LOW_AT = 5;

export default function InventoryPage() {
  const { data, loading } = useAdminGet<Product[]>("/products?limit=100");
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const list = data ?? [];
    return { out: list.filter((p) => p.stock <= 0).length, low: list.filter((p) => p.stock > 0 && p.stock <= LOW_AT).length };
  }, [data]);

  const rows = useMemo(
    () =>
      [...(data ?? [])]
        .filter((p) => (filter === "out" ? p.stock <= 0 : filter === "low" ? p.stock > 0 && p.stock <= LOW_AT : true))
        .sort((a, b) => a.stock - b.stock),
    [data, filter],
  );

  return (
    <>
      <AdminHeader title="Inventory" description="Stock levels, lowest first. Edit a product to restock it." />
      <Segmented<Filter>
        ariaLabel="Stock filter"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "All" },
          { value: "low", label: `Low (${counts.low})` },
          { value: "out", label: `Out (${counts.out})` },
        ]}
        className="mb-5 max-w-sm"
      />

      {loading && !data ? (
        <Skeleton className="h-96 rounded-[var(--radius-tile)]" />
      ) : rows.length === 0 ? (
        <EmptyState icon={Boxes} title={filter === "all" ? "No products yet" : "Nothing here"} body={filter === "all" ? undefined : "Every product is above this stock level."} />
      ) : (
        <TableShell caption="Inventory">
          <thead>
            <tr>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th className="text-right">In stock</Th>
              <Th>Status</Th>
              <Th className="w-16">
                <span className="sr-only">Edit</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <Tr key={p.id}>
                <Td label="Product" className="max-md:col-span-2">
                  <span className="flex items-center gap-3">
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-[var(--plate)]">
                      <ProductImage src={p.image} alt="" sizes="40px" className="p-1" />
                    </span>
                    <span className="font-semibold text-ink">{p.name}</span>
                  </span>
                </Td>
                <Td label="Category">{p.category}</Td>
                <Td label="In stock" className="tabular text-right font-mono text-lg font-semibold text-ink max-md:text-left">
                  {p.stock}
                </Td>
                <Td label="Status">
                  <StockPill stock={p.stock} lowAt={LOW_AT} />
                </Td>
                <Td className="max-md:col-span-2 max-md:justify-self-end">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    aria-label={`Edit stock for ${p.name}`}
                    className="grid size-9 place-items-center rounded-full text-ink-2 hover:bg-brand-soft hover:text-brand"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </Link>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </>
  );
}
