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
  const [failed, setFailed] = useState(false);
  const url = formatImageUrl(src);

  if (!url || failed) {
    return (
      <div className={cn("grid size-full place-items-center text-ink-3", className)}>
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
      unoptimized={url.startsWith("/uploads")}
      onError={() => setFailed(true)}
      className={cn("object-contain", className)}
    />
  );
}
