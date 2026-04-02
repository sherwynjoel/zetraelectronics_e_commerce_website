
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats() {
        const totalRevenue = await this.prisma.order.aggregate({
            _sum: { total: true },
        });

        const totalOrders = await this.prisma.order.count();
        const productsCount = await this.prisma.product.count();
        const usersCount = await this.prisma.user.count();

        // Get recent orders
        const recentOrders = await this.prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: true },
        });

        return {
            revenue: totalRevenue._sum.total || 0,
            orders: totalOrders,
            products: productsCount,
            users: usersCount,
            recentOrders,
        };
    }

    async getSalesChart() {
        const daysToTrack = 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysToTrack);

        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            select: {
                createdAt: true,
                total: true,
            },
        });

        // Initialize last 30 days with 0 to ensure smooth chart rendering
        const chartData: Record<string, { total: number; count: number }> = {};
        for (let i = daysToTrack; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            chartData[dateStr] = { total: 0, count: 0 };
        }

        // Aggregate real data
        orders.forEach(order => {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            if (chartData[dateStr]) {
                chartData[dateStr].total += Number(order.total);
                chartData[dateStr].count += 1;
            }
        });

        return Object.entries(chartData).map(([date, stats]) => ({
            date,
            total: stats.total,
            orders: stats.count
        }));
    }
}
