"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";


const priceRanges = [
    { label: "Under ₹500", min: 0, max: 500 },
    { label: "₹500 - ₹2000", min: 500, max: 2000 },
    { label: "₹2000 - ₹5000", min: 2000, max: 5000 },
    { label: "Over ₹5000", min: 5000, max: undefined },
];

interface FilterContentProps {
    categories: string[];
    currentCategory: string | null;
    currentMin: string | null;
    currentMax: string | null;
    min: string;
    max: string;
    setMin: (v: string) => void;
    setMax: (v: string) => void;
    updateFilter: (key: string, value: string | null) => void;
    applyPrice: () => void;
    clearFilters: () => void;
    onClose?: () => void;
}

function FilterContent({
    categories, currentCategory, currentMin, currentMax,
    min, max, setMin, setMax,
    updateFilter, applyPrice, clearFilters, onClose,
}: FilterContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [catOpen, setCatOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(true);

    return (
        <div className="space-y-4">
            {/* Active filter chips */}
            {(currentCategory || currentMin || currentMax) && (
                <div className="flex items-center gap-2 flex-wrap pb-2 border-b">
                    {currentCategory && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                            {currentCategory}
                            <button onClick={() => updateFilter("category", null)}>
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {(currentMin || currentMax) && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                            ₹{currentMin || "0"} – {currentMax ? `₹${currentMax}` : "∞"}
                            <button onClick={() => {
                                const p = new URLSearchParams(searchParams.toString());
                                p.delete("minPrice"); p.delete("maxPrice");
                                router.push(`/products?${p.toString()}`);
                            }}>
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-destructive underline ml-auto">
                        Clear all
                    </button>
                </div>
            )}

            {/* Categories Section */}
            <div className="border rounded-xl overflow-hidden">
                <button
                    onClick={() => setCatOpen(!catOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 font-semibold text-sm bg-muted/30 hover:bg-muted/60 transition-colors"
                >
                    Categories
                    {catOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {catOpen && (
                    <div className="p-2 space-y-0.5">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => {
                                    updateFilter("category", currentCategory === cat ? null : cat);
                                    onClose?.();
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${currentCategory === cat
                                    ? "bg-primary text-white font-semibold shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Range Section */}
            <div className="border rounded-xl overflow-hidden">
                <button
                    onClick={() => setPriceOpen(!priceOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 font-semibold text-sm bg-muted/30 hover:bg-muted/60 transition-colors"
                >
                    Price Range
                    {priceOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {priceOpen && (
                    <div className="p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            {priceRanges.map(range => {
                                const isActive =
                                    currentMin === range.min.toString() &&
                                    (range.max ? currentMax === range.max.toString() : !currentMax);
                                return (
                                    <button
                                        key={range.label}
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams.toString());
                                            params.set("minPrice", range.min.toString());
                                            if (range.max) params.set("maxPrice", range.max.toString());
                                            else params.delete("maxPrice");
                                            router.push(`/products?${params.toString()}`);
                                            onClose?.();
                                        }}
                                        className={`text-xs px-2 py-2 rounded-lg border text-center transition-all ${isActive
                                            ? "bg-primary text-white border-primary font-semibold"
                                            : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                                            }`}
                                    >
                                        {range.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-2 font-medium">Custom Range</p>
                            <div className="flex gap-2 items-center mb-2">
                                <input
                                    type="number" placeholder="Min" value={min}
                                    onChange={e => setMin(e.target.value)}
                                    className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background"
                                />
                                <span className="text-muted-foreground text-sm flex-shrink-0">–</span>
                                <input
                                    type="number" placeholder="Max" value={max}
                                    onChange={e => setMax(e.target.value)}
                                    className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background"
                                />
                            </div>
                            <Button variant="outline" size="sm" className="w-full" onClick={() => { applyPrice(); onClose?.(); }}>
                                Apply
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function ProductFilters({ categories }: { categories: string[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const currentCategory = searchParams.get("category");
    const currentMin = searchParams.get("minPrice");
    const currentMax = searchParams.get("maxPrice");
    const [min, setMin] = useState(currentMin || "");
    const [max, setMax] = useState(currentMax || "");

    const activeFilterCount = [currentCategory, currentMin, currentMax].filter(Boolean).length;

    // Lock body scroll when drawer is open on mobile
    useEffect(() => {
        if (drawerOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [drawerOpen]);

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value); else params.delete(key);
        router.push(`/products?${params.toString()}`);
    };

    const applyPrice = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (min) params.set("minPrice", min); else params.delete("minPrice");
        if (max) params.set("maxPrice", max); else params.delete("maxPrice");
        router.push(`/products?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push("/products");
        setMin("");
        setMax("");
        setDrawerOpen(false);
    };

    const sharedProps = { categories, currentCategory, currentMin, currentMax, min, max, setMin, setMax, updateFilter, applyPrice, clearFilters };

    return (
        <>
            {/* ── MOBILE: Sticky filter trigger button ── */}
            <div className="lg:hidden sticky top-[70px] z-30 bg-background/95 backdrop-blur-sm border-b -mx-4 px-4 py-2.5 mb-2">
                <button
                    id="mobile-filter-toggle"
                    onClick={() => setDrawerOpen(true)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-card shadow-sm hover:border-primary hover:shadow-md transition-all text-sm font-semibold"
                >
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-[11px] font-bold">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* ── MOBILE: Backdrop ── */}
            {drawerOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setDrawerOpen(false)}
                />
            )}

            {/* ── MOBILE: Slide-in Drawer ── */}
            <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-80 max-w-[90vw] bg-background shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-primary" />
                        <span className="font-bold text-base">Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-[11px] font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setDrawerOpen(false)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        aria-label="Close filters"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <FilterContent {...sharedProps} onClose={() => setDrawerOpen(false)} />
                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t bg-muted/10">
                    <Button className="w-full" onClick={() => setDrawerOpen(false)}>
                        Show Results
                    </Button>
                </div>
            </div>

            {/* ── DESKTOP: Static sidebar content (rendered into <aside> via parent) ── */}
            <div className="hidden lg:block">
                <div className="sticky top-28">
                    <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-primary" />
                        Filters
                    </h2>
                    <FilterContent {...sharedProps} />
                </div>
            </div>
        </>
    );
}
