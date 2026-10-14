import { parseAddress, printAddressLabel } from "./print-label";

test("parses JSON addresses and falls back to a street string", () => {
  expect(parseAddress('{"city":"Pune"}')).toEqual({ city: "Pune" });
  expect(parseAddress("12 Lab Lane")).toEqual({ street: "12 Lab Lane" });
  expect(parseAddress(null)).toEqual({});
});

test("escapes customer-entered text in the printed label", () => {
  let html = "";
  const fake = { document: { write: (s: string) => (html = s), close: () => {} } };
  vi.spyOn(window, "open").mockReturnValue(fake as unknown as Window);
  printAddressLabel({ id: 7, createdAt: "2026-10-14", shippingAddress: { name: "<img src=x onerror=alert(1)>", street: "A & B" } });
  expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  expect(html).not.toContain("<img src=x");
  expect(html).toContain("A &amp; B");
});
