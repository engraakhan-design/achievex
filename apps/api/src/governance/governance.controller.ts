import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { GovernanceService } from './governance.service';
import { AddEvidenceDto, CreateAssessmentDto, CreateControlDto, CreateFrameworkDto, CreatePolicyDto } from './dto/governance.dto';

@ApiTags('Governance, Risk and Compliance') @ApiBearerAuth() @Controller('governance')
export class GovernanceController {
  constructor(private readonly service: GovernanceService) {}
  @Get('overview') @Permissions('governance.read') overview(@CurrentUser() u: AuthenticatedUser) { return this.service.overview(u.organizationId); }
  @Get('frameworks') @Permissions('governance.read') frameworks(@CurrentUser() u: AuthenticatedUser) { return this.service.frameworks(u.organizationId); }
  @Post('frameworks') @Permissions('governance.manage') createFramework(@CurrentUser() u: AuthenticatedUser, @Body() d: CreateFrameworkDto) { return this.service.createFramework(u.organizationId, d); }
  @Get('policies') @Permissions('policy.read') policies(@CurrentUser() u: AuthenticatedUser) { return this.service.policies(u.organizationId); }
  @Post('policies') @Permissions('policy.manage') createPolicy(@CurrentUser() u: AuthenticatedUser, @Body() d: CreatePolicyDto) { return this.service.createPolicy(u.organizationId, d); }
  @Get('controls') @Permissions('control.read') controls(@CurrentUser() u: AuthenticatedUser, @Query('frameworkId') frameworkId?: string) { return this.service.controls(u.organizationId, frameworkId); }
  @Post('controls') @Permissions('control.manage') createControl(@CurrentUser() u: AuthenticatedUser, @Body() d: CreateControlDto) { return this.service.createControl(u.organizationId, d); }
  @Post('evidence') @Permissions('evidence.manage') addEvidence(@CurrentUser() u: AuthenticatedUser, @Body() d: AddEvidenceDto) { return this.service.addEvidence(u.organizationId, d); }
  @Get('assessments') @Permissions('assessment.read') assessments(@CurrentUser() u: AuthenticatedUser) { return this.service.assessments(u.organizationId); }
  @Post('assessments') @Permissions('assessment.manage') createAssessment(@CurrentUser() u: AuthenticatedUser, @Body() d: CreateAssessmentDto) { return this.service.createAssessment(u.organizationId, d); }
}
