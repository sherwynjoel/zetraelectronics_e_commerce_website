"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileDown, MapPin, Printer } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useAdminGet } from "@/lib/admin-api";
import { downloadInvoice } from "@/lib/invoice";
import { parseAddress, printAddressLabel } from "@/lib/print-label";
import { formatDate, formatINR } from "@/lib/format";
import { statusTone } from "@/lib/status";
import { AdminHeader } from "@/components/admin/admin-shell";
import { FulfillOrder } from "@/components/admin/fulfill-order";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

type Order = {
  id: number;
  status: string;
  total: number;
  shippingCost?: number;
  createdAt: string;
  trackingUrl?: string | null;
  razorpayPaymentId?: string | null;
  shippingAddress?: string;
  user?: { name?: string | null; email?: string };
  items: { id: number; productId: number; quantity: number; price: number; product?: { name: string; image?: string | null } | null }[];
};

export default function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token } = useAuthStore();
  const { data: order, loading, error, reload } = useAdminGet<Order>(`/orders/${id}`);

  if (loading && !order) return <Skeleton className="h-[32rem] rounded-[var(--radius-pane)]" />;
  if (error || !order)
    return <EmptyState title="Order not found" body={error ?? undefined} action={<ButtonLink href="/admin/orders">Back to orders</ButtonLink>} />;

  const addr = parseAddress(order.shippingAddress);
  const itemsTotal = order.items.reduce((a, i) => a + Number(i.price) * i.quantity, 0);

  return (
    <>
      <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-brand">
        <ArrowLeft className="size-4" aria-hidden />
        All orders
      </Link>
      <AdminHeader
        title={`Order #ORD-${order.id}`}
        description={`Placed ${formatDate(order.createdAt)}`}
        action={
          <>
            <Button variant="glass" size="sm" onClick={() => !printAddressLabel(order) && toast.error("Pop-up blocked", "Allow pop-ups to print labels.")}>
              <Printer className="size-4" aria-hidden />
              Label
            </Button>
            <Button variant="glass" size="sm" onClick={() => token && downloadInvoice(order.id, token).catch(() => toast.error("Invoice download failed"))}>
              <FileDown className="size-4" aria-hidden />
              Invoice
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="grid gap-6">
          <section aria-labelledby="items-title" className="glass glass-regular rounded-[var(--radius-pane)] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 id="items-title" className="text-lg font-bold text-ink">
                Items
              </h2>
              <Badge tone={statusTone(order.status)}>{order.status.charAt(0) + order.status.slice(1).toLowerCase()}</Badge>
            </div>
            <ul className="mt-4 grid divide-y divide-line">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[var(--plate)]">
                    <ProductImage src={i.product?.image} alt="" sizes="56px" className="p-1.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{i.product?.name ?? `Product #${i.productId}`}</span>
                    <span className="tabular text-sm text-ink-3">
                      {i.quantity} × {formatINR(Number(i.price))}
                    </span>
                  </span>
                  <span className="tabular font-semibold text-ink">{formatINR(Number(i.price) * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 grid gap-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-2">Items</dt>
                <dd className="tabular text-ink">{formatINR(itemsTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-2">Shipping, tax and adjustments</dt>
                <dd className="tabular text-ink">{formatINR(Number(order.total) - itemsTotal)}</dd>
              </div>
              <div className="flex justify-between text-base font-bold">
                <dt className="text-ink">Total charged</dt>
                <dd className="tabular text-ink">{formatINR(Number(order.total))}</dd>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex justify-between">
                  <dt className="text-ink-3">Razorpay payment</dt>
                  <dd className="font-mono text-xs text-ink-2">{order.razorpayPaymentId}</dd>
                </div>
              )}
            </dl>
          </section>

          <section aria-labelledby="ship-title" className="glass glass-regular rounded-[var(--radius-pane)] p-5 sm:p-6">
            <h2 id="ship-title" className="flex items-center gap-2 text-lg font-bold text-ink">
              <MapPin className="size-5 text-brand" aria-hidden />
              Ship to
            </h2>
            {addr.street || addr.city ? (
              <address className="mt-3 not-italic leading-relaxed text-ink-2">
                <span className="block font-semibold text-ink">{addr.name || order.user?.name}</span>
                {addr.phone && <span className="tabular block">{addr.phone}</span>}
                {addr.street}
                <br />
                {[addr.city, addr.state].filter(Boolean).join(", ")} <span className="tabular font-semibold text-ink">{addr.zip}</span>
              </address>
            ) : (
              <p className="mt-3 text-sm text-ink-3">No address on this order.</p>
            )}
            <p className="mt-4 border-t border-line pt-4 text-sm text-ink-2">
              Customer: <span className="font-semibold text-ink">{order.user?.name || "—"}</span>
              {order.user?.email && (
                <a href={`mailto:${order.user.email}`} className="ml-2 text-brand hover:underline">
                  {order.user.email}
                </a>
              )}
            </p>
            {order.trackingUrl && (
              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
                <ExternalLink className="size-4" aria-hidden />
                Open tracking page
              </a>
            )}
          </section>
        </div>

        <div className="lg:sticky lg:top-8">
          <FulfillOrder key={`${order.status}-${order.trackingUrl}`} orderId={order.id} currentStatus={order.status} currentTracking={order.trackingUrl} onSaved={reload} />
        </div>
      </div>
    </>
  );
}
