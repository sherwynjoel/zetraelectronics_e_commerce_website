"use client";

import { API_URL } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/lib/auth-store";

interface ProductActionsProps {
    productId: number;
}

export function ProductActions({ productId }: ProductActionsProps) {
    const router = useRouter();
    const { token } = useAuthStore();
    const [isConfirming, setIsConfirming] = useState(false);

    const handleDelete = async () => {
        setIsConfirming(false);
        try {
            const res = await fetch(`${API_URL}/products/${productId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                alert(`Failed to delete: ${errorData.message || res.statusText || 'Product might be restricted or in an active order.'}`);
                return;
            }

            alert("Product successfully deleted!");
            router.refresh();
        } catch (e) {
            alert("Failed to connect to the server to delete.");
            console.error(e);
        }
    };

    return (
        <div className="flex justify-end gap-2 relative">
            <Link href={`/admin/products/${productId}/edit`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600">
                    <Edit className="h-4 w-4" />
                </Button>
            </Link>

            {isConfirming ? (
                <div className="absolute right-0 top-0 mt-8 z-10 w-48 p-2 bg-white dark:bg-slate-800 border rounded-md shadow-lg flex flex-col gap-2">
                    <p className="text-xs text-center font-medium">Delete Product?</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="w-full text-xs h-7" onClick={() => setIsConfirming(false)}>No</Button>
                        <Button variant="destructive" size="sm" className="w-full text-xs h-7" onClick={handleDelete}>Yes</Button>
                    </div>
                </div>
            ) : null}

            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => setIsConfirming(true)}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}
