"use client";

import { API_URL } from '@/lib/api';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Save, Globe } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

interface Setting {
    key: string;
    value: string;
    description?: string;
}

export default function AdminSettingsPage() {
    const { token } = useAuthStore();
    const [settings, setSettings] = useState<Record<string, string>>({
        GST_PERCENTAGE: "18",
        FREE_SHIPPING_THRESHOLD: "0",
        STORE_PHONE: "",
        STORE_EMAIL: "",
        STORE_ADDRESS: "",
        SOCIAL_INSTAGRAM: "",
        SOCIAL_TWITTER: "", 
        SOCIAL_LINKEDIN: "",
        FLAT_SHIPPING_FEE: "0",
        HOME_HERO_IMAGE: "",
        HOME_HERO_SUBTEXT: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then((data: Setting[]) => {
                const newSettings: any = { ...settings };
                data.forEach(s => {
                    newSettings[s.key] = s.value;
                });
                setSettings(newSettings);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const responses = await Promise.all(
                Object.entries(settings).map(([key, value]) =>
                    fetch(`${API_URL}/settings/${key}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            value,
                            description: getDescription(key)
                        })
                    })
                )
            );

            const failed = responses.find(r => !r.ok);
            if (failed) {
                const errData = await failed.json().catch(() => ({}));
                const msg = (errData as any).message || `HTTP ${failed.status}`;
                setMessage({ type: 'error', text: `Save failed: ${msg}` });
            } else {
                setMessage({ type: 'success', text: "All settings updated successfully" });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "Network error — could not save settings" });
        } finally {
            setSaving(false);
        }
    };

    const getDescription = (key: string) => {
        switch (key) {
            case "GST_PERCENTAGE": return "Global GST Percentage";
            case "FREE_SHIPPING_THRESHOLD": return "Minimum order amount for free shipping";
            case "STORE_PHONE": return "Contact phone number displayed to customers";
            case "STORE_EMAIL": return "Support email address";
            case "STORE_ADDRESS": return "Physical Store Address";
            case "SOCIAL_INSTAGRAM": return "Instagram Profile URL";
            case "SOCIAL_TWITTER": return "Twitter/X Profile URL";
            case "SOCIAL_LINKEDIN": return "LinkedIn Company Page URL";
            case "FLAT_SHIPPING_FEE": return "Standard shipping charge when threshold is not met";
            case "HOME_HERO_IMAGE": return "Hero banner image URL for homepage";
            case "HOME_HERO_SUBTEXT": return "Short description text below the hero title";
            default: return "";
        }
    };

    if (loading) return <div className="p-8 font-medium animate-pulse">Loading system settings...</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Configure your store operations, taxes, and shipping rules.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 gap-8 max-w-5xl">

                {/* Store Information */}
                <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                         Store Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-semibold mb-2 block">Store Phone</label>
                            <input
                                type="text"
                                value={settings.STORE_PHONE}
                                onChange={(e) => handleChange("STORE_PHONE", e.target.value)}
                                className="w-full border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="e.g. +91 98765 43210"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold mb-2 block">Support Email</label>
                            <input
                                type="email"
                                value={settings.STORE_EMAIL}
                                onChange={(e) => handleChange("STORE_EMAIL", e.target.value)}
                                className="w-full border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="e.g. contact@yourstore.com"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold mb-2 block">Store Address</label>
                            <textarea
                                value={settings.STORE_ADDRESS}
                                onChange={(e) => handleChange("STORE_ADDRESS", e.target.value)}
                                className="w-full border rounded-xl p-3 bg-background h-24 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                placeholder="Enter your business address"
                            />
                        </div>
                    </div>
                </div>

                {/* Tax & Shipping Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-card p-8 rounded-2xl border shadow-sm h-full flex flex-col">
                        <h2 className="text-xl font-bold mb-6">Tax Configuration</h2>
                        <div className="space-y-4 flex-1">
                            <div>
                                <label className="text-sm font-semibold mb-2 block">GST Percentage (%)</label>
                                <input
                                    type="number"
                                    value={settings.GST_PERCENTAGE}
                                    onChange={(e) => handleChange("GST_PERCENTAGE", e.target.value)}
                                    className="w-full border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    min="0" max="100" step="0.01"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Applied to all orders. Set to 0 to disable tax.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-8 rounded-2xl border shadow-sm h-full flex flex-col">
                        <h2 className="text-xl font-bold mb-6">Shipping Configuration</h2>
                        <div className="space-y-4 flex-1">
                            <div>
                                <label className="text-sm font-semibold mb-2 block">Free Shipping Threshold (₹)</label>
                                <input
                                    type="number"
                                    value={settings.FREE_SHIPPING_THRESHOLD}
                                    onChange={(e) => handleChange("FREE_SHIPPING_THRESHOLD", e.target.value)}
                                    className="w-full border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    min="0"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Orders below this pay for shipping. Set to 0 to disable.
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold mb-2 block">Standard Shipping Fee (₹)</label>
                                <input
                                    type="number"
                                    value={settings.FLAT_SHIPPING_FEE}
                                    onChange={(e) => handleChange("FLAT_SHIPPING_FEE", e.target.value)}
                                    className="w-full border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    min="0"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Applied if the order is below the free shipping threshold.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero / Branding Section */}
                <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Homepage Hero Section
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-semibold mb-2 block">Hero Tagline / Subtext</label>
                            <input
                                type="text"
                                value={settings.HOME_HERO_SUBTEXT}
                                onChange={(e) => handleChange("HOME_HERO_SUBTEXT", e.target.value)}
                                className="w-full border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="e.g. Your premium destination for electronic components..."
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold mb-2 block">Hero Banner Image</label>
                            <div className="flex gap-4 items-start">
                                <div className="relative h-40 w-64 bg-muted rounded-xl border border-dashed flex items-center justify-center overflow-hidden">
                                    {settings.HOME_HERO_IMAGE ? (
                                        <img src={settings.HOME_HERO_IMAGE} alt="Hero" className="object-cover h-full w-full" />
                                    ) : (
                                        <div className="text-xs text-muted-foreground">No image set</div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        id="hero-upload"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            
                                            try {
                                                const res = await fetch(`${API_URL}/products/upload`, {
                                                    method: 'POST',
                                                    headers: { 'Authorization': `Bearer ${token}` },
                                                    body: formData
                                                });
                                                const data = await res.json();
                                                if (data.url) {
                                                    const finalUrl = data.url.replace('http://localhost:4000', API_URL);
                                                    handleChange("HOME_HERO_IMAGE", finalUrl);
                                                }
                                            } catch (err) {
                                                console.error("Upload failed", err);
                                            }
                                        }}
                                    />
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => document.getElementById('hero-upload')?.click()}
                                        className="rounded-xl"
                                    >
                                        Upload New Image
                                    </Button>
                                    <p className="text-[10px] text-muted-foreground">Recommended: 1200x800px. JPG/PNG.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Globe className="h-5 w-5" /> Social Media Links
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-sm font-semibold mb-2 block">Instagram URL</label>
                            <input
                                type="url"
                                value={settings.SOCIAL_INSTAGRAM}
                                onChange={(e) => handleChange("SOCIAL_INSTAGRAM", e.target.value)}
                                className="w-full border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="https://instagram.com/..."
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold mb-2 block">Twitter / X URL</label>
                            <input
                                type="url"
                                value={settings.SOCIAL_TWITTER}
                                onChange={(e) => handleChange("SOCIAL_TWITTER", e.target.value)}
                                className="w-full border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="https://twitter.com/..."
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold mb-2 block">LinkedIn URL</label>
                            <input
                                type="url"
                                value={settings.SOCIAL_LINKEDIN}
                                onChange={(e) => handleChange("SOCIAL_LINKEDIN", e.target.value)}
                                className="w-full border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="https://linkedin.com/..."
                            />
                        </div>
                    </div>
                </div>

                {/* Save Bar */}
                <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
                    <AnimatePresence>
                        {message && (
                            <div className={`p-4 rounded-2xl border shadow-2xl flex items-center gap-3 bg-black text-white`}>
                                {message.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-400" /> : <AlertCircle className="h-5 w-5 text-red-400" />}
                                <span className="text-sm font-medium">{message.text}</span>
                            </div>
                        )}
                    </AnimatePresence>
                    <Button 
                        type="submit" 
                        size="lg" 
                        disabled={saving} 
                        className="shadow-2xl rounded-2xl px-12 h-14 text-base font-bold bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
                    >
                        <Save className="h-5 w-5 mr-3" />
                        {saving ? "Saving Changes..." : "Save All Settings"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

const AnimatePresence = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};
