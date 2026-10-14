"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, RotateCw } from "lucide-react";
import { useAdminGet } from "@/lib/admin-api";
import { formatDate, formatINR } from "@/lib/format";
import { statusTone } from "@/lib/status";
import { AdminHeader } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TableShell, Td, Th, Tr } from "@/components/ui/table";

const SalesChart = dynamic(() => import("@/components/admin/sales-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[22rem] rounded-[var(--radius-pane)]" />,
});

type Stats = {
  revenue: number;
  orders: number;
  products: number;
  users: number;
  recentOrders: { id: number; total: number; status: string; createdAt: string; user?: { name?: string | null; email?: string } }[];
};

export default function AdminDashboard() {
  const { data, loading, error, reload } = useAdminGet<Stats>("/analytics/stats");

  const tiles = data
    ? [
        { label: "Revenue, all time", value: formatINR(Number(data.revenue) || 0), href: "/admin/orders" },
        { label: "Orders", value: String(data.orders ?? 0), href: "/admin/orders" },
        { label: "Products listed", value: String(data.products ?? 0), href: "/admin/products" },
        { label: "Customers", value: String(data.users ?? 0), href: "/admin/customers" },
      ]
    : [];

  return (
    <>
      <AdminHeader title="Dashboard" description="How the store is doing today." />

      {error ? (
        <EmptyState
          title="The dashboard couldn’t load"
          body={error}
          action={
            <Button variant="glass" onClick={reload}>
              <RotateCw className="size-4" aria-hidden />
              Try again
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6">
          <ul className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {loading || !data
              ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-[var(--radius-tile)]" />)
              : tiles.map((t) => (
                  <li key={t.label}>
                    <Link href={t.href} className="glass glass-regular glass-lift flex h-full flex-col justify-between gap-4 rounded-[var(--radius-tile)] p-5">
                      <span className="text-sm font-semibold text-ink-3">{t.label}</span>
                      <span className="tabular truncate text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{t.value}</span>
                    </Link>
                  </li>
                ))}
          </ul>

          <SalesChart />

          <section aria-labelledby="recent-title" className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 id="recent-title" className="text-lg font-bold text-ink">
                Recent orders
              </h2>
              <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                All orders
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            {loading || !data ? (
              <Skeleton className="h-48 rounded-[var(--radius-tile)]" />
            ) : data.recentOrders?.length ? (
              <TableShell caption="Recent orders">
                <thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Customer</Th>
                    <Th>Date</Th>
                    <Th className="text-right">Total</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((o) => (
                    <Tr key={o.id}>
                      <Td label="Order">
                        <Link href={`/admin/orders/${o.id}`} className="tabular font-mono font-semibold text-ink hover:text-brand">
                          #ORD-{o.id}
                        </Link>
                      </Td>
                      <Td label="Customer">
                        <span className="block font-semibold text-ink">{o.user?.name || "Customer"}</span>
                        <span className="block text-xs text-ink-3">{o.user?.email}</span>
                      </Td>
                      <Td label="Date">{formatDate(o.createdAt)}</Td>
                      <Td label="Total" className="tabular text-right font-semibold text-ink max-md:text-left">
                        {formatINR(Number(o.total))}
                      </Td>
                      <Td label="Status">
                        <Badge tone={statusTone(o.status)}>{o.status.charAt(0) + o.status.slice(1).toLowerCase()}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </TableShell>
            ) : (
              <EmptyState title="No orders yet" body="New orders will show up here as they come in." />
            )}
          </section>
        </div>
      )}
    </>
  );
}
