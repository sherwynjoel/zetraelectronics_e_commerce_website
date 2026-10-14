import { statusTone } from "./status";

test("maps order statuses to tones", () => {
  expect(statusTone("PAID")).toBe("brand");
  expect(statusTone("SHIPPED")).toBe("brand");
  expect(statusTone("DELIVERED")).toBe("ok");
  expect(statusTone("PENDING")).toBe("warn");
  expect(statusTone("CANCELLED")).toBe("danger");
  expect(statusTone("whatever")).toBe("neutral");
});
