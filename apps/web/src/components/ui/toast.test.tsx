import { render, screen, act } from "@testing-library/react";
import { Toaster, toast } from "./toast";

test("toast appears in a polite live region", () => {
  render(<Toaster />);
  act(() => toast.success("Added to cart", "Arduino Uno R3"));
  expect(screen.getByRole("status")).toHaveTextContent("Added to cart");
  expect(screen.getByText("Arduino Uno R3")).toBeInTheDocument();
});

test("error toasts use an assertive alert region", () => {
  render(<Toaster />);
  act(() => toast.error("Payment failed", "Card declined"));
  expect(screen.getByRole("alert")).toHaveTextContent("Payment failed");
});
