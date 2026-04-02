"use client";

import { useState } from "react";
import { Search, HelpCircle, Truck, Package, CreditCard, RotateCcw, ChevronDown, ChevronUp, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const categories = [
        { icon: <Package className="h-6 w-6" />, title: "Orders", desc: "Track, modify, or cancel orders" },
        { icon: <Truck className="h-6 w-6" />, title: "Shipping", desc: "Delivery times and methods" },
        { icon: <RotateCcw className="h-6 w-6" />, title: "Returns", desc: "Return policy and refunds" },
        { icon: <CreditCard className="h-6 w-6" />, title: "Payments", desc: "Payment methods and security" },
    ];

    const faqs = [
        {
            question: "How do I track my order?",
            answer: "You can track your order by visiting the 'Track Order' page and entering your Order ID. You will receive the Order ID in your confirmation email."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit/debit cards (Visa, MasterCard), UPI, Net Banking, and Cash on Delivery (COD) for eligible locations."
        },
        {
            question: "Can I cancel my order?",
            answer: "Orders can be cancelled within 2 hours of placement if they haven't been shipped yet. Please contact support immediately or check your order details page."
        },
        {
            question: "Do you offer international shipping?",
            answer: "Currently, we only ship within India. We are working on expanding our services to international locations soon."
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 7-day return policy for defective or damaged items. Sensitive electronic components (like ICs) may not be returnable if the seal is broken."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Hero Section */}
            <section className="bg-slate-900 text-white py-16 px-4">
                <div className="container mx-auto max-w-4xl text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center"
                    >
                        <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-4">
                            <HelpCircle className="h-6 w-6" />
                        </div>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold tracking-tight"
                    >
                        How can we help you?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg max-w-2xl mx-auto"
                    >
                        Search our knowledge base or browse common topics below.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-xl mx-auto relative group mt-8"
                    >
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search for help..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-900 bg-white shadow-lg border-0 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto max-w-5xl px-4 py-12 -mt-8 relative z-10">
                {/* Topic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={cat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (idx * 0.1) }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
                        >
                            <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                {cat.icon}
                            </div>
                            <h3 className="font-bold text-slate-900">{cat.title}</h3>
                            <p className="text-sm text-slate-500 mt-1">{cat.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* FAQs */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.filter(f => f.question.toLowerCase().includes(searchQuery.toLowerCase())).map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-semibold text-slate-800">{faq.question}</span>
                                    {openFaq === idx ? (
                                        <ChevronUp className="h-5 w-5 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-slate-400" />
                                    )}
                                </button>
                                <AnimatePresence>
                                    {openFaq === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Contact Support CTA */}
                <div className="mt-16 bg-primary rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">Still need help?</h2>
                        <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">Our support team is available Monday to Friday, 9:00 AM to 6:00 PM to assist you with any questions.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" variant="secondary" className="gap-2 font-semibold bg-white text-primary hover:bg-slate-100">
                                <Mail className="h-4 w-4" /> Email Support
                            </Button>
                            <Button size="lg" className="gap-2 font-semibold bg-slate-900 text-white hover:bg-slate-800 border-0 shadow-xl">
                                <Phone className="h-4 w-4" /> 8300592209
                            </Button>
                        </div>
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>
                </div>
            </div>
        </div>
    );
}
