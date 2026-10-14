import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";

type Props<T extends ElementType> = {
  as?: T;
  tier?: "thin" | "regular" | "thick";
  interactive?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function GlassPanel<T extends ElementType = "div">({
  as,
  tier = "regular",
  interactive,
  className,
  ...rest
}: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn("glass rounded-[var(--radius-pane)]", `glass-${tier}`, interactive && "glass-lift", className)}
      {...rest}
    />
  );
}
