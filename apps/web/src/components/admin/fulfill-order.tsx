"use client";

import { API_URL } from '@/lib/api';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Truck, X, ExternalLink, Check, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

const STATUS_OPTIONS = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

export function FulfillOrder({
    orderId,
    currentStatus,
    currentTracking,
}: {
    orderId: number;
    currentStatus: string;
    currentTracking?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [trackingUrl, setTrackingUrl] = useState(currentTracking || "");
    const [status, setStatus] = useState(currentStatus);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const { token } = useAuthStore();

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status, trackingUrl }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setSuccess(false);
                    router.refresh();
                }, 800);
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

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setIsOpen(true)}
            >
                <Edit2 className="h-3.5 w-3.5" /> Manage
            </Button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold">Manage Order #{orderId.toString().padStart(5, "0")}</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">Update status and tracking information</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-muted transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Status selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Order Status</label>
                            <div className="grid grid-cols-2 gap-2">
                                {STATUS_OPTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatus(s)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                                            status === s
                                                ? s === "DELIVERED" ? "bg-green-500 text-white border-green-500"
                                                : s === "SHIPPED" ? "bg-blue-500 text-white border-blue-500"
                                                : s === "CANCELLED" ? "bg-red-500 text-white border-red-500"
                                                : "bg-yellow-500 text-white border-yellow-500"
                                                : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tracking URL */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wide flex items-center gap-1">
                                <Truck className="h-3.5 w-3.5" /> Tracking URL
                            </label>
                            <input
                                type="url"
                                placeholder="https://track.delhivery.com/..."
                                className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                value={trackingUrl}
                                onChange={(e) => setTrackingUrl(e.target.value)}
                            />
                            {trackingUrl && (
                                <a
                                    href={trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
                                >
                                    <ExternalLink className="h-3 w-3" /> Preview link
                                </a>
                            )}
                            <p className="text-[11px] text-muted-foreground">
                                This URL will be shown to the customer on their Order History page.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                            <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 gap-2"
                                onClick={handleSave}
                                disabled={isLoading || success}
                            >
                                {success ? (
                                    <><Check className="h-4 w-4" /> Saved!</>
                                ) : isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
