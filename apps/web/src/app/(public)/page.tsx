import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Cpu, FileText, MessageCircle, ReceiptIndianRupee, ShieldCheck, Truck } from "lucide-react";
import { API_URL } from "@/lib/api";
import type { Product } from "@/lib/types";
import { categoryHref, categoryTree, getCategories, getSettings } from "@/lib/store-data";
import { ProductCard } from "@/components/product-card";
import { ExpandableGrid } from "@/components/expandable-grid";
import { HeroSpotlight } from "@/components/home/hero-spotlight";
import { pickSpotlight } from "@/lib/spotlight";
import { HeroSearchBar } from "@/components/layout/HeroSearchBar";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductImage } from "@/components/ui/product-image";
import { formatImageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Zetra Electronics | Buy Electronic Components Online India",
  description:
    "Genuine, tested electronic components, sensors, IoT modules, development boards and robotics parts, with datasheets and a GST invoice, shipped across India.",
  alternates: { canonical: "https://zetraelectronics.com" },
  openGraph: {
    title: "Zetra Electronics | Buy Electronic Components Online India",
    description: "Electrify Your Needs With Us. Genuine, tested electronic components with datasheets and a GST invoice, shipped across India.",
    url: "https://zetraelectronics.com",
  },
};

export const dynamic = "force-dynamic";

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const promises = [
  { icon: ShieldCheck, label: "Genuine, tested parts" },
  { icon: Truck, label: "Fast shipping across India" },
  { icon: FileText, label: "Specs and datasheets on every part" },
  { icon: ReceiptIndianRupee, label: "GST invoice with every order" },
];


export default async function Home() {
  const [products, settings, all] = await Promise.all([getProducts(), getSettings(0), getCategories(0)]);
  const categories = categoryTree(all);
  const spotlight = pickSpotlight(products, 5).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    stock: p.stock,
    image: p.image ?? null,
    shippingCost: Number(p.shippingCost ?? 0),
  }));
  const subtext =
    settings.HOME_HERO_SUBTEXT ||
    "Genuine, tested sensors, boards and modules for makers across India, with a datasheet and a GST invoice on every order.";

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zetra Electronics",
    url: "https://zetraelectronics.com",
    logo: "https://zetraelectronics.com/logo-square.png",
    description: "Electrify Your Needs With Us. Genuine, tested electronic components with datasheets and a GST invoice, shipped across India.",
    contactPoint: { "@type": "ContactPoint", contactType: "customer service", areaServed: "IN" },
  };

  // Tells Google the site's name for the search result heading.
  const siteJsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: "Zetra Electronics", url: "https://zetraelectronics.com" };

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-16 pb-16 lg:gap-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, "\u003c") }} />

      {/* First viewport: headline and search on the field; the spotlight shows real parts, large, ready to add to cart */}
      <section aria-labelledby="hero-title" className="grid gap-8 pt-2 lg:pt-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div className="rise-in max-w-xl">
            <h1 id="hero-title" className="text-[2.6rem] font-extrabold leading-[0.98] tracking-[-0.04em] text-ink sm:text-6xl lg:text-[4.6rem]">
              Parts for what you’re building next.
            </h1>
            <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-ink-2">{subtext}</p>
            <HeroSearchBar className="mt-7 max-w-[34rem]" />
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <ButtonLink href="/products" variant="glass" size="md" className="rounded-full">
                Browse all parts
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              {categories.slice(0, 3).map((c) => (
                <Link key={c.id} href={categoryHref(c.name)} className="text-sm font-semibold text-ink-2 underline decoration-line underline-offset-4 hover:text-brand hover:decoration-brand">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {spotlight.length > 0 ? (
            <HeroSpotlight parts={spotlight} />
          ) : settings.HOME_HERO_IMAGE ? (
            <div className="glass glass-thick relative aspect-[4/3] overflow-hidden rounded-[2rem] p-2">
              <div className="relative size-full overflow-hidden rounded-[1.5rem]">
                <Image src={formatImageUrl(settings.HOME_HERO_IMAGE)} alt="" fill priority sizes="(min-width: 1024px) 45vw, 92vw" className="object-cover" unoptimized={formatImageUrl(settings.HOME_HERO_IMAGE).startsWith("/uploads")} />
              </div>
            </div>
          ) : null}
        </div>

        <ul className="glass glass-thin grid gap-x-6 gap-y-3 rounded-[1.5rem] px-5 py-4 sm:grid-cols-2 lg:grid-cols-4 lg:rounded-full lg:px-8">
          {promises.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5 text-sm font-semibold text-ink-2">
              <Icon className="size-[18px] shrink-0 text-brand" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </section>

      {categories.length > 0 && (
        <section aria-labelledby="categories-title">
          <h2 id="categories-title" className="text-2xl font-bold text-ink sm:text-3xl">
            Popular categories
          </h2>
          <div className="mt-6">
            <ExpandableGrid
              noun="categories"
              className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 lg:grid-cols-4"
              items={categories
                .map((c) => {
                  const names = [c.name, ...(c.children ?? []).map((s) => s.name)];
                  const parts = products.filter((p) => names.includes(p.category));
                  return { c, parts, cover: parts.find((p) => p.image && p.stock > 0) ?? parts.find((p) => p.image) };
                })
                // Popular first: categories with the most parts lead.
                .sort((x, y) => y.parts.length - x.parts.length || x.c.name.localeCompare(y.c.name))
                .map(({ c, parts, cover }) => (
                  <Link
                    key={c.id}
                    href={categoryHref(c.name)}
                    className="glass glass-thin glass-lift flex min-w-0 items-center gap-3 rounded-[var(--radius-tile)] p-2.5 pr-3"
                  >
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[var(--plate)]">
                      <ProductImage src={cover?.image} alt="" sizes="56px" className="p-1 [&_span]:hidden [&_svg]:size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-snug text-ink">{c.name}</span>
                      <span className="block text-xs text-ink-3">
                        {parts.length ? `${parts.length} ${parts.length === 1 ? "part" : "parts"}` : "Coming soon"}
                      </span>
                    </span>
                  </Link>
                ))}
            />
          </div>
        </section>
      )}

      <section aria-labelledby="new-title">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <h2 id="new-title" className="text-2xl font-bold text-ink sm:text-3xl">
            Featured products
          </h2>
          {products.length > 0 && (
            <Link href="/products" className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
              Browse the catalog
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
        {products.length > 0 ? (
          <div className="mt-6">
            <ExpandableGrid
              noun="products"
              className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
              items={products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            />
          </div>
        ) : (
          <EmptyState
            className="mt-6"
            icon={Cpu}
            title="The shelves are being stocked"
            body="New parts are being added. Check back soon, or tell us which part you need."
            action={
              <ButtonLink href="/contact" variant="glass">
                Ask for a part
              </ButtonLink>
            }
          />
        )}
      </section>

      <section className="glass glass-thick flex flex-col items-start gap-5 rounded-[var(--radius-pane)] p-8 sm:flex-row sm:items-center sm:justify-between lg:p-10">
        <div>
          <h2 className="text-2xl font-bold text-ink">Can’t find the part you need?</h2>
          <p className="mt-2 max-w-xl text-ink-2">Send us the part number or what you are building. We will tell you if we can source it.</p>
        </div>
        <ButtonLink href="/contact" size="lg" className="shrink-0">
          <MessageCircle className="size-5" aria-hidden />
          Ask us
        </ButtonLink>
      </section>
    </div>
  );
}
