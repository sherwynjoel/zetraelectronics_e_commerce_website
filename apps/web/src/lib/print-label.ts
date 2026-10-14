export type ShippingAddress = { name?: string; phone?: string; street?: string; city?: string; state?: string; zip?: string };

export function parseAddress(raw: unknown): ShippingAddress {
  if (!raw) return {};
  if (typeof raw === "object") return raw as ShippingAddress;
  try {
    return JSON.parse(String(raw));
  } catch {
    return { street: String(raw) };
  }
}

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Opens a printable address label. All customer-entered text is HTML-escaped. Returns false if the pop-up was blocked. */
export function printAddressLabel(order: { id: number; createdAt: string; shippingAddress?: unknown; user?: { name?: string | null } }) {
  const a = parseAddress(order.shippingAddress);
  const id = `#${order.id.toString().padStart(5, "0")}`;
  const name = a.name || order.user?.name || "N/A";
  const cityState = [a.city, a.state].filter(Boolean).join(", ") || "—";
  const win = window.open("", "_blank", "width=420,height=340");
  if (!win) return false;
  win.document.write(`<!DOCTYPE html><html><head><title>Address label ${esc(id)}</title><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;padding:24px;color:#0b1a33}
.label{border:2px dashed #56657f;border-radius:10px;padding:20px 24px;max-width:380px}
.k{font-size:10px;color:#56657f;text-transform:uppercase;letter-spacing:1px}.from{font-size:12px;font-weight:700;margin:4px 0 12px}
.name{font-size:18px;font-weight:700;margin:4px 0}.phone{font-size:14px;margin-bottom:6px}.addr{font-size:13px;line-height:1.6}
.meta{margin-top:12px;font-size:11px;color:#56657f;border-top:1px solid #e2e8f0;padding-top:8px}@media print{body{padding:0}}
</style></head><body><div class="label"><div class="k">From</div><div class="from">Zetra Electronics · zetraelectronics.com</div>
<div class="k">Ship to</div><div class="name">${esc(name)}</div><div class="phone">Phone: ${esc(a.phone || "—")}</div>
<div class="addr">${esc(a.street || "—")}<br/>${esc(cityState)}<br/>PIN: ${esc(a.zip || "—")}</div>
<div class="meta">Order ${esc(id)} · ${esc(new Date(order.createdAt).toLocaleDateString("en-IN"))}</div></div>
<script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script></body></html>`);
  win.document.close();
  return true;
}
