"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, FileDown, Package } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { downloadInvoice } from "@/lib/invoice";
import { Button, ButtonLink } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

function SuccessContent() {
  const orderId = useSearchParams().get("orderId");
  const { token } = useAuthStore();
  const [busy, setBusy] = useState(false);

  const invoice = async () => {
    if (!orderId || !token) return;
    setBusy(true);
    try {
      await downloadInvoice(orderId, token);
    } catch {
      toast.error("Invoice download failed", "Try again from your orders page.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl py-6">
      <section className="glass glass-thick flex flex-col items-center gap-5 rounded-[2.25rem] px-6 py-12 text-center sm:px-12">
        <span className="grid size-20 place-items-center rounded-full bg-ok text-white shadow-[0_14px_30px_-10px_var(--ok)] motion-safe:animate-[toast-in_.7s_var(--ease-spring)] dark:text-bg">
          <Check className="size-10" strokeWidth={3} aria-hidden />
        </span>
        <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">Order confirmed</h1>
        {orderId && (
          <p className="text-ink-2">
            Order <span className="tabular font-mono font-semibold text-ink">#ORD-{orderId}</span> is paid. We’ve emailed your GST invoice and
            will send tracking once it ships.
          </p>
        )}
        <div className="mt-2 grid w-full gap-3 sm:grid-cols-2">
          <ButtonLink href="/track-order" size="lg" className="h-13">
            <Package className="size-5" aria-hidden />
            Track order
          </ButtonLink>
          <Button variant="glass" size="lg" className="h-13" onClick={invoice} loading={busy} disabled={!orderId || !token}>
            <FileDown className="size-5" aria-hidden />
            Invoice (PDF)
          </Button>
        </div>
        <ButtonLink href="/products" variant="link">
          Continue shopping
        </ButtonLink>
      </section>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-ink-3">Loading your order…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
