"use client";

import { useEffect, useState } from "react";
import { API_URL } from '@/lib/api';
import { useAuthStore } from "@/lib/auth-store";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { ZoomIn, ZoomOut } from "lucide-react";

export function SalesChart() {
    const { token } = useAuthStore();
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(30);

    useEffect(() => {
        if (!token) return;

        fetch(`${API_URL}/analytics/sales-chart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                // The backend sends { date, total, orders }
                // Let's format the date for better UI
                const formatted = data.map((d: any) => {
                    const dateObj = new Date(d.date);
                    return {
                        name: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        Revenue: d.total,
                        Orders: d.orders
                    };
                });
                setChartData(formatted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load chart data:", err);
                setLoading(false);
            });
    }, [token]);

    const handleZoomIn = () => setZoom(prev => Math.max(7, prev - 7));
    const handleZoomOut = () => setZoom(prev => Math.min(90, prev + 7));

    if (loading) {
        return (
            <div className="w-full h-[350px] flex items-center justify-center border rounded-xl bg-card">
                <div className="text-muted-foreground animate-pulse">Loading Chart Data...</div>
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="w-full h-[350px] flex items-center justify-center border rounded-xl bg-card">
                <div className="text-muted-foreground">No recent sales data.</div>
            </div>
        );
    }

    return (
        <div className="w-full h-[400px] p-6 border rounded-xl bg-card shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold tracking-tight">
                    Revenue Overview <span className="text-muted-foreground font-normal text-sm ml-2">(Last {zoom} Days)</span>
                </h3>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleZoomIn} 
                        disabled={zoom <= 7}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 disabled:opacity-50 transition-all font-bold text-sm border border-blue-500/20"
                        title="Zoom In (Show less history)"
                    >
                        <ZoomIn className="h-4 w-4" /> <span>+</span>
                    </button>
                    <button 
                        onClick={handleZoomOut} 
                        disabled={zoom >= 90}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 disabled:opacity-50 transition-all font-bold text-sm border border-blue-500/20"
                        title="Zoom Out (Show more history)"
                    >
                        <ZoomOut className="h-4 w-4" /> <span>-</span>
                    </button>
                </div>
            </div>
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart
                    data={chartData.slice(-zoom)}
                    margin={{
                        top: 5,
                        right: 10,
                        left: 40,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        tickFormatter={(value) => `₹${value}`}
                        width={80}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any, name: any) => [
                            name === 'Revenue' ? `₹${Number(value).toFixed(2)}` : value, 
                            name
                        ]}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="Revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
