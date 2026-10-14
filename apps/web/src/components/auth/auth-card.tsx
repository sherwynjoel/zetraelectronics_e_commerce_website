"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { controlClasses } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/** Only same-site paths are allowed as a post-login destination. */
export function safeNext(next: string | null | undefined, fallback = "/") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-14rem)] max-w-md place-items-center pb-10">
      <section className="glass glass-thick w-full rounded-[2rem] p-6 sm:p-9">
        <Link href="/" className="mx-auto mb-6 block size-16 overflow-hidden rounded-full bg-white shadow-[0_6px_18px_-6px_rgba(11,26,51,.3)]" aria-label="Zetra Electronics home">
          <span className="relative block size-full">
            <Image src="/logo.png" alt="" fill sizes="64px" className="scale-[1.35] object-contain" />
          </span>
        </Link>
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-2">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="mt-7 border-t border-line pt-5 text-center text-sm text-ink-2">{footer}</div>}
      </section>
    </div>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-[var(--radius-control)] bg-danger-soft p-3 text-sm text-ink">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

export function PasswordField({
  label,
  hint,
  error,
  className,
  ...input
}: { label: string; hint?: string; error?: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(controlClasses, "h-11 pr-12")}
          {...input}
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-pressed={shown}
          aria-label={shown ? "Hide password" : "Show password"}
          className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-3 hover:text-ink"
        >
          {shown ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-ink-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function GoogleMark() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
