import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Instagram, Twitter, Linkedin, Facebook } from "lucide-react";

async function getSettings() {
    try {
        const res = await fetch("http://localhost:4000/settings", { next: { revalidate: 60 } }); // Revalidate every minute
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
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="inline-block mb-4">
                            <div className="relative h-32 w-32">
                                <Image
                                    src="/logo.png"
                                    alt="Zetra Electronics Logo"
                                    fill
                                    className="object-contain brightness-0 invert"
                                />
                            </div>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                            Your premium source for electronic components, sensors, and robotics. Empowering innovation across India.
                        </p>
                        <div className="flex gap-4">
                            {settings.SOCIAL_INSTAGRAM && (
                                <a href={settings.SOCIAL_INSTAGRAM} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                    <Instagram className="h-5 w-5" />
                                </a>
                            )}
                            {settings.SOCIAL_TWITTER && (
                                <a href={settings.SOCIAL_TWITTER} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                    <Twitter className="h-5 w-5" />
                                </a>
                            )}
                            {settings.SOCIAL_LINKEDIN && (
                                <a href={settings.SOCIAL_LINKEDIN} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-white mb-4">Shop</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                            <li><Link href="/products?category=Sensors" className="hover:text-primary transition-colors">Sensors</Link></li>
                            <li><Link href="/products?category=Robotics" className="hover:text-primary transition-colors">Robotics</Link></li>
                            <li><Link href="/products?category=Development+Boards" className="hover:text-primary transition-colors">Dev Boards</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-bold text-white mb-4">Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/profile" className="hover:text-primary transition-colors">My Account</Link></li>
                            <li><Link href="/cart" className="hover:text-primary transition-colors">Track Order</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-white mb-4">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            {settings.STORE_ADDRESS && (
                                <li className="flex gap-3">
                                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                                    <span>{settings.STORE_ADDRESS}</span>
                                </li>
                            )}
                            {settings.STORE_PHONE && (
                                <li className="flex gap-3 items-center">
                                    <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                                    <a href={`tel:${settings.STORE_PHONE}`} className="hover:text-white">{settings.STORE_PHONE}</a>
                                </li>
                            )}
                            {settings.STORE_EMAIL && (
                                <li className="flex gap-3 items-center">
                                    <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                                    <a href={`mailto:${settings.STORE_EMAIL}`} className="hover:text-white">{settings.STORE_EMAIL}</a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} Tech uc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
