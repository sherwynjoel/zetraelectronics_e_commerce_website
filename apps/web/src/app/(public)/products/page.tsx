import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";

async function getProducts(params: Record<string, string>) {
    try {
        const query = new URLSearchParams(params).toString();
        const url = `http://localhost:4000/products${query ? `?${query}` : ""}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        return [];
    }
}

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

    const products = await getProducts(flatParams);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">All Products</h1>

            <div className="lg:flex lg:gap-8">
                {/* Desktop Sidebar — hidden on mobile via ProductFilters */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <ProductFilters />
                </aside>

                {/* Main column */}
                <div className="flex-1 min-w-0">
                    {/* Mobile: sticky filter bar + slide-in drawer */}
                    <div className="lg:hidden">
                        <ProductFilters />
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
