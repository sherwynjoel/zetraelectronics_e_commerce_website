"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/store";
import { syncCartToBackend, fetchBackendCart } from "@/lib/cart-api";

export function CartSyncProvider() {
    const { user, token } = useAuthStore();
    const { items, addItem, clearCart } = useCartStore();
    const prevUserId = useRef<number | null>(null);

    useEffect(() => {
        if (!user || !token) {
            prevUserId.current = null;
            return;
        }

        // Only run on login (user id changes from null/different to current)
        if (prevUserId.current === user.id) return;
        prevUserId.current = user.id;

        (async () => {
            try {
                // 1. Push local cart items to backend (merge)
                if (items.length > 0) {
                    await syncCartToBackend(token, items);
                }

                // 2. Fetch merged backend cart and replace local store
                const backendItems = await fetchBackendCart(token);
                if (!Array.isArray(backendItems)) return;

                clearCart();
                for (const item of backendItems) {
                    const p = item.product;
                    if (!p) continue;
                    addItem({
                        id: p.id,
                        name: p.name,
                        price: Number(p.price),
                        shippingCost: Number(p.shippingCost || 0),
                        image: p.image,
                        stock: Number(p.stock),
                        quantity: item.quantity,
                    });
                    // addItem only increments by 1; set correct quantity
                    useCartStore.setState((state) => ({
                        items: state.items.map((ci) =>
                            ci.id === p.id ? { ...ci, quantity: item.quantity } : ci
                        ),
                    }));
                }
            } catch {
                // silently fail — localStorage cart is still usable
            }
        })();
    }, [user?.id, token]);

    return null;
}
