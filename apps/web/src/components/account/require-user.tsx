"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { useMounted } from "@/lib/use-mounted";
import { Skeleton } from "@/components/ui/skeleton";

/** Renders children only for a signed-in user; otherwise sends them to sign in and back. */
export function RequireUser({ next, children }: { next: string; children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const mounted = useMounted();
  const router = useRouter();

  useEffect(() => {
    if (mounted && !user) router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [mounted, user, router, next]);

  if (!mounted || !user)
    return (
      <div className="mx-auto grid max-w-3xl gap-4">
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-48 rounded-[var(--radius-tile)]" />
      </div>
    );
  return <>{children}</>;
}
