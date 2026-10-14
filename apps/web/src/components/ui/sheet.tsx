"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const sides = {
  left: "mr-auto ml-0 h-dvh max-h-dvh w-[min(88vw,22rem)] rounded-r-[var(--radius-pane)] open:motion-safe:animate-[sheet-in-left_.5s_var(--ease-liquid)]",
  right:
    "ml-auto mr-0 h-dvh max-h-dvh w-[min(92vw,26rem)] rounded-l-[var(--radius-pane)] open:motion-safe:animate-[sheet-in-right_.5s_var(--ease-liquid)]",
  bottom:
    "mb-0 mt-auto max-h-[88dvh] w-full max-w-none rounded-t-[var(--radius-pane)] open:motion-safe:animate-[sheet-in-bottom_.5s_var(--ease-liquid)]",
};

export function Sheet({
  open,
  onClose,
  side = "right",
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose(): void;
  side?: keyof typeof sides;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal?.();
    if (!open && d.open) d.close?.();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn("glass glass-thick flex-col overflow-hidden p-0 text-ink open:flex", sides[side])}
    >
      <div className="flex items-center justify-between gap-4 px-5 pb-3 pt-5">
        <h2 className="text-lg font-bold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="glass glass-thin grid size-9 place-items-center rounded-full text-ink-2 hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
      {footer && <div className="border-t border-line px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">{footer}</div>}
    </dialog>
  );
}
