"use client";

import { Share2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/** Native share sheet where supported; otherwise copies the link and says so. */
export function ShareButton({ title, path, className }: { title: string; path: string; className?: string }) {
  const share = async () => {
    const url = new URL(path, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title} on Zetra Electronics`, url });
        return;
      } catch (e) {
        if ((e as DOMException)?.name === "AbortError") return; // the user closed the sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", "Paste it anywhere to share this part.");
    } catch {
      toast({ title: "Copy this link to share", description: url, tone: "info" });
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-label={`Share ${title}`}
      title="Share"
      className={cn("glass glass-thin grid size-11 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:text-brand", className)}
    >
      <Share2 className="size-5" aria-hidden />
    </button>
  );
}
