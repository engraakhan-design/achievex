import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { ApprovalService } from './approval.service';
import { CreateApprovalRequestDto, CreateDelegationDto, CreateEscalationDto, DecideApprovalDto } from './dto/approval.dto';
@Controller('workflow')
export class ApprovalController {
 constructor(private readonly service:ApprovalService){}
 @Post('approvals') @RequirePermissions('approval.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateApprovalRequestDto){return this.service.create(u.organizationId,u.sub,d)}
 @Get('approvals') @RequirePermissions('approval.read') list(@CurrentUser()u:AuthenticatedUser,@Query('mine')mine?:string){return this.service.list(u.organizationId,mine==='true'?u.sub:undefined)}
 @Get('approvals/dashboard') @RequirePermissions('approval.read') dashboard(@CurrentUser()u:AuthenticatedUser){return this.service.dashboard(u.organizationId)}
 @Get('approvals/:id') @RequirePermissions('approval.read') get(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.get(u.organizationId,id)}
 @Post('approvals/:id/decide') @RequirePermissions('approval.approve') decide(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:DecideApprovalDto){return this.service.decide(u.organizationId,u.sub,id,d)}
 @Post('approvals/:id/approve') @RequirePermissions('approval.approve') approve(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:Omit<DecideApprovalDto,'decision'>){return this.service.decide(u.organizationId,u.sub,id,{...d,decision:'APPROVE'} as DecideApprovalDto)}
 @Post('approvals/:id/reject') @RequirePermissions('approval.approve') reject(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:Omit<DecideApprovalDto,'decision'>){return this.service.decide(u.organizationId,u.sub,id,{...d,decision:'REJECT'} as DecideApprovalDto)}
 @Post('approvals/:id/request-changes') @RequirePermissions('approval.approve') changes(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:Omit<DecideApprovalDto,'decision'>){return this.service.decide(u.organizationId,u.sub,id,{...d,decision:'REQUEST_CHANGES'} as DecideApprovalDto)}
 @Post('approvals/:id/escalations') @RequirePermissions('approval.manage') escalate(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CreateEscalationDto){return this.service.escalate(u.organizationId,id,d)}
 @Post('delegations') @RequirePermissions('approval.delegate') delegate(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateDelegationDto){return this.service.createDelegation(u.organizationId,u.sub,d)}
 @Get('delegations') @RequirePermissions('approval.read') delegations(@CurrentUser()u:AuthenticatedUser){return this.service.listDelegations(u.organizationId)}
}
