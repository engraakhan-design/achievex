import { Body, Controller, Get, Param, Post } from '@nestjs/common'; import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; import { CurrentUser } from '../auth/decorators/current-user.decorator'; import { Permissions } from '../auth/decorators/permissions.decorator'; import { AuthenticatedUser } from '../auth/auth.types'; import { RiskAssuranceService } from './risk-assurance.service'; import { AssessRiskDto, CompleteControlTestDto, CreateControlTestDto, CreateCorrectiveActionDto, CreateFindingDto, CreateRiskDto } from './dto';
@ApiTags('Enterprise Risk and Control Assurance') @ApiBearerAuth() @Controller()
export class RiskAssuranceController { constructor(private readonly s:RiskAssuranceService){}
@Get('risk/register') @Permissions('risk.read') risks(@CurrentUser()u:AuthenticatedUser){return this.s.risks(u.organizationId)}
@Post('risk/register') @Permissions('risk.manage') createRisk(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateRiskDto){return this.s.createRisk(u.organizationId,d)}
@Post('risk/register/:id/assessments') @Permissions('risk.assess') assess(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:AssessRiskDto){return this.s.assess(u.organizationId,id,d,u.sub)}
@Get('risk/heatmap') @Permissions('risk.read') heatmap(@CurrentUser()u:AuthenticatedUser){return this.s.heatmap(u.organizationId)}
@Get('risk/dashboard') @Permissions('grc.dashboard') dashboard(@CurrentUser()u:AuthenticatedUser){return this.s.dashboard(u.organizationId)}
@Get('control-tests') @Permissions('control.test') tests(@CurrentUser()u:AuthenticatedUser){return this.s.tests(u.organizationId)}
@Post('control-tests') @Permissions('control.test') createTest(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateControlTestDto){return this.s.createTest(u.organizationId,d)}
@Post('control-tests/:id/complete') @Permissions('control.test') complete(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CompleteControlTestDto){return this.s.completeTest(u.organizationId,id,d,u.sub)}
@Get('findings') @Permissions('finding.manage') findings(@CurrentUser()u:AuthenticatedUser){return this.s.findings(u.organizationId)}
@Post('findings') @Permissions('finding.manage') finding(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateFindingDto){return this.s.createFinding(u.organizationId,d)}
@Get('actions') @Permissions('action.manage') actions(@CurrentUser()u:AuthenticatedUser){return this.s.actions(u.organizationId)}
@Post('actions') @Permissions('action.manage') action(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateCorrectiveActionDto){return this.s.createAction(u.organizationId,d)} }
