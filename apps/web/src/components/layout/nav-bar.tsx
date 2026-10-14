"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { Category } from "@/lib/store-data";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SearchBox } from "./search-box";
import { CategoryMenu } from "./category-menu";
import { AccountMenu } from "./account-menu";
import { CartLink } from "./cart-link";
import { MobileTabBar } from "./mobile-tab-bar";

function Brand() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2 rounded-full pr-2" aria-label="Zetra Electronics home">
      <span className="relative size-11 overflow-hidden rounded-full bg-logo shadow-[0_2px_8px_rgba(11,26,51,.12)]">
        <Image src="/logo.png" alt="" fill sizes="44px" className="scale-[1.35] object-contain" priority />
      </span>
      <span className="hidden text-[17px] font-extrabold tracking-tight text-ink sm:block">
        Zetra<span className="font-semibold text-ink-3"> Electronics</span>
      </span>
    </Link>
  );
}

export function NavBar({ categories }: { categories: Category[] }) {
  const [searching, setSearching] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 lg:px-6 lg:pt-4">
        <div className="glass glass-thin mx-auto flex h-16 max-w-[1280px] items-center gap-2 rounded-full pl-2.5 pr-2.5 lg:gap-3 lg:pl-3">
          {searching ? (
            <div className="flex flex-1 items-center gap-2 lg:hidden">
              <SearchBox autoFocus onNavigate={() => setSearching(false)} className="flex-1" />
              <button
                type="button"
                onClick={() => setSearching(false)}
                aria-label="Close search"
                className="grid size-10 shrink-0 place-items-center rounded-full text-ink-2 hover:text-ink"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
          ) : (
            <>
              <Brand />
              <nav aria-label="Catalog" className="hidden lg:block">
                <CategoryMenu categories={categories} />
              </nav>
              <SearchBox className="hidden flex-1 lg:block lg:max-w-xl xl:max-w-2xl" />
              <div className="flex flex-1 items-center justify-end gap-2 lg:flex-none">
                <button
                  type="button"
                  onClick={() => setSearching(true)}
                  aria-label="Search parts"
                  className="glass glass-thin grid size-10 place-items-center rounded-full text-ink-2 hover:text-ink lg:hidden"
                >
                  <Search className="size-[18px]" aria-hidden />
                </button>
                <ThemeToggle />
                <CartLink className="hidden lg:grid" />
                <span className="hidden lg:block">
                  <AccountMenu />
                </span>
              </div>
            </>
          )}
        </div>
      </header>
      <MobileTabBar />
    </>
  );
}
