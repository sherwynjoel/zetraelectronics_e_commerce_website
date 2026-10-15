import { resolveTheme, nextPref } from "./theme";

test("resolves system preference", () => {
  expect(resolveTheme("system", true)).toBe("dark");
  expect(resolveTheme("system", false)).toBe("light");
  expect(resolveTheme("light", true)).toBe("light");
  expect(resolveTheme("dark", false)).toBe("dark");
});

test("flips between light and dark in one tap", () => {
  // One tap always flips what is on screen; there is no third "system" step.
  expect(nextPref("light")).toBe("dark");
  expect(nextPref("dark")).toBe("light");
});
