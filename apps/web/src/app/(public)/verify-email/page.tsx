"use client";

import { API_URL } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('No verification token found.');
            return;
        }

        fetch(`${API_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.message?.includes('successfully')) {
                    setStatus('success');
                    setMessage(data.message);
                    setTimeout(() => router.push('/login'), 3000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed.');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Something went wrong. Please try again.');
            });
    }, [searchParams, router]);

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4 bg-muted/20">
            <div className="w-full max-w-md text-center bg-card p-10 rounded-xl border shadow-lg space-y-4">
                {status === 'loading' && (
                    <>
                        <div className="text-4xl">⏳</div>
                        <h2 className="text-2xl font-bold">Verifying your email...</h2>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="text-4xl">✅</div>
                        <h2 className="text-2xl font-bold text-green-600">Email Verified!</h2>
                        <p className="text-muted-foreground">{message}</p>
                        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="text-4xl">❌</div>
                        <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
                        <p className="text-muted-foreground">{message}</p>
                        <Link href="/register" className="text-primary underline text-sm">Register again</Link>
                    </>
                )}
            </div>
        </div>
    );
}
