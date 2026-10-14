"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";
import { AuthCard, FormError, GoogleMark, PasswordField, safeNext } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState("");

  const finish = (data: { user: { role: string } & Record<string, unknown>; access_token: string }) => {
    login(data.user as never, data.access_token);
    router.push(safeNext(next, data.user.role === "ADMIN" ? "/admin" : "/"));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("email");
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Sign-in failed");
      finish(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const google = async () => {
    setBusy("google");
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await fetch(`${API_URL}/auth/google/firebase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google sign-in failed");
      finish(data);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/popup-blocked") setError("Your browser blocked the Google window. Allow pop-ups for this site, then try again.");
      else if (code === "auth/popup-closed-by-user") setError("Google sign-in was cancelled.");
      else if (code !== "auth/cancelled-popup-request") setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(null);
    }
  };

  const nextQuery = next ? `?next=${encodeURIComponent(safeNext(next))}` : "";

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to check out, track orders and download invoices."
      footer={
        <>
          New to Zetra?{" "}
          <Link href={`/register${nextQuery}`} className="font-semibold text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4">
        <FormError>{error}</FormError>
        <TextField label="Email" type="email" name="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField label="Password" name="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <Link href="/forgot-password" className="-mt-1 justify-self-end text-sm font-semibold text-brand hover:underline">
          Forgot password?
        </Link>
        <Button type="submit" size="lg" className="h-12" loading={busy === "email"} disabled={!!busy}>
          Sign in
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs font-semibold text-ink-3">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
      <Button variant="glass" size="lg" className="h-12 w-full" onClick={google} loading={busy === "google"} disabled={!!busy}>
        {busy !== "google" && <GoogleMark />}
        Continue with Google
      </Button>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
