"use client";

import Image from "next/image";
import { useState } from "react";
import { Cpu } from "lucide-react";
import { cn, formatImageUrl } from "@/lib/utils";

export function ProductImage({
  src,
  alt,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  className,
  priority,
}: {
  src?: string | null;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  // Resized first; if the resizer can't fetch it, show the original file before giving up.
  const [stage, setStage] = useState<"resized" | "original" | "failed">("resized");
  const url = formatImageUrl(src);
  const [forUrl, setForUrl] = useState(url);
  if (forUrl !== url) {
    setForUrl(url);
    setStage("resized");
  }

  if (!url || stage === "failed") {
    return (
      <div className={cn("grid size-full place-items-center text-[var(--plate-ink)]", className)}>
        <div className="flex flex-col items-center gap-2">
          <Cpu className="size-8 opacity-70" aria-hidden />
          <span className="text-xs font-medium">No photo yet</span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={stage === "original"}
      onError={() => setStage((s) => (s === "resized" ? "original" : "failed"))}
      className={cn("object-contain mix-blend-multiply", className)}
    />
  );
}
