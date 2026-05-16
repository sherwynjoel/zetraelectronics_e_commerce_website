"use client";

import { API_URL } from '@/lib/api';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Something went wrong");
            }

            setSent(true);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4 bg-muted/20">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Forgot Password</h2>
                    <p className="text-muted-foreground mt-2">
                        Enter your email and we&apos;ll send you a reset link
                    </p>
                </div>

                {sent ? (
                    <div className="text-center space-y-4">
                        <div className="bg-green-50 text-green-700 text-sm p-4 rounded-md border border-green-200">
                            If an account exists for <strong>{email}</strong>, a password reset link has been sent. Check your inbox.
                        </div>
                        <Link href="/login" className="text-sm text-primary hover:underline">
                            Back to login
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Email address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="name@example.com"
                                />
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </form>

                        <div className="text-center text-sm text-muted-foreground">
                            Remember your password?{" "}
                            <Link href="/login" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
