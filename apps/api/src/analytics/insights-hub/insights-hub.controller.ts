import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../../auth/auth.types';
import { AcknowledgeInsightDto, CreateInsightSubscriptionDto, CreateManualInsightDto } from './dto/insights-hub.dto';
import { InsightsHubService } from './insights-hub.service';
@Controller('analytics/insights')
export class InsightsHubController { constructor(private service:InsightsHubService){}
 @Get() @RequirePermissions('insight.read') list(@CurrentUser()u:AuthenticatedUser,@Query('status')status?:string,@Query('severity')severity?:string,@Query('type')type?:string,@Query('tag')tag?:string){return this.service.list(u.organizationId,{status,severity,type,tag})}
 @Get('dashboard') @RequirePermissions('insight.read') dashboard(@CurrentUser()u:AuthenticatedUser){return this.service.dashboard(u.organizationId)}
 @Post('refresh') @RequirePermissions('insight.manage') refresh(@CurrentUser()u:AuthenticatedUser){return this.service.refresh(u.organizationId,u.sub)}
 @Post() @RequirePermissions('insight.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateManualInsightDto){return this.service.createManual(u.organizationId,u.sub,d)}
 @Get('subscriptions') @RequirePermissions('insight.read') subscriptions(@CurrentUser()u:AuthenticatedUser){return this.service.subscriptions(u.organizationId,u.sub)}
 @Post('subscriptions') @RequirePermissions('insight.subscribe') subscribe(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateInsightSubscriptionDto){return this.service.createSubscription(u.organizationId,u.sub,d)}
 @Get(':id') @RequirePermissions('insight.read') detail(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.detail(u.organizationId,id)}
 @Post(':id/acknowledgements') @RequirePermissions('insight.acknowledge') acknowledge(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:AcknowledgeInsightDto){return this.service.acknowledge(u.organizationId,u.sub,id,d)}
}
