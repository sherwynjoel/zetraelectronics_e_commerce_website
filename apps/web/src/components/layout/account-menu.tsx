"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LayoutDashboard, LogOut, Package, User } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { ButtonLink } from "@/components/ui/button";
import { useMounted } from "@/lib/use-mounted";

function initials(name: string | null, email: string) {
  const src = (name || email).trim();
  const parts = src.split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : src.slice(0, 2)).toUpperCase();
}

export function AccountMenu() {
  const { user, logout } = useAuthStore();
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!mounted) return <span className="block h-10 w-24" aria-hidden />;

  if (!user)
    return (
      <ButtonLink href="/login" size="sm" className="h-10 rounded-full px-5">
        Sign in
      </ButtonLink>
    );

  const item = "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-2 hover:bg-brand-soft hover:text-ink";

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Account menu for ${user.name || user.email}`}
        onClick={() => setOpen((v) => !v)}
        className="grid size-10 place-items-center rounded-full bg-brand text-sm font-bold text-brand-ink shadow-[inset_0_1px_0_rgba(255,255,255,.35)]"
      >
        {initials(user.name, user.email)}
      </button>
      {open && (
        <div className="glass glass-thick absolute right-0 top-[calc(100%+0.75rem)] z-50 w-60 rounded-[var(--radius-tile)] p-2 motion-safe:animate-[toast-in_.35s_var(--ease-liquid)]">
          <div className="px-3 pb-2 pt-1.5">
            <p className="truncate text-sm font-semibold text-ink">{user.name || "Your account"}</p>
            <p className="truncate text-xs text-ink-3">{user.email}</p>
          </div>
          <div className="grid border-t border-line pt-1">
            <Link href="/profile" className={item} onClick={() => setOpen(false)}>
              <User className="size-4" aria-hidden />
              Profile
            </Link>
            <Link href="/favorites" className={item} onClick={() => setOpen(false)}>
              <Heart className="size-4" aria-hidden />
              Favourites
            </Link>
            <Link href="/track-order" className={item} onClick={() => setOpen(false)}>
              <Package className="size-4" aria-hidden />
              Orders
            </Link>
            {user.role === "ADMIN" && (
              <Link href="/admin" className={item} onClick={() => setOpen(false)}>
                <LayoutDashboard className="size-4" aria-hidden />
                Store admin
              </Link>
            )}
            <button
              type="button"
              className={`${item} text-danger hover:text-danger`}
              onClick={() => {
                setOpen(false);
                logout();
                router.push("/");
              }}
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
