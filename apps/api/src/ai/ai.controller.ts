import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { AiService } from './ai.service';
import { AiFeedbackDto, AnalyzeProjectDeliveryRiskDto, AnalyzeRisksDto, ExecutiveDeliveryUpdateDto, ExecutiveSummaryDto, GenerateObjectivesDto, GenerateProjectPlanDto, ProjectHealthSummaryDto, ResolveResourceConflictsDto, RewriteObjectiveDto, SkillGapAnalysisDto, StaffingRecommendationDto, WorkforceSummaryDto } from './dto/ai.dto';

@ApiTags('AI Strategy Assistant') @ApiBearerAuth() @Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}
  @Post('objectives/generate') @RequirePermissions('okrs.manage') generate(@CurrentUser() u: AuthenticatedUser, @Body() d: GenerateObjectivesDto) { return this.ai.generateObjectives(u.organizationId, u.sub, d); }
  @Post('objectives/rewrite') @RequirePermissions('okrs.manage') rewrite(@CurrentUser() u: AuthenticatedUser, @Body() d: RewriteObjectiveDto) { return this.ai.rewriteObjective(u.organizationId, u.sub, d); }
  @Post('risks/analyze') @RequirePermissions('okrs.read') risks(@CurrentUser() u: AuthenticatedUser, @Body() d: AnalyzeRisksDto) { return this.ai.analyzeRisks(u.organizationId, u.sub, d); }
  @Post('executive-summary') @RequirePermissions('okrs.read') summary(@CurrentUser() u: AuthenticatedUser, @Body() d: ExecutiveSummaryDto) { return this.ai.executiveSummary(u.organizationId, u.sub, d); }
  @Post('projects/plan') @RequirePermissions('execution.manage') projectPlan(@CurrentUser() u: AuthenticatedUser, @Body() d: GenerateProjectPlanDto) { return this.ai.generateProjectPlan(u.organizationId, u.sub, d); }
  @Post('projects/risks/analyze') @RequirePermissions('execution.read') projectRisks(@CurrentUser() u: AuthenticatedUser, @Body() d: AnalyzeProjectDeliveryRiskDto) { return this.ai.analyzeProjectDeliveryRisk(u.organizationId, u.sub, d); }
  @Post('projects/health-summary') @RequirePermissions('execution.read') projectSummary(@CurrentUser() u: AuthenticatedUser, @Body() d: ProjectHealthSummaryDto) { return this.ai.projectHealthSummary(u.organizationId, u.sub, d); }
  @Post('projects/executive-update') @RequirePermissions('execution.read') deliveryUpdate(@CurrentUser() u: AuthenticatedUser, @Body() d: ExecutiveDeliveryUpdateDto) { return this.ai.executiveDeliveryUpdate(u.organizationId, u.sub, d); }
  @Post('resources/staffing-recommendations') @RequirePermissions('resources.read') staffing(@CurrentUser() u: AuthenticatedUser, @Body() d: StaffingRecommendationDto) { return this.ai.staffingRecommendations(u.organizationId, u.sub, d); }
  @Post('resources/conflicts/resolve') @RequirePermissions('resources.read') resolveConflicts(@CurrentUser() u: AuthenticatedUser, @Body() d: ResolveResourceConflictsDto) { return this.ai.resolveResourceConflicts(u.organizationId, u.sub, d); }
  @Post('resources/skill-gaps') @RequirePermissions('resources.read') skillGaps(@CurrentUser() u: AuthenticatedUser, @Body() d: SkillGapAnalysisDto) { return this.ai.skillGapAnalysis(u.organizationId, u.sub, d); }
  @Post('resources/workforce-summary') @RequirePermissions('resources.read') workforceSummary(@CurrentUser() u: AuthenticatedUser, @Body() d: WorkforceSummaryDto) { return this.ai.workforceSummary(u.organizationId, u.sub, d); }
  @Get('history') @RequirePermissions('okrs.read') history(@CurrentUser() u: AuthenticatedUser) { return this.ai.history(u.organizationId, u.sub); }
  @Get('usage') @RequirePermissions('organization.manage') usage(@CurrentUser() u: AuthenticatedUser) { return this.ai.usage(u.organizationId); }
  @Post('generations/:id/feedback') @RequirePermissions('okrs.read') feedback(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: AiFeedbackDto) { return this.ai.feedback(u.organizationId, u.sub, id, d.helpful, d.comment); }
}
