"use client";

import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";

export function AddToCartButton({ product, size = "default" }: { product: any, size?: "default" | "sm" | "lg" | "icon" }) {
    const { addItem, removeItem, updateQuantity, items } = useCartStore();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const cartItem = mounted ? items.find((item) => item.id === product.id) : null;
    const quantity = cartItem?.quantity ?? 0;

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
    };

    const handleIncrease = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
    };

    const handleDecrease = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantity <= 1) {
            removeItem(product.id);
        } else {
            updateQuantity(product.id, quantity - 1);
        }
    };

    // ── ICON mode (used on product CARDS) ──────────────────────────
    if (size === "icon") {
        if (quantity > 0) {
            return (
                <div
                    className="flex items-center gap-1 bg-primary rounded-full shadow"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                    <button
                        onClick={handleDecrease}
                        className="h-8 w-8 flex items-center justify-center text-primary-foreground hover:bg-white/20 rounded-full transition"
                    >
                        <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-primary-foreground font-bold text-sm w-4 text-center">{quantity}</span>
                    <button
                        onClick={handleIncrease}
                        className="h-8 w-8 flex items-center justify-center text-primary-foreground hover:bg-white/20 rounded-full transition"
                    >
                        <Plus className="h-3 w-3" />
                    </button>
                </div>
            );
        }
        return (
            <Button size="icon" className="rounded-full h-8 w-8" onClick={handleAdd}>
                <ShoppingCart className="h-4 w-4" />
            </Button>
        );
    }

    // ── DEFAULT / LG mode (used on product DETAIL page) ────────────
    if (quantity > 0) {
        return (
            <div className="flex items-center gap-2 flex-1">
                <button
                    onClick={handleDecrease}
                    className="h-10 w-10 rounded-full border flex items-center justify-center hover:bg-muted transition"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                <button
                    onClick={handleIncrease}
                    className="h-10 w-10 rounded-full border flex items-center justify-center hover:bg-muted transition"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <Button size={size} className="flex-1 gap-2 text-lg" onClick={handleAdd}>
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
        </Button>
    );
}
