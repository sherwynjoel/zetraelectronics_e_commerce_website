"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { AdminHeader } from "@/components/admin/admin-shell";
import { ImageUpload } from "@/components/admin/image-upload";
import { FormError } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { TextField, TextareaField } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

const DEFAULTS: Record<string, string> = {
  GST_PERCENTAGE: "18",
  FREE_SHIPPING_THRESHOLD: "0",
  STORE_PHONE: "",
  STORE_EMAIL: "",
  STORE_ADDRESS: "",
  SOCIAL_INSTAGRAM: "",
  SOCIAL_TWITTER: "",
  SOCIAL_LINKEDIN: "",
  FLAT_SHIPPING_FEE: "0",
  HOME_HERO_IMAGE: "",
  HOME_HERO_SUBTEXT: "",
};

const DESCRIPTIONS: Record<string, string> = {
  GST_PERCENTAGE: "Global GST Percentage",
  FREE_SHIPPING_THRESHOLD: "Minimum order amount for free shipping",
  STORE_PHONE: "Contact phone number displayed to customers",
  STORE_EMAIL: "Support email address",
  STORE_ADDRESS: "Physical Store Address",
  SOCIAL_INSTAGRAM: "Instagram Profile URL",
  SOCIAL_TWITTER: "Twitter/X Profile URL",
  SOCIAL_LINKEDIN: "LinkedIn Company Page URL",
  FLAT_SHIPPING_FEE: "Standard shipping charge when threshold is not met",
  HOME_HERO_IMAGE: "Hero banner image URL for homepage",
  HOME_HERO_SUBTEXT: "Short description text below the hero title",
};

export default function SettingsPage() {
  const { token } = useAuthStore();
  const [s, setS] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { key: string; value: string }[]) => {
        const next = { ...DEFAULTS };
        for (const r of rows) if (r.key in next) next[r.key] = r.value ?? "";
        setS(next);
      })
      .catch(() => setError("Settings couldn’t load. Saving now would overwrite them with defaults."))
      .finally(() => setLoading(false));
  }, []);

  const field = (key: string) => ({ value: s[key], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setS((p) => ({ ...p, [key]: e.target.value })) });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const responses = await Promise.all(
        Object.entries(s).map(([key, value]) =>
          fetch(`${API_URL}/settings/${key}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ value, description: DESCRIPTIONS[key] ?? "" }),
          }),
        ),
      );
      const failed = responses.find((r) => !r.ok);
      if (failed) {
        const data = await failed.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message || `The server returned ${failed.status}`);
      }
      toast.success("Settings saved", "The store updates within a minute.");
    } catch (err) {
      setError(err instanceof Error ? `Save failed: ${err.message}` : "Network error. Settings were not saved.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-[40rem] rounded-[var(--radius-pane)]" />;

  const section = "glass glass-thick grid gap-5 rounded-[var(--radius-pane)] p-5 sm:p-7";

  return (
    <form onSubmit={save} className="mx-auto grid max-w-3xl gap-5 pb-24 lg:pb-0">
      <AdminHeader title="Settings" description="Store details customers see, and how tax and shipping are charged." />
      <FormError>{error}</FormError>

      <section className={section} aria-labelledby="contact-title">
        <div>
          <h2 id="contact-title" className="text-lg font-bold text-ink">
            Store contact
          </h2>
          <p className="mt-1 text-sm text-ink-3">Shown in the footer and on the contact page. Leave a field empty to hide it.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Phone" type="tel" {...field("STORE_PHONE")} />
          <TextField label="Support email" type="email" {...field("STORE_EMAIL")} />
        </div>
        <TextareaField label="Address" rows={3} {...field("STORE_ADDRESS")} />
      </section>

      <section className={section} aria-labelledby="tax-title">
        <div>
          <h2 id="tax-title" className="text-lg font-bold text-ink">
            Tax and shipping
          </h2>
          <p className="mt-1 text-sm text-ink-3">Applied at checkout to every order.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="GST (%)" type="number" min={0} step="0.01" {...field("GST_PERCENTAGE")} />
          <TextField label="Free shipping above (₹)" type="number" min={0} step="0.01" {...field("FREE_SHIPPING_THRESHOLD")} hint="0 turns this off" />
          <TextField label="Flat shipping fee (₹)" type="number" min={0} step="0.01" {...field("FLAT_SHIPPING_FEE")} hint="0 uses each product’s shipping" />
        </div>
      </section>

      <section className={section} aria-labelledby="home-title">
        <div>
          <h2 id="home-title" className="text-lg font-bold text-ink">
            Home page
          </h2>
          <p className="mt-1 text-sm text-ink-3">Leave the text empty to use the default introduction.</p>
        </div>
        <TextareaField label="Introduction under the headline" rows={3} {...field("HOME_HERO_SUBTEXT")} />
        <ImageUpload label="Hero image" value={s.HOME_HERO_IMAGE} onChange={(url) => setS((p) => ({ ...p, HOME_HERO_IMAGE: url }))} />
      </section>

      <section className={section} aria-labelledby="social-title">
        <h2 id="social-title" className="text-lg font-bold text-ink">
          Social links
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Instagram" type="url" placeholder="https://instagram.com/…" {...field("SOCIAL_INSTAGRAM")} />
          <TextField label="X (Twitter)" type="url" placeholder="https://x.com/…" {...field("SOCIAL_TWITTER")} />
          <TextField label="LinkedIn" type="url" placeholder="https://linkedin.com/…" {...field("SOCIAL_LINKEDIN")} />
        </div>
      </section>

      <div className="glass glass-thick fixed inset-x-3 bottom-3 z-20 flex justify-end rounded-full p-2 lg:static lg:inset-auto lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none lg:before:hidden">
        <Button type="submit" loading={saving}>
          Save settings
        </Button>
      </div>
    </form>
  );
}
