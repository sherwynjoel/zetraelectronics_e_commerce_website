import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

const primary =
  "bg-brand text-brand-ink shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_10px_24px_-10px_var(--brand)] hover:bg-brand-hover";
const glass = "glass glass-thin text-ink hover:text-brand";
const danger = "bg-danger text-white hover:brightness-110 dark:text-bg";

export const buttonClasses = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[transform,background-color,box-shadow,color,filter] duration-300 ease-[var(--ease-liquid)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        primary,
        glass,
        ghost: "text-ink-2 hover:bg-brand-soft hover:text-ink",
        danger,
        link: "text-brand underline-offset-4 hover:underline",
        // legacy names, removed in Task 16
        default: primary,
        outline: glass,
        secondary: glass,
        destructive: danger,
      },
      size: {
        sm: "h-9 rounded-[var(--radius-control)] px-3.5 text-sm",
        md: "h-11 rounded-[var(--radius-control)] px-5 text-sm",
        lg: "h-13 rounded-[1.1rem] px-7 text-base",
        icon: "size-11 rounded-full",
        // legacy name, removed in Task 16
        default: "h-11 rounded-[var(--radius-control)] px-5 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

/** @deprecated use buttonClasses */
export const buttonVariants = buttonClasses;

type Variants = VariantProps<typeof buttonClasses>;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & Variants & { loading?: boolean };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClasses({ variant, size }), className)}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export function ButtonLink({ className, variant, size, ...props }: React.ComponentProps<typeof Link> & Variants) {
  return <Link className={cn(buttonClasses({ variant, size }), className)} {...props} />;
}
