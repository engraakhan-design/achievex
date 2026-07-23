import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { AddEdgeDto, AddNodeDto, ApprovalDecisionDto, CompleteStepDto, CreateAutomationDto, StartAutomationDto, UpdateAutomationDto } from './dto';
import { IntegrationAutomationService } from './integration-automation.service';
@ApiTags('Integration Automation Builder') @ApiBearerAuth() @Controller('v1/automation-builder')
export class IntegrationAutomationController { constructor(private readonly service:IntegrationAutomationService){}
@Get('workflows') @Permissions('integration.automation.read') workflows(@CurrentUser()u:AuthenticatedUser){return this.service.workflows(u.organizationId)}
@Post('workflows') @Permissions('integration.automation.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateAutomationDto){return this.service.create(u.organizationId,u.sub,d)}
@Get('workflows/:id') @Permissions('integration.automation.read') workflow(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.workflow(u.organizationId,id)}
@Patch('workflows/:id') @Permissions('integration.automation.manage') update(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpdateAutomationDto){return this.service.update(u.organizationId,id,d)}
@Post('workflows/:id/nodes') @Permissions('integration.automation.manage') node(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:AddNodeDto){return this.service.addNode(u.organizationId,id,d)}
@Post('workflows/:id/edges') @Permissions('integration.automation.manage') edge(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:AddEdgeDto){return this.service.addEdge(u.organizationId,id,d)}
@Post('workflows/:id/publish') @Permissions('integration.automation.publish') publish(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.publish(u.organizationId,u.sub,id)}
@Post('workflows/:id/runs') @Permissions('integration.automation.execute') start(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:StartAutomationDto){return this.service.start(u.organizationId,u.sub,id,d)}
@Get('runs') @Permissions('integration.automation.read') runs(@CurrentUser()u:AuthenticatedUser,@Query('take')take?:string){return this.service.runs(u.organizationId,Number(take)||100)}
@Post('runs/:id/cancel') @Permissions('integration.automation.execute') cancel(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.cancel(u.organizationId,id)}
@Post('steps/:id/complete') @Permissions('integration.automation.worker') complete(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CompleteStepDto){return this.service.completeStep(u.organizationId,id,d)}
@Post('steps/:id/retry') @Permissions('integration.automation.execute') retry(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.retryStep(u.organizationId,id)}
@Get('approvals') @Permissions('integration.automation.approve') approvals(@CurrentUser()u:AuthenticatedUser){return this.service.approvals(u.organizationId,u.sub)}
@Post('approvals/:id/decision') @Permissions('integration.automation.approve') decide(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:ApprovalDecisionDto){return this.service.decide(u.organizationId,u.sub,id,d)}
@Get('analytics') @Permissions('integration.automation.analytics') analytics(@CurrentUser()u:AuthenticatedUser,@Query('days')days?:string){return this.service.analytics(u.organizationId,Number(days)||30)} }
