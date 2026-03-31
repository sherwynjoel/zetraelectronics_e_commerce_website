"use client";

import { API_URL } from '@/lib/api';
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

async function searchProducts(query: string) {
    try {
        const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(query)}`, { cache: "no-store" });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error("Search fetch failed:", e);
        return [];
    }
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            setLoading(true);
            searchProducts(query).then(data => {
                setProducts(data);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [query]);

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-80 bg-muted animate-pulse rounded-xl"></div>)}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/20 rounded-xl">
                    <h2 className="text-xl font-bold mb-2">No results found</h2>
                    <p className="text-muted-foreground">Try searching for generic terms like "Arduino" or "Sensor"</p>
                </div>
            )}
        </div>
    );
}
