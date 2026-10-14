import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/** Sign-in and account-recovery pages: no navbar, tab bar or footer, only the task. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-ink"
      >
        Skip to main content
      </a>
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
        <Link
          href="/"
          className="glass glass-thin inline-flex h-10 items-center gap-2 rounded-full pl-3 pr-4 text-sm font-semibold text-ink-2 transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to store
        </Link>
        <ThemeToggle />
      </div>
      <main id="main-content" className="flex-1 px-4 pt-4 sm:px-6">
        {children}
      </main>
    </div>
  );
}
