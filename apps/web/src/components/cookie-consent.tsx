"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "zetra_cookie_consent";

export function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            setVisible(true);
        }
    }, []);

    const accept = () => {
        localStorage.setItem(STORAGE_KEY, "accepted");
        setVisible(false);
    };

    const decline = () => {
        localStorage.setItem(STORAGE_KEY, "declined");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-5">
                <div className="flex-1 text-sm text-slate-300 leading-relaxed">
                    We use cookies to improve your browsing experience and analyse site traffic. By clicking{" "}
                    <span className="text-white font-medium">Accept All</span>, you consent to our use of cookies.
                    Read our{" "}
                    <Link href="/privacy" className="text-primary underline underline-offset-2 hover:text-primary/80">
                        Privacy Policy
                    </Link>{" "}
                    to learn more.
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={decline}
                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={accept}
                        className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Accept All
                    </button>
                    <button
                        onClick={decline}
                        aria-label="Dismiss"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
