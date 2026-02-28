"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Truck, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

export function FulfillOrder({ orderId, currentStatus, currentTracking }: { orderId: number, currentStatus: string, currentTracking?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [trackingUrl, setTrackingUrl] = useState(currentTracking || "");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { token } = useAuthStore();

    const handleFulfill = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/orders/${orderId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: "SHIPPED",
                    trackingUrl: trackingUrl
                })
            });

            if (res.ok) {
                setIsOpen(false);
                router.refresh();
            } else {
                alert("Failed to update order");
            }
        } catch (e) {
            console.error(e);
            alert("Error updating order");
        } finally {
            setIsLoading(false);
        }
    };

    if (currentStatus === "SHIPPED" || currentStatus === "DELIVERED") {
        if (currentTracking) {
            return (
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2" disabled>
                        <Check className="h-4 w-4 text-green-500" /> Shipped
                    </Button>
                    <a href={currentTracking} target="_blank" rel="noopener noreferrer">
                        <Button variant="link" size="sm">Track Package</Button>
                    </a>
                </div>
            )
        }
        return (
            <Button variant="outline" className="gap-2" disabled>
                <Check className="h-4 w-4 text-green-500" /> Shipped
            </Button>
        )
    }

    if (isOpen) {
        return (
            <div className="flex items-center gap-2 absolute right-0 bg-background border p-2 rounded-lg shadow-lg z-10 animate-in fade-in zoom-in-95 origin-top-right">
                <input
                    type="text"
                    placeholder="Tracking URL..."
                    className="flex h-9 w-64 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                />
                <Button size="sm" onClick={handleFulfill} disabled={isLoading}>
                    {isLoading ? "..." : "Confirm"}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="relative">
            <Button variant="outline" className="gap-2" onClick={() => setIsOpen(true)}>
                <Truck className="h-4 w-4" /> Mark Shipped
            </Button>
        </div>
    );
}
