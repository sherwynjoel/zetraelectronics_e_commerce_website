"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, FileDown, Package, RotateCw, XCircle } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { downloadInvoice } from "@/lib/invoice";
import { formatDate, formatINR } from "@/lib/format";
import { statusTone } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import { confirmAction } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export type MyOrder = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  trackingUrl?: string | null;
  items: { id: number; quantity: number; price: number; product?: { id: number; name: string; image?: string | null } | null }[];
};

const STEPS = ["PENDING", "PAID", "SHIPPED", "DELIVERED"] as const;
const STEP_LABEL: Record<string, string> = { PENDING: "Placed", PAID: "Paid", SHIPPED: "Shipped", DELIVERED: "Delivered" };
const STATUS_LABEL: Record<string, string> = { PENDING: "Awaiting payment", PAID: "Paid", SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled" };

export function useMyOrders() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const fetchOrders = useCallback(() => {
    if (!user || !token) return;
    fetch(`${API_URL}/orders/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          logout();
          router.push("/login?next=/track-order");
          return;
        }
        if (!res.ok) throw new Error();
        setOrders(await res.json());
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [user, token, logout, router]);

  useEffect(fetchOrders, [fetchOrders]);
  const reload = () => {
    setState("loading");
    fetchOrders();
  };
  return { orders, setOrders, state, reload };
}

function Timeline({ status }: { status: string }) {
  const at = STEPS.indexOf(status as (typeof STEPS)[number]);
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label={`Order status: ${STATUS_LABEL[status] ?? status}`}>
      {STEPS.map((s, i) => {
        const done = i <= at;
        return (
          <li key={s} className="grid gap-2">
            <span className={cn("h-1.5 rounded-full transition-colors", done ? "bg-brand" : "bg-line")} aria-hidden />
            <span className={cn("flex items-center gap-1 text-xs font-semibold", done ? "text-ink" : "text-ink-3")}>
              {done && <Check className="size-3.5 text-brand" aria-hidden />}
              {STEP_LABEL[s]}
              {i === at && <span className="sr-only"> (current)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderList() {
  const { token } = useAuthStore();
  const { orders, setOrders, state, reload } = useMyOrders();
  const [busy, setBusy] = useState<number | null>(null);

  const cancel = async (id: number) => {
    const ok = await confirmAction({
      title: `Cancel order #ORD-${id}?`,
      body: "The parts go back into stock and you won’t be charged.",
      confirmLabel: "Cancel order",
      cancelLabel: "Keep order",
      tone: "danger",
    });
    if (!ok || !token) return;
    setBusy(id);
    try {
      const res = await fetch(`${API_URL}/orders/${id}/cancel`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not cancel this order");
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "CANCELLED" } : o)));
      toast.success("Order cancelled", `#ORD-${id}`);
    } catch (e) {
      toast.error("Order not cancelled", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  const invoice = async (id: number) => {
    if (!token) return;
    try {
      await downloadInvoice(id, token);
    } catch {
      toast.error("Invoice download failed", "Please try again in a moment.");
    }
  };

  if (state === "loading")
    return (
      <div className="grid gap-3">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-44 rounded-[var(--radius-tile)]" />
        ))}
      </div>
    );

  if (state === "error")
    return (
      <EmptyState
        icon={XCircle}
        title="We couldn’t load your orders"
        body="Check your connection and try again."
        action={
          <Button variant="glass" onClick={reload}>
            <RotateCw className="size-4" aria-hidden />
            Try again
          </Button>
        }
      />
    );

  if (!orders.length)
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        body="When you place an order, its status, tracking and invoice will appear here."
        action={<ButtonLink href="/products">Browse parts</ButtonLink>}
      />
    );

  return (
    <ul className="grid gap-4">
      {orders.map((o) => (
        <li key={o.id} className="glass glass-regular grid gap-5 rounded-[var(--radius-tile)] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="tabular font-mono text-sm font-semibold text-ink">#ORD-{o.id}</p>
              <p className="mt-0.5 text-sm text-ink-3">{formatDate(o.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={statusTone(o.status)}>{STATUS_LABEL[o.status] ?? o.status}</Badge>
              <span className="tabular text-lg font-bold text-ink">{formatINR(Number(o.total))}</span>
            </div>
          </div>

          {o.status === "CANCELLED" ? (
            <p className="text-sm text-ink-3">This order was cancelled.</p>
          ) : (
            <Timeline status={o.status} />
          )}

          <ul className="flex flex-wrap gap-2" aria-label="Parts in this order">
            {o.items.map((it) => (
              <li key={it.id} className="glass glass-thin flex max-w-full items-center gap-2 rounded-full py-1 pl-1 pr-3">
                <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-[var(--plate)]">
                  <ProductImage src={it.product?.image} alt="" sizes="32px" className="p-0.5" />
                </span>
                <span className="truncate text-xs font-semibold text-ink">{it.product?.name ?? "Part"}</span>
                <span className="tabular text-xs text-ink-3">×{it.quantity}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2 border-t border-line pt-4">
            {o.trackingUrl && (
              <ButtonLink href={o.trackingUrl} target="_blank" rel="noopener noreferrer" size="sm">
                <ExternalLink className="size-4" aria-hidden />
                Track shipment
              </ButtonLink>
            )}
            {o.status !== "CANCELLED" && (
              <Button variant="glass" size="sm" onClick={() => invoice(o.id)}>
                <FileDown className="size-4" aria-hidden />
                Invoice
              </Button>
            )}
            {o.status === "PENDING" && (
              <Button variant="ghost" size="sm" onClick={() => cancel(o.id)} loading={busy === o.id} className="text-danger hover:bg-danger-soft hover:text-danger">
                Cancel order
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
