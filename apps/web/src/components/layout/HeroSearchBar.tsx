"use client";

import { API_URL } from '@/lib/api';
import { useEffect, useState, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function HeroSearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 1) {
                setIsLoading(true);
                setIsOpen(true);
                try {
                    const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(query)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data.slice(0, 5));
                    }
                } catch (error) {
                    console.error("Search failed:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setIsOpen(false);
        }
    };

    return (
        <div className="w-full max-w-xl relative mt-8" ref={searchRef}>
            <form onSubmit={handleSubmit} className="relative z-20 group">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length > 1 && setIsOpen(true)}
                        placeholder="Search for components, parts, or brands..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 bg-white/10 backdrop-blur-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-lg text-lg"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                    {isLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        </div>
                    )}
                </div>
            </form>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-4 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden z-50 p-2"
                    >
                        {results.length > 0 ? (
                            <div className="space-y-1">
                                {results.map((product: any) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-xl transition-all group"
                                    >
                                        <div className="h-14 w-14 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 relative">
                                            {product.image ? (
                                                <Image
                                                    src={product.image.startsWith('http') ? product.image : `${API_URL}${product.image}`}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-500">
                                                    No Img
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="font-semibold text-white truncate group-hover:text-primary transition-colors">
                                                {product.name}
                                            </h4>
                                            <p className="text-xs text-slate-400 truncate uppercase tracking-wider">{product.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-white">
                                                ₹{parseFloat(product.price).toLocaleString()}
                                            </div>
                                            <p className="text-[10px] text-primary font-bold">IN STOCK</p>
                                        </div>
                                    </Link>
                                ))}
                                <Link
                                    href={`/search?q=${encodeURIComponent(query)}`}
                                    onClick={() => setIsOpen(false)}
                                    className="block py-4 text-center text-sm font-bold text-primary hover:bg-white/5 rounded-xl transition-all mt-2 border-t border-slate-800"
                                >
                                    SHOW ALL RESULTS FOR "{query.toUpperCase()}"
                                </Link>
                            </div>
                        ) : query.length > 1 && !isLoading ? (
                            <div className="p-10 text-center">
                                <Search className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">No components matching "{query}"</p>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
