"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { API_URL } from "@/lib/api";
import { AuthCard, FormError, PasswordField } from "@/components/auth/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const mismatch = confirm.length > 0 && confirm !== newPassword;

  if (!token) {
    return (
      <AuthCard title="This link isn’t valid" subtitle="The reset link is missing or incomplete.">
        <ButtonLink href="/forgot-password" size="lg" className="h-12 w-full">
          Request a new link
        </ButtonLink>
      </AuthCard>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) return setError("Passwords do not match.");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthCard title="Password updated">
        <div role="status" className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="size-10 text-ok" aria-hidden />
          <p className="text-ink-2">You can sign in with your new password. Taking you to sign in…</p>
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Sign in now
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={submit} className="grid gap-4">
        <FormError>{error}</FormError>
        <PasswordField
          label="New password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={mismatch ? "Passwords do not match" : undefined}
        />
        <Button type="submit" size="lg" className="h-12" loading={loading}>
          Update password
        </Button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
