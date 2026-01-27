import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@ApiTags('1. System') // Prefix for System modules
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get dashboard statistics' })
    async getStats(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const stats = await this.dashboardService.getStats(startDate, endDate);
        return {
            message: 'Success',
            data: stats,
        };
    }
}
