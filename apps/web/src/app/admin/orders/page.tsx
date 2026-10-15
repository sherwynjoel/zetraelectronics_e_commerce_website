"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileDown, Printer, ShoppingCart } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useAdminGet } from "@/lib/admin-api";
import { filterOrders, paymentState, type OrderFilters } from "@/lib/admin-filters";
import { downloadInvoice } from "@/lib/invoice";
import { printAddressLabel } from "@/lib/print-label";
import { formatDate, formatINR } from "@/lib/format";
import { statusTone } from "@/lib/status";
import { AdminHeader } from "@/components/admin/admin-shell";
import { FilterBar, SearchField } from "@/components/admin/filter-bar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField, TextField } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { TableShell, Td, Th, Tr } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";

type Order = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  paymentMethod?: string | null;
  shippingAddress?: string;
  user?: { name?: string | null; email?: string };
  items: { quantity: number }[];
};

const EMPTY: Required<OrderFilters> = { q: "", status: "all", payment: "all", from: "", to: "", method: "all" };
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const PAYMENT_LABEL = { paid: "Paid", unpaid: "Awaiting payment", cancelled: "Cancelled" } as const;

function Orders() {
  const { token } = useAuthStore();
  const initialQ = useSearchParams().get("q") ?? "";
  const { data, loading } = useAdminGet<Order[]>("/orders?limit=1000");
  const [f, setF] = useState<Required<OrderFilters>>({ ...EMPTY, q: initialQ });
  const set = <K extends keyof OrderFilters>(k: K, v: string) => setF((p) => ({ ...p, [k]: v }));

  const methods = useMemo(() => [...new Set((data ?? []).map((o) => o.paymentMethod).filter(Boolean) as string[])], [data]);
  const rows = useMemo(() => filterOrders(data ?? [], f), [data, f]);
  const active = JSON.stringify(f) !== JSON.stringify(EMPTY);
  const icon = "grid size-9 place-items-center rounded-full text-ink-2 hover:bg-brand-soft hover:text-brand";

  return (
    <>
      <AdminHeader title="Orders" description="Every order, newest first." />

      <FilterBar
        active={active}
        onReset={() => setF(EMPTY)}
        summary={data ? `${rows.length} of ${data.length} orders` : null}
        search={
          <SearchField
            label="Search orders"
            value={f.q}
            onChange={(v) => set("q", v)}
            placeholder="ID, name, email or phone"
          />
        }
      >
        <SelectField label="Order status" value={f.status} onChange={(e) => set("status", e.target.value)}>
          <option value="all">All statuses</option>
          <option value="open">Not shipped yet</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </SelectField>
        <SelectField label="Payment" value={f.payment} onChange={(e) => set("payment", e.target.value)}>
          <option value="all">All payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Awaiting payment</option>
        </SelectField>
        <TextField label="From date" type="date" value={f.from} max={f.to || undefined} onChange={(e) => set("from", e.target.value)} />
        <TextField label="To date" type="date" value={f.to} min={f.from || undefined} onChange={(e) => set("to", e.target.value)} />
        {methods.length > 1 && (
          <SelectField label="Payment method" value={f.method} onChange={(e) => set("method", e.target.value)}>
            <option value="all">All methods</option>
            {methods.map((m) => (
              <option key={m} value={m}>
                {label(m)}
              </option>
            ))}
          </SelectField>
        )}
      </FilterBar>

      {loading && !data ? (
        <Skeleton className="h-96 rounded-[var(--radius-tile)]" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={active ? "No orders match" : "No orders yet"}
          body={active ? "Try a different search or widen the dates, or clear the filters." : "Orders appear here as customers check out."}
        />
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
                  <span className="block text-xs text-ink-3">{o.items?.reduce((a, i) => a + i.quantity, 0) ?? 0} items</span>
                </Td>
                <Td label="Customer" className="min-w-0">
                  <span className="block break-words font-semibold text-ink">{o.user?.name || "Customer"}</span>
                  <span className="block break-all text-xs text-ink-3">{o.user?.email}</span>
                </Td>
                <Td label="Date">{formatDate(o.createdAt)}</Td>
                <Td label="Total" className="tabular text-right font-semibold text-ink max-md:text-left">
                  {formatINR(Number(o.total))}
                  <span className="block text-xs font-normal text-ink-3">{PAYMENT_LABEL[paymentState(o.status)]}</span>
                </Td>
                <Td label="Status">
                  <Badge tone={statusTone(o.status)}>{label(o.status)}</Badge>
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

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-[var(--radius-tile)]" />}>
      <Orders />
    </Suspense>
  );
}
