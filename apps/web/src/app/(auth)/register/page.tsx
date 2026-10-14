"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { AuthCard, FormError, PasswordField, safeNext } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

function RegisterForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const change = (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message.join(". ") : data.message || "Registration failed");

      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        login(loginData.user, loginData.access_token);
        router.push(safeNext(next, "/"));
      } else {
        router.push(`/login${next ? `?next=${encodeURIComponent(safeNext(next))}` : ""}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Track orders, download GST invoices and check out faster."
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/login${next ? `?next=${encodeURIComponent(safeNext(next))}` : ""}`} className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4">
        <FormError>{error}</FormError>
        <TextField label="Full name" name="name" autoComplete="name" required value={form.name} onChange={change} />
        <TextField label="Email" type="email" name="email" autoComplete="email" required value={form.email} onChange={change} />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          required
          minLength={6}
          hint="At least 6 characters"
          value={form.password}
          onChange={change}
        />
        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          value={form.confirmPassword}
          onChange={change}
          error={mismatch ? "Passwords do not match" : undefined}
        />
        <Button type="submit" size="lg" className="mt-1 h-12" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
