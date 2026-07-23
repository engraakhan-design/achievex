import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator'; import { RequirePermissions } from '../../auth/decorators/permissions.decorator'; import { AuthenticatedUser } from '../../auth/auth.types';
import { AnalyticsWarehouseService } from './analytics-warehouse.service'; import { CalculateMetricDto, CreateDashboardDto, CreateMetricDto, CreateMetricVersionDto, RunAggregationDto } from './dto/warehouse.dto';
@Controller('analytics') export class AnalyticsWarehouseController {constructor(private service:AnalyticsWarehouseService){}
@Get('metrics') @RequirePermissions('analytics.read') metrics(@CurrentUser()u:AuthenticatedUser){return this.service.listMetrics(u.organizationId)}
@Post('metrics') @RequirePermissions('analytics.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateMetricDto){return this.service.createMetric(u.organizationId,u.sub,d)}
@Post('metrics/:id/versions') @RequirePermissions('analytics.manage') version(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CreateMetricVersionDto){return this.service.addVersion(u.organizationId,u.sub,id,d)}
@Post('metrics/:id/versions/:versionId/publish') @RequirePermissions('analytics.manage') publish(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Param('versionId')v:string){return this.service.publish(u.organizationId,id,v)}
@Post('metrics/:id/calculate') @RequirePermissions('analytics.calculate') calculate(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CalculateMetricDto){return this.service.calculate(u.organizationId,u.sub,id,d)}
@Get('snapshots') @RequirePermissions('analytics.read') snapshots(@CurrentUser()u:AuthenticatedUser,@Query('metricDefinitionId')id?:string){return this.service.snapshots(u.organizationId,id)}
@Get('dashboards') @RequirePermissions('analytics.read') dashboards(@CurrentUser()u:AuthenticatedUser){return this.service.listDashboards(u.organizationId)}
@Post('dashboards') @RequirePermissions('analytics.dashboard.manage') dashboard(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateDashboardDto){return this.service.createDashboard(u.organizationId,u.sub,d)}
@Post('aggregations/run') @RequirePermissions('analytics.calculate') aggregate(@CurrentUser()u:AuthenticatedUser,@Body()d:RunAggregationDto){return this.service.runAggregation(u.organizationId,u.sub,d)} }
