"use client";

import { SearchBox } from "./search-box";

export function HeroSearchBar({ className }: { className?: string }) {
  return <SearchBox variant="hero" className={className} />;
}
