import { API_URL } from '@/lib/api';
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "All Products",
    description: "Browse our full catalog of electronic components, sensors, IoT modules, development boards, and robotics kits. Fast delivery across India.",
    alternates: { canonical: "https://zetraelectronics.com/products" },
    openGraph: {
        title: "All Products | Zetra Electronics",
        description: "Browse electronic components, sensors, IoT modules, and robotics kits at Zetra Electronics.",
        url: "https://zetraelectronics.com/products",
    },
};

async function getProducts(params: Record<string, string>) {
    try {
        const query = new URLSearchParams(params).toString();
        const url = `${API_URL}/products${query ? `?${query}` : ""}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        return [];
    }
}

async function getCategories(): Promise<string[]> {
    try {
        const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 60 } });
        if (!res.ok) return [];
        const data: { id: number; name: string }[] = await res.json();
        return data.map(c => c.name);
    } catch (e) {
        return [];
    }
}

export const dynamic = "force-dynamic";

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Next.js 15: searchParams is a Promise — must be awaited
    const resolvedParams = await searchParams;

    // Flatten to string-only record for URLSearchParams
    const flatParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(resolvedParams)) {
        if (value !== undefined) {
            flatParams[key] = Array.isArray(value) ? value[0] : value;
        }
    }

    const [products, categories] = await Promise.all([
        getProducts(flatParams),
        getCategories(),
    ]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">All Products</h1>

            <div className="lg:flex lg:gap-8">
                {/* Desktop Sidebar — hidden on mobile via ProductFilters */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <ProductFilters categories={categories} />
                </aside>

                {/* Main column */}
                <div className="flex-1 min-w-0">
                    {/* Mobile: sticky filter bar + slide-in drawer */}
                    <div className="lg:hidden">
                        <ProductFilters categories={categories} />
                    </div>

                    {/* Product Grid */}
                    <div className="mt-4 lg:mt-0">
                        {products.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground border rounded-xl bg-card">
                                <p className="text-lg font-medium mb-1">No products found</p>
                                <p className="text-sm">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                                {products.map((product: any) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
