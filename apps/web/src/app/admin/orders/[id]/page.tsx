"use client";

import { API_URL } from '@/lib/api';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import Image from "next/image";
import { FulfillOrder } from "@/components/admin/fulfill-order";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatImageUrl } from "@/lib/utils";

export default function AdminOrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { token } = useAuthStore();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted || !token) return;
        fetch(`${API_URL}/orders/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        } as any)
            .then(res => {
                if (res.status === 401 || res.status === 403) { router.push('/login'); return null; }
                if (!res.ok) return null;
                return res.json();
            })
            .then(data => { setOrder(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [mounted, token, id]);

    if (loading) return <div className="p-8">Loading order...</div>;

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
                <Link href="/admin/orders">
                    <Button>Back to Orders</Button>
                </Link>
            </div>
        );
    }

    const addr = (() => {
        try {
            return typeof order.shippingAddress === 'string'
                ? JSON.parse(order.shippingAddress)
                : order.shippingAddress;
        } catch { return null; }
    })();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/orders">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Order #{order.id.toString().padStart(5, '0')}</h1>
                    <p className="text-muted-foreground text-sm">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>
                </div>
                <div className="ml-auto">
                    <FulfillOrder
                        orderId={order.id}
                        currentStatus={order.status}
                        currentTracking={order.trackingUrl}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="border rounded-xl bg-card p-6 shadow-sm">
                        <h3 className="font-semibold mb-4 text-lg">Order Items</h3>
                        <div className="space-y-4">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex gap-4 items-center border-b pb-4 last:border-0 last:pb-0">
                                    <div className="h-16 w-16 bg-white border rounded flex items-center justify-center relative overflow-hidden">
                                        {item.product?.image ? (
                                            <Image
                                                src={formatImageUrl(item.product.image)}
                                                alt={item.product.name}
                                                fill
                                                className="object-contain p-2 mix-blend-multiply"
                                                unoptimized
                                            />
                                        ) : (
                                            <Package className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{item.product?.name ?? `Product #${item.productId}`}</div>
                                        <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                                    </div>
                                    <div className="font-semibold">₹{Number(item.price).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t flex justify-between items-center bg-muted/20 -mx-6 -mb-6 p-6 rounded-b-xl">
                            <span className="font-medium">Total Amount</span>
                            <span className="text-2xl font-bold text-primary">₹{Number(order.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="border rounded-xl bg-card p-6 shadow-sm">
                        <h3 className="font-semibold mb-4 text-lg">Customer</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-muted-foreground uppercase font-bold">Name</label>
                                <div className="font-medium">{order.user?.name || "Guest User"}</div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase font-bold">Email</label>
                                <div className="font-medium break-all">{order.user?.email}</div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase font-bold">Status</label>
                                <div className="mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                        order.status === 'SHIPPED'   ? 'bg-blue-100 text-blue-700' :
                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                                       'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            {order.trackingUrl && (
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase font-bold">Tracking</label>
                                    <div className="mt-1">
                                        <a href={order.trackingUrl} target="_blank" className="text-blue-600 hover:underline break-all text-sm">
                                            {order.trackingUrl}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="border rounded-xl bg-card p-6 shadow-sm">
                        <h3 className="font-semibold mb-4 text-lg">Shipping Address</h3>
                        {addr && (addr.street || addr.city) ? (
                            <div className="text-sm space-y-1">
                                {addr.street && <div className="font-medium">{addr.street}</div>}
                                {(addr.city || addr.state) && (
                                    <div className="text-muted-foreground">{[addr.city, addr.state].filter(Boolean).join(', ')}</div>
                                )}
                                {addr.zip && <div className="text-muted-foreground">PIN: {addr.zip}</div>}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">No address on record</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
