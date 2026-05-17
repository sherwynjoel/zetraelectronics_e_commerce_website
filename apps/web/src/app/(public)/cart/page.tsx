"use client";

import { API_URL } from '@/lib/api';
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatImageUrl } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { removeItemFromBackend, clearBackendCart, addItemToBackend } from "@/lib/cart-api";

export default function CartPage() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
    const { token } = useAuthStore();

    const handleRemoveItem = (id: number) => {
        removeItem(id);
        if (token) removeItemFromBackend(token, id);
    };

    const handleUpdateQuantity = (id: number, quantity: number) => {
        if (quantity < 1) {
            handleRemoveItem(id);
            return;
        }
        updateQuantity(id, quantity);
        if (token) addItemToBackend(token, id, quantity);
    };

    const handleClearCart = () => {
        clearCart();
        if (token) clearBackendCart(token);
    };
    const [mounted, setMounted] = useState(false);
    const [taxRate, setTaxRate] = useState(0.18);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
    const [flatShippingFee, setFlatShippingFee] = useState(0);

    useEffect(() => {
        setMounted(true);
        fetch(`${API_URL}/settings`)
            .then(res => res.ok ? res.json() : [])
            .then((data: any[]) => {
                const gst = data.find(s => s.key === 'GST_PERCENTAGE');
                if (gst) setTaxRate(parseFloat(gst.value) / 100);

                const threshold = data.find(s => s.key === 'FREE_SHIPPING_THRESHOLD');
                if (threshold) setFreeShippingThreshold(parseFloat(threshold.value));

                const flat = data.find(s => s.key === 'FLAT_SHIPPING_FEE');
                if (flat) setFlatShippingFee(parseFloat(flat.value));
            })
            .catch(err => console.error("Using default static settings", err));
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-muted/20 flex items-center justify-center">Loading cart...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <h1 className="text-3xl font-bold mb-4 font-heading">Your Cart is Empty</h1>
                <p className="text-muted-foreground mb-8 text-center max-w-md">Looks like you haven't added any components yet. Start building your next project today!</p>
                <Link href="/">
                    <Button size="lg" className="rounded-xl px-8 h-12 text-base font-bold">Start Shopping</Button>
                </Link>
            </div>
        );
    }

    const subtotal = total();
    let shipping = items.reduce((acc, item) => acc + (item.shippingCost * item.quantity), 0);
    
    if (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) {
        shipping = 0;
    } else if (flatShippingFee > 0) {
        shipping = flatShippingFee;
    }

    const taxAmount = (subtotal + shipping) * taxRate;
    const finalTotal = subtotal + shipping + taxAmount;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 dark:bg-slate-950/50">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-12">
                <h1 className="text-2xl sm:text-4xl font-black mb-6 sm:mb-10 tracking-tight">Shopping Cart <span className="text-primary/40 text-base sm:text-2xl font-medium ml-2 sm:ml-4">({items.length} items)</span></h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-slate-900 p-3 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-3 sm:gap-6 items-center shadow-sm hover:shadow-md transition-shadow group">
                                <div className="relative h-20 w-20 sm:h-28 sm:w-28 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {item.image ? (
                                        <Image src={formatImageUrl(item.image)} alt={item.name} fill className="object-contain p-2 sm:p-4 mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-300" unoptimized />
                                    ) : (
                                        <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">No Img</div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm sm:text-lg truncate mb-1">{item.name}</h3>
                                    <div className="text-primary font-black text-base sm:text-xl">₹{item.price.toFixed(2)}</div>
                                </div>

                                <div className="flex flex-col items-end gap-4">
                                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl h-10 px-1 border border-slate-200 dark:border-slate-700">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                            className="w-8 h-8 hover:bg-white dark:hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                            className="w-8 h-8 hover:bg-white dark:hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-slate-400 hover:text-destructive hover:bg-destructive/5 rounded-xl h-9" 
                                        onClick={() => handleRemoveItem(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between items-center pt-4">
                            <Link href="/">
                                <Button variant="link" className="text-slate-500 hover:text-primary p-0 h-auto">
                                    ← Continue Shopping
                                </Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                className="text-slate-400 hover:text-destructive hover:bg-destructive/5 border-slate-200 dark:border-slate-800 rounded-xl" 
                                onClick={() => handleClearCart()}
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl sticky top-28">
                            <h2 className="text-2xl font-black mb-8 tracking-tight">Order Summary</h2>

                            <div className="space-y-5">
                                <div className="flex justify-between items-center text-slate-500">
                                    <span className="font-medium">Subtotal</span>
                                    <span className="font-bold text-slate-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500">
                                    <span className="font-medium">Shipping</span>
                                    {shipping === 0 ? (
                                        <span className="font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs">FREE SHIPPING</span>
                                    ) : (
                                        <span className="font-bold text-slate-900 dark:text-white">₹{shipping.toFixed(2)}</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-slate-500">
                                    <span className="font-medium">Tax (GST {(taxRate * 100).toFixed(0)}%)</span>
                                    <span className="font-bold text-slate-900 dark:text-white">₹{taxAmount.toFixed(2)}</span>
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex justify-between items-center">
                                    <span className="text-lg font-bold">Total</span>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-primary">₹{finalTotal.toFixed(2)}</div>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">incl. all taxes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 space-y-4">
                                <Link href="/checkout" className="w-full block">
                                    <Button size="lg" className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <div className="flex items-center justify-center gap-4 py-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                                    <Image src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" width={80} height={20} className="dark:invert" />
                                </div>
                                <p className="text-[10px] text-center text-slate-400 leading-relaxed max-w-[200px] mx-auto uppercase tracking-tighter font-bold">
                                    Secure encryption enabled
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
