"use client";

import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { useAuthStore } from "@/lib/auth-store";

export default function CheckoutPage() {
    const { items, clearCart } = useCartStore();
    const { user, token } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        city: "",
        zip: "",
        paymentMethod: "cod" // Default to Cash on Delivery
    });
    const [taxRate, setTaxRate] = useState(0.18);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);

    useEffect(() => {
        // Fetch dynamic settings
        fetch("http://localhost:4000/settings")
            .then(res => res.ok ? res.json() : [])
            .then((data: any[]) => {
                const gst = data.find(s => s.key === 'GST_PERCENTAGE');
                if (gst) setTaxRate(parseFloat(gst.value) / 100);

                const shipping = data.find(s => s.key === 'FREE_SHIPPING_THRESHOLD');
                if (shipping) setFreeShippingThreshold(parseFloat(shipping.value));
            })
            .catch(err => console.error("Using default settings", err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        let shipping = items.reduce((acc, item) => acc + (item.shippingCost * item.quantity), 0);

        if (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) {
            shipping = 0;
        }

        const tax = (subtotal + shipping) * taxRate;
        const total = subtotal + shipping + tax;

        return { subtotal, shipping, tax, total };
    }

    const { subtotal, shipping, tax, total: finalTotal } = calculateTotals();

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert("Please login to place an order");
            router.push("/login");
            return;
        }

        setLoading(true);

        const orderData = {
            items: items.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            // Backend will recalculate total, so this is just for reference/log
            total: finalTotal,
            userId: user.id, // Real user ID
            address: {
                street: formData.address,
                city: formData.city,
                zip: formData.zip
            }
        };

        try {
            const res = await fetch("http://localhost:4000/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const order = await res.json();
                clearCart();
                router.push(`/checkout/success?orderId=${order.id}`);
            } else {
                const err = await res.json();
                const msg = err.message || 'Unknown error';

                // Handle "Product ID X not found" error
                if (msg.includes("not found")) {
                    const match = msg.match(/Product ID (\d+) not found/);
                    if (match && match[1]) {
                        const badId = parseInt(match[1]);
                        // Remove the bad item directly from store state
                        useCartStore.getState().removeItem(badId);
                        alert(`Item (ID: ${badId}) is no longer available and has been removed from your cart. Please review your order and try again.`);
                        return; // Stop here so user can review
                    }
                }

                alert(`Order Failed: ${msg}`);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to place order. Check network connection.");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                        <ArrowLeft className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
                    <p className="text-muted-foreground mb-6">Add some products to your cart before checking out.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/products">
                            <Button size="lg" className="w-full sm:w-auto">Browse Products</Button>
                        </Link>
                        <Link href="/cart">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto">View Cart</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/10 pb-20">
            <div className="container mx-auto px-4 py-8">
                <Link href="/cart" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="h-4 w-4" /> Back to Cart
                </Link>

                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Form */}
                    <form onSubmit={handlePlaceOrder} className="space-y-8">
                        <div className="bg-card p-6 rounded-xl border shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Shipping Details</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">First Name</label>
                                    <input required name="firstName" className="w-full border rounded-md p-2 bg-background" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Last Name</label>
                                    <input required name="lastName" className="w-full border rounded-md p-2 bg-background" onChange={handleChange} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium mb-1 block">Email Address</label>
                                    <input required name="email" type="email" className="w-full border rounded-md p-2 bg-background" onChange={handleChange} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium mb-1 block">Street Address</label>
                                    <input required name="address" className="w-full border rounded-md p-2 bg-background" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">City</label>
                                    <input required name="city" className="w-full border rounded-md p-2 bg-background" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">ZIP Code</label>
                                    <input required name="zip" className="w-full border rounded-md p-2 bg-background" onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-xl border shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={formData.paymentMethod === 'card'}
                                        onChange={handleChange}
                                    />
                                    <span className="font-medium">Credit/Debit Card (Secure)</span>
                                </label>

                                <AnimatePresence>
                                    {formData.paymentMethod === 'card' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-3 pl-8 border-l-2 border-primary/20"
                                        >
                                            <input required placeholder="Card Number (0000 0000 0000 0000)" className="w-full border rounded-md p-2 text-sm" maxLength={19} />
                                            <div className="flex gap-3">
                                                <input required placeholder="MM/YY" className="w-1/2 border rounded-md p-2 text-sm" maxLength={5} />
                                                <input required placeholder="CVC" className="w-1/2 border rounded-md p-2 text-sm" maxLength={3} />
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                <span>Payments processed securely via encrypted gateway (Simulation)</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer bg-primary/5 ring-1 ring-primary/20">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={formData.paymentMethod === 'cod'}
                                        onChange={handleChange}
                                    />
                                    <span className="font-medium">Cash on Delivery (COD)</span>
                                </label>
                            </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full text-lg" disabled={loading}>
                            {loading ? "Processing..." : `Place Order (₹${finalTotal.toFixed(2)})`}
                        </Button>
                    </form>

                    {/* Right: Order Summary */}
                    <div>
                        <div className="bg-card p-6 rounded-xl border shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold mb-4">Your Order</h2>
                            <div className="divide-y max-h-80 overflow-y-auto pr-2 mb-4">
                                {items.map((item) => (
                                    <div key={item.id} className="py-3 flex gap-3">
                                        <div className="relative h-12 w-12 bg-white border rounded flex-shrink-0">
                                            {item.image && <Image src={item.image} alt={item.name} fill className="object-contain p-1" unoptimized />}
                                            <span className="absolute -top-2 -right-2 bg-slate-700 text-white text-[10px] h-5 w-5 flex items-center justify-center rounded-full">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{item.name}</div>
                                            <div className="text-sm text-muted-foreground">₹{item.price} each</div>
                                        </div>
                                        <div className="font-bold">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-4 border-t">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    {shipping === 0 && items.some(i => i.shippingCost > 0) ? (
                                        <span className="text-green-600 font-bold">Free</span>
                                    ) : (
                                        <span>₹{shipping.toFixed(2)}</span>
                                    )}
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">₹{finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
