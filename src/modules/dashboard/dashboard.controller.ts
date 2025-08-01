import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { QueryDashboardStatisticDto } from './dto/query-dashboard-statistic.dto';
import { ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get dashboard statistics' })
  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getStatisticsByRange(@Query() query: QueryDashboardStatisticDto) {
    return this.dashboardService.getStatisticsForDateRange(query);
  }

  @ApiOperation({ summary: 'Get current dashboard statistics' })
  @Get('statistics/today')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getStatisticsForToday() {
    return this.dashboardService.getStatisticsForToday();
  }
}
