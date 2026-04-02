"use client";

import { API_URL } from '@/lib/api';
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { FulfillOrder } from "@/components/admin/fulfill-order";

export default function AdminOrdersPage() {
    const { token, logout } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!token) { router.push('/login'); return; }
        fetchOrders();
    }, [mounted, token]);

    const fetchOrders = () => {
        if (!token) return;
        fetch(`${API_URL}/orders`, {
            headers: { "Authorization": `Bearer ${token}` },
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    logout();
                    router.push('/login');
                    return null;
                }
                if (!res.ok) throw new Error("Failed to load orders");
                return res.json();
            })
            .then(data => {
                setOrders(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const downloadInvoice = async (orderId: number) => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/invoice`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to download invoice");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `invoice-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Error downloading invoice.");
        }
    };

    if (loading) return <div className="p-8">Loading orders...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
            </div>

            <div className="border rounded-md bg-card">
                {orders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No orders found.</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground border-b">
                            <tr>
                                <th className="p-4 font-medium">Order ID</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Customer</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Total</th>
                                <th className="p-4 font-medium">Tracking</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-muted/50">
                                    <td className="p-4 font-medium">#{order.id.toString().padStart(5, '0')}</td>
                                    <td className="p-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4">{order.user?.email || "Guest"}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                            order.status === 'SHIPPED'   ? 'bg-blue-100 text-blue-700' :
                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                                           'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium">₹{Number(order.total).toFixed(2)}</td>
                                    <td className="p-4">
                                        {order.trackingUrl ? (
                                            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline text-xs">
                                                Track →
                                            </a>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => downloadInvoice(order.id)}
                                                className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                            >
                                                <Download className="h-3.5 w-3.5 mr-1.5" /> Invoice
                                            </button>
                                            <FulfillOrder
                                                orderId={order.id}
                                                currentStatus={order.status}
                                                currentTracking={order.trackingUrl}
                                                onSaved={fetchOrders}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
