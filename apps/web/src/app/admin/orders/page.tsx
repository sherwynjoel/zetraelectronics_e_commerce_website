"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Download } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export default function AdminOrdersPage() {
    const { token } = useAuthStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        fetch("http://localhost:4000/orders", {
            headers: { "Authorization": `Bearer ${token}` },
        })
            .then(res => {
                if (!res.ok) throw new Error("Unauthorized");
                return res.json();
            })
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [token]);

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
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium">₹{Number(order.total).toFixed(2)}</td>
                                    <td className="p-4 text-right">
                                        <a href={`http://localhost:4000/orders/${order.id}/invoice`} target="_blank" className="mr-2 inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground align-middle">
                                            <Download className="h-4 w-4 mr-2" /> Invoice
                                        </a>
                                        <Link href={`/admin/orders/${order.id}`}>
                                            <Button variant="outline" size="sm">Manage</Button>
                                        </Link>
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
