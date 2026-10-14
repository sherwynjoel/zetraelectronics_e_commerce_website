import type { ReactNode } from "react";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export function OrderSummary({
  totals,
  taxRate,
  children,
  className,
  itemCount,
}: {
  totals: { subtotal: number; shipping: number; tax: number; total: number };
  taxRate: number;
  children?: ReactNode;
  className?: string;
  itemCount: number;
}) {
  const row = "flex items-center justify-between gap-4 text-sm";
  return (
    <section aria-labelledby="summary-title" className={cn("glass glass-thick grid gap-5 rounded-[var(--radius-pane)] p-6", className)}>
      <h2 id="summary-title" className="text-lg font-bold text-ink">
        Order summary
      </h2>
      <dl className="grid gap-3">
        <div className={row}>
          <dt className="text-ink-2">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </dt>
          <dd className="tabular font-semibold text-ink">{formatINR(totals.subtotal)}</dd>
        </div>
        <div className={row}>
          <dt className="text-ink-2">Shipping</dt>
          <dd className={cn("tabular font-semibold", totals.shipping === 0 ? "text-ok" : "text-ink")}>
            {totals.shipping === 0 ? "Free" : formatINR(totals.shipping)}
          </dd>
        </div>
        <div className={row}>
          <dt className="text-ink-2">GST ({Math.round(taxRate * 100)}%)</dt>
          <dd className="tabular font-semibold text-ink">{formatINR(totals.tax)}</dd>
        </div>
        <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
          <dt className="font-bold text-ink">Total</dt>
          <dd className="tabular text-2xl font-extrabold tracking-tight text-ink">{formatINR(totals.total)}</dd>
        </div>
      </dl>
      {children}
    </section>
  );
}
