"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { adminSend } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const EMAIL_NOTE: Record<string, string> = {
  SHIPPED: "Saving emails the customer their tracking link.",
  DELIVERED: "Saving emails the customer a delivery confirmation.",
  CANCELLED: "Saving emails the customer that the order was cancelled. Stock is not restored automatically.",
};

export function FulfillOrder({
  orderId,
  currentStatus,
  currentTracking,
  onSaved,
}: {
  orderId: number;
  currentStatus: string;
  currentTracking?: string | null;
  onSaved?(): void;
}) {
  const { token } = useAuthStore();
  const [status, setStatus] = useState(currentStatus);
  const [trackingUrl, setTrackingUrl] = useState(currentTracking ?? "");
  const [saving, setSaving] = useState(false);
  const dirty = status !== currentStatus || trackingUrl !== (currentTracking ?? "");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSend(token, `/orders/${orderId}`, "PATCH", { status, trackingUrl });
      toast.success("Order updated", `#ORD-${orderId} is now ${status.toLowerCase()}`);
      onSaved?.();
    } catch (err) {
      toast.error("Order not updated", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="glass glass-thick grid gap-4 rounded-[var(--radius-pane)] p-5 sm:p-6">
      <h2 className="text-lg font-bold text-ink">Fulfilment</h2>
      <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </SelectField>
      <TextField
        label="Tracking link"
        type="url"
        placeholder="https://…"
        value={trackingUrl}
        onChange={(e) => setTrackingUrl(e.target.value)}
        hint="The courier’s tracking page for this parcel"
      />
      {status !== currentStatus && EMAIL_NOTE[status] && (
        <p className="flex items-start gap-2 rounded-xl bg-brand-soft p-3 text-sm text-ink-2">
          <Mail className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          {EMAIL_NOTE[status]}
        </p>
      )}
      <Button type="submit" loading={saving} disabled={!dirty}>
        Save
      </Button>
    </form>
  );
}
