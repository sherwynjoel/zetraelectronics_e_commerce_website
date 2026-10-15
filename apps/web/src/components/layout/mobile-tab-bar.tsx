"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, ShoppingBag, Store, User } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useMounted } from "@/lib/use-mounted";
import { CountBadge, useCartCount } from "./cart-link";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const mounted = useMounted();
  const count = useCartCount();

  const tabs = [
    { href: "/products", label: "Shop", icon: Store, match: (p: string) => p === "/" || p.startsWith("/products") || p.startsWith("/category") },
    { href: "/search", label: "Search", icon: Search, match: (p: string) => p.startsWith("/search") },
    { href: "/cart", label: "Cart", icon: ShoppingBag, match: (p: string) => p.startsWith("/cart") || p.startsWith("/checkout") },
    {
      href: mounted && user ? "/profile" : "/login",
      label: mounted && user ? "Account" : "Sign in",
      icon: User,
      match: (p: string) => ["/profile", "/login", "/register", "/track-order"].some((x) => p.startsWith(x)),
    },
  ];
  // Admins browsing the store get a way back to the dashboard that is always in reach.
  if (mounted && user?.role === "ADMIN") {
    tabs.push({ href: "/admin", label: "Admin", icon: LayoutDashboard, match: (p: string) => p.startsWith("/admin") });
  }
  const cols = tabs.length;
  const activeIndex = tabs.findIndex((t) => t.match(pathname));

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 lg:hidden"
    >
      <div className={cn("glass glass-regular relative grid rounded-full p-1.5", cols === 5 ? "grid-cols-5" : "grid-cols-4")}>
        {activeIndex >= 0 && (
          <span
            aria-hidden
            className="absolute inset-y-1.5 left-1.5 rounded-full bg-[var(--glass-thick-bg)] shadow-[var(--glass-shadow),var(--glass-inner)] transition-transform duration-500 ease-[var(--ease-spring)] motion-reduce:transition-none"
            style={{ width: `calc((100% - 0.75rem) / ${cols})`, transform: `translateX(${activeIndex * 100}%)` }}
          />
        )}
        {tabs.map((t, i) => {
          const Icon = t.icon;
          const active = i === activeIndex;
          return (
            <Link
              key={t.label}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative z-10 flex h-14 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold transition-colors",
                active ? "text-brand" : "text-ink-3",
              )}
            >
              <span className="relative">
                <Icon className="size-5" aria-hidden />
                {t.href === "/cart" && count > 0 && <CountBadge count={count} className="-right-2.5 -top-2" />}
              </span>
              {t.label}
              {t.href === "/cart" && count > 0 && <span className="sr-only">{`, ${count} items`}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
