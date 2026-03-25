"use client";

import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function ClientAuthButtons() {
    const { user, logout } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="default" className="gap-2 w-full flex justify-center">
                <User className="h-4 w-4" />
                <span>...</span>
            </Button>
        );
    }

    if (user) {
        return (
            <div className="flex items-center justify-between w-full">
                <Link href="/profile" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Hi, {user.name}</span>
                </Link>
                <div className="flex items-center gap-2">
                    {user.role === 'ADMIN' && (
                        <Link href="/admin">
                            <Button variant="outline" size="sm">Admin</Button>
                        </Link>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout" className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
                        <LogOut className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Link href="/login" className="w-full">
            <Button variant="default" className="gap-2 w-full flex justify-center">
                <User className="h-4 w-4" />
                <span>Login</span>
            </Button>
        </Link>
    );
}
