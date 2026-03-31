"use client";

import { API_URL } from '@/lib/api';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Save, Globe, CreditCard } from "lucide-react";
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
        SOCIAL_TWITTER: "", // X
        SOCIAL_LINKEDIN: "",
        PAYMENT_RAZORPAY_KEY: "",
        PAYMENT_RAZORPAY_SECRET: ""
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
            const updates = Object.entries(settings).map(([key, value]) => {
                // Only save if it's different or exists? API allows upsert so generally safe to save all or check dirty.
                // Saving all is simpler for this scale.
                return fetch(`${API_URL}/settings/${key}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        value,
                        description: getDescription(key)
                    })
                });
            });

            await Promise.all(updates);
            setMessage({ type: 'success', text: "All settings updated successfully" });
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to update some settings" });
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
            case "PAYMENT_RAZORPAY_KEY": return "Razorpay Public Key ID";
            case "PAYMENT_RAZORPAY_SECRET": return "Razorpay Secret Key";
            default: return "";
        }
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">System Settings</h1>

            <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 max-w-5xl">

                {/* Store Information */}
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        Store Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Store Phone</label>
                            <input
                                type="text"
                                value={settings.STORE_PHONE}
                                onChange={(e) => handleChange("STORE_PHONE", e.target.value)}
                                className="w-full border rounded-md p-2 bg-background"
                                placeholder="+91 99999 99999"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Support Email</label>
                            <input
                                type="email"
                                value={settings.STORE_EMAIL}
                                onChange={(e) => handleChange("STORE_EMAIL", e.target.value)}
                                className="w-full border rounded-md p-2 bg-background"
                                placeholder="support@example.com"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Store Address</label>
                            <textarea
                                value={settings.STORE_ADDRESS}
                                onChange={(e) => handleChange("STORE_ADDRESS", e.target.value)}
                                className="w-full border rounded-md p-2 bg-background h-20"
                                placeholder="123 Tech Street, Silicon Valley, India"
                            />
                        </div>
                    </div>
                </div>

                {/* Tax & Shipping Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card p-6 rounded-xl border shadow-sm h-full">
                        <h2 className="text-xl font-bold mb-4">Tax Configuration</h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">GST Percentage (%)</label>
                                <input
                                    type="number"
                                    value={settings.GST_PERCENTAGE}
                                    onChange={(e) => handleChange("GST_PERCENTAGE", e.target.value)}
                                    className="w-full border rounded-md p-2 bg-background"
                                    min="0" max="100" step="0.01"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Applied to all orders. Set to 0 to disable tax.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl border shadow-sm h-full">
                        <h2 className="text-xl font-bold mb-4">Shipping Configuration</h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Free Shipping Threshold (₹)</label>
                                <input
                                    type="number"
                                    value={settings.FREE_SHIPPING_THRESHOLD}
                                    onChange={(e) => handleChange("FREE_SHIPPING_THRESHOLD", e.target.value)}
                                    className="w-full border rounded-md p-2 bg-background"
                                    min="0"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Orders below this pay for shipping. Set to 0 to disable.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Globe className="h-5 w-5" /> Social Media Links
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Instagram URL</label>
                            <input
                                type="url"
                                value={settings.SOCIAL_INSTAGRAM}
                                onChange={(e) => handleChange("SOCIAL_INSTAGRAM", e.target.value)}
                                className="w-full border rounded-md p-2 bg-background"
                                placeholder="https://instagram.com/zetraelectronics"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Twitter / X URL</label>
                            <input
                                type="url"
                                value={settings.SOCIAL_TWITTER}
                                onChange={(e) => handleChange("SOCIAL_TWITTER", e.target.value)}
                                className="w-full border rounded-md p-2 bg-background"
                                placeholder="https://twitter.com/zetraelectronics"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">LinkedIn URL</label>
                            <input
                                type="url"
                                value={settings.SOCIAL_LINKEDIN}
                                onChange={(e) => handleChange("SOCIAL_LINKEDIN", e.target.value)}
                                className="w-full border rounded-md p-2 bg-background"
                                placeholder="https://linkedin.com/company/zetraelectronics"
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Gateway */}
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5" /> Payment Gateway (Razorpay)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Key ID</label>
                            <input
                                type="password"
                                value={settings.PAYMENT_RAZORPAY_KEY}
                                onChange={(e) => handleChange("PAYMENT_RAZORPAY_KEY", e.target.value)}
                                className="w-full border rounded-md p-2 bg-background"
                                placeholder="rzp_test_..."
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Key Secret</label>
                            <input
                                type="password"
                                value={settings.PAYMENT_RAZORPAY_SECRET}
                                onChange={(e) => handleChange("PAYMENT_RAZORPAY_SECRET", e.target.value)}
                                className="w-full border rounded-md p-2 bg-background"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        These keys are used to process payments. Keep them secure.
                    </p>
                </div>

                {/* Save Bar */}
                <div className="fixed bottom-6 right-6 z-50">
                    {message && (
                        <div className={`mb-4 p-4 rounded-xl border shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-5 ${message.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'}`}>
                            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            {message.text}
                        </div>
                    )}
                    <Button type="submit" size="lg" disabled={saving} className="shadow-xl">
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving Changes..." : "Save All Settings"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
