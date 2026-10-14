import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-3xl md:text-4xl",
};

export function Price({ value, size = "md", className }: { value: number; size?: keyof typeof sizes; className?: string }) {
  return <span className={cn("tabular font-bold tracking-tight text-ink", sizes[size], className)}>{formatINR(value)}</span>;
}
