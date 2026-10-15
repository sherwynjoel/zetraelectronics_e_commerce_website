import { filterCustomers, filterOrders, inDateRange, orderStage, paymentState, type AdminOrderLike, type CustomerLike } from "./admin-filters";

const orders: AdminOrderLike[] = [
  { id: 101, status: "PAID", createdAt: "2026-10-01T10:00:00Z", paymentMethod: "RAZORPAY", shippingAddress: '{"name":"Asha Rao","phone":"9876500001"}', user: { name: "Asha Rao", email: "asha@example.com" } },
  { id: 102, status: "PENDING", createdAt: "2026-10-10T10:00:00Z", paymentMethod: "RAZORPAY", shippingAddress: '{"phone":"9123400002"}', user: { name: "Vikram S", email: "vik@example.com" } },
  { id: 103, status: "CANCELLED", createdAt: "2026-09-20T10:00:00Z", paymentMethod: "RAZORPAY", shippingAddress: null, user: { name: "Asha Rao", email: "asha@example.com" } },
];

test("payment state is derived from order status", () => {
  expect(paymentState("PAID")).toBe("paid");
  expect(paymentState("SHIPPED")).toBe("paid");
  expect(paymentState("DELIVERED")).toBe("paid");
  expect(paymentState("PENDING")).toBe("unpaid");
  expect(paymentState("CANCELLED")).toBe("cancelled");
});

test("order stage tracks delivery only, so it never repeats a payment state", () => {
  expect(orderStage("PENDING")).toBe("open");
  expect(orderStage("PAID")).toBe("open");
  expect(orderStage("PROCESSING")).toBe("open");
  expect(orderStage("SHIPPED")).toBe("shipped");
  expect(orderStage("DELIVERED")).toBe("delivered");
  expect(orderStage("CANCELLED")).toBe("cancelled");
});

test("order status and payment filters combine: paid but not shipped yet", () => {
  const base = { q: "", status: "all", payment: "all", from: "", to: "" };
  expect(filterOrders(orders, { ...base, status: "open" }).map((o) => o.id)).toEqual([101, 102]);
  expect(filterOrders(orders, { ...base, status: "open", payment: "paid" }).map((o) => o.id)).toEqual([101]);
});

test("date range is inclusive of whole days and open-ended", () => {
  expect(inDateRange("2026-10-10T12:00:00Z", "2026-10-10", "2026-10-10")).toBe(true);
  // 20:00 UTC on 9 Oct is 01:30 on 10 Oct in India, so it counts as the 10th.
  expect(inDateRange("2026-10-09T20:00:00Z", "2026-10-10", "2026-10-10")).toBe(true);
  expect(inDateRange("2026-10-09T10:00:00Z", "2026-10-10", "")).toBe(false);
  expect(inDateRange("2026-10-09T10:00:00Z", "", "")).toBe(true);
});

test("orders: search by id, name, email or phone, combined with filters", () => {
  const base = { q: "", status: "all", payment: "all", from: "", to: "" };
  expect(filterOrders(orders, { ...base, q: "102" }).map((o) => o.id)).toEqual([102]);
  expect(filterOrders(orders, { ...base, q: "#ORD-101" }).map((o) => o.id)).toEqual([101]);
  expect(filterOrders(orders, { ...base, q: "asha" }).map((o) => o.id)).toEqual([101, 103]);
  expect(filterOrders(orders, { ...base, q: "vik@" }).map((o) => o.id)).toEqual([102]);
  expect(filterOrders(orders, { ...base, q: "98765" }).map((o) => o.id)).toEqual([101]);
  expect(filterOrders(orders, { ...base, q: "asha", status: "cancelled" }).map((o) => o.id)).toEqual([103]);
  expect(filterOrders(orders, { ...base, payment: "unpaid" }).map((o) => o.id)).toEqual([102]);
  expect(filterOrders(orders, { ...base, from: "2026-10-01", to: "2026-10-05" }).map((o) => o.id)).toEqual([101]);
});

const customers: CustomerLike[] = [
  { id: 1, name: "Asha Rao", email: "asha@example.com", role: "CUSTOMER", createdAt: "2026-09-01T00:00:00Z", orders: 2, phones: ["9876500001"] },
  { id: 2, name: null, email: "admin@zetra.com", role: "ADMIN", createdAt: "2026-01-01T00:00:00Z", orders: 0, phones: [] },
  { id: 3, name: "Vikram S", email: "vik@example.com", role: "CUSTOMER", createdAt: "2026-10-12T00:00:00Z", orders: 0, phones: ["9123400002"] },
];

test("customers: search by name, email or phone, filter by role, activity and join date", () => {
  const base = { q: "", role: "all", activity: "all", from: "", to: "" };
  expect(filterCustomers(customers, { ...base, q: "asha" }).map((c) => c.id)).toEqual([1]);
  expect(filterCustomers(customers, { ...base, q: "9123" }).map((c) => c.id)).toEqual([3]);
  expect(filterCustomers(customers, { ...base, role: "ADMIN" }).map((c) => c.id)).toEqual([2]);
  expect(filterCustomers(customers, { ...base, activity: "with-orders" }).map((c) => c.id)).toEqual([1]);
  expect(filterCustomers(customers, { ...base, activity: "no-orders", role: "CUSTOMER" }).map((c) => c.id)).toEqual([3]);
  expect(filterCustomers(customers, { ...base, from: "2026-10-01" }).map((c) => c.id)).toEqual([3]);
});
