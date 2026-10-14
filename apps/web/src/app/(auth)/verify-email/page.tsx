"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { API_URL } from "@/lib/api";
import { AuthCard } from "@/components/auth/auth-card";
import { ButtonLink } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function Verify() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "" : "This verification link is missing its code.");

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.message?.includes("successfully")) {
          setStatus("success");
          setMessage(data.message);
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("We couldn’t reach the server. Check your connection and open the link again.");
      });
  }, [token, router]);

  if (status === "loading") {
    return (
      <AuthCard title="Verifying your email">
        <div className="flex justify-center text-brand">
          <Spinner className="size-8" label="Verifying" />
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={status === "success" ? "Email verified" : "Verification failed"}>
      <div role="status" className="flex flex-col items-center gap-4 text-center">
        {status === "success" ? <CheckCircle2 className="size-10 text-ok" aria-hidden /> : <XCircle className="size-10 text-danger" aria-hidden />}
        <p className="text-ink-2">{message}</p>
        {status === "success" ? (
          <p className="text-sm text-ink-3">Taking you to sign in…</p>
        ) : (
          <ButtonLink href="/login" variant="glass">
            Go to sign in
          </ButtonLink>
        )}
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <Verify />
    </Suspense>
  );
}
