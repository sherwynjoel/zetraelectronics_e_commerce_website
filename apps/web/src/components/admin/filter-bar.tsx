"use client";

import { useId, type ReactNode } from "react";
import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { controlClasses } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/** Search on its own row, filters in a wrapping grid beneath, Reset at the end. Never overflows a phone. */
export function FilterBar({
  search,
  children,
  active,
  onReset,
  summary,
}: {
  search: ReactNode;
  children?: ReactNode;
  active: boolean;
  onReset(): void;
  summary?: ReactNode;
}) {
  return (
    <section aria-label="Search and filters" className="glass glass-thick mb-5 grid gap-4 rounded-[var(--radius-tile)] p-4 sm:p-5">
      {search}
      {children && <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">{children}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <p className="text-sm text-ink-3" aria-live="polite">
          {summary}
        </p>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={!active}>
          <RotateCcw className="size-4" aria-hidden />
          Clear filters
        </Button>
      </div>
    </section>
  );
}

export function SearchField({ label, value, onChange, placeholder }: { label: string; value: string; onChange(v: string): void; placeholder: string }) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink-2">
        {label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(controlClasses, "h-11 pl-10")}
        />
      </div>
    </div>
  );
}
