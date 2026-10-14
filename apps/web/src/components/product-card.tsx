import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart";
import { ProductImage } from "@/components/ui/product-image";
import { StockPill } from "@/components/ui/stock-pill";
import { Price } from "@/components/ui/price";

type CardProduct = {
  id: number;
  name: string;
  price: number | string;
  stock: number;
  category: string;
  image?: string | null;
  shippingCost?: number;
};

export function ProductCard({ product, priority }: { product: CardProduct; priority?: boolean }) {
  const href = `/products/${product.id}`;
  return (
    <article className="glass glass-regular glass-lift group relative flex flex-col rounded-[var(--radius-tile)] p-2.5">
      <div className="relative aspect-square overflow-hidden rounded-[calc(var(--radius-tile)-0.4rem)] bg-[var(--glass-solid)]">
        <ProductImage
          src={product.image}
          alt={product.name}
          priority={priority}
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
          className="p-4 mix-blend-multiply transition-transform duration-700 ease-[var(--ease-liquid)] group-hover:scale-[1.04] dark:mix-blend-normal motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 px-1.5 pb-1 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <p className="truncate text-xs font-medium text-ink-3">{product.category}</p>
          <StockPill stock={product.stock} />
        </div>
        <h3 className="line-clamp-2 min-h-[2.6em] text-[15px] font-semibold leading-snug text-ink">
          <Link href={href} className="after:absolute after:inset-0 after:rounded-[var(--radius-tile)] focus:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-brand">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <Price value={Number(product.price)} size="lg" />
          <span className="relative z-10">
            <AddToCartButton product={{ ...product, price: Number(product.price) }} size="icon" />
          </span>
        </div>
      </div>
    </article>
  );
}
