"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Centred glass modal on the native <dialog>: focus is trapped, Esc and a backdrop click close it,
 * the body scrolls inside when content is long, and it never exceeds the viewport.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose(): void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
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
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "glass glass-thick m-auto max-h-[min(88dvh,46rem)] w-[min(94vw,36rem)] flex-col overflow-hidden rounded-[var(--radius-pane)] p-0 text-ink open:flex open:motion-safe:animate-[toast-in_.4s_var(--ease-spring)]",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4 border-b border-line px-5 pb-4 pt-5 sm:px-6">
        <div className="min-w-0">
          <h2 id="modal-title" className="text-xl font-bold text-ink">
            {title}
          </h2>
          {description && <div className="mt-1 text-sm text-ink-3">{description}</div>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="glass glass-thin grid size-9 shrink-0 place-items-center rounded-full text-ink-2 hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">{children}</div>
      {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">{footer}</footer>}
    </dialog>
  );
}
