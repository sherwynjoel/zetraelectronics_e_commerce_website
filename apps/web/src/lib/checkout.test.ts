import { calcTotals, parseCheckoutSettings } from "./checkout";

const items = [
  { price: 100, quantity: 2, shippingCost: 10 },
  { price: 50, quantity: 1, shippingCost: 0 },
];

test("sums per-unit shipping and applies GST to subtotal plus shipping", () => {
  const t = calcTotals(items, { taxRate: 0.18, freeShippingThreshold: 0, flatShippingFee: 0 });
  expect(t.subtotal).toBe(250);
  expect(t.shipping).toBe(20);
  expect(t.tax).toBeCloseTo(48.6);
  expect(t.total).toBeCloseTo(318.6);
});

test("free shipping above the threshold, flat fee otherwise", () => {
  expect(calcTotals(items, { taxRate: 0, freeShippingThreshold: 200, flatShippingFee: 40 }).shipping).toBe(0);
  expect(calcTotals(items, { taxRate: 0, freeShippingThreshold: 1000, flatShippingFee: 40 }).shipping).toBe(40);
});

test("reads GST and shipping settings with an 18% default", () => {
  expect(parseCheckoutSettings([])).toEqual({ taxRate: 0.18, freeShippingThreshold: 0, flatShippingFee: 0 });
  expect(
    parseCheckoutSettings([
      { key: "GST_PERCENTAGE", value: "12" },
      { key: "FREE_SHIPPING_THRESHOLD", value: "999" },
      { key: "FLAT_SHIPPING_FEE", value: "49" },
    ]),
  ).toEqual({ taxRate: 0.12, freeShippingThreshold: 999, flatShippingFee: 49 });
});
