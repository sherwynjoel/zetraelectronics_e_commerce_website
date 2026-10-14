"use client";

import { useRef, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { lensBackground } from "./loupe-math";
import { cn } from "@/lib/utils";

type Point = { x: number; y: number; width: number; height: number };

/**
 * The signature magnifier: a red-ringed glass lens that follows the pointer
 * over a product photo. On touch, the Magnify button arms it so dragging
 * moves the lens instead of scrolling.
 */
export function Loupe({
  src,
  alt,
  zoom = 2.5,
  lens = 168,
  children,
  className,
}: {
  src: string;
  alt: string;
  zoom?: number;
  lens?: number;
  children: ReactNode;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [pt, setPt] = useState<Point | null>(null);
  const [armed, setArmed] = useState(false);

  const track = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" && !armed) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const r = box.current!.getBoundingClientRect();
    setPt({ x: e.clientX - r.left, y: e.clientY - r.top, width: r.width, height: r.height });
  };
  const clear = () => setPt(null);

  const bg = pt && src ? lensBackground({ ...pt, zoom, lens }) : null;

  return (
    <div
      ref={box}
      className={cn("relative overflow-hidden", armed && "touch-none", pt && "cursor-none", className)}
      onPointerMove={track}
      onPointerDown={track}
      onPointerLeave={clear}
      onPointerCancel={clear}
      onPointerUp={(e) => {
        if (e.pointerType !== "mouse") clear();
      }}
    >
      {children}
      {bg && pt && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-20 rounded-full border-[3px] border-ember"
          style={{
            width: lens,
            height: lens,
            left: pt.x - lens / 2,
            top: pt.y - lens / 2,
            backgroundColor: "var(--glass-solid)",
            backgroundImage: `url("${src}")`,
            backgroundRepeat: "no-repeat",
            backgroundSize: bg.size,
            backgroundPosition: bg.position,
            boxShadow:
              "0 22px 44px -12px rgba(0,0,0,.45), inset 0 3px 8px rgba(255,255,255,.55), inset 0 -6px 14px rgba(0,0,0,.18)",
          }}
        />
      )}
      {src && (
        <button
          type="button"
          onClick={() => {
            setArmed((v) => !v);
            clear();
          }}
          aria-pressed={armed}
          className="glass glass-thin absolute bottom-3 right-3 z-30 flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-ink lg:hidden"
        >
          <Search className="size-3.5" aria-hidden />
          {armed ? "Done magnifying" : "Magnify"}
        </button>
      )}
      <span className="sr-only">{`Move over the photo of ${alt} to magnify it.`}</span>
    </div>
  );
}
