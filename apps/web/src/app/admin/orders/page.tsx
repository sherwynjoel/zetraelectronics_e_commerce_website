"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileDown, Printer, ShoppingCart } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useAdminGet } from "@/lib/admin-api";
import { downloadInvoice } from "@/lib/invoice";
import { printAddressLabel } from "@/lib/print-label";
import { formatDate, formatINR } from "@/lib/format";
import { statusTone } from "@/lib/status";
import { AdminHeader } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { TableShell, Td, Th, Tr } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";

type Order = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  shippingAddress?: string;
  user?: { name?: string | null; email?: string };
  items: { quantity: number }[];
};
type View = "active" | "PAID" | "SHIPPED" | "DELIVERED" | "all";

const VIEWS: Record<View, (s: string) => boolean> = {
  active: (s) => ["PAID", "SHIPPED", "DELIVERED"].includes(s),
  PAID: (s) => s === "PAID",
  SHIPPED: (s) => s === "SHIPPED",
  DELIVERED: (s) => s === "DELIVERED",
  all: () => true,
};

export default function AdminOrdersPage() {
  const { token } = useAuthStore();
  const { data, loading } = useAdminGet<Order[]>("/orders");
  const [view, setView] = useState<View>("active");
  const rows = useMemo(() => (data ?? []).filter((o) => VIEWS[view](o.status)), [data, view]);

  const icon = "grid size-9 place-items-center rounded-full text-ink-2 hover:bg-brand-soft hover:text-brand";

  return (
    <>
      <AdminHeader title="Orders" description="Paid orders to fulfil, newest first." />
      <div className="-mx-3 mb-5 overflow-x-auto px-3 pb-1">
        <Segmented<View>
          ariaLabel="Order view"
          value={view}
          onChange={setView}
          options={[
            { value: "active", label: "Paid & later" },
            { value: "PAID", label: "To ship" },
            { value: "SHIPPED", label: "Shipped" },
            { value: "DELIVERED", label: "Delivered" },
            { value: "all", label: "All" },
          ]}
          className="min-w-[34rem] max-w-2xl"
        />
      </div>

      {loading && !data ? (
        <Skeleton className="h-96 rounded-[var(--radius-tile)]" />
      ) : rows.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders in this view" body="Orders appear here once customers pay." />
      ) : (
        <TableShell caption="Orders">
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Date</Th>
              <Th className="text-right">Total</Th>
              <Th>Status</Th>
              <Th className="w-28">
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <Tr key={o.id}>
                <Td label="Order">
                  <Link href={`/admin/orders/${o.id}`} className="tabular font-mono font-semibold text-ink hover:text-brand">
                    #ORD-{o.id}
                  </Link>
                  <span className="block text-xs text-ink-3">
                    {o.items?.reduce((a, i) => a + i.quantity, 0) ?? 0} items
                  </span>
                </Td>
                <Td label="Customer">
                  <span className="block font-semibold text-ink">{o.user?.name || "Customer"}</span>
                  <span className="block truncate text-xs text-ink-3">{o.user?.email}</span>
                </Td>
                <Td label="Date">{formatDate(o.createdAt)}</Td>
                <Td label="Total" className="tabular text-right font-semibold text-ink max-md:text-left">
                  {formatINR(Number(o.total))}
                </Td>
                <Td label="Status">
                  <Badge tone={statusTone(o.status)}>{o.status.charAt(0) + o.status.slice(1).toLowerCase()}</Badge>
                </Td>
                <Td className="max-md:col-span-2 max-md:justify-self-end">
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      className={icon}
                      aria-label={`Print address label for order ${o.id}`}
                      onClick={() => {
                        if (!printAddressLabel(o)) toast.error("Pop-up blocked", "Allow pop-ups for this site to print labels.");
                      }}
                    >
                      <Printer className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className={icon}
                      aria-label={`Download invoice for order ${o.id}`}
                      onClick={() => token && downloadInvoice(o.id, token).catch(() => toast.error("Invoice download failed"))}
                    >
                      <FileDown className="size-4" aria-hidden />
                    </button>
                  </span>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </>
  );
}
