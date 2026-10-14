import { render, screen } from "@testing-library/react";
import { TextField } from "./field";

test("label is linked to its input", () => {
  render(<TextField label="Email" name="email" />);
  expect(screen.getByLabelText("Email")).toHaveAttribute("name", "email");
});

test("error marks the input invalid and describes it", () => {
  render(<TextField label="PIN code" name="zip" error="Enter a 6-digit PIN code" hint="Used for delivery" />);
  const input = screen.getByLabelText("PIN code");
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAccessibleDescription("Used for delivery Enter a 6-digit PIN code");
});
