import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function TableShell({ children, className, caption }: { children: ReactNode; className?: string; caption?: string }) {
  return (
    <div className={cn("glass glass-thick overflow-hidden rounded-[var(--radius-tile)]", className)}>
      <div className="max-h-[70vh] overflow-auto max-md:max-h-none">
        <table className="w-full border-collapse text-sm max-md:block [&_tbody]:max-md:block [&_thead]:max-md:hidden">
          {caption && <caption className="sr-only">{caption}</caption>}
          {children}
        </table>
      </div>
    </div>
  );
}

export function Th({ children, className, ...p }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "sticky top-0 z-10 whitespace-nowrap border-b border-line bg-[var(--glass-solid)] px-4 py-3 text-left text-xs font-semibold text-ink-3",
        className,
      )}
      {...p}
    >
      {children}
    </th>
  );
}

export function Tr({ children, className, ...p }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-line transition-colors last:border-0 hover:bg-brand-soft max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-3 max-md:p-4",
        className,
      )}
      {...p}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className, label, ...p }: TdHTMLAttributes<HTMLTableCellElement> & { label?: string }) {
  return (
    <td
      data-label={label}
      className={cn(
        "px-4 py-3 align-middle text-ink-2 max-md:p-0 max-md:before:mb-0.5 max-md:before:block max-md:before:text-[11px] max-md:before:font-semibold max-md:before:text-ink-3 max-md:before:content-[attr(data-label)]",
        className,
      )}
      {...p}
    >
      {children}
    </td>
  );
}
