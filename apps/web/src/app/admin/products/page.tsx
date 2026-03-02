import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ProductActions } from "@/components/admin/product-actions";
import Image from "next/image";

async function getProducts() {
    try {
        const res = await fetch("http://127.0.0.1:4000/products", { cache: "no-store" });
        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        return [];
    }
}

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Products</h2>
                <Link href="/admin/products/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>

            <div className="border rounded-md bg-card">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground border-b">
                        <tr>
                            <th className="p-4 font-medium">Image</th>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Category</th>
                            <th className="p-4 font-medium">Price</th>
                            <th className="p-4 font-medium">Stock</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {products.map((product: any) => (
                            <tr key={product.id} className="hover:bg-muted/50">
                                <td className="p-4">
                                    <div className="relative h-10 w-10 bg-white border rounded">
                                        {product.image && <img src={product.image} alt={product.name} className="h-full w-full object-contain p-1" />}
                                    </div>
                                </td>
                                <td className="p-4 font-medium">{product.name}</td>
                                <td className="p-4 text-muted-foreground">{product.category}</td>
                                <td className="p-4">₹{Number(product.price).toFixed(2)}</td>
                                <td className="p-4">{product.stock}</td>
                                <td className="p-4 text-right">
                                    <ProductActions productId={product.id} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
