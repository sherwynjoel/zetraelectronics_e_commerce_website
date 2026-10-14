import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { GlassPanel } from "./glass-panel";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
  headingLevel = "h2",
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
  headingLevel?: "h1" | "h2" | "h3";
}) {
  const H = headingLevel;
  return (
    <GlassPanel tier="regular" className={cn("flex flex-col items-center gap-3 px-6 py-14 text-center", className)}>
      {Icon && (
        <span className="glass glass-thin grid size-14 place-items-center rounded-full text-brand">
          <Icon className="size-6" aria-hidden />
        </span>
      )}
      <H className="text-lg font-bold text-ink">{title}</H>
      {body && <p className="max-w-sm text-sm leading-relaxed text-ink-3">{body}</p>}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div>}
    </GlassPanel>
  );
}
