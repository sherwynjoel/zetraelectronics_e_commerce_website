import { Badge } from "./badge";

function Dot() {
  return <span aria-hidden className="size-1.5 rounded-full bg-current" />;
}

export function StockPill({ stock, lowAt = 5 }: { stock: number; lowAt?: number }) {
  if (stock <= 0)
    return (
      <Badge tone="danger">
        <Dot />
        Out of stock
      </Badge>
    );
  if (stock <= lowAt)
    return (
      <Badge tone="warn">
        <Dot />
        Only {stock} left
      </Badge>
    );
  return (
    <Badge tone="ok">
      <Dot />
      In stock
    </Badge>
  );
}
