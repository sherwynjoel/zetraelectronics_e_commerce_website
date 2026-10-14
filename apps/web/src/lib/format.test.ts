import { formatINR, formatDate } from "./format";

test("formats rupees with Indian grouping and two decimals", () => {
  expect(formatINR(1234.5)).toBe("₹1,234.50");
  expect(formatINR(123456)).toBe("₹1,23,456.00");
  expect(formatINR(0)).toBe("₹0.00");
});

test("formats dates in en-IN short form", () => {
  expect(formatDate("2026-10-14T10:00:00Z")).toBe("14 Oct 2026");
});
