"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

export type CheckoutSettings = { taxRate: number; freeShippingThreshold: number; flatShippingFee: number };
export const defaultCheckoutSettings: CheckoutSettings = { taxRate: 0.18, freeShippingThreshold: 0, flatShippingFee: 0 };

export function parseCheckoutSettings(rows: { key: string; value: string }[]): CheckoutSettings {
  const get = (k: string) => rows.find((r) => r.key === k)?.value;
  const gst = get("GST_PERCENTAGE");
  const free = get("FREE_SHIPPING_THRESHOLD");
  const flat = get("FLAT_SHIPPING_FEE");
  return {
    taxRate: gst ? parseFloat(gst) / 100 : defaultCheckoutSettings.taxRate,
    freeShippingThreshold: free ? parseFloat(free) : 0,
    flatShippingFee: flat ? parseFloat(flat) : 0,
  };
}

/** Same rules the checkout always used: per-unit shipping, free above threshold, else flat fee; GST on subtotal + shipping. */
export function calcTotals(items: { price: number; quantity: number; shippingCost: number }[], s: CheckoutSettings) {
  const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
  let shipping = items.reduce((a, i) => a + (i.shippingCost || 0) * i.quantity, 0);
  if (s.freeShippingThreshold > 0 && subtotal >= s.freeShippingThreshold) shipping = 0;
  else if (s.flatShippingFee > 0) shipping = s.flatShippingFee;
  const tax = (subtotal + shipping) * s.taxRate;
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

export function useCheckoutSettings() {
  const [settings, setSettings] = useState<CheckoutSettings>(defaultCheckoutSettings);
  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setSettings(parseCheckoutSettings(rows)))
      .catch(() => {});
  }, []);
  return settings;
}
