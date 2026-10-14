"use client";

import { useEffect, useRef } from "react";
import { create } from "zustand";
import { Button } from "./button";

type Request = {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  resolve(v: boolean): void;
};

const useConfirm = create<{ req: Request | null; set(r: Request | null): void }>((set) => ({
  req: null,
  set: (req) => set({ req }),
}));

export function confirmAction(input: Omit<Request, "resolve">): Promise<boolean> {
  return new Promise((resolve) => useConfirm.getState().set({ ...input, resolve }));
}

export function ConfirmHost() {
  const { req, set } = useConfirm();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (req && !d.open) d.showModal?.();
    if (!req && d.open) d.close?.();
  }, [req]);

  const done = (v: boolean) => {
    req?.resolve(v);
    set(null);
  };

  return (
    <dialog
      ref={ref}
      role="alertdialog"
      aria-labelledby="confirm-title"
      aria-describedby={req?.body ? "confirm-body" : undefined}
      onCancel={(e) => {
        e.preventDefault();
        done(false);
      }}
      className="glass glass-thick m-auto w-[min(92vw,26rem)] rounded-[var(--radius-pane)] p-6 text-ink open:motion-safe:animate-[toast-in_.4s_var(--ease-spring)]"
    >
      {req && (
        <>
          <h2 id="confirm-title" className="text-lg font-bold">
            {req.title}
          </h2>
          {req.body && (
            <p id="confirm-body" className="mt-2 text-sm leading-relaxed text-ink-3">
              {req.body}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => done(false)}>
              {req.cancelLabel ?? "Keep it"}
            </Button>
            <Button variant={req.tone === "danger" ? "danger" : "primary"} onClick={() => done(true)} autoFocus>
              {req.confirmLabel ?? "Confirm"}
            </Button>
          </div>
        </>
      )}
    </dialog>
  );
}
