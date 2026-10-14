"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Mail, Phone, ShieldCheck, ShoppingCart, Users } from "lucide-react";
import { useAdminGet } from "@/lib/admin-api";
import { filterCustomers, paymentState, type CustomerFilters, type CustomerLike } from "@/lib/admin-filters";
import { parseAddress } from "@/lib/print-label";
import { formatDate, formatINR } from "@/lib/format";
import { statusTone } from "@/lib/status";
import { AdminHeader } from "@/components/admin/admin-shell";
import { FilterBar, SearchField } from "@/components/admin/filter-bar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField, TextField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { TableShell, Td, Th, Tr } from "@/components/ui/table";

type ApiUser = { id: number; name: string | null; email: string; role: string; createdAt: string; _count?: { orders: number } };
type ApiOrder = { id: number; status: string; total: number; createdAt: string; shippingAddress?: string; user?: { id?: number; email?: string } };
type Customer = CustomerLike & { spent: number; recent: ApiOrder[] };

const EMPTY: CustomerFilters = { q: "", role: "all", activity: "all", from: "", to: "" };
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function CustomersPage() {
  const users = useAdminGet<ApiUser[]>("/auth/users");
  const orders = useAdminGet<ApiOrder[]>("/orders?limit=1000");
  const [f, setF] = useState<CustomerFilters>(EMPTY);
  const [openId, setOpenId] = useState<number | null>(null);
  const set = <K extends keyof CustomerFilters>(k: K, v: string) => setF((p) => ({ ...p, [k]: v }));

  // Phones live only on order addresses; spend counts paid orders.
  const customers = useMemo<Customer[]>(() => {
    const byUser = new Map<string, ApiOrder[]>();
    for (const o of orders.data ?? []) {
      const key = o.user?.email ?? "";
      byUser.set(key, [...(byUser.get(key) ?? []), o]);
    }
    return (users.data ?? []).map((u) => {
      const mine = (byUser.get(u.email) ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const phones = [...new Set(mine.map((o) => parseAddress(o.shippingAddress).phone).filter(Boolean) as string[])];
      const spent = mine.filter((o) => paymentState(o.status) === "paid").reduce((a, o) => a + Number(o.total), 0);
      return { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt, orders: u._count?.orders ?? mine.length, phones, spent, recent: mine.slice(0, 5) };
    });
  }, [users.data, orders.data]);

  const rows = useMemo(() => filterCustomers(customers, f), [customers, f]);
  const active = JSON.stringify(f) !== JSON.stringify(EMPTY);
  const open = customers.find((c) => c.id === openId) ?? null;

  return (
    <>
      <AdminHeader title="Customers" description={users.data ? `${users.data.length} registered accounts` : undefined} />

      <FilterBar
        active={active}
        onReset={() => setF(EMPTY)}
        summary={users.data ? `${rows.length} of ${customers.length} customers` : null}
        search={<SearchField label="Search customers" value={f.q} onChange={(v) => set("q", v)} placeholder="Name, email or phone" />}
      >
        <SelectField label="Account type" value={f.role} onChange={(e) => set("role", e.target.value)}>
          <option value="all">All accounts</option>
          <option value="CUSTOMER">Customers</option>
          <option value="ADMIN">Admins</option>
        </SelectField>
        <SelectField label="Order activity" value={f.activity} onChange={(e) => set("activity", e.target.value)}>
          <option value="all">Any activity</option>
          <option value="with-orders">Has ordered</option>
          <option value="no-orders">No orders yet</option>
        </SelectField>
        <TextField label="Joined from" type="date" value={f.from} max={f.to || undefined} onChange={(e) => set("from", e.target.value)} />
        <TextField label="Joined to" type="date" value={f.to} min={f.from || undefined} onChange={(e) => set("to", e.target.value)} />
      </FilterBar>

      {users.loading && !users.data ? (
        <Skeleton className="h-80 rounded-[var(--radius-tile)]" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title={active ? "No customers match" : "No customers yet"}
          body={active ? "Try a different search or filter, or clear the filters." : undefined}
        />
      ) : (
        <TableShell caption="Customers">
          <thead>
            <tr>
              <Th>Customer</Th>
              <Th>Type</Th>
              <Th className="text-right">Orders</Th>
              <Th>Joined</Th>
              <Th className="w-36">
                <span className="sr-only">Details</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <Tr key={c.id}>
                <Td label="Customer" className="min-w-0 max-md:col-span-2">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                      {(c.name || c.email).charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block break-words font-semibold text-ink">{c.name || "No name"}</span>
                      <span className="block break-all text-sm text-ink-3">{c.email}</span>
                    </span>
                  </span>
                </Td>
                <Td label="Type">
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
                  {c.orders}
                </Td>
                <Td label="Joined">{formatDate(c.createdAt)}</Td>
                <Td className="max-md:col-span-2">
                  <Button variant="glass" size="sm" className="w-full rounded-full md:w-auto" onClick={() => setOpenId(c.id)} aria-label={`View details for ${c.name || c.email}`}>
                    <Eye className="size-4" aria-hidden />
                    View details
                  </Button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <Modal
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.name || open?.email || "Customer"}
        description={open ? `${open.role === "ADMIN" ? "Admin" : "Customer"} · joined ${formatDate(open.createdAt)}` : undefined}
        footer={
          open && (
            <>
              <Button variant="ghost" onClick={() => setOpenId(null)}>
                Close
              </Button>
              <ButtonLink href={`mailto:${open.email}`} variant="glass">
                <Mail className="size-4" aria-hidden />
                Email
              </ButtonLink>
              {open.orders > 0 && (
                <ButtonLink href={`/admin/orders?q=${encodeURIComponent(open.email)}`}>
                  <ShoppingCart className="size-4" aria-hidden />
                  View all orders
                </ButtonLink>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="grid gap-6">
            <dl className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
              {[
                ["Orders", String(open.orders)],
                ["Paid spend", formatINR(open.spent)],
                ["Last order", open.recent[0] ? formatDate(open.recent[0].createdAt) : "None yet"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[var(--radius-control)] bg-brand-soft px-4 py-3">
                  <dt className="text-xs font-semibold text-ink-3">{k}</dt>
                  <dd className="tabular mt-1 text-lg font-bold text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            <section aria-labelledby="contact-h" className="grid gap-2">
              <h3 id="contact-h" className="text-sm font-bold text-ink">
                Contact
              </h3>
              <a href={`mailto:${open.email}`} className="flex items-center gap-2.5 break-all text-sm text-ink-2 hover:text-brand">
                <Mail className="size-4 shrink-0 text-brand" aria-hidden />
                {open.email}
              </a>
              {open.phones.length ? (
                open.phones.map((p) => (
                  <a key={p} href={`tel:${p}`} className="flex items-center gap-2.5 text-sm text-ink-2 hover:text-brand">
                    <Phone className="size-4 shrink-0 text-brand" aria-hidden />
                    <span className="tabular">{p}</span>
                  </a>
                ))
              ) : (
                <p className="flex items-center gap-2.5 text-sm text-ink-3">
                  <Phone className="size-4 shrink-0" aria-hidden />
                  No phone yet. It appears once they place an order.
                </p>
              )}
            </section>

            <section aria-labelledby="recent-h" className="grid gap-2">
              <h3 id="recent-h" className="text-sm font-bold text-ink">
                Recent orders
              </h3>
              {open.recent.length ? (
                <ul className="grid divide-y divide-line rounded-[var(--radius-control)] border border-line">
                  {open.recent.map((o) => (
                    <li key={o.id}>
                      <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 hover:bg-brand-soft">
                        <span className="tabular font-mono text-sm font-semibold text-ink">#ORD-{o.id}</span>
                        <span className="text-sm text-ink-3">{formatDate(o.createdAt)}</span>
                        <Badge tone={statusTone(o.status)}>{label(o.status)}</Badge>
                        <span className="tabular text-sm font-semibold text-ink">{formatINR(Number(o.total))}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-3">No orders yet.</p>
              )}
            </section>
          </div>
        )}
      </Modal>
    </>
  );
}
