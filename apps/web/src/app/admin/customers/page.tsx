"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck, Users } from "lucide-react";
import { useAdminGet } from "@/lib/admin-api";
import { formatDate } from "@/lib/format";
import { AdminHeader } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TableShell, Td, Th, Tr } from "@/components/ui/table";

type Customer = { id: number; name: string | null; email: string; role: string; createdAt: string; _count?: { orders: number } };

export default function CustomersPage() {
  const { data, loading } = useAdminGet<Customer[]>("/auth/users");
  const [q, setQ] = useState("");
  const rows = useMemo(
    () => (data ?? []).filter((c) => `${c.name ?? ""} ${c.email}`.toLowerCase().includes(q.trim().toLowerCase())),
    [data, q],
  );

  return (
    <>
      <AdminHeader title="Customers" description={data ? `${data.length} registered accounts` : undefined} />
      <label className="glass glass-thin mb-4 flex h-11 max-w-md items-center gap-2 rounded-full px-4">
        <Search className="size-4 text-ink-3" aria-hidden />
        <span className="sr-only">Search customers</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none" />
      </label>

      {loading && !data ? (
        <Skeleton className="h-80 rounded-[var(--radius-tile)]" />
      ) : rows.length === 0 ? (
        <EmptyState icon={Users} title={q ? `No customers match “${q}”` : "No customers yet"} />
      ) : (
        <TableShell caption="Customers">
          <thead>
            <tr>
              <Th>Customer</Th>
              <Th>Role</Th>
              <Th className="text-right">Orders</Th>
              <Th>Joined</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <Tr key={c.id}>
                <Td label="Customer" className="max-md:col-span-2">
                  <span className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                      {(c.name || c.email).charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">{c.name || "No name"}</span>
                      <a href={`mailto:${c.email}`} className="block truncate text-sm text-ink-3 hover:text-brand">
                        {c.email}
                      </a>
                    </span>
                  </span>
                </Td>
                <Td label="Role">
                  {c.role === "ADMIN" ? (
                    <Badge tone="brand">
                      <ShieldCheck className="size-3.5" aria-hidden />
                      Admin
                    </Badge>
                  ) : (
                    <Badge>Customer</Badge>
                  )}
                </Td>
                <Td label="Orders" className="tabular text-right font-mono font-semibold text-ink max-md:text-left">
                  {c._count?.orders ?? 0}
                </Td>
                <Td label="Joined">{formatDate(c.createdAt)}</Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </>
  );
}
