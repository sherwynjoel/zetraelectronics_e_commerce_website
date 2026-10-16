"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Boxes, Pencil } from "lucide-react";
import { useAdminGet } from "@/lib/admin-api";
import type { Product } from "@/lib/types";
import { AdminHeader } from "@/components/admin/admin-shell";
import { FilterBar, SearchField } from "@/components/admin/filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField } from "@/components/ui/field";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import { StockPill } from "@/components/ui/stock-pill";
import { TableShell, Td, Th, Tr } from "@/components/ui/table";

type Stock = "all" | "in" | "low" | "out";
const LOW_AT = 5;
const EMPTY = { q: "", category: "all", stock: "all" as Stock };

function stockState(n: number): Exclude<Stock, "all"> {
  return n <= 0 ? "out" : n <= LOW_AT ? "low" : "in";
}

export default function InventoryPage() {
  const { data, loading } = useAdminGet<Product[]>("/products", { allPages: true });
  const [f, setF] = useState(EMPTY);
  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => setF((p) => ({ ...p, [k]: v }));

  const categories = useMemo(() => [...new Set((data ?? []).map((p) => p.category))].sort(), [data]);
  const counts = useMemo(() => {
    const c = { in: 0, low: 0, out: 0 };
    for (const p of data ?? []) c[stockState(p.stock)]++;
    return c;
  }, [data]);

  const rows = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return [...(data ?? [])]
      .filter((p) => (f.category === "all" ? true : p.category === f.category))
      .filter((p) => (f.stock === "all" ? true : stockState(p.stock) === f.stock))
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || String(p.id) === q)
      .sort((a, b) => a.stock - b.stock);
  }, [data, f]);

  const active = f.q !== "" || f.category !== "all" || f.stock !== "all";

  return (
    <>
      <AdminHeader title="Inventory" description="Stock levels, lowest first. Edit a product to restock it." />

      <FilterBar
        active={active}
        onReset={() => setF(EMPTY)}
        summary={data ? `${rows.length} of ${data.length} products` : null}
        search={<SearchField label="Search products" value={f.q} onChange={(v) => set("q", v)} placeholder="Name, category or product ID" />}
      >
        <SelectField label="Category" value={f.category} onChange={(e) => set("category", e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectField>
        <SelectField label="Stock" value={f.stock} onChange={(e) => set("stock", e.target.value as Stock)}>
          <option value="all">All stock levels</option>
          <option value="in">In stock ({counts.in})</option>
          <option value="low">Low, {LOW_AT} or fewer ({counts.low})</option>
          <option value="out">Out of stock ({counts.out})</option>
        </SelectField>
      </FilterBar>

      {loading && !data ? (
        <Skeleton className="h-96 rounded-[var(--radius-tile)]" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title={active ? "No products match these filters" : "No products yet"}
          body={active ? "Try another category or stock level, or clear the filters." : undefined}
        />
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
                    <span className="min-w-0 break-words font-semibold text-ink">{p.name}</span>
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
