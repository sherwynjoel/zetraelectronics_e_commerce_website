"use client";

import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Base = { label: string; hint?: string; error?: string; className?: string; labelHidden?: boolean };

export const controlClasses =
  "w-full rounded-[var(--radius-control)] border border-line bg-field px-3.5 text-[15px] text-ink placeholder:text-ink-3 shadow-[inset_0_1px_2px_rgba(11,26,51,.06)] transition-[border-color,box-shadow] duration-200 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-soft aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger-soft disabled:cursor-not-allowed disabled:opacity-60";

function useFieldIds(hint?: string, error?: string) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return { id, hintId, errorId, describedBy: [hintId, errorId].filter(Boolean).join(" ") || undefined };
}

function Frame({
  id,
  label,
  labelHidden,
  hint,
  error,
  hintId,
  errorId,
  className,
  children,
}: Base & { id: string; hintId?: string; errorId?: string; children: ReactNode }) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className={cn("text-sm font-semibold text-ink-2", labelHidden && "sr-only")}>
        {label}
      </label>
      {children}
      {hint && (
        <p id={hintId} className="text-xs text-ink-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  labelHidden,
  hint,
  error,
  className,
  ...input
}: Base & InputHTMLAttributes<HTMLInputElement>) {
  const ids = useFieldIds(hint, error);
  return (
    <Frame {...ids} label={label} labelHidden={labelHidden} hint={hint} error={error} className={className}>
      <input
        id={ids.id}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        className={cn(controlClasses, "h-11")}
        {...input}
      />
    </Frame>
  );
}

export function TextareaField({
  label,
  labelHidden,
  hint,
  error,
  className,
  ...input
}: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ids = useFieldIds(hint, error);
  return (
    <Frame {...ids} label={label} labelHidden={labelHidden} hint={hint} error={error} className={className}>
      <textarea
        id={ids.id}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        className={cn(controlClasses, "min-h-28 py-3 leading-relaxed")}
        {...input}
      />
    </Frame>
  );
}

export function SelectField({
  label,
  labelHidden,
  hint,
  error,
  className,
  children,
  ...input
}: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  const ids = useFieldIds(hint, error);
  return (
    <Frame {...ids} label={label} labelHidden={labelHidden} hint={hint} error={error} className={className}>
      <div className="relative">
        <select
          id={ids.id}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          className={cn(controlClasses, "h-11 appearance-none pr-10")}
          {...input}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3"
        />
      </div>
    </Frame>
  );
}
