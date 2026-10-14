import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Cpu, FileText, MessageCircle, ReceiptIndianRupee, ShieldCheck, Truck } from "lucide-react";
import { API_URL } from "@/lib/api";
import type { Product } from "@/lib/types";
import { categoryHref, categoryTree, getCategories, getSettings } from "@/lib/store-data";
import { ProductCard } from "@/components/product-card";
import { HeroSearchBar } from "@/components/layout/HeroSearchBar";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductImage } from "@/components/ui/product-image";
import { StockPill } from "@/components/ui/stock-pill";
import { formatINR } from "@/lib/format";
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

const tilt = ["lg:rotate-[-4deg] lg:translate-x-2", "lg:rotate-[3deg] lg:-translate-x-3", "lg:rotate-[-1.5deg] lg:translate-x-4"];

export default async function Home() {
  const [products, settings, all] = await Promise.all([getProducts(), getSettings(0), getCategories(0)]);
  const categories = categoryTree(all);
  const bench = products.slice(0, 3);
  const subtext =
    settings.HOME_HERO_SUBTEXT ||
    "Sensors, development boards, IoT modules and robotics parts for makers and students across India. Every part ships genuine and tested, with its datasheet and a GST invoice.";

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zetra Electronics",
    url: "https://zetraelectronics.com",
    logo: "https://zetraelectronics.com/logo.png",
    description: "Electrify Your Needs With Us. Genuine, tested electronic components with datasheets and a GST invoice, shipped across India.",
    contactPoint: { "@type": "ContactPoint", contactType: "customer service", areaServed: "IN" },
  };

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-16 pb-16 lg:gap-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\u003c") }} />

      {/* First viewport: the search is the primary action; the bench shows real parts in stock */}
      <section aria-labelledby="hero-title" className="glass glass-regular relative overflow-hidden rounded-[2.25rem] px-5 py-10 sm:px-10 lg:px-14 lg:py-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
          <div className="rise-in">
            <h1 id="hero-title" className="text-[2.6rem] font-extrabold leading-[0.98] tracking-[-0.04em] text-ink sm:text-6xl lg:text-[5.25rem]">
              Parts for what you’re building next.
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-2">{subtext}</p>
            <HeroSearchBar className="mt-8 max-w-[36rem]" />
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <ButtonLink href="/products" variant="glass" size="md" className="rounded-full">
                Browse all parts
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              {categories.slice(0, 3).map((c) => (
                <Link key={c.id} href={categoryHref(c.name)} className="text-sm font-semibold text-ink-2 underline decoration-line hover:text-brand hover:decoration-brand">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
          {settings.HOME_HERO_IMAGE && (
            <div className="glass glass-thick relative aspect-[16/10] overflow-hidden rounded-[1.6rem] p-1.5">
              <div className="relative size-full overflow-hidden rounded-[1.25rem]">
                <Image src={formatImageUrl(settings.HOME_HERO_IMAGE)} alt="" fill priority sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" unoptimized={formatImageUrl(settings.HOME_HERO_IMAGE).startsWith("/uploads")} />
              </div>
            </div>
          )}
          {bench.length > 0 ? (
            <div aria-label="Just added to the store" role="list" className="relative mx-auto grid w-full max-w-sm grid-cols-1 gap-4 lg:max-w-none">
              {bench.map((p, i) => (
                <Link
                  role="listitem"
                  key={p.id}
                  href={`/products/${p.id}`}
                  style={{ animationDelay: `${150 + i * 120}ms` }}
                  className={`glass glass-thick glass-lift rise-in flex items-center gap-4 rounded-[1.4rem] p-3 pr-5 ${tilt[i]} motion-reduce:rotate-0 motion-reduce:translate-x-0`}
                >
                  <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-[var(--plate)]">
                    <ProductImage src={p.image} alt="" sizes="80px" className="p-2 mix-blend-multiply" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-semibold leading-snug text-ink">{p.name}</span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="tabular text-sm font-bold text-ink">{formatINR(Number(p.price))}</span>
                      <StockPill stock={p.stock} />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <ul className="grid gap-3">
              {promises.map(({ icon: Icon, label }) => (
                <li key={label} className="glass glass-thick flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-ink">
                  <Icon className="size-5 text-brand" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          )}
          </div>
        </div>

        {bench.length > 0 && (
          <ul className="mt-12 grid gap-x-6 gap-y-3 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {promises.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-sm font-semibold text-ink-2">
                <Icon className="size-[18px] shrink-0 text-brand" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        )}
      </section>

      {categories.length > 0 && (
        <section aria-labelledby="categories-title">
          <h2 id="categories-title" className="text-2xl font-bold text-ink sm:text-3xl">
            Shop by category
          </h2>
          <ul className="-mx-3 -my-4 mt-1 flex snap-x gap-3 overflow-x-auto px-3 py-4 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
            {categories.map((c) => {
              const names = [c.name, ...(c.children ?? []).map((s) => s.name)];
              const parts = products.filter((p) => names.includes(p.category));
              const cover = parts.find((p) => p.image && p.stock > 0) ?? parts.find((p) => p.image);
              return (
                <li key={c.id} className="shrink-0 snap-start">
                  <Link href={categoryHref(c.name)} className="glass glass-thin glass-lift flex w-44 items-center gap-3 rounded-[var(--radius-tile)] p-2.5 pr-3 lg:w-auto">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-[var(--plate)]">
                      <ProductImage src={cover?.image} alt="" sizes="48px" className="p-1 [&_span]:hidden [&_svg]:size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">{c.name}</span>
                      <span className="block text-xs text-ink-3">{parts.length ? `${parts.length} ${parts.length === 1 ? "part" : "parts"}` : "Coming soon"}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="new-title">
        <div className="flex items-end justify-between gap-4">
          <h2 id="new-title" className="text-2xl font-bold text-ink sm:text-3xl">
            New on the bench
          </h2>
          {products.length > 0 && (
            <Link href="/products" className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
              See all parts
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
        {products.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
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
