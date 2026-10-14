import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { categoryHref, categoryTree, getCategories, getSettings } from "@/lib/store-data";

const linkClass = "text-sm text-ink-2 transition-colors hover:text-brand";

export async function Footer() {
  const [settings, all] = await Promise.all([getSettings(), getCategories()]);
  const shop = categoryTree(all).slice(0, 6);
  const contact = [
    settings.STORE_ADDRESS && { icon: MapPin, label: settings.STORE_ADDRESS, href: undefined },
    settings.STORE_PHONE && { icon: Phone, label: settings.STORE_PHONE, href: `tel:${settings.STORE_PHONE.replace(/\s+/g, "")}` },
    settings.STORE_EMAIL && { icon: Mail, label: settings.STORE_EMAIL, href: `mailto:${settings.STORE_EMAIL}` },
  ].filter(Boolean) as { icon: typeof Mail; label: string; href?: string }[];
  const social = [
    settings.SOCIAL_INSTAGRAM && { icon: Instagram, href: settings.SOCIAL_INSTAGRAM, label: "Instagram" },
    settings.SOCIAL_TWITTER && { icon: Twitter, href: settings.SOCIAL_TWITTER, label: "X (Twitter)" },
    settings.SOCIAL_LINKEDIN && { icon: Linkedin, href: settings.SOCIAL_LINKEDIN, label: "LinkedIn" },
  ].filter(Boolean) as { icon: typeof Mail; href: string; label: string }[];

  return (
    <footer className="px-3 pb-28 pt-10 lg:px-6 lg:pb-6">
      <div className="glass glass-regular mx-auto max-w-[1280px] rounded-[var(--radius-pane)] px-6 py-10 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Zetra Electronics home">
              <span className="relative size-14 overflow-hidden rounded-full bg-logo shadow-[0_2px_10px_rgba(11,26,51,.14)]">
                <Image src="/logo.png" alt="" fill sizes="56px" className="scale-[1.35] object-contain" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-ink">Zetra Electronics</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              Electrify Your Needs With Us. Genuine, tested parts for makers across India, with a datasheet and a GST
              invoice on every order.
            </p>
            {social.length > 0 && (
              <ul className="mt-5 flex gap-2">
                {social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Zetra Electronics on ${s.label}`}
                      className="glass glass-thin grid size-10 place-items-center rounded-full text-ink-2 hover:text-brand"
                    >
                      <s.icon className="size-4" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label="Shop">
            <h2 className="text-sm font-bold text-ink">Shop</h2>
            <ul className="mt-4 grid gap-2.5">
              <li>
                <Link href="/products" className={linkClass}>
                  All parts
                </Link>
              </li>
              {shop.map((c) => (
                <li key={c.id}>
                  <Link href={categoryHref(c.name)} className={linkClass}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help">
            <h2 className="text-sm font-bold text-ink">Help</h2>
            <ul className="mt-4 grid gap-2.5">
              {[
                ["/track-order", "Track an order"],
                ["/help", "Help center"],
                ["/contact", "Contact us"],
                ["/privacy", "Privacy"],
                ["/terms", "Terms"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {contact.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-ink">Reach us</h2>
              <ul className="mt-4 grid gap-3">
                {contact.map((c) => (
                  <li key={c.label} className="flex items-start gap-2.5 text-sm text-ink-2">
                    <c.icon className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    {c.href ? (
                      <a href={c.href} className="break-words hover:text-brand">
                        {c.label}
                      </a>
                    ) : (
                      <span>{c.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Zetra Electronics. All rights reserved.</p>
          <p>
            Powered by{" "}
            <a href="https://thearktech.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-ink-2 hover:text-brand">
              The Ark Tech
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
