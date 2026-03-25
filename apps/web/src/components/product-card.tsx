import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/add-to-cart";

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    category: string;
    image: string | null;
}

export function ProductCard({ product }: { product: Product }) {
    return (
        <div className="bg-card text-card-foreground rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            <Link href={`/products/${product.id}`} className="block relative aspect-square bg-slate-50 dark:bg-slate-900 border-b">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                )}
                {product.stock > 0 ? (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full">
                        In Stock
                    </span>
                ) : (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full">
                        Out of Stock
                    </span>
                )}
            </Link>

            <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold line-clamp-1">{product.category}</div>
                <Link href={`/products/${product.id}`} className="block">
                    <h3 className="font-bold text-sm sm:text-base leading-tight line-clamp-2 h-9 sm:h-10 hover:text-primary transition-colors" title={product.name}>
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-0.5 sm:gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">(0)</span>
                </div>

                <div className="flex items-center justify-between pt-1 sm:pt-2">
                    <div className="text-base sm:text-lg font-bold text-primary truncate mr-2">
                        ₹{Number(product.price).toFixed(2)}
                    </div>
                    <AddToCartButton product={product} size="icon" />
                </div>
            </div>
        </div>
    );
}
