"use client";

import { API_URL } from '@/lib/api';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Package, User, LogOut, Download, MapPin } from "lucide-react";

interface Order {
    id: number;
    createdAt: string;
    total: string;
    status: string;
    trackingUrl?: string;
    items: {
        product: { name: string; image: string };
        quantity: number;
        price: string;
    }[];
}

export default function ProfilePage() {
    const { user, token, logout } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    const fetchOrders = (uid: number, tok: string) => {
        setLoading(true);
        setOrdersError(null);
        fetch(`${API_URL}/orders/user/${uid}`, {
            headers: { Authorization: `Bearer ${tok}` },
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    logout();
                    router.push("/login");
                    throw new Error("Unauthorized");
                }
                if (!res.ok) throw new Error(`Server error (${res.status})`);
                return res.json();
            })
            .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(err => { console.error(err); setOrdersError(err.message || "Failed to load orders"); setLoading(false); });
    };

    useEffect(() => {
        if (!user || !token) { router.push("/login"); return; }
        fetchOrders(user.id, token);
    }, [user, token]);

    const downloadInvoice = async (orderId: number) => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/invoice`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `invoice-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            alert("Could not download invoice. Please try again.");
        }
    };

    if (!user) return null;

    const statusColor = (s: string) =>
        s === "DELIVERED" ? "bg-green-100 text-green-700" :
        s === "SHIPPED"   ? "bg-blue-100 text-blue-700" :
        s === "CANCELLED" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700";

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="bg-card p-6 rounded-xl border shadow-sm h-fit">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user.name || "User"}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            <span className="inline-block mt-2 px-2 py-1 bg-muted rounded text-xs font-medium uppercase">{user.role}</span>
                        </div>
                    </div>
                    <Button variant="destructive" className="w-full gap-2" onClick={() => { logout(); router.push("/"); }}>
                        <LogOut className="h-4 w-4" /> Sign Out
                    </Button>
                </div>

                {/* Orders List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Package className="h-5 w-5" /> Order History
                    </h2>

                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
                    ) : ordersError ? (
                        <div className="bg-card p-8 rounded-xl border text-center">
                            <p className="text-destructive font-medium mb-2">Could not load orders</p>
                            <p className="text-sm text-muted-foreground mb-4">{ordersError}</p>
                            <button onClick={() => user && token && fetchOrders(user.id, token)}
                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                                Retry
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-card p-8 rounded-xl border text-center text-muted-foreground">
                            No orders found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Order Header */}
                                    <div className="bg-muted/30 p-4 flex items-center justify-between border-b flex-wrap gap-3">
                                        <div className="flex gap-6">
                                            <div>
                                                <span className="text-xs text-muted-foreground block">Order Placed</span>
                                                <span className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground block">Total</span>
                                                <span className="text-sm font-medium">₹{Number(order.total).toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground block">Order ID</span>
                                                <span className="text-sm font-mono font-medium">#{order.id.toString().padStart(5, "0")}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => downloadInvoice(order.id)}
                                                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline px-3 py-1.5 bg-primary/10 rounded-full cursor-pointer border-0"
                                            >
                                                <Download className="h-3 w-3" /> Invoice
                                            </button>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-4 space-y-3">
                                        <div className="sm:hidden mb-3 font-bold text-sm">Total: ₹{Number(order.total).toFixed(2)}</div>
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex gap-4 items-center">
                                                <div className="h-12 w-12 bg-muted rounded flex-shrink-0 overflow-hidden">
                                                    {item.product.image ? (
                                                        <img src={item.product.image} alt="" className="object-contain w-full h-full" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs">No Img</div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm line-clamp-1">{item.product.name}</div>
                                                    <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                                                </div>
                                                <div className="font-medium text-sm">₹{item.price}</div>
                                            </div>
                                        ))}

                                        {/* Tracking link — shown when admin adds a tracking URL */}
                                        {order.trackingUrl && (
                                            <a
                                                href={order.trackingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors"
                                            >
                                                <MapPin className="h-4 w-4" />
                                                Track your shipment →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
