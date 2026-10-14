import type { FooterColumn } from "@/components/ui/halftone-wordmark-footer";
import { categoryHref, categoryTree, getCategories, getSettings } from "@/lib/store-data";
import { ZetraFooter } from "./zetra-footer";

export async function Footer() {
  const [settings, all] = await Promise.all([getSettings(), getCategories()]);

  const shop: FooterColumn = {
    title: "Shop",
    links: [...categoryTree(all).map((c) => ({ label: c.name, href: categoryHref(c.name) })), { label: "All parts", href: "/products" }],
  };
  const help: FooterColumn = {
    title: "Help",
    links: [
      { label: "Track an order", href: "/track-order" },
      { label: "Help center", href: "/help" },
      { label: "Contact us", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  };

  // Contact details render only when the store has saved them; otherwise the account links take the slot.
  const contactLinks = [
    settings.STORE_PHONE && { label: settings.STORE_PHONE, href: `tel:${settings.STORE_PHONE.replace(/\s+/g, "")}` },
    settings.STORE_EMAIL && { label: settings.STORE_EMAIL, href: `mailto:${settings.STORE_EMAIL}` },
    settings.SOCIAL_INSTAGRAM && { label: "Instagram", href: settings.SOCIAL_INSTAGRAM },
    settings.SOCIAL_TWITTER && { label: "X (Twitter)", href: settings.SOCIAL_TWITTER },
    settings.SOCIAL_LINKEDIN && { label: "LinkedIn", href: settings.SOCIAL_LINKEDIN },
  ].filter(Boolean) as { label: string; href: string }[];

  const third: FooterColumn = contactLinks.length
    ? { title: "Reach us", links: contactLinks }
    : {
        title: "Account",
        links: [
          { label: "Sign in", href: "/login" },
          { label: "Your orders", href: "/track-order" },
          { label: "Cart", href: "/cart" },
        ],
      };

  return <ZetraFooter columns={[shop, help, third]} year={new Date().getFullYear()} />;
}
