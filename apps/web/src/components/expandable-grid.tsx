"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shows the first `initial` items; "View all" reveals the rest in place, "Show fewer" collapses again. */
export function ExpandableGrid({
  items,
  initial = 4,
  className,
  noun,
}: {
  items: ReactNode[];
  initial?: number;
  className?: string;
  noun: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const hidden = items.length - initial;
  const shown = open ? items : items.slice(0, initial);

  return (
    <div className="grid gap-5">
      <div id={id} className={className}>
        {shown}
      </div>
      {hidden > 0 && (
        <Button
          variant="glass"
          className="justify-self-center rounded-full"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? `Show fewer ${noun}` : `View all ${items.length} ${noun}`}
          <ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} aria-hidden />
        </Button>
      )}
    </div>
  );
}
