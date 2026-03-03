"use client";
import Image from "next/image";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ShoppingCart, Heart, Menu, Phone, ChevronDown, Sparkles, Truck, Package, Zap, Search, X, ChevronRight, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientCartBadge } from "@/components/client-cart-badge";
import { ClientAuthButtons } from "@/components/client-auth-buttons";
import { SearchBar } from "./SearchBar";

const allCategories = [
    "Electronic Components",
    "Sensors",
    "IoT & Wireless",
    "Robotics",
    "Development Boards",
    "Tools & Equipment",
    "Battery & Power",
    "Wire & Cables",
    "3D Printing",
    "Displays",
    "Enclosures",
    "Connectors",
    "Soldering",
    "Test Instruments"
];

const quickAccessCategories = allCategories.slice(0, 8);

export function Navbar() {
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    const categoryMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
                setIsCategoryMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const filteredCategories = allCategories.filter(c =>
        c.toLowerCase().includes(categorySearch.toLowerCase())
    );

    return (
        <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
            {/* Top Bar - Premium Dark Strip - Full Width */}
            <div className="bg-slate-950 text-slate-300 py-2 text-[11px] font-medium tracking-wide hidden md:block">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                            <Phone className="h-3.5 w-3.5 text-primary" />
                            <span>+91 98765 43210</span>
                        </span>
                        <span className="hover:text-white transition-colors cursor-default">
                            support@techuc.com
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/track-order" className="hover:text-primary transition-colors flex items-center gap-1.5 group">
                            <Truck className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                            Track My Order
                        </Link>
                        <Link href="/help" className="hover:text-white transition-colors">Help Center</Link>
                    </div>
                </div>
            </div>

            {/* Category Navigation - Full Width Dark Tech Bar (Desktop) - Moved Top */}
            <div className="bg-slate-900 text-slate-300 hidden md:block border-t border-slate-800 shadow-inner relative z-[60]">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                    <div className="flex items-center h-14">

                        {/* Mega Menu Trigger */}
                        <div className="relative mr-8" ref={categoryMenuRef}>
                            <Button
                                variant="ghost"
                                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                                className={`
                                    h-10 px-5 rounded-lg text-sm font-bold gap-2 transition-all uppercase tracking-wide
                                    ${isCategoryMenuOpen
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                                    }
                                `}
                            >
                                {isCategoryMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                                All Categories
                                <ChevronDown className={`h-3 w-3 ml-1 transition-transform duration-200 opacity-70 ${isCategoryMenuOpen ? "rotate-180" : ""}`} />
                            </Button>

                            {/* Dropdown Menu */}
                            {isCategoryMenuOpen && (
                                <div className="absolute top-full left-0 mt-3 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left ring-1 ring-white/10">
                                    {/* Search Input */}
                                    <div className="p-3 border-b border-slate-800 bg-slate-950/50">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <input
                                                type="text"
                                                placeholder="Find a category..."
                                                value={categorySearch}
                                                onChange={(e) => setCategorySearch(e.target.value)}
                                                autoFocus
                                                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Category List */}
                                    <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map((cat, idx) => (
                                                <Link
                                                    key={idx}
                                                    href={`/category/${cat.toLowerCase().replace(/ /g, '-')}`}
                                                    onClick={() => setIsCategoryMenuOpen(false)}
                                                    className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white hover:pl-6 transition-all group"
                                                >
                                                    {cat}
                                                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="px-4 py-6 text-center text-slate-500 text-sm">
                                                No categories found for "{categorySearch}"
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="p-3 bg-slate-950/30 border-t border-slate-800 text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">
                                        browse all {allCategories.length} categories
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Access Links - Visible on Bar */}
                        <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
                            {quickAccessCategories.map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/category/${cat.toLowerCase().replace(/ /g, '-')}`}
                                    className="text-[13px] font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition-all whitespace-nowrap"
                                >
                                    {cat}
                                </Link>
                            ))}
                        </div>

                        {/* Right / Secondary Links - Kept clean */}
                        <div className="flex items-center gap-6 text-[13px] font-medium text-slate-400 pl-4 border-l border-slate-800 ml-4 flex-shrink-0">
                            <Link href="/deals" className="text-secondary hover:text-secondary-foreground transition-colors flex items-center gap-1.5 hover:bg-white/5 px-3 py-1.5 rounded-md">
                                <Zap className="h-3.5 w-3.5 fill-current" />
                                Daily Deals
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header - Center Aligned */}
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-3 md:py-4">
                <div className="flex items-center justify-between gap-4 md:gap-12">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center group">
                        <div className="relative h-10 w-10 md:h-12 md:w-12 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                            <Image
                                src="/logo.png"
                                alt="Zetra Electronics Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Search Bar - Expanded Center (Desktop) */}
                    <div className="flex-1 max-w-4xl hidden md:block">
                        <SearchBar />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="hidden sm:flex items-center gap-1 mr-2">
                            <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 rounded-full">
                                <Heart className="h-5 w-5" />
                            </Button>
                        </div>

                        <Link href="/cart">
                            <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5 rounded-full">
                                <ShoppingCart className="h-5 w-5" />
                                <ClientCartBadge />
                            </Button>
                        </Link>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

                        <div className="hidden sm:block">
                            <ClientAuthButtons />
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden ml-1"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                {/* Mobile Search Bar (Below Header) */}
                <div className="mt-3 md:hidden max-w-[1440px] mx-auto">
                    <SearchBar />
                </div>
            </div>



            {/* Mobile Menu Overlay - Full Re-Implementation as per User Request */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10">
                        <span className="font-bold text-lg text-slate-900 dark:text-white">Menu</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <X className="h-6 w-6 text-slate-900 dark:text-white" />
                        </Button>
                    </div>

                    {/* Integrated Search (Like Desktop Dropdown) */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Find a category..."
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
                        <div className="p-4 flex flex-col gap-6">

                            {/* User Section */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Account & Support</h3>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <ClientAuthButtons />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href="/track-order"
                                        className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Truck className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Track Order</span>
                                    </Link>
                                    <Link
                                        href="/help"
                                        className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Phone className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Support</span>
                                    </Link>
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            {/* Categories List (Vertical List like Desktop) */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                                    Browse Categories
                                </h3>
                                <div className="flex flex-col">
                                    {filteredCategories.length > 0 ? (
                                        filteredCategories.map((cat, idx) => (
                                            <Link
                                                key={idx}
                                                href={`/category/${cat.toLowerCase().replace(/ /g, '-')}`}
                                                className="flex items-center justify-between py-3 px-2 text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/50 hover:text-primary dark:hover:text-primary hover:pl-4 transition-all group"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                {cat}
                                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-slate-500">
                                            No categories found for "{categorySearch}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-xs text-slate-400">© 2024 Tech uc Electronics</p>
                    </div>
                </div>
            )}
        </header>
    );
}
