"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Boxes, LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingCart, Store, Tags, Users } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useMounted } from "@/lib/use-mounted";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({ onNavigate }: { onNavigate?(): void }) {
  const pathname = usePathname();
  return (
    <ul className="grid gap-1">
      {adminNav.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                active
                  ? "bg-[var(--glass-thick-bg)] text-ink shadow-[var(--glass-shadow),var(--glass-inner)]"
                  : "text-ink-2 hover:bg-brand-soft hover:text-ink",
              )}
            >
              <Icon className={cn("size-[18px]", active ? "text-brand" : "text-ink-3")} aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarFooter() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  return (
    <div className="grid gap-2 border-t border-line pt-4">
      <div className="flex items-center gap-2 px-1">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{user?.name || "Admin"}</span>
          <span className="block truncate text-xs text-ink-3">{user?.email}</span>
        </span>
        <ThemeToggle />
      </div>
      <Link href="/" className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink-2 hover:bg-brand-soft hover:text-ink">
        <Store className="size-4" aria-hidden />
        View store
      </Link>
      <button
        type="button"
        onClick={() => {
          logout();
          router.push("/login");
        }}
        className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-danger hover:bg-danger-soft"
      >
        <LogOut className="size-4" aria-hidden />
        Sign out
      </button>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 px-1" aria-label="Zetra admin home">
      <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-logo shadow-[0_2px_10px_rgba(11,26,51,.16)] ring-1 ring-line">
        <Image src="/logo-mark.png" alt="" fill unoptimized className="object-contain p-[3px]" priority />
      </span>
      <span className="leading-tight">
        <span className="block text-base font-extrabold tracking-tight text-ink">Zetra Electronics</span>
        <span className="block text-xs font-semibold text-ink-3">Store admin</span>
      </span>
    </Link>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const mounted = useMounted();
  const router = useRouter();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (mounted && (!user || user.role !== "ADMIN")) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [mounted, user, router, pathname]);

  if (!mounted || !user || user.role !== "ADMIN") {
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <Skeleton className="h-40 w-full max-w-md rounded-[var(--radius-pane)]" />
      </div>
    );
  }

  const title = adminNav.find((n) => isActive(pathname, n.href))?.label ?? "Admin";

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16.5rem_1fr]">
      <aside className="hidden lg:block">
        <div className="glass glass-thick sticky top-4 m-4 mr-0 flex h-[calc(100dvh-2rem)] flex-col gap-6 rounded-[var(--radius-pane)] p-4">
          <Brand />
          <nav aria-label="Admin" className="min-h-0 flex-1 overflow-y-auto">
            <NavList />
          </nav>
          <SidebarFooter />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 px-3 pt-3 lg:hidden">
          <div className="glass glass-thin flex h-14 items-center gap-2 rounded-full pl-2 pr-1.5">
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-label="Open admin menu"
              className="grid size-10 place-items-center rounded-full text-ink-2 hover:bg-brand-soft hover:text-ink"
            >
              <Menu className="size-5" aria-hidden />
            </button>
            <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-logo ring-1 ring-line" aria-hidden>
              <Image src="/logo-mark.png" alt="" fill unoptimized className="object-contain p-[3px]" />
            </span>
            <span className="flex-1 truncate font-bold text-ink">{title}</span>
            <ThemeToggle />
          </div>
        </header>
        <Sheet open={menu} onClose={() => setMenu(false)} side="left" title="Zetra admin" footer={<SidebarFooter />}>
          <nav aria-label="Admin">
            <NavList onNavigate={() => setMenu(false)} />
          </nav>
        </Sheet>

        <main id="main-content" className="mx-auto w-full max-w-[1200px] px-3 pb-12 pt-5 sm:px-5 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Page heading row with an optional action slot. */
export function AdminHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-1 text-ink-3">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}
