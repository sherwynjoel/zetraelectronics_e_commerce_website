"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Package, Plus, Search } from "lucide-react";
import { useAdminGet } from "@/lib/admin-api";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AdminHeader } from "@/components/admin/admin-shell";
import { ProductActions } from "@/components/admin/product-actions";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField } from "@/components/ui/field";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import { StockPill } from "@/components/ui/stock-pill";
import { TableShell, Td, Th, Tr } from "@/components/ui/table";

type Sort = "name_asc" | "name_desc" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc";

export default function AdminProductsPage() {
  const { data, loading, reload } = useAdminGet<Product[]>("/products?limit=100");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("name_asc");

  const rows = useMemo(() => {
    const list = (data ?? []).filter((p) => (p.name + " " + p.category).toLowerCase().includes(q.trim().toLowerCase()));
    return [...list].sort((a, b) => {
      switch (sort) {
        case "price_asc":
          return Number(a.price) - Number(b.price);
        case "price_desc":
          return Number(b.price) - Number(a.price);
        case "stock_asc":
          return a.stock - b.stock;
        case "stock_desc":
          return b.stock - a.stock;
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [data, q, sort]);

  return (
    <>
      <AdminHeader
        title="Products"
        description={data ? `${data.length} in the catalog` : undefined}
        action={
          <ButtonLink href="/admin/products/new">
            <Plus className="size-4" aria-hidden />
            New product
          </ButtonLink>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_14rem] sm:items-end">
        <label className="glass glass-thin flex h-11 items-center gap-2 rounded-full px-4">
          <Search className="size-4 text-ink-3" aria-hidden />
          <span className="sr-only">Search products</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or category" className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none" />
        </label>
        <SelectField label="Sort" labelHidden value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
          <option value="price_asc">Price, low to high</option>
          <option value="price_desc">Price, high to low</option>
          <option value="stock_asc">Stock, low to high</option>
          <option value="stock_desc">Stock, high to low</option>
        </SelectField>
      </div>

      {loading && !data ? (
        <Skeleton className="h-96 rounded-[var(--radius-tile)]" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Package}
          title={q ? `No products match “${q}”` : "No products yet"}
          body={q ? "Try a different search." : "Add your first part to start selling."}
          action={!q && <ButtonLink href="/admin/products/new">New product</ButtonLink>}
        />
      ) : (
        <TableShell caption="Products">
          <thead>
            <tr>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th className="text-right">Price</Th>
              <Th>Stock</Th>
              <Th className="w-24">
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <Tr key={p.id}>
                <Td label="Product" className="max-md:col-span-2">
                  <span className="flex items-center gap-3">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-[var(--plate)]">
                      <ProductImage src={p.image} alt="" sizes="44px" className="p-1" />
                    </span>
                    <Link href={`/admin/products/${p.id}/edit`} className="font-semibold text-ink hover:text-brand">
                      {p.name}
                    </Link>
                  </span>
                </Td>
                <Td label="Category">{p.category}</Td>
                <Td label="Price" className="tabular text-right font-semibold text-ink max-md:text-left">
                  {formatINR(Number(p.price))}
                </Td>
                <Td label="Stock">
                  <span className="flex items-center gap-2">
                    <span className="tabular font-mono text-ink">{p.stock}</span>
                    <StockPill stock={p.stock} />
                  </span>
                </Td>
                <Td className="max-md:col-span-2 max-md:justify-self-end">
                  <ProductActions productId={p.id} name={p.name} onDeleted={reload} />
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </>
  );
}
