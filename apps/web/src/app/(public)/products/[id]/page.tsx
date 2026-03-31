import { API_URL } from '@/lib/api';
import { AddToCartButton } from "@/components/add-to-cart";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Truck, Check, Share2, Download, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    shippingCost: string;
    stock: number;
    category: string;
    image: string;
    datasheet?: string;
    specs?: string;
}

// Fetch single product
async function getProduct(id: string) {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, { cache: "no-store" });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        console.error("Failed to fetch product:", e);
        return null;
    }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
    // Await params correctly in Next.js 15+
    const { id } = await params;
    const product: Product | null = await getProduct(id);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Product Not Found</h1>
                    <Link href="/" className="text-primary hover:underline mt-4 inline-block">Return Home</Link>
                </div>
            </div>
        );
    }

    let specs = {};
    try {
        if (product.specs) {
            specs = JSON.parse(product.specs);
        }
    } catch (e) { }

    return (
        <div className="bg-background min-h-screen pb-20">
            <div className="container mx-auto px-4 py-8">

                {/* Breadcrumb */}
                <div className="text-sm text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-primary">{product.category}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-foreground">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column: Images */}
                    <div className="space-y-4">
                        <div className="aspect-square relative bg-slate-50 dark:bg-slate-900 border rounded-2xl overflow-hidden flex items-center justify-center">
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="text-muted-foreground">No Image</div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    <span className="text-sm text-muted-foreground ml-2">(No reviews yet)</span>
                                </div>
                                <div className="h-4 w-px bg-border"></div>
                                <div className="text-sm text-muted-foreground">SKU: {product.id.toString().padStart(6, '0')}</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-4xl font-bold text-primary">₹{Number(product.price).toFixed(2)}</span>
                            {Number(product.shippingCost) > 0 && (
                                <span className="text-sm text-muted-foreground">
                                    + ₹{Number(product.shippingCost).toFixed(2)} Shipping
                                </span>
                            )}
                        </div>

                        <div className="border-t border-b py-4 space-y-3">
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                                <Check className="h-5 w-5" />
                                In Stock ({product.stock} units available)
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Truck className="h-4 w-4" />
                                Ships within 24 hours
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <AddToCartButton product={product} size="lg" />
                            <Button size="icon" variant="outline" className="h-12 w-12 rounded-md border-input">
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground leading-relaxed">
                            {product.description}
                        </div>

                        {product.datasheet && (
                            <a
                                href={product.datasheet}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary hover:underline font-medium p-3 bg-primary/10 rounded-lg w-full justify-center transition-colors hover:bg-primary/20"
                            >
                                <FileText className="h-5 w-5" />
                                Download Datasheet PDF
                            </a>
                        )}
                    </div>
                </div>

                {/* Bottom Section: Specs & Reviews */}
                <div className="mt-16">
                    <div className="border-b mb-8">
                        <div className="flex gap-8">
                            <button className="pb-4 border-b-2 border-primary font-bold text-primary">Specifications</button>
                            <button className="pb-4 border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors">Reviews</button>
                            <button className="pb-4 border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors">Q & A</button>
                        </div>
                    </div>

                    <div className="max-w-3xl">
                        <h3 className="text-xl font-bold mb-6">Technical Specifications</h3>
                        <div className="rounded-xl border overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <tbody>
                                    {Object.entries(specs).map(([key, value], i) => (
                                        <tr key={key} className={i % 2 === 0 ? "bg-muted/50" : "bg-card"}>
                                            <td className="p-4 font-medium border-r w-1/3">{key}</td>
                                            <td className="p-4 text-muted-foreground">{value as string}</td>
                                        </tr>
                                    ))}
                                    {Object.keys(specs).length === 0 && (
                                        <tr>
                                            <td className="p-4 text-muted-foreground italic">No detailed specifications available.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
