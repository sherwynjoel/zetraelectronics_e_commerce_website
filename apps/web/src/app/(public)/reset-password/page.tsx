"use client";

import { API_URL } from '@/lib/api';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) setError("Invalid or missing reset token. Please request a new reset link.");
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setIsLoading(true);
        setError("");

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
                    <h2 className="text-3xl font-bold tracking-tight">Set New Password</h2>
                    <p className="text-muted-foreground mt-2">Choose a strong password for your account</p>
                </div>

                {success ? (
                    <div className="text-center space-y-4">
                        <div className="bg-green-50 text-green-700 text-sm p-4 rounded-md border border-green-200">
                            Password updated successfully! Redirecting you to login...
                        </div>
                        <Link href="/login" className="text-sm text-primary hover:underline">
                            Go to login
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
                                <label className="text-sm font-medium leading-none">New Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="At least 8 characters"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Repeat your new password"
                                />
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={isLoading || !token}>
                                {isLoading ? "Updating..." : "Update Password"}
                            </Button>
                        </form>

                        <div className="text-center text-sm text-muted-foreground">
                            <Link href="/forgot-password" className="text-primary hover:underline">
                                Request a new reset link
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
