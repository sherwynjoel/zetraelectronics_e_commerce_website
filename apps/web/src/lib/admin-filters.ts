import { parseAddress } from "@/lib/print-label";

/** Calendar day in India (YYYY-MM-DD), so admin date filters match what the store sees. */
const istDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });

export function inDateRange(iso: string, from: string, to: string) {
  const d = istDay.format(new Date(iso));
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

export type PaymentState = "paid" | "unpaid" | "cancelled";

/** Payment state derived from order status: only PENDING orders are unpaid. */
export function paymentState(status: string): PaymentState {
  const s = status?.toUpperCase();
  if (s === "CANCELLED") return "cancelled";
  if (s === "PENDING") return "unpaid";
  return "paid";
}

const norm = (s: unknown) => String(s ?? "").toLowerCase();
const digits = (s: unknown) => String(s ?? "").replace(/\D/g, "");

export type AdminOrderLike = {
  id: number;
  status: string;
  createdAt: string;
  paymentMethod?: string | null;
  shippingAddress?: unknown;
  user?: { name?: string | null; email?: string } | null;
};

export type OrderFilters = { q: string; status: string; payment: string; from: string; to: string; method?: string };

export function filterOrders<T extends AdminOrderLike>(orders: T[], f: OrderFilters): T[] {
  const q = f.q.trim().toLowerCase().replace(/^#?ord-?/, "");
  const qDigits = digits(q);
  return orders.filter((o) => {
    if (f.status !== "all" && o.status !== f.status) return false;
    if (f.payment !== "all" && paymentState(o.status) !== f.payment) return false;
    if (f.method && f.method !== "all" && norm(o.paymentMethod) !== norm(f.method)) return false;
    if (!inDateRange(o.createdAt, f.from, f.to)) return false;
    if (!q) return true;
    const addr = parseAddress(o.shippingAddress);
    if (String(o.id) === q) return true;
    if (norm(o.user?.name).includes(q) || norm(o.user?.email).includes(q) || norm(addr.name).includes(q)) return true;
    return qDigits.length >= 4 && digits(addr.phone).includes(qDigits);
  });
}

export type CustomerLike = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  orders: number;
  phones: string[];
};

export type CustomerFilters = { q: string; role: string; activity: string; from: string; to: string };

export function filterCustomers<T extends CustomerLike>(list: T[], f: CustomerFilters): T[] {
  const q = f.q.trim().toLowerCase();
  const qDigits = digits(q);
  return list.filter((c) => {
    if (f.role !== "all" && c.role !== f.role) return false;
    if (f.activity === "with-orders" && c.orders === 0) return false;
    if (f.activity === "no-orders" && c.orders > 0) return false;
    if (!inDateRange(c.createdAt, f.from, f.to)) return false;
    if (!q) return true;
    if (norm(c.name).includes(q) || norm(c.email).includes(q)) return true;
    return qDigits.length >= 4 && c.phones.some((p) => digits(p).includes(qDigits));
  });
}
