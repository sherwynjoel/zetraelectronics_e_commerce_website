import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmHost, confirmAction } from "./confirm-dialog";

test("resolves true when confirmed and false when cancelled", async () => {
  render(<ConfirmHost />);
  let p!: Promise<boolean>;

  act(() => {
    p = confirmAction({ title: "Delete product?", confirmLabel: "Delete", tone: "danger" });
  });
  await userEvent.click(await screen.findByRole("button", { name: "Delete" }));
  await expect(p).resolves.toBe(true);

  act(() => {
    p = confirmAction({ title: "Cancel order?" });
  });
  await userEvent.click(await screen.findByRole("button", { name: "Keep it" }));
  await expect(p).resolves.toBe(false);
});
