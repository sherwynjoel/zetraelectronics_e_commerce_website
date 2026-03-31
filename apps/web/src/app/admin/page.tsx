"use client";

import { API_URL } from '@/lib/api';

import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, DollarSign, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";

interface DashboardStats {
    revenue: number;
    orders: number;
    products: number;
    users: number;
    recentOrders: any[];
}

export default function AdminDashboard() {
    const { user, token, logout } = useAuthStore();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Wait for Zustand persist to rehydrate from localStorage before checking auth
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (!token) {
            router.push('/login');
            return;
        }
        if (user?.role !== 'ADMIN') {
            router.push('/');
            return;
        }

        // Fetch stats
        fetch(`${API_URL}/analytics/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    logout();
                    router.push('/login');
                    throw new Error('Session expired — please log in again');
                }
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setStats({
                    revenue: Number(data?.revenue ?? 0),
                    orders: Number(data?.orders ?? 0),
                    products: Number(data?.products ?? 0),
                    users: Number(data?.users ?? 0),
                    recentOrders: Array.isArray(data?.recentOrders) ? data.recentOrders : [],
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Dashboard stats error:', err);
                setError(err.message || 'Failed to load stats');
                setLoading(false);
            });
    }, [mounted, token, user, router]);

    if (!mounted || loading) {
        return <div className="p-8">Loading dashboard metrics...</div>;
    }

    if (error || !stats) {
        return <div className="p-8 text-red-500">Failed to load stats: {error ?? 'Unknown error'}. Please refresh.</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Revenue", value: `₹${Number(stats.revenue).toFixed(2)}`, icon: DollarSign, change: "Lifetime Earnings", color: "text-green-600" },
                    { label: "Total Orders", value: stats.orders, icon: ShoppingCart, change: "All time orders", color: "text-blue-600" },
                    { label: "Products", value: stats.products, icon: Package, change: "Active Inventory", color: "text-orange-600" },
                    { label: "Total Users", value: stats.users, icon: Users, change: "Registered Customers", color: "text-purple-600" },
                ].map((stat, i) => (
                    <div key={i} className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                            <div className={`p-2 rounded-full bg-muted/50 ${stat.color.replace('text-', 'text-opacity-20 ')}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{stat.change}</div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-muted/5">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" /> Recent Orders
                    </h2>
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/orders')}>View All</Button>
                </div>
                <div className="p-0">
                    {stats.recentOrders.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No orders found yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Order ID</th>
                                        <th className="px-6 py-3 font-medium">Customer</th>
                                        <th className="px-6 py-3 font-medium">Date</th>
                                        <th className="px-6 py-3 font-medium">Amount</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {stats.recentOrders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4 font-mono font-medium">#{order.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{order.user?.name || 'Guest'}</div>
                                                <div className="text-xs text-muted-foreground">{order.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-bold">₹{Number(order.total).toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                    {order.status.toLowerCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
