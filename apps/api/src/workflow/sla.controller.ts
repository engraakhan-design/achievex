import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator'; import { RequirePermissions } from '../auth/decorators/permissions.decorator'; import { AuthenticatedUser } from '../auth/auth.types';
import { CreateSlaEscalationDto, CreateSlaPolicyDto, StartSlaClockDto } from './dto/sla.dto'; import { SlaService } from './sla.service';
@ApiTags('Workflow SLA') @ApiBearerAuth() @Controller('workflow/sla')
export class SlaController {
 constructor(private readonly sla:SlaService){}
 @Get('policies') @RequirePermissions('sla.read') policies(@CurrentUser() u:AuthenticatedUser){return this.sla.listPolicies(u.organizationId)}
 @Post('policies') @RequirePermissions('sla.manage') create(@CurrentUser() u:AuthenticatedUser,@Body() d:CreateSlaPolicyDto){return this.sla.createPolicy(u.organizationId,u.sub,d)}
 @Post('policies/:id/activate') @RequirePermissions('sla.manage') activate(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string){return this.sla.activatePolicy(u.organizationId,id)}
 @Get('clocks') @RequirePermissions('sla.read') clocks(@CurrentUser() u:AuthenticatedUser,@Query('status') status?:string){return this.sla.listClocks(u.organizationId,status)}
 @Post('clocks') @RequirePermissions('sla.execute') start(@CurrentUser() u:AuthenticatedUser,@Body() d:StartSlaClockDto){return this.sla.startClock(u.organizationId,d)}
 @Patch('clocks/:id/complete') @RequirePermissions('sla.execute') complete(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string,@Body() d:{metadata?:Record<string,unknown>}){return this.sla.completeClock(u.organizationId,id,d.metadata)}
 @Post('clocks/:id/escalations') @RequirePermissions('sla.manage') escalation(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string,@Body() d:CreateSlaEscalationDto){return this.sla.addEscalation(u.organizationId,id,d)}
 @Post('process-due') @RequirePermissions('sla.execute') process(@CurrentUser() u:AuthenticatedUser){return this.sla.processDue(u.organizationId)}
 @Get('dashboard') @RequirePermissions('sla.read') dashboard(@CurrentUser() u:AuthenticatedUser){return this.sla.dashboard(u.organizationId)}
}
