"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, CreditCard, MessageCircle, Package, RotateCcw, Search, Truck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

const topics = [
  { icon: Package, title: "Orders", desc: "Track and view your orders", href: "/track-order" },
  { icon: Truck, title: "Shipping", desc: "Delivery times and methods", href: "#faq" },
  { icon: RotateCcw, title: "Returns", desc: "Return policy and refunds", href: "#faq" },
  { icon: CreditCard, title: "Payments", desc: "Payment methods and security", href: "#faq" },
];

const faqs = [
  {
    question: "How do I track my order?",
    answer:
      "Sign in and open Track order (also under your account menu). Every order shows its status, a tracking link once it ships, and a download for the GST invoice. Your order number is also in your confirmation email.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit/debit cards (Visa, MasterCard), UPI, Net Banking, and Cash on Delivery (COD) for eligible locations.",
  },
  {
    question: "Do you offer international shipping?",
    answer: "Currently, we only ship within India. We are working on expanding our services to international locations soon.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 7-day return policy for defective or damaged items. Sensitive electronic components (like ICs) may not be returnable if the seal is broken.",
  },
];

export default function HelpPage() {
  const [q, setQ] = useState("");
  const shown = faqs.filter((f) => (f.question + " " + f.answer).toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="mx-auto grid max-w-4xl gap-10 pb-16">
      <header className="glass glass-regular grid gap-5 rounded-[2.25rem] px-6 py-10 text-center sm:px-12 sm:py-14">
        <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">How can we help?</h1>
        <p className="text-ink-2">Search the common questions below, or send us a message.</p>
        <div className="glass glass-thick mx-auto flex h-14 w-full max-w-xl items-center gap-3 rounded-full px-5">
          <Search className="size-5 text-ink-3" aria-hidden />
          <label htmlFor="help-search" className="sr-only">
            Search help
          </label>
          <input
            id="help-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search help, for example “returns”"
            className="min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-3 focus:outline-none"
          />
        </div>
      </header>

      <nav aria-label="Help topics">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {topics.map((t) => (
            <li key={t.title}>
              <Link href={t.href} className="glass glass-thin glass-lift flex h-full flex-col gap-3 rounded-[var(--radius-tile)] p-5">
                <t.icon className="size-6 text-brand" aria-hidden />
                <span>
                  <span className="block font-semibold text-ink">{t.title}</span>
                  <span className="text-sm text-ink-3">{t.desc}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-28">
        <h2 id="faq-title" className="mb-4 text-2xl font-bold text-ink">
          Common questions
        </h2>
        {shown.length ? (
          <div className="grid gap-3">
            {shown.map((f) => (
              <details key={f.question} className="glass glass-regular group rounded-[var(--radius-tile)] open:glass-thick">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <ChevronDown className="size-5 shrink-0 text-ink-3 transition-transform duration-300 group-open:rotate-180" aria-hidden />
                </summary>
                <p className="max-w-[68ch] px-5 pb-5 leading-relaxed text-ink-2">{f.answer}</p>
              </details>
            ))}
          </div>
        ) : (
          <EmptyState icon={Search} title={`Nothing matches “${q}”`} body="Try another word, or ask us directly." />
        )}
      </section>

      <section className="glass glass-thick flex flex-col items-start gap-4 rounded-[var(--radius-pane)] p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Still stuck?</h2>
          <p className="mt-1 text-ink-2">Send a message and we’ll reply by email.</p>
        </div>
        <ButtonLink href="/contact" size="lg">
          <MessageCircle className="size-5" aria-hidden />
          Contact us
        </ButtonLink>
      </section>
    </div>
  );
}
