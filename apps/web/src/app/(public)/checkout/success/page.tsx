"use client";

import { API_URL } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, FileText } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    return (
        <div className="text-center space-y-6 max-w-md w-full">
            <div className="flex justify-center">
                <CheckCircle className="h-24 w-24 text-green-500" />
            </div>

            <h1 className="text-4xl font-bold text-foreground">Order Confirmed!</h1>

            <p className="text-lg text-muted-foreground">
                Thank you for your purchase. We have received your order and are getting it ready for shipment.
            </p>

            <div className="bg-card p-6 rounded-xl border space-y-2">
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Order ID</div>
                <div className="text-3xl font-mono font-bold">#{orderId?.toString().padStart(6, '0')}</div>
            </div>

            <div className="flex flex-col gap-3">
                <Link href="/">
                    <Button size="lg" className="w-full">Continue Shopping</Button>
                </Link>
                <Link href="/profile">
                    <Button variant="outline" className="w-full gap-2">
                        <Package className="h-4 w-4" /> View Order History
                    </Button>
                </Link>
                {orderId && (
                    <a href={`${API_URL}/orders/${orderId}/invoice`} target="_blank" rel="noopener noreferrer" className="w-full block">
                        <Button variant="secondary" className="w-full gap-2 bg-slate-100 dark:bg-slate-800 border">
                            <FileText className="h-4 w-4" /> View Invoice
                        </Button>
                    </a>
                )}
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/10 p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
