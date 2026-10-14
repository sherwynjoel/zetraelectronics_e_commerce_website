"use client";

import { useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { ownerKey, useFavorites } from "@/lib/favorites";
import { useMounted } from "@/lib/use-mounted";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/** Current owner's favourite ids (empty until hydrated, so server and client agree). */
export function useFavoriteIds() {
  const user = useAuthStore((s) => s.user);
  const mounted = useMounted();
  const ids = useFavorites((s) => s.byOwner[ownerKey(user)]);
  return { owner: ownerKey(user), ids: mounted ? (ids ?? []) : [] };
}

export function FavoriteButton({
  productId,
  name,
  size = "sm",
  className,
}: {
  productId: number;
  name: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { owner, ids } = useFavoriteIds();
  const toggle = useFavorites((s) => s.toggle);
  const active = ids.includes(productId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from favourites` : `Save ${name} to favourites`}
      title={active ? "Remove from favourites" : "Save to favourites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const nowFav = toggle(owner, productId);
        toast.success(nowFav ? "Saved to favourites" : "Removed from favourites", name);
      }}
      className={cn(
        "glass glass-thin grid shrink-0 place-items-center rounded-full transition-[color,transform] duration-300 active:scale-90",
        size === "sm" ? "size-9" : "size-11",
        active ? "text-brand" : "text-ink-2 hover:text-brand",
        className,
      )}
    >
      <Heart className={cn(size === "sm" ? "size-4" : "size-5", active && "fill-current")} aria-hidden />
    </button>
  );
}

/** Moves a guest's favourites into the account when someone signs in. */
export function FavoritesSync() {
  const user = useAuthStore((s) => s.user);
  const merge = useFavorites((s) => s.mergeGuestInto);
  useEffect(() => {
    if (user) merge(ownerKey(user));
  }, [user, merge]);
  return null;
}
