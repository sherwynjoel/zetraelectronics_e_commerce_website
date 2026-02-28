"use client";

import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-muted/20 flex items-center justify-center">Loading cart...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-muted-foreground mb-8 text-center max-w-md">Looks like you haven't added any components yet. Start building your next project today!</p>
                <Link href="/">
                    <Button size="lg">Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/10 pb-20">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart ({items.length} items)</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-card p-4 rounded-xl border flex gap-4 items-center">
                                <div className="relative h-20 w-20 bg-white rounded-md border flex-shrink-0 flex items-center justify-center">
                                    {item.image ? (
                                        <Image src={item.image} alt={item.name} fill className="object-contain p-2 mix-blend-multiply" unoptimized />
                                    ) : (
                                        <div className="text-xs text-muted-foreground">No Img</div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base truncate">{item.name}</h3>
                                    <div className="text-primary font-semibold mt-1">₹{item.price.toFixed(2)}</div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border rounded-md h-8">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="px-2 hover:bg-muted h-full flex items-center justify-center"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="px-2 hover:bg-muted h-full flex items-center justify-center"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <Button variant="outline" className="text-muted-foreground hover:text-foreground" onClick={() => clearCart()}>
                            Clear Cart
                        </Button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card p-6 rounded-xl border shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">₹{total().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping Estimate</span>
                                    <span className="font-medium text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax (GST 18%)</span>
                                    <span className="font-medium">₹{(total() * 0.18).toFixed(2)}</span>
                                </div>

                                <div className="border-t pt-4 flex justify-between text-base font-bold">
                                    <span>Total</span>
                                    <span>₹{(total() * 1.18).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <Link href="/checkout" className="w-full">
                                    <Button size="lg" className="w-full gap-2 text-md">
                                        Proceed to Checkout <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <div className="text-xs text-center text-muted-foreground">
                                    Secure Checkout powered by Stripe / Razorpay
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
