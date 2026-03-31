import { API_URL } from '@/lib/api';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Check, Package } from "lucide-react";
import Image from "next/image";
import { FulfillOrder } from "@/components/admin/fulfill-order";

async function getOrder(id: string) {
    try {
        const res = await fetch(`${API_URL}/orders/${id}`, { cache: "no-store" });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        return null;
    }
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const order = await getOrder(id);

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
                <div className="ml-auto flex gap-3 relative">
                    <FulfillOrder
                        orderId={order.id}
                        currentStatus={order.status}
                        currentTracking={order.trackingUrl}
                    />
                    <Button className="gap-2">
                        <Check className="h-4 w-4" /> Mark Delivered
                    </Button>
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
                                    <div className="h-16 w-16 bg-white border rounded flex items-center justify-center relative">
                                        {item.product.image ? (
                                            <Image
                                                src={item.product.image}
                                                alt={item.product.name}
                                                fill
                                                className="object-contain p-2 mix-blend-multiply"
                                            />
                                        ) : (
                                            <Package className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{item.product.name}</div>
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

                {/* Customer Details */}
                <div className="space-y-6">
                    <div className="border rounded-xl bg-card p-6 shadow-sm">
                        <h3 className="font-semibold mb-4 text-lg">Customer</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-muted-foreground uppercase font-bold">Name</label>
                                <div className="font-medium">{order.user?.name || "Guest User"}</div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase font-bold">Email</label>
                                <div className="font-medium">{order.user?.email}</div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase font-bold">Status</label>
                                <div className="mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
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
                </div>
            </div>
        </div>
    );
}
