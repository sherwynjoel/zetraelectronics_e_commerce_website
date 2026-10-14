import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileDown, FileText, ReceiptIndianRupee, ShieldCheck, Truck } from "lucide-react";
import { API_URL } from "@/lib/api";
import { formatImageUrl } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import { categoryHref } from "@/lib/store-data";
import { ProductStage } from "@/components/product/product-stage";
import { BuyBox } from "@/components/product/buy-box";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { StockPill } from "@/components/ui/stock-pill";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  shippingCost: string | number;
  stock: number;
  category: string;
  image: string | null;
  datasheet?: string | null;
  specs?: string | null;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product Not Found" };
  const imageUrl = product.image?.startsWith("http") ? product.image : `https://zetraelectronics.com${product.image}`;
  return {
    title: product.name,
    description: product.description?.slice(0, 160) || `Buy ${product.name} online at Zetra Electronics. Best price in India.`,
    keywords: [product.name, product.category, "buy online India", "Zetra Electronics"],
    openGraph: {
      title: `${product.name} | Zetra Electronics`,
      description: product.description?.slice(0, 160) || `Buy ${product.name} at best price in India.`,
      images: [{ url: imageUrl, alt: product.name }],
      type: "website",
    },
    alternates: { canonical: `https://zetraelectronics.com/products/${id}` },
  };
}

function parseSpecs(raw?: string | null): [string, string][] {
  if (!raw) return [];
  try {
    const obj = JSON.parse(raw);
    return Object.entries(obj).map(([k, v]) => [k, String(v)]);
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <EmptyState
          headingLevel="h1"
          title="We couldn’t find that part"
          body="It may have been removed or the link is wrong. Search the catalog for it instead."
          action={<ButtonLink href="/products">Browse all parts</ButtonLink>}
        />
      </div>
    );
  }

  const price = Number(product.price);
  const shipping = Number(product.shippingCost);
  const specs = parseSpecs(product.specs);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image ? formatImageUrl(product.image) : undefined,
    sku: product.id.toString().padStart(6, "0"),
    brand: { "@type": "Brand", name: "Zetra Electronics" },
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: "INR",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Zetra Electronics" },
    },
  };

  return (
    <div className="mx-auto max-w-[1280px] pb-32 lg:pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-3">
          <li>
            <Link href="/" className="hover:text-brand">
              Home
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden />
          <li>
            <Link href={categoryHref(product.category)} className="hover:text-brand">
              {product.category}
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden />
          <li aria-current="page" className="max-w-[60vw] truncate text-ink-2">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-10">
        <ProductStage src={product.image} alt={product.name} />

        <section aria-labelledby="product-title" className="glass glass-thick grid gap-6 rounded-[var(--radius-pane)] p-6 sm:p-8 lg:sticky lg:top-28">
          <div className="grid gap-3">
            <StockPill stock={product.stock} />
            <h1 id="product-title" className="text-3xl font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-4xl">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
              <Price value={price} size="xl" />
              <span className="pb-1.5 text-sm text-ink-3">incl. GST</span>
            </div>
            <p className="text-sm text-ink-2">
              {shipping > 0 ? `+ ${formatINR(shipping)} shipping per unit` : "Free shipping on this part"}
            </p>
          </div>

          <BuyBox
            product={{ id: product.id, name: product.name, price, stock: product.stock, image: product.image, shippingCost: shipping }}
          />

          <ul className="grid gap-2.5 border-t border-line pt-5 text-sm text-ink-2">
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="size-[18px] text-brand" aria-hidden /> Genuine, tested before dispatch
            </li>
            <li className="flex items-center gap-2.5">
              <Truck className="size-[18px] text-brand" aria-hidden /> Ships across India
            </li>
            <li className="flex items-center gap-2.5">
              <ReceiptIndianRupee className="size-[18px] text-brand" aria-hidden /> GST invoice with your order
            </li>
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:mt-10 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <section aria-labelledby="specs-title" className="glass glass-regular rounded-[var(--radius-pane)] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="specs-title" className="text-xl font-bold text-ink">
              Specifications
            </h2>
            {product.datasheet && (
              <ButtonLink href={formatImageUrl(product.datasheet) || product.datasheet} target="_blank" rel="noopener noreferrer" variant="glass" size="sm" className="rounded-full">
                <FileDown className="size-4" aria-hidden />
                Datasheet (PDF)
              </ButtonLink>
            )}
          </div>
          {specs.length ? (
            <dl className="mt-5 grid divide-y divide-line">
              {specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-4 py-3">
                  <dt className="text-sm text-ink-3">{k}</dt>
                  <dd className="tabular font-mono text-sm text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 flex items-center gap-2 text-sm text-ink-3">
              <FileText className="size-4" aria-hidden /> Detailed specifications for this part are on the way.
            </p>
          )}
        </section>

        {product.description && (
          <section aria-labelledby="about-title" className="glass glass-regular rounded-[var(--radius-pane)] p-6 sm:p-8">
            <h2 id="about-title" className="text-xl font-bold text-ink">
              About this part
            </h2>
            <p className="mt-4 max-w-[68ch] whitespace-pre-line leading-relaxed text-ink-2">{product.description}</p>
          </section>
        )}
      </div>
    </div>
  );
}
