import { API_URL } from "@/lib/api";

/** Downloads the order invoice PDF. Throws on failure so callers can show a toast. */
export async function downloadInvoice(orderId: number | string, token: string) {
  const res = await fetch(`${API_URL}/orders/${orderId}/invoice`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Invoice download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${orderId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
