import { API_URL } from '@/lib/api';
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getCategoryProducts(category: string) {
    // Convert URL-friendly slug back to Title Case for API query or filtering
    // e.g. "electronic-components" -> "Electronic Components"
    // This simple logic works for the predefined categories in navbar
    const categoryName = category
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    try {
        const res = await fetch(`${API_URL}/products?category=${encodeURIComponent(categoryName)}`, { cache: "no-store" });
        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        console.error("Failed to fetch products for category:", category);
        return [];
    }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const products = await getCategoryProducts(slug);

    // Format title for display
    const title = slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <p className="text-muted-foreground mt-1">{products.length} Products Found</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.length > 0 ? (
                    products.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center bg-muted/30 rounded-xl border border-dashed">
                        <p className="text-lg font-medium text-muted-foreground">No products found in this category.</p>
                        <Link href="/">
                            <Button variant="link" className="mt-2 text-primary">Browse All Products</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
