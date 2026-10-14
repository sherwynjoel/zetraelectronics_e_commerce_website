import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Favourites live in the browser, kept separately per signed-in account (or "guest"). */
export function ownerKey(user: { id: number } | null | undefined) {
  return user ? `user:${user.id}` : "guest";
}

type FavoritesState = {
  byOwner: Record<string, number[]>;
  /** Adds or removes a product; returns true when it is now a favourite. */
  toggle(owner: string, productId: number): boolean;
  remove(owner: string, productId: number): void;
  mergeGuestInto(owner: string): void;
};

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      byOwner: {},
      toggle: (owner, productId) => {
        const list = get().byOwner[owner] ?? [];
        const has = list.includes(productId);
        const next = has ? list.filter((id) => id !== productId) : [productId, ...list];
        set({ byOwner: { ...get().byOwner, [owner]: next } });
        return !has;
      },
      remove: (owner, productId) =>
        set({ byOwner: { ...get().byOwner, [owner]: (get().byOwner[owner] ?? []).filter((id) => id !== productId) } }),
      mergeGuestInto: (owner) => {
        const guest = get().byOwner.guest ?? [];
        if (owner === "guest" || guest.length === 0) return;
        const mine = get().byOwner[owner] ?? [];
        const merged = [...mine, ...guest.filter((id) => !mine.includes(id))];
        set({ byOwner: { ...get().byOwner, [owner]: merged, guest: [] } });
      },
    }),
    { name: "zetra-favorites" },
  ),
);
