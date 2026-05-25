"use client";

import { API_URL } from '@/lib/api';
import { useEffect, useState, useRef } from "react";
import { Search, Loader2, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatImageUrl } from "@/lib/utils";

export function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 1) {
                setIsLoading(true);
                setIsOpen(true);
                try {
                    const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(query)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data.slice(0, 6));
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
            setIsFocused(false);
        }
    };

    return (
        <div className="flex-1 max-w-xl mx-auto hidden md:block relative group" ref={searchRef}>
            <form onSubmit={handleSubmit} className="relative z-50">
                <div className={`
                    relative flex items-center transition-all duration-200 ease-out rounded-xl px-4 border
                    ${isFocused
                        ? "bg-slate-950 border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                    }
                `}>
                    <Search className={`h-4 w-4 transition-colors ${isFocused ? "text-primary" : "text-slate-500"}`} />

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => {
                            setIsFocused(true);
                            if (query.length > 1) setIsOpen(true);
                        }}
                        placeholder="Search components..."
                        className="w-full bg-transparent border-none focus:outline-none focus:ring-0 py-2.5 px-3 text-sm text-slate-200 placeholder:text-slate-400 font-medium"
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-slate-300"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}

                    {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary ml-2" />
                    )}
                </div>
            </form>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        className="absolute top-0 left-0 right-0 pt-14 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-40"
                    >
                        <div className="p-2">
                            {results.length > 0 ? (
                                <div className="grid grid-cols-1 gap-1">
                                    <div className="px-3 pb-2 pt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">
                                        Top Matches
                                    </div>
                                    {results.map((product: any) => (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.id}`}
                                            onClick={() => {
                                                setIsOpen(false);
                                                setIsFocused(false);
                                            }}
                                            className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-700"
                                        >
                                            <div className="h-10 w-10 bg-white rounded-md overflow-hidden flex-shrink-0 relative border border-slate-700">
                                                {product.image ? (
                                                    <img
                                                        src={formatImageUrl(product.image)}
                                                        alt={product.name}
                                                        referrerPolicy="no-referrer"
                                                        className="h-full w-full object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-300 bg-slate-800">
                                                        N/A
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="font-bold text-xs text-slate-200 truncate group-hover:text-primary transition-colors">
                                                    {product.name}
                                                </h4>
                                                <p className="text-[10px] text-slate-500 font-medium">{product.category}</p>
                                            </div>
                                            <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                                ₹{parseFloat(product.price).toLocaleString()}
                                            </div>
                                        </Link>
                                    ))}
                                    <Link
                                        href={`/search?q=${encodeURIComponent(query)}`}
                                        onClick={() => {
                                            setIsOpen(false);
                                            setIsFocused(false);
                                        }}
                                        className="flex items-center justify-between mt-2 p-3 text-[11px] font-bold text-white bg-primary hover:bg-primary/90 transition-all rounded-lg shadow-lg group"
                                    >
                                        <span>VIEW ALL RESULTS FOR "{query.toUpperCase()}"</span>
                                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            ) : query.length > 1 && !isLoading ? (
                                <div className="p-8 text-center">
                                    <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-700">
                                        <Search className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">No results found</p>
                                    <p className="text-[10px] text-slate-600 mt-1">Try "Arduino" or "Sensor"</p>
                                </div>
                            ) : null}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
