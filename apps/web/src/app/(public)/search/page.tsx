import type { Metadata } from "next";
import { API_URL } from "@/lib/api";
import type { Product } from "@/lib/types";
import { SearchBox } from "@/components/layout/search-box";
import { CatalogGrid } from "@/components/catalog-grid";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Search", robots: { index: false } };
export const dynamic = "force-dynamic";

async function search(q: string): Promise<Product[]> {
  if (!q) return [];
  try {
    const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(q)}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  const results = await search(q);

  return (
    <div className="mx-auto grid max-w-[1280px] gap-8 pb-16">
      <header className="grid gap-5">
        <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">
          {q ? <>Results for “{q}”</> : "Search parts"}
        </h1>
        <SearchBox key={q} variant="hero" initialQuery={q} className="max-w-2xl" />
        {q && (
          <p className="text-sm text-ink-3" aria-live="polite">
            {results.length} {results.length === 1 ? "part" : "parts"} found
          </p>
        )}
      </header>
      {q ? (
        <CatalogGrid
          products={results}
          empty={{
            title: `No parts match “${q}”`,
            body: "Check the spelling, try the part family (for example “sensor”), or browse the full catalog.",
            action: (
              <ButtonLink href="/products" variant="glass">
                Browse all parts
              </ButtonLink>
            ),
          }}
        />
      ) : (
        <p className="text-ink-2">Type a part name, number or family above.</p>
      )}
    </div>
  );
}
