import { resolveTheme, nextPref } from "./theme";

test("resolves system preference", () => {
  expect(resolveTheme("system", true)).toBe("dark");
  expect(resolveTheme("system", false)).toBe("light");
  expect(resolveTheme("light", true)).toBe("light");
  expect(resolveTheme("dark", false)).toBe("dark");
});

test("cycles system → light → dark → system", () => {
  expect(nextPref("system")).toBe("light");
  expect(nextPref("light")).toBe("dark");
  expect(nextPref("dark")).toBe("system");
});
