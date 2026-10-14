"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { API_URL } from "@/lib/api";
import { FormError } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { TextField, TextareaField } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

const empty = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setForm(empty);
      toast.success("Message sent", "We’ll reply by email.");
    } catch {
      setError("Your message couldn’t be sent. Please try again in a moment.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-10 text-center">
        <CheckCircle2 className="size-12 text-ok" aria-hidden />
        <h2 className="text-xl font-bold text-ink">Thanks, your message is on its way</h2>
        <p className="text-ink-2">We’ll reply to the email you gave us.</p>
        <Button variant="glass" onClick={() => setSent(false)} className="mt-2">
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <h2 className="text-xl font-bold text-ink">Send us a message</h2>
      <FormError>{error}</FormError>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Your name" name="name" autoComplete="name" required value={form.name} onChange={change} />
        <TextField label="Email" type="email" name="email" autoComplete="email" required value={form.email} onChange={change} />
      </div>
      <TextField label="Subject" name="subject" value={form.subject} onChange={change} hint="Optional, for example a part number" />
      <TextareaField label="Message" name="message" required rows={6} value={form.message} onChange={change} />
      <Button type="submit" size="lg" className="h-12 sm:justify-self-end" loading={sending}>
        <Send className="size-4" aria-hidden />
        Send message
      </Button>
    </form>
  );
}
