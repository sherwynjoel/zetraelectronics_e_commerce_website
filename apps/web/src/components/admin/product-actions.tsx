"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { adminSend } from "@/lib/admin-api";
import { confirmAction } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";

export function ProductActions({ productId, name, onDeleted }: { productId: number; name: string; onDeleted?(): void }) {
  const { token } = useAuthStore();
  const router = useRouter();

  const remove = async () => {
    const ok = await confirmAction({
      title: `Delete “${name}”?`,
      body: "This removes the product from the store and also deletes it from past order records. To keep order history, set its stock to 0 instead.",
      confirmLabel: "Delete product",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await adminSend(token, `/products/${productId}`, "DELETE");
      toast.success("Product deleted", name);
      onDeleted?.();
      router.refresh();
    } catch (e) {
      toast.error("Product not deleted", e instanceof Error ? e.message : undefined);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/admin/products/${productId}/edit`}
        aria-label={`Edit ${name}`}
        className="grid size-9 place-items-center rounded-full text-ink-2 hover:bg-brand-soft hover:text-brand"
      >
        <Pencil className="size-4" aria-hidden />
      </Link>
      <button
        type="button"
        onClick={remove}
        aria-label={`Delete ${name}`}
        className="grid size-9 place-items-center rounded-full text-ink-2 hover:bg-danger-soft hover:text-danger"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}
