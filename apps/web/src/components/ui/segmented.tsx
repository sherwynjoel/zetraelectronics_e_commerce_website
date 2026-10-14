"use client";

import { cn } from "@/lib/utils";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange(v: T): void;
  ariaLabel: string;
  className?: string;
}) {
  const i = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const n = options.length;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("glass glass-thin relative grid rounded-full p-1", className)}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const next = options[(i + (e.key === "ArrowRight" ? 1 : n - 1)) % n];
        onChange(next.value);
        (e.currentTarget.querySelectorAll("button")[options.indexOf(next)] as HTMLButtonElement)?.focus();
      }}
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-full bg-[var(--glass-thick-bg)] shadow-[var(--glass-shadow),var(--glass-inner)] transition-transform duration-500 ease-[var(--ease-spring)] motion-reduce:transition-none"
        style={{ width: `calc((100% - 0.5rem) / ${n})`, transform: `translateX(${i * 100}%)` }}
      />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative z-10 h-9 truncate rounded-full px-3 text-sm font-semibold transition-colors",
              active ? "text-ink" : "text-ink-3 hover:text-ink-2",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
