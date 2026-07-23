import { Body, Controller, Get, Param, Post } from '@nestjs/common'; import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; import { CurrentUser } from '../auth/decorators/current-user.decorator'; import { Permissions } from '../auth/decorators/permissions.decorator'; import { AuthenticatedUser } from '../auth/auth.types'; import { IdentityGovernanceService } from './identity-governance.service'; import { CreateAccessRequestDto, CreateCampaignDto, CreatePrivilegedAssignmentDto, CreateSoDRuleDto, DecisionDto } from './dto';
@ApiTags('Identity Governance') @ApiBearerAuth() @Controller('identity-governance') export class IdentityGovernanceController{constructor(private readonly s:IdentityGovernanceService){}
@Get('campaigns') @Permissions('identity.certify') campaigns(@CurrentUser()u:AuthenticatedUser){return this.s.campaigns(u.organizationId)}
@Post('campaigns') @Permissions('identity.certify') createCampaign(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateCampaignDto){return this.s.createCampaign(u.organizationId,d,u.sub)}
@Get('reviews') @Permissions('identity.review') reviews(@CurrentUser()u:AuthenticatedUser){return this.s.reviews(u.organizationId,u.sub)}
@Post('reviews/:id/decision') @Permissions('identity.review') decide(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:DecisionDto){return this.s.decide(u.organizationId,id,d,u.sub)}
@Get('sod') @Permissions('identity.sod.manage') sod(@CurrentUser()u:AuthenticatedUser){return this.s.sod(u.organizationId)}
@Post('sod/rules') @Permissions('identity.sod.manage') rule(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateSoDRuleDto){return this.s.createRule(u.organizationId,d)}
@Get('sod/violations') @Permissions('identity.sod.manage') violations(@CurrentUser()u:AuthenticatedUser){return this.s.violations(u.organizationId)}
@Get('access-requests') @Permissions('identity.access.request') requests(@CurrentUser()u:AuthenticatedUser){return this.s.accessRequests(u.organizationId,u.sub)}
@Post('access-requests') @Permissions('identity.access.request') request(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateAccessRequestDto){return this.s.requestAccess(u.organizationId,u.sub,d)}
@Get('privileged') @Permissions('identity.privileged.manage') privileged(@CurrentUser()u:AuthenticatedUser){return this.s.privileged(u.organizationId)}
@Post('privileged') @Permissions('identity.privileged.manage') assign(@CurrentUser()u:AuthenticatedUser,@Body()d:CreatePrivilegedAssignmentDto){return this.s.assignPrivileged(u.organizationId,d,u.sub)}
@Get('dashboard') @Permissions('identity.analytics') dashboard(@CurrentUser()u:AuthenticatedUser){return this.s.dashboard(u.organizationId)}}
