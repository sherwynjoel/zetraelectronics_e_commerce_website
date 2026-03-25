"use client";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Bell
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter, usePathname } from "next/navigation";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-muted/20 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10 transition-transform">
                <div className="p-4 border-b border-white/10">
                    <Link href="/admin" className="flex items-center">
                        <div className="relative h-12 w-36">
                            <Image
                                src="/logo.png"
                                alt="Zetra Electronics Logo"
                                fill
                                className="object-contain brightness-0 invert"
                            />
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link key={href} href={href}>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start gap-3 hover:bg-white/10 hover:text-white ${isActive ? "bg-white/15 text-white" : "text-slate-300"}`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout at bottom of sidebar */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {user?.name?.charAt(0) || "A"}
                        </div>
                        <div className="text-sm">
                            <div className="font-medium text-white">{user?.name || "Admin"}</div>
                            <div className="text-slate-400 text-xs truncate w-36">{user?.email}</div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 flex flex-col">
                {/* Header */}
                <header className="h-16 border-b bg-background flex items-center justify-between px-8 sticky top-0 z-10">
                    <h1 className="font-semibold text-lg capitalize">
                        {pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
                    </h1>
                    <div className="flex items-center gap-4">
                        <Button size="icon" variant="ghost">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold cursor-pointer">
                            {user?.name?.charAt(0) || "A"}
                        </div>
                    </div>
                </header>

                <div className="p-8 flex-1">
                    {children}
                </div>

                {/* Admin Footer */}
                <footer className="border-t bg-background px-8 py-4 text-xs text-muted-foreground">
                    <div className="flex justify-between items-center">
                        <p>© {new Date().getFullYear()} Zetra Electronics Admin. All rights reserved.</p>
                        <div className="flex gap-4">
                            <span>v1.0.0</span>
                            <span className="text-primary font-medium">System Online</span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
