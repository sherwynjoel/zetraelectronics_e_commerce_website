"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CreditCard, Lock, MapPin, ShoppingBag, UserRound } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useCartStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { calcTotals, useCheckoutSettings } from "@/lib/checkout";
import { useMounted } from "@/lib/use-mounted";
import { formatINR } from "@/lib/format";
import { OrderSummary } from "@/components/checkout/order-summary";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TextField } from "@/components/ui/field";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Form = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  paymentMethod: string;
};

type PlacedOrder = { id: number; total: number; razorpayOrderId?: string };

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const router = useRouter();
  const mounted = useMounted();
  const settings = useCheckoutSettings();

  const [step, setStep] = useState<"address" | "review">("address");
  const [loading, setLoading] = useState(false);
  const [pinLookup, setPinLookup] = useState<{ zip: string; result: "found" | "unknown" } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [form, setForm] = useState<Form>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    paymentMethod: "razorpay",
  });

  // PIN code lookup fills city and state
  useEffect(() => {
    const zip = form.zip;
    if (zip.length !== 6) return;
    fetch(`https://api.postalpincode.in/pincode/${zip}`)
      .then((r) => r.json())
      .then((data) => {
        if (data[0]?.Status === "Success") {
          const po = data[0].PostOffice[0];
          setForm((f) => ({ ...f, city: po.District, state: po.State }));
          setPinLookup({ zip, result: "found" });
        } else setPinLookup({ zip, result: "unknown" });
      })
      .catch(() => setPinLookup({ zip, result: "unknown" }));
  }, [form.zip]);
  const pinState = form.zip.length !== 6 ? "idle" : pinLookup?.zip === form.zip ? pinLookup.result : "checking";

  const change = (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (!mounted) {
    return (
      <div className="mx-auto grid max-w-[1280px] gap-4 pb-16 lg:grid-cols-[1fr_24rem]">
        <Skeleton className="h-[28rem]" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (items.length === 0 && !placed) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <EmptyState
          headingLevel="h1"
          icon={ShoppingBag}
          title="Your cart is empty"
          body="Add parts to your cart before checking out."
          action={<ButtonLink href="/products">Browse parts</ButtonLink>}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <EmptyState
          headingLevel="h1"
          icon={UserRound}
          title="Sign in to check out"
          body="Your order, invoice and tracking live in your account. It takes under a minute."
          action={
            <>
              <ButtonLink href="/login?next=/checkout">Sign in</ButtonLink>
              <ButtonLink href="/register?next=/checkout" variant="glass">
                Create account
              </ButtonLink>
            </>
          }
        />
      </div>
    );
  }

  const totals = calcTotals(items, settings);
  const count = items.reduce((a, i) => a + i.quantity, 0);
  const fullName = `${form.firstName} ${form.lastName}`.trim();

  const fail = (title: string, detail?: string) => {
    setError(detail ? `${title}. ${detail}` : title);
    toast.error(title, detail);
    setLoading(false);
  };

  const openRazorpay = (order: PlacedOrder) => {
    const Razorpay = (window as unknown as { Razorpay?: new (o: unknown) => { on(e: string, cb: (r: { error: { description: string } }) => void): void; open(): void } }).Razorpay;
    if (!Razorpay) return fail("Payment window could not load", "Check your connection and try again.");
    const rzp = new Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: Math.round(order.total * 100),
      currency: "INR",
      name: "Zetra Electronics",
      description: `Payment for Order #${order.id}`,
      order_id: order.razorpayOrderId,
      handler: async (response: { razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          const verifyRes = await fetch(`${API_URL}/orders/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              orderId: order.razorpayOrderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (verifyRes.ok) {
            clearCart();
            router.push(`/checkout/success?orderId=${order.id}`);
          } else fail("We couldn’t confirm your payment", "If money left your account, contact us with your order number.");
        } catch {
          fail("We couldn’t confirm your payment", "Check your connection, then contact us with your order number.");
        }
      },
      prefill: { name: fullName, email: user.email },
      theme: { color: "#1653a6" },
      modal: { ondismiss: () => setLoading(false) },
    });
    rzp.on("payment.failed", (r) => fail("Payment failed", r.error.description));
    rzp.open();
  };

  const placeOrder = async () => {
    setError(null);
    setLoading(true);
    if (placed?.razorpayOrderId) return openRazorpay(placed);

    const orderData = {
      items: items.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price })),
      total: totals.total,
      userId: user.id,
      address: { name: fullName, phone: form.phone, street: form.address, city: form.city, state: form.state, zip: form.zip },
      paymentMethod: form.paymentMethod,
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return fail("Order could not be placed", err.message || "Please try again.");
      }
      const order: PlacedOrder = await res.json();
      if (order.razorpayOrderId) {
        setPlaced(order);
        openRazorpay(order);
      } else {
        clearCart();
        router.push(`/checkout/success?orderId=${order.id}`);
      }
    } catch {
      fail("Order could not be placed", "Check your network connection and try again.");
    }
  };

  const steps = [
    { id: "address", label: "Address", icon: MapPin },
    { id: "review", label: "Review & pay", icon: CreditCard },
  ] as const;

  return (
    <div className="mx-auto max-w-[1280px] pb-16">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <Link href="/cart" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-brand">
        <ArrowLeft className="size-4" aria-hidden />
        Back to cart
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
        <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">Checkout</h1>
        <ol className="glass glass-thin flex rounded-full p-1 text-sm font-semibold" aria-label="Checkout steps">
          {steps.map((s) => {
            const active = step === s.id;
            return (
              <li
                key={s.id}
                aria-current={active ? "step" : undefined}
                className={cn("flex items-center gap-2 rounded-full px-4 py-2 transition-colors", active ? "bg-brand text-brand-ink" : "text-ink-3")}
              >
                <s.icon className="size-4" aria-hidden />
                {s.label}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="grid gap-4">
          {error && (
            <div role="alert" className="glass glass-thick flex items-start gap-3 rounded-[var(--radius-tile)] border border-danger/30 bg-danger-soft p-4 text-sm">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
              <p className="text-ink">{error}</p>
            </div>
          )}

          {step === "address" ? (
            <form
              className="glass glass-thick grid gap-5 rounded-[var(--radius-pane)] p-6 sm:p-8"
              onSubmit={(e) => {
                e.preventDefault();
                setStep("review");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
                <MapPin className="size-5 text-brand" aria-hidden />
                Where should we ship?
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="First name" name="firstName" required autoComplete="given-name" value={form.firstName} onChange={change} />
                <TextField label="Last name" name="lastName" required autoComplete="family-name" value={form.lastName} onChange={change} />
                <TextField
                  className="sm:col-span-2"
                  label="Mobile number"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  title="10-digit Indian mobile number"
                  hint="10 digits, for delivery updates"
                  autoComplete="tel-national"
                  value={form.phone}
                  onChange={change}
                />
                <TextField
                  className="sm:col-span-2"
                  label="Street address"
                  name="address"
                  required
                  placeholder="House or flat number, street, area"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={change}
                />
                <TextField
                  label="PIN code"
                  name="zip"
                  inputMode="numeric"
                  required
                  maxLength={6}
                  pattern="[1-9][0-9]{5}"
                  title="6-digit PIN code"
                  autoComplete="postal-code"
                  value={form.zip}
                  onChange={change}
                  hint={pinState === "checking" ? "Checking PIN code…" : pinState === "found" ? "City and state filled in" : undefined}
                  error={pinState === "unknown" ? "We couldn’t find this PIN code. Check it, or fill in city and state." : undefined}
                />
                <TextField label="City" name="city" required autoComplete="address-level2" value={form.city} onChange={change} />
                <TextField className="sm:col-span-2" label="State" name="state" required autoComplete="address-level1" value={form.state} onChange={change} />
              </div>
              <Button type="submit" size="lg" className="h-13 sm:justify-self-end">
                Continue to review
              </Button>
            </form>
          ) : (
            <section aria-labelledby="review-title" className="glass glass-thick grid gap-6 rounded-[var(--radius-pane)] p-6 sm:p-8">
              <h2 id="review-title" className="text-xl font-bold text-ink">
                Review your order
              </h2>
              <div className="flex items-start justify-between gap-4 rounded-[var(--radius-tile)] bg-brand-soft p-4">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
                  <address className="not-italic leading-relaxed text-ink-2">
                    <span className="block font-semibold text-ink">{fullName}</span>
                    <span className="tabular block">{form.phone}</span>
                    {form.address}
                    <br />
                    {form.city}, {form.state} <span className="tabular font-semibold text-ink">{form.zip}</span>
                  </address>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep("address")} disabled={loading}>
                  Edit
                </Button>
              </div>
              <ul className="grid divide-y divide-line" aria-label="Parts in this order">
                {items.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 py-3">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[var(--plate)]">
                      <ProductImage src={i.image} alt="" sizes="56px" className="p-1.5 mix-blend-multiply" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{i.name}</span>
                      <span className="tabular text-xs text-ink-3">
                        {i.quantity} × {formatINR(i.price)}
                      </span>
                    </span>
                    <span className="tabular text-sm font-bold text-ink">{formatINR(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="h-13" onClick={placeOrder} loading={loading}>
                <Lock className="size-4" aria-hidden />
                {placed ? "Try payment again" : `Pay ${formatINR(totals.total)}`}
              </Button>
              <p className="-mt-2 text-center text-xs text-ink-3">Payments are processed securely by Razorpay. You’ll get a GST invoice by email.</p>
            </section>
          )}
        </div>

        <OrderSummary totals={totals} taxRate={settings.taxRate} itemCount={count} className="lg:sticky lg:top-28" />
      </div>
    </div>
  );
}
