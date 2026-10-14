export type Tone = "neutral" | "brand" | "ok" | "warn" | "danger";

const map: Record<string, Tone> = {
  PENDING: "warn",
  PAID: "brand",
  PROCESSING: "brand",
  SHIPPED: "brand",
  DELIVERED: "ok",
  CANCELLED: "danger",
};

export function statusTone(status: string): Tone {
  return map[status?.toUpperCase()] ?? "neutral";
}
