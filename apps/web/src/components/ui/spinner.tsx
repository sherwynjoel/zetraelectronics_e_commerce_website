import { cn } from "@/lib/utils";

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-[spin_1.6s_linear_infinite]",
        className,
      )}
    />
  );
}
