"use client";

import { API_URL } from '@/lib/api';
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CheckCircle, MapPin, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { useAuthStore } from "@/lib/auth-store";

export default function CheckoutPage() {
    const { items, clearCart } = useCartStore();
    const { user, token } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        paymentMethod: "razorpay"
    });
    
    const [taxRate, setTaxRate] = useState(0.18);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
    const [flatShippingFee, setFlatShippingFee] = useState(0);

    useEffect(() => {
        // Fetch dynamic settings
        fetch(`${API_URL}/settings`)
            .then(res => res.ok ? res.json() : [])
            .then((data: any[]) => {
                const gst = data.find(s => s.key === 'GST_PERCENTAGE');
                if (gst) setTaxRate(parseFloat(gst.value) / 100);

                const shipping = data.find(s => s.key === 'FREE_SHIPPING_THRESHOLD');
                if (shipping) setFreeShippingThreshold(parseFloat(shipping.value));

                const flat = data.find(s => s.key === 'FLAT_SHIPPING_FEE');
                if (flat) setFlatShippingFee(parseFloat(flat.value));
            })
            .catch(err => console.error("Using default settings", err));
    }, []);

    // 📍 Auto-verify Pincode and Fill City/State
    useEffect(() => {
        if (formData.zip.length === 6) {
            setPincodeLoading(true);
            fetch(`https://api.postalpincode.in/pincode/${formData.zip}`)
                .then(res => res.json())
                .then(data => {
                    if (data[0].Status === "Success") {
                        const postOffice = data[0].PostOffice[0];
                        setFormData(prev => ({
                            ...prev,
                            city: postOffice.District,
                            state: postOffice.State
                        }));
                    }
                })
                .catch(err => console.error("Pincode error:", err))
                .finally(() => setPincodeLoading(false));
        }
    }, [formData.zip]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        let shipping = items.reduce((acc, item) => acc + (item.shippingCost * item.quantity), 0);

        if (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) {
            shipping = 0;
        } else if (flatShippingFee > 0) {
            shipping = flatShippingFee;
        }

        const tax = (subtotal + shipping) * taxRate;
        const total = subtotal + shipping + tax;

        return { subtotal, shipping, tax, total };
    }

    const { subtotal, shipping, tax, total: finalTotal } = calculateTotals();

    const handlePreOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert("Please login to place an order");
            router.push("/login");
            return;
        }
        setShowConfirmModal(true);
    };

    const handlePlaceOrder = async () => {
        if (!user) return; // TypeScript safety
        
        setShowConfirmModal(false);
        setLoading(true);

        const orderData = {
            items: items.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            total: finalTotal,
            userId: user.id,
            address: {
                street: formData.address,
                city: formData.city,
                state: formData.state,
                zip: formData.zip
            },
            paymentMethod: formData.paymentMethod
        };

        try {
            const res = await fetch(`${API_URL}/orders`, {
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
                alert(`Order Failed: ${err.message || 'Unknown error'}`);
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
                    <form onSubmit={handlePreOrder} className="space-y-8">
                        <div className="bg-card p-6 rounded-xl border shadow-sm">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" /> Shipping Details
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">First Name</label>
                                    <input required name="firstName" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Last Name</label>
                                    <input required name="lastName" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" onChange={handleChange} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium mb-1 block">Street Address</label>
                                    <input required name="address" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">ZIP Code</label>
                                    <div className="relative">
                                        <input 
                                            required 
                                            name="zip" 
                                            maxLength={6}
                                            placeholder="6-digit ZIP"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                                            onChange={handleChange} 
                                        />
                                        {pincodeLoading && (
                                            <div className="absolute right-3 top-2.5">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">City</label>
                                    <input 
                                        required 
                                        name="city" 
                                        value={formData.city}
                                        className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-medium" 
                                        readOnly 
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium mb-1 block">State</label>
                                    <input 
                                        required 
                                        name="state" 
                                        value={formData.state}
                                        className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-medium" 
                                        readOnly 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-xl border shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 bg-primary/5 ring-1 ring-primary/20">
                                    <input type="radio" checked readOnly />
                                    <span className="font-medium bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent italic font-bold text-lg">Razorpay</span>
                                    <span className="text-sm text-muted-foreground">(Cards, UPI, NetBanking)</span>
                                </label>
                            </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full text-lg shadow-xl shadow-primary/20" disabled={loading}>
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
                                        <div className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</div>
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
                                    {shipping === 0 ? <span className="text-green-600 font-bold">Free</span> : <span>₹{shipping.toFixed(2)}</span>}
                                </div>
                                <div className="flex justify-between text-sm font-bold">
                                    <span>Total</span>
                                    <span className="text-primary text-lg">₹{finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden"
                        >
                            <div className="p-6 text-center border-b bg-muted/30">
                                <AlertCircle className="h-10 w-10 text-primary mx-auto mb-2" />
                                <h3 className="text-xl font-bold">Confirm Your Address</h3>
                                <p className="text-sm text-muted-foreground mt-1">Please verify your delivery location before we ship.</p>
                            </div>
                            
                            <div className="p-8">
                                <div className="space-y-4 text-left">
                                    <div className="flex gap-3">
                                        <div className="text-primary mt-1"><MapPin className="h-5 w-5" /></div>
                                        <div>
                                            <div className="font-bold text-lg">{formData.firstName} {formData.lastName}</div>
                                            <div className="text-muted-foreground leading-relaxed mt-1">
                                                {formData.address}<br />
                                                {formData.city}, {formData.state}<br />
                                                <span className="font-bold text-foreground">{formData.zip}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2">
                                <button 
                                    onClick={() => setShowConfirmModal(false)}
                                    className="p-4 bg-muted hover:bg-muted/80 font-medium transition-colors border-r"
                                >
                                    Edit Address
                                </button>
                                <button 
                                    onClick={handlePlaceOrder}
                                    className="p-4 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
                                >
                                    Yes, Place Order
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
