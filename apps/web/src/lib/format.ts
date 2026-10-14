const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const day = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export function formatINR(value: number): string {
  return inr.format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value: string | Date): string {
  return day.format(typeof value === "string" ? new Date(value) : value);
}
