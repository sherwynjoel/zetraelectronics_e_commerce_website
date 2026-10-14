import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/store-data";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about parts, shipping or bulk orders? Send Zetra Electronics a message.",
};

export default async function ContactPage() {
  const s = await getSettings(60);
  const methods = [
    s.STORE_PHONE && { icon: Phone, title: "Phone", value: s.STORE_PHONE, href: `tel:${s.STORE_PHONE.replace(/\s+/g, "")}` },
    s.STORE_EMAIL && { icon: Mail, title: "Email", value: s.STORE_EMAIL, href: `mailto:${s.STORE_EMAIL}` },
    s.STORE_ADDRESS && { icon: MapPin, title: "Address", value: s.STORE_ADDRESS, href: undefined },
  ].filter(Boolean) as { icon: typeof Mail; title: string; value: string; href?: string }[];

  return (
    <div className="mx-auto grid max-w-5xl gap-8 pb-16">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">Get in touch</h1>
        <p className="mt-3 text-lg text-ink-2">Questions about a part, shipping or a bulk order? Send us a message and we’ll reply by email.</p>
      </header>

      <div className={methods.length ? "grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start" : "grid"}>
        <section className="glass glass-thick rounded-[var(--radius-pane)] p-6 sm:p-8">
          <ContactForm />
        </section>
        {methods.length > 0 && (
          <ul className="grid gap-3" aria-label="Other ways to reach us">
            {methods.map((m) => (
              <li key={m.title} className="glass glass-regular flex items-start gap-4 rounded-[var(--radius-tile)] p-5">
                <span className="glass glass-thin grid size-11 shrink-0 place-items-center rounded-full text-brand">
                  <m.icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-ink-3">{m.title}</span>
                  {m.href ? (
                    <a href={m.href} className="break-words font-semibold text-ink hover:text-brand">
                      {m.value}
                    </a>
                  ) : (
                    <span className="font-semibold text-ink">{m.value}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
