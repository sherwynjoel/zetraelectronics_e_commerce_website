
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('stats')
    async getDashboardStats() {
        return this.analyticsService.getDashboardStats();
    }

    @Get('sales-chart')
    async getSalesChart() {
        return this.analyticsService.getSalesChart();
    }
}
