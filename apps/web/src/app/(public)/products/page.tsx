import type { Metadata } from "next";
import { API_URL } from "@/lib/api";
import type { Product } from "@/lib/types";
import { categoryTree, getCategories } from "@/lib/store-data";
import { ActiveFilters, ProductFilters } from "@/components/product-filters";
import { CatalogGrid } from "@/components/catalog-grid";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse our full catalog of electronic components, sensors, IoT modules, development boards, and robotics kits. Fast delivery across India.",
  alternates: { canonical: "https://zetraelectronics.com/products" },
  openGraph: {
    title: "All Products | Zetra Electronics",
    description: "Browse electronic components, sensors, IoT modules, and robotics kits at Zetra Electronics.",
    url: "https://zetraelectronics.com/products",
  },
};

export const dynamic = "force-dynamic";

async function getProducts(params: Record<string, string>): Promise<Product[]> {
  try {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/products${q ? `?${q}` : ""}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) if (v !== undefined) params[k] = Array.isArray(v) ? v[0] : v;

  const [products, all] = await Promise.all([getProducts(params), getCategories()]);
  const categories = categoryTree(all);
  const title = params.category ?? "All parts";

  return (
    <div className="mx-auto max-w-[1280px] pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">{title}</h1>
          <p className="mt-2 text-sm text-ink-3" aria-live="polite">
            {products.length} {products.length === 1 ? "part" : "parts"}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:items-start">
        <ProductFilters categories={categories} />
        <div className="grid min-w-0 gap-5">
          <ActiveFilters />
          <CatalogGrid products={products} />
        </div>
      </div>
    </div>
  );
}
