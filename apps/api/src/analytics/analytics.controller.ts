import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { AnalyticsQueryDto } from './dto/analytics.dto';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('executive') @RequirePermissions('okrs.read')
  executive(@CurrentUser() user:AuthenticatedUser,@Query() query:AnalyticsQueryDto){return this.analytics.executive(user.organizationId,query.cycleId)}

  @Get('alignment') @RequirePermissions('okrs.read')
  alignment(@CurrentUser() user:AuthenticatedUser,@Query('cycleId') cycleId?:string){return this.analytics.alignment(user.organizationId,cycleId)}

  @Get('progress-trend') @RequirePermissions('okrs.read')
  trend(@CurrentUser() user:AuthenticatedUser,@Query() query:AnalyticsQueryDto){return this.analytics.progressTrend(user.organizationId,query)}

  @Get('check-in-health') @RequirePermissions('okrs.read')
  checkInHealth(@CurrentUser() user:AuthenticatedUser,@Query() query:AnalyticsQueryDto){return this.analytics.checkInHealth(user.organizationId,query.cycleId)}

  @Get('breakdown') @RequirePermissions('okrs.read')
  breakdown(@CurrentUser() user:AuthenticatedUser,@Query() query:AnalyticsQueryDto){return this.analytics.breakdown(user.organizationId,query.cycleId,query.groupBy ?? 'scope')}

  @Get('export.csv') @RequirePermissions('okrs.read') @Header('Content-Type','text/csv; charset=utf-8') @Header('Content-Disposition','attachment; filename="achievex-okr-report.csv"')
  exportCsv(@CurrentUser() user:AuthenticatedUser,@Query('cycleId') cycleId?:string){return this.analytics.exportCsv(user.organizationId,cycleId)}
}
