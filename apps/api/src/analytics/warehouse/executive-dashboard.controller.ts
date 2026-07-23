import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../../auth/auth.types';
import { ExecutiveDashboardService } from './executive-dashboard.service';
@Controller('analytics/executive-dashboards')
export class ExecutiveDashboardController {
 constructor(private service:ExecutiveDashboardService){}
 @Get() @RequirePermissions('analytics.read') list(@CurrentUser()u:AuthenticatedUser,@Query('audience')audience?:string){return this.service.overview(u.organizationId,audience)}
 @Post('templates/:audience') @RequirePermissions('analytics.dashboard.manage') template(@CurrentUser()u:AuthenticatedUser,@Param('audience')a:string){return this.service.ensureTemplate(u.organizationId,u.sub,a)}
 @Get(':id') @RequirePermissions('analytics.read') detail(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Query()filters:Record<string,string>){return this.service.detail(u.organizationId,id,filters)}
 @Post(':id/views') @RequirePermissions('analytics.read') save(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()b:{name:string;filters?:Record<string,string>;isDefault?:boolean}){return this.service.saveView(u.organizationId,u.sub,id,b.name,b.filters||{},!!b.isDefault)}
 @Get('metrics/:metricId/drilldown') @RequirePermissions('analytics.read') drill(@CurrentUser()u:AuthenticatedUser,@Param('metricId')id:string,@Query('dimension')dimension?:string){return this.service.drilldown(u.organizationId,id,dimension)}
}
