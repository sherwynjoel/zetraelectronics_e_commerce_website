"use client";

import { useState } from "react";
import { Loupe } from "@/components/ui/loupe";
import { ProductImage } from "@/components/ui/product-image";
import { formatImageUrl } from "@/lib/utils";

/** Square glass stage. The Loupe wraps the photo at its natural aspect ratio so the lens maps 1:1. */
export function ProductStage({ src, alt }: { src?: string | null; alt: string }) {
  const url = formatImageUrl(src);
  const [failed, setFailed] = useState(false);

  return (
    <div className="glass glass-regular relative grid aspect-square place-items-center overflow-hidden rounded-[var(--radius-pane)] p-6 sm:p-10">
      <div className="absolute inset-3 rounded-[calc(var(--radius-pane)-0.5rem)] bg-[var(--glass-solid)] sm:inset-4" aria-hidden />
      {url && !failed ? (
        <Loupe src={url} alt={alt} className="relative max-h-full rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element -- the lens needs the exact rendered photo box */}
          <img
            src={url}
            alt={alt}
            onError={() => setFailed(true)}
            className="block max-h-[min(70vh,34rem)] w-auto max-w-full select-none object-contain mix-blend-multiply dark:mix-blend-normal"
            draggable={false}
          />
        </Loupe>
      ) : (
        <div className="relative size-full">
          <ProductImage src={null} alt={alt} />
        </div>
      )}
    </div>
  );
}
