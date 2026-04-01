"use client";

import { API_URL } from '@/lib/api';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import {
    Package, Truck, CheckCircle, Clock, XCircle,
    MapPin, Download, ChevronRight, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    product: { name: string; image: string };
}

interface Order {
    id: number;
    status: string;
    total: number;
    createdAt: string;
    trackingUrl?: string;
    items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any; step: number }> = {
    PENDING:   { label: "Order Placed",  color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200",  icon: Clock,        step: 1 },
    SHIPPED:   { label: "Shipped",       color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",      icon: Truck,        step: 2 },
    DELIVERED: { label: "Delivered",     color: "text-green-600",  bg: "bg-green-50 border-green-200",    icon: CheckCircle,  step: 3 },
    CANCELLED: { label: "Cancelled",     color: "text-red-600",    bg: "bg-red-50 border-red-200",        icon: XCircle,      step: 0 },
};

const STEPS = ["Order Placed", "Shipped", "Delivered"];

export default function TrackOrderPage() {
    const { user, token, logout } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        if (!user || !token) { router.push("/login"); return; }
        fetch(`${API_URL}/orders/user/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (res.status === 401) { logout(); router.push("/login"); throw new Error("Unauthorized"); }
                if (!res.ok) throw new Error("Failed to load orders");
                return res.json();
            })
            .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [user, token]);

    const downloadInvoice = async (orderId: number) => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/invoice`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `invoice-${orderId}.pdf`;
            document.body.appendChild(a); a.click(); a.remove();
            window.URL.revokeObjectURL(url);
        } catch { alert("Could not download invoice."); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground">Loading your orders...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Track Your Orders</h1>
                    <p className="text-muted-foreground">View live status and tracking for all your orders.</p>
                </div>

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" /> {error}
                    </div>
                )}

                {orders.length === 0 && !error && (
                    <div className="text-center py-16 bg-white rounded-2xl border shadow-sm">
                        <Package className="h-14 w-14 mx-auto text-muted-foreground/40 mb-4" />
                        <h3 className="font-semibold text-lg mb-1">No orders yet</h3>
                        <p className="text-muted-foreground text-sm">Orders you place will appear here with live tracking.</p>
                    </div>
                )}

                <div className="space-y-4">
                    <AnimatePresence>
                        {orders.map((order, i) => {
                            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                            const StatusIcon = cfg.icon;
                            const isExpanded = expandedId === order.id;

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                                >
                                    {/* Order header row */}
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                        className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50/60 transition-colors"
                                    >
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold ${cfg.bg} ${cfg.color}`}>
                                            <StatusIcon className="h-4 w-4" />
                                            {cfg.label}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm">
                                                Order #{order.id.toString().padStart(5, "0")}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? "s" : ""} · ₹{Number(order.total).toFixed(2)}
                                            </div>
                                        </div>
                                        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                    </button>

                                    {/* Progress bar */}
                                    {order.status !== "CANCELLED" && (
                                        <div className="px-5 pb-4">
                                            <div className="relative flex items-center justify-between">
                                                <div className="absolute top-2 left-0 w-full h-1 bg-slate-100 rounded-full" />
                                                <div
                                                    className="absolute top-2 left-0 h-1 bg-primary rounded-full transition-all duration-700"
                                                    style={{ width: cfg.step === 1 ? "5%" : cfg.step === 2 ? "50%" : "100%" }}
                                                />
                                                {STEPS.map((step, idx) => (
                                                    <div key={step} className="relative z-10 flex flex-col items-center gap-1">
                                                        <div className={`h-4 w-4 rounded-full border-2 transition-colors ${cfg.step > idx ? "bg-primary border-primary" : "bg-white border-slate-300"}`} />
                                                        <span className={`text-[10px] font-medium ${cfg.step > idx ? "text-primary" : "text-slate-400"}`}>{step}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tracking link */}
                                    {order.trackingUrl && (
                                        <div className="px-5 pb-4">
                                            <a
                                                href={order.trackingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 rounded-xl text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
                                            >
                                                <MapPin className="h-4 w-4" />
                                                Track shipment with courier →
                                            </a>
                                        </div>
                                    )}

                                    {/* Expanded: items + invoice */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-slate-100 overflow-hidden"
                                            >
                                                <div className="p-5 space-y-3">
                                                    {order.items.map((item) => (
                                                        <div key={item.id} className="flex items-center gap-3">
                                                            <div className="h-12 w-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                {item.product?.image && (
                                                                    <img src={item.product.image} alt="" className="h-full w-full object-contain" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium line-clamp-1">{item.product?.name}</div>
                                                                <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                                                            </div>
                                                            <div className="text-sm font-semibold">₹{Number(item.price).toFixed(2)}</div>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => downloadInvoice(order.id)}
                                                        className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                                                    >
                                                        <Download className="h-4 w-4" /> Download Invoice
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
