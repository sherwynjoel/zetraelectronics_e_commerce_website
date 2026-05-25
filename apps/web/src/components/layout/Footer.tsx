import { API_URL } from '@/lib/api';
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Instagram, Twitter, Linkedin, Facebook } from "lucide-react";

async function getSettings() {
    try {
        const res = await fetch(`${API_URL}/settings`, { next: { revalidate: 60 } }); // Revalidate every minute
        if (!res.ok) return {};
        const data = await res.json();
        const settings: Record<string, string> = {};
        data.forEach((s: any) => {
            settings[s.key] = s.value;
        });
        return settings;
    } catch (e) {
        return {};
    }
}

export async function Footer() {
    const settings = await getSettings();

    return (
        <footer className="bg-slate-900 text-slate-200 mt-auto border-t border-slate-800">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1 flex flex-col items-start">
                        <Link href="/" className="flex items-center gap-3 mb-6 group">
                            <div className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 flex-shrink-0 bg-white rounded-xl p-1">
                                <Image src="/logo.png" alt="Zetra" fill className="object-contain group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <span className="font-black text-2xl text-white tracking-tighter italic">
                                Zetra <span className="text-primary">Electronics</span>
                            </span>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                            Premium electronics store in India.
                        </p>
                        <div className="flex gap-4">
                            <a href={settings.SOCIAL_INSTAGRAM || "#"} target="_blank" rel="noopener noreferrer" aria-label="Zetra Electronics on Instagram" className="hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href={settings.SOCIAL_TWITTER || "#"} target="_blank" rel="noopener noreferrer" aria-label="Zetra Electronics on Twitter" className="hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href={settings.SOCIAL_LINKEDIN || "#"} target="_blank" rel="noopener noreferrer" aria-label="Zetra Electronics on LinkedIn" className="hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Shop & Support (2 Columns on mobile) */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-8">
                        {/* Quick Links */}
                        <div>
                            <h3 className="font-bold text-white mb-4">Shop</h3>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                                <li><Link href="/products?category=Sensors" className="hover:text-primary transition-colors">Sensors</Link></li>
                                <li><Link href="/products?category=Robotics" className="hover:text-primary transition-colors">Robotics</Link></li>
                                <li><Link href="/products?category=Development+Boards" className="hover:text-primary transition-colors">Dev Boards</Link></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h3 className="font-bold text-white mb-4">Support</h3>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li><Link href="/profile" className="hover:text-primary transition-colors">My Account</Link></li>
                                <li><Link href="/track-order" className="hover:text-primary transition-colors">Track Order</Link></li>
                                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="col-span-1">
                        <h3 className="font-bold text-white mb-4">Contact Us</h3>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex gap-3">
                                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                                <span>{settings.STORE_ADDRESS || "Store Address"}</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                                <a href={`tel:${settings.STORE_PHONE || ""}`} className="hover:text-white transition-colors">
                                    {settings.STORE_PHONE || "Call Support"}
                                </a>
                            </li>
                            <li className="flex gap-3 items-center">
                                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                                <a href={`mailto:${settings.STORE_EMAIL || ""}`} className="hover:text-white transition-colors">
                                    {settings.STORE_EMAIL || "Email Support"}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                        <p>© {new Date().getFullYear()} Zetra Electronics. All rights reserved.</p>
                        <span className="hidden md:inline text-slate-700">|</span>
                        <p>Powered by <a href="https://thearktech.in" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors">The Ark Tech</a></p>
                    </div>
                    <div className="flex gap-6">
                        <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
