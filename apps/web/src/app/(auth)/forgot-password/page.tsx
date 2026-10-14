"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { API_URL } from "@/lib/api";
import { AuthCard, FormError } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      Remember it?{" "}
      <Link href="/login" className="font-semibold text-brand hover:underline">
        Back to sign in
      </Link>
    </>
  );

  if (sent) {
    return (
      <AuthCard title="Check your inbox" footer={footer}>
        <div role="status" className="flex flex-col items-center gap-3 text-center">
          <MailCheck className="size-10 text-ok" aria-hidden />
          <p className="text-ink-2">
            If an account exists for <strong className="text-ink">{email}</strong>, we’ve sent a link to reset your password. It expires in one hour.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" subtitle="Enter your account email and we’ll send you a reset link." footer={footer}>
      <form onSubmit={submit} className="grid gap-4">
        <FormError>{error}</FormError>
        <TextField label="Email" type="email" name="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" size="lg" className="h-12" loading={loading}>
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}
