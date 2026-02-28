
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
        // Group by day for the last 7 days
        // This is complex in Prisma raw or requires processing in JS
        // For now, let's just return a mock or simple aggregation
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: {
                    gte: sevenDaysAgo,
                },
            },
            select: {
                createdAt: true,
                total: true,
            },
        });

        // Aggregate by date in JS
        const chartData = {};
        orders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0];
            if (!chartData[date]) chartData[date] = 0;
            chartData[date] += Number(order.total);
        });

        return Object.entries(chartData).map(([date, total]) => ({ date, total }));
    }
}
