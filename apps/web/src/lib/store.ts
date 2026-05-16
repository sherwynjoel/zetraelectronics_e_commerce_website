import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    shippingCost: number;
    image: string | null;
    quantity: number;
    stock: number; // track available stock to enforce cap
}

interface CartStore {
    items: CartItem[];
    addItem: (product: any) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    count: () => number;
    total: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const items = get().items;
                const existingItem = items.find((item) => item.id === product.id);
                const stock = Number(product.stock ?? 999);

                if (existingItem) {
                    // Don't exceed available stock
                    if (existingItem.quantity >= stock) return;
                    set({
                        items: items.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    });
                } else {
                    set({
                        items: [
                            ...items,
                            {
                                id: product.id,
                                name: product.name,
                                price: Number(product.price),
                                shippingCost: Number(product.shippingCost || 0),
                                image: product.image,
                                quantity: 1,
                                stock,
                            },
                        ],
                    });
                }
            },
            removeItem: (id) =>
                set({ items: get().items.filter((item) => item.id !== id) }),
            updateQuantity: (id, quantity) =>
                set({
                    items: get().items.map((item) =>
                        item.id === id
                            ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) }
                            : item
                    ),
                }),
            clearCart: () => set({ items: [] }),
            count: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            total: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity) + (item.shippingCost * item.quantity), 0),
        }),
        {
            name: 'electro-cart-storage',
        }
    )
);

