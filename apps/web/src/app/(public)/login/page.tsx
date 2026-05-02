"use client";

import { API_URL } from '@/lib/api';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const rawText = await res.text();
            let data;
            try {
                data = JSON.parse(rawText);
            } catch (e) {
                console.error("Received non-JSON response:", rawText);
                throw new Error("Server returned an invalid response. Is the backend running on port 4000?");
            }

            if (!res.ok) {
                throw new Error(data.message || "Failed to login");
            }

            login(data.user, data.access_token);

            // Redirect based on role
            if (data.user.role === 'ADMIN') {
                router.push("/admin");
            } else {
                router.push("/");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
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

            if (!res.ok) {
                throw new Error(data.message || "Failed to authenticate with backend");
            }

            login(data.user, data.access_token);

            if (data.user.role === 'ADMIN') {
                router.push("/admin");
            } else {
                router.push("/");
            }
        } catch (err: any) {
            console.error("Google Login Error:", err);
            setError(err.message || "Failed to sign in with Google");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4 bg-muted/20">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
                    <p className="text-muted-foreground mt-2">Sign in to your Zetra Electronics account</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="name@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted-foreground/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    type="button"
                    className="w-full bg-white text-black hover:bg-gray-100 flex items-center gap-2"
                    disabled={isLoading}
                    onClick={handleGoogleLogin}
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Google
                </Button>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <Link href="#" className="hover:text-primary hover:underline">Forgot password?</Link>
                    <Link href="/register" className="hover:text-primary hover:underline">Create account</Link>
                </div>

                {/* Test Account Section for Razorpay/Testing */}
                <div className="mt-8 pt-6 border-t border-dashed">
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Reviewer Test Account</h4>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-mono font-medium">test@zetra.com</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Password:</span>
                                <span className="font-mono font-medium">Zetra@Test123</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-3 italic leading-tight">
                            Use these credentials to test the checkout and Razorpay payment flow.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
