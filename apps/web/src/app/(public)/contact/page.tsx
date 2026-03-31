"use client";

import { API_URL } from '@/lib/api';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    useEffect(() => {
        // Fetch Store Settings
        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then(data => {
                const s: any = {};
                data.forEach((item: any) => s[item.key] = item.value);
                setSettings(s);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSubmitting(false);
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-muted/10 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
                    <p className="text-muted-foreground">
                        Have questions about our products, shipping, or bulk orders? We're here to help!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card p-6 rounded-xl border shadow-sm flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Phone Support</h3>
                                <p className="text-sm text-muted-foreground mb-2">Mon-Fri from 9am to 6pm</p>
                                {loading ? <div className="h-4 w-24 bg-muted animate-pulse rounded" /> : (
                                    <a href={`tel:${settings.STORE_PHONE}`} className="font-medium hover:text-primary transition-colors">
                                        {settings.STORE_PHONE || "+91 98765 43210"}
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-xl border shadow-sm flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Email</h3>
                                <p className="text-sm text-muted-foreground mb-2">For general inquiries</p>
                                {loading ? <div className="h-4 w-32 bg-muted animate-pulse rounded" /> : (
                                    <a href={`mailto:${settings.STORE_EMAIL}`} className="font-medium hover:text-primary transition-colors">
                                        {settings.STORE_EMAIL || "support@zetraelectronics.com"}
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-xl border shadow-sm flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Office</h3>
                                <p className="text-sm text-muted-foreground mb-2">Visit our main office</p>
                                {loading ? <div className="h-4 w-40 bg-muted animate-pulse rounded" /> : (
                                    <p className="font-medium text-sm">
                                        {settings.STORE_ADDRESS || "123 Tech Park, Innovation City, India"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-card p-8 rounded-xl border shadow-sm">
                            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

                            {submitted ? (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center py-16">
                                    <div className="flex justify-center mb-4">
                                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <CheckCircle className="h-8 w-8" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                                    <p className="text-green-700 mb-6">
                                        Thank you for contacting us. We will get back to you shortly.
                                    </p>
                                    <Button onClick={() => setSubmitted(false)} variant="outline">
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Your Name</label>
                                            <input
                                                required
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full border rounded-md p-3 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full border rounded-md p-3 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Subject</label>
                                        <input
                                            required
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full border rounded-md p-3 bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="How can we help?"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Message</label>
                                        <textarea
                                            required
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full border rounded-md p-3 bg-background min-h-[150px] focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="Tell us more about your inquiry..."
                                        />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full md:w-auto" disabled={submitting}>
                                        {submitting ? (
                                            "Sending Message..."
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" /> Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
