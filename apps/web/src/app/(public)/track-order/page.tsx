"use client";

import { API_URL } from '@/lib/api';
import { useState } from "react";
import { Search, Package, MapPin, Calendar, CreditCard, ChevronRight, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    product: {
        name: string;
        image: string;
    };
}

interface Order {
    id: number;
    status: string;
    total: number;
    createdAt: string;
    items: OrderItem[];
    trackingUrl?: string;
}

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState("");
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) return;

        setLoading(true);
        setError("");
        setOrder(null);

        try {
            const res = await fetch(`${API_URL}/orders/${orderId}`);
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error("Order not found. Please check your Order ID.");
                }
                throw new Error("Failed to fetch order details.");
            }
            const data = await res.json();
            setOrder(data);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "DELIVERED": return "text-green-600 bg-green-50 border-green-200";
            case "SHIPPED": return "text-blue-600 bg-blue-50 border-blue-200";
            case "PENDING": return "text-orange-600 bg-orange-50 border-orange-200";
            default: return "text-slate-600 bg-slate-50 border-slate-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case "DELIVERED": return <CheckCircle className="h-5 w-5" />;
            case "SHIPPED": return <Truck className="h-5 w-5" />;
            case "PENDING": return <Package className="h-5 w-5" />;
            default: return <AlertCircle className="h-5 w-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Track Your Order</h1>
                    <p className="text-slate-500">Enter your order ID to see the current status and delivery details.</p>
                </div>

                {/* Search Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Enter Order ID (e.g., 123)"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            className="rounded-xl px-8 font-semibold"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Tracking...
                                </span>
                            ) : "Track Order"}
                        </Button>
                    </form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100"
                        >
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </motion.div>
                    )}
                </div>

                {/* Results */}
                <AnimatePresence mode="wait">
                    {order && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Order Status Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <div className="text-sm text-slate-500 font-medium mb-1">Order #{order.id}</div>
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full border flex items-center gap-2 font-bold text-sm ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status}
                                    </div>
                                </div>

                                <div className="p-6 grid gap-6 md:grid-cols-3">
                                    <div className="space-y-1">
                                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Delivery</div>
                                        <div className="font-semibold text-slate-900">3-5 Business Days</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Shipping Method</div>
                                        <div className="font-semibold text-slate-900">Standard Shipping</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tracking Number</div>
                                        <div className="font-mono text-slate-900 bg-slate-50 px-2 py-1 rounded w-fit text-sm">
                                            {order.trackingUrl || "Pending assignment"}
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Visualization (Mock) */}
                                <div className="bg-slate-50/50 p-8 border-t border-slate-100">
                                    <div className="relative flex items-center justify-between w-full max-w-2xl mx-auto">
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
                                        <div className="absolute top-1/2 left-0 h-1 bg-primary transition-all duration-1000 -translate-y-1/2 z-0"
                                            style={{
                                                width: order.status === 'DELIVERED' ? '100%' : order.status === 'SHIPPED' ? '50%' : '5%'
                                            }}
                                        ></div>

                                        {['Ordered', 'Shipped', 'Delivered'].map((step, idx) => {
                                            const isCompleted = (
                                                (order.status === 'PENDING' && idx === 0) ||
                                                (order.status === 'SHIPPED' && idx <= 1) ||
                                                (order.status === 'DELIVERED' && idx <= 2)
                                            );

                                            return (
                                                <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                                    <div className={`
                                        h-4 w-4 rounded-full border-2 transition-colors duration-500
                                        ${isCompleted ? 'bg-primary border-primary' : 'bg-white border-slate-300'}
                                    `}></div>
                                                    <span className={`text-xs font-medium ${isCompleted ? 'text-primary' : 'text-slate-400'}`}>
                                                        {step}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-100">
                                    <h3 className="font-bold text-lg text-slate-900">Order Items</h3>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {order.items?.map((item) => (
                                        <div key={item.id} className="p-6 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                                            <div className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200">
                                                {/* Placeholder since API might not return full image URL or backend structure for OrderItem product include might vary */}
                                                {item.product?.image && (
                                                    <img
                                                        src={item.product.image.startsWith('http') ? item.product.image : `${API_URL}${item.product.image}`}
                                                        alt={item.product?.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-900">{item.product?.name || `Product #${item.productId}`}</h4>
                                                <div className="text-sm text-slate-500">Qty: {item.quantity}</div>
                                            </div>
                                            <div className="font-bold text-slate-900">
                                                ₹{parseFloat(item.price.toString()).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
                                    <span className="font-medium text-slate-500">Total Amount</span>
                                    <span className="text-2xl font-black text-slate-900">₹{parseFloat(order.total.toString()).toLocaleString()}</span>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
