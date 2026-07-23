import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CreateChecklistItemDto, CreateDependencyDto, CreateKeyResultLinkDto, CreateObjectiveLinkDto, CreateExecutionLabelDto, CreateIssueDto, CreateMilestoneDto, CreatePortfolioDto, CreateProgramDto, CreateProjectDto, CreateRiskDto, CreateTaskAttachmentDto, CreateTaskCommentDto, CreateTaskDependencyDto, CreateTaskDto, CreateWorkstreamDto, ListExecutionQuery, ListTasksQuery, PortfolioAnalyticsQuery, ReorderTaskDto, SetTaskLabelsDto, TransitionProjectDto, UpdateChecklistItemDto, UpdateIssueDto, UpdateMilestoneDto, UpdatePortfolioDto, UpdateProgramDto, UpdateProjectDto, UpdateRiskDto, UpdateTaskDto } from './dto/execution.dto';
import { ExecutionService } from './execution.service';

@ApiTags('execution') @ApiBearerAuth() @Controller('execution')
export class ExecutionController {
  constructor(private readonly service: ExecutionService) {}
  @Get('overview') @RequirePermissions('execution.read') overview(@CurrentUser() u: AuthenticatedUser) { return this.service.overview(u.organizationId); }
  @Get('analytics/dashboard') @RequirePermissions('execution.read') analyticsDashboard(@CurrentUser() u: AuthenticatedUser, @Query() q: PortfolioAnalyticsQuery) { return this.service.analyticsDashboard(u.organizationId, q); }
  @Get('analytics/portfolios/:id') @RequirePermissions('execution.read') portfolioAnalytics(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.portfolioAnalytics(u.organizationId, id); }
  @Get('analytics/executive-report') @RequirePermissions('execution.read') executiveReport(@CurrentUser() u: AuthenticatedUser, @Query() q: PortfolioAnalyticsQuery) { return this.service.executiveReport(u.organizationId, q); }
  @Get('portfolios') @RequirePermissions('execution.read') portfolios(@CurrentUser() u: AuthenticatedUser, @Query() q: ListExecutionQuery) { return this.service.listPortfolios(u.organizationId, q); }
  @Post('portfolios') @RequirePermissions('execution.manage') createPortfolio(@CurrentUser() u: AuthenticatedUser, @Body() d: CreatePortfolioDto) { return this.service.createPortfolio(u.organizationId, u.sub, d); }
  @Get('portfolios/:id') @RequirePermissions('execution.read') portfolio(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.getPortfolio(u.organizationId, id); }
  @Patch('portfolios/:id') @RequirePermissions('execution.manage') updatePortfolio(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: UpdatePortfolioDto) { return this.service.updatePortfolio(u.organizationId, id, u.sub, d); }
  @Get('programs') @RequirePermissions('execution.read') programs(@CurrentUser() u: AuthenticatedUser, @Query() q: ListExecutionQuery) { return this.service.listPrograms(u.organizationId, q); }
  @Post('programs') @RequirePermissions('execution.manage') createProgram(@CurrentUser() u: AuthenticatedUser, @Body() d: CreateProgramDto) { return this.service.createProgram(u.organizationId, u.sub, d); }
  @Get('programs/:id') @RequirePermissions('execution.read') program(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.getProgram(u.organizationId, id); }
  @Patch('programs/:id') @RequirePermissions('execution.manage') updateProgram(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: UpdateProgramDto) { return this.service.updateProgram(u.organizationId, id, u.sub, d); }
  @Get('projects') @RequirePermissions('execution.read') projects(@CurrentUser() u: AuthenticatedUser, @Query() q: ListExecutionQuery) { return this.service.listProjects(u.organizationId, q); }
  @Post('projects') @RequirePermissions('execution.manage') createProject(@CurrentUser() u: AuthenticatedUser, @Body() d: CreateProjectDto) { return this.service.createProject(u.organizationId, u.sub, d); }
  @Get('projects/:id') @RequirePermissions('execution.read') project(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.getProject(u.organizationId, id); }
  @Patch('projects/:id') @RequirePermissions('execution.manage') updateProject(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: UpdateProjectDto) { return this.service.updateProject(u.organizationId, id, u.sub, d); }
  @Post('projects/:id/transition') @RequirePermissions('execution.manage') transition(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: TransitionProjectDto) { return this.service.transitionProject(u.organizationId, id, u.sub, d); }
  @Post('projects/:id/recalculate-health') @RequirePermissions('execution.manage') health(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.recalculateProject(u.organizationId, id, u.sub); }
  @Post('projects/:id/workstreams') @RequirePermissions('execution.manage') workstream(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: CreateWorkstreamDto) { return this.service.createWorkstream(u.organizationId, id, u.sub, d); }
  @Post('projects/:id/milestones') @RequirePermissions('execution.manage') milestone(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: CreateMilestoneDto) { return this.service.createMilestone(u.organizationId, id, u.sub, d); }
  @Patch('milestones/:id') @RequirePermissions('execution.manage') updateMilestone(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: UpdateMilestoneDto) { return this.service.updateMilestone(u.organizationId, id, u.sub, d); }
  @Post('projects/:id/tasks') @RequirePermissions('execution.manage') task(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: CreateTaskDto) { return this.service.createTask(u.organizationId, id, u.sub, d); }
  @Patch('tasks/:id') @RequirePermissions('execution.manage') updateTask(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: UpdateTaskDto) { return this.service.updateTask(u.organizationId, id, u.sub, d); }
  @Post('dependencies') @RequirePermissions('execution.manage') dependency(@CurrentUser() u: AuthenticatedUser, @Body() d: CreateDependencyDto) { return this.service.createDependency(u.organizationId, u.sub, d); }
  @Post('projects/:id/risks') @RequirePermissions('execution.manage') risk(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: CreateRiskDto) { return this.service.createRisk(u.organizationId, id, u.sub, d); }
  @Patch('risks/:id') @RequirePermissions('execution.manage') updateRisk(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: UpdateRiskDto) { return this.service.updateRisk(u.organizationId, id, u.sub, d); }
  @Post('projects/:id/issues') @RequirePermissions('execution.manage') issue(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: CreateIssueDto) { return this.service.createIssue(u.organizationId, id, u.sub, d); }
  @Patch('issues/:id') @RequirePermissions('execution.manage') updateIssue(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: UpdateIssueDto) { return this.service.updateIssue(u.organizationId, id, u.sub, d); }
  @Get('projects/:id/board') @RequirePermissions('execution.read') board(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.projectBoard(u.organizationId, id); }
  @Get('tasks') @RequirePermissions('execution.read') tasks(@CurrentUser() u: AuthenticatedUser, @Query() q: ListTasksQuery) { return this.service.listTasks(u.organizationId, q); }
  @Get('tasks/:id') @RequirePermissions('execution.read') taskDetail(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.getTask(u.organizationId, id); }
  @Patch('tasks/:id/reorder') @RequirePermissions('execution.manage') reorderTask(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: ReorderTaskDto) { return this.service.reorderTask(u.organizationId, id, u.sub, d); }
  @Post('tasks/:id/comments') @RequirePermissions('execution.manage') taskComment(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: CreateTaskCommentDto) { return this.service.addTaskComment(u.organizationId, id, u.sub, d); }
  @Post('tasks/:id/checklist') @RequirePermissions('execution.manage') checklist(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: CreateChecklistItemDto) { return this.service.addChecklistItem(u.organizationId, id, u.sub, d); }
  @Patch('checklist/:id') @RequirePermissions('execution.manage') updateChecklist(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: UpdateChecklistItemDto) { return this.service.updateChecklistItem(u.organizationId, id, u.sub, d); }
  @Get('labels') @RequirePermissions('execution.read') labels(@CurrentUser() u: AuthenticatedUser) { return this.service.listLabels(u.organizationId); }
  @Post('labels') @RequirePermissions('execution.manage') createLabel(@CurrentUser() u: AuthenticatedUser, @Body() d: CreateExecutionLabelDto) { return this.service.createLabel(u.organizationId, u.sub, d); }
  @Put('tasks/:id/labels') @RequirePermissions('execution.manage') taskLabels(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: SetTaskLabelsDto) { return this.service.setTaskLabels(u.organizationId, id, u.sub, d); }
  @Post('tasks/:id/attachments') @RequirePermissions('execution.manage') attachment(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: CreateTaskAttachmentDto) { return this.service.addTaskAttachment(u.organizationId, id, u.sub, d); }
  @Post('task-dependencies') @RequirePermissions('execution.manage') taskDependency(@CurrentUser() u: AuthenticatedUser, @Body() d: CreateTaskDependencyDto) { return this.service.createTaskDependency(u.organizationId, u.sub, d); }

  @Get('strategy/catalog') @RequirePermissions('execution.read') strategyCatalog(@CurrentUser() u: AuthenticatedUser) { return this.service.strategyCatalog(u.organizationId); }
  @Get('projects/:id/traceability') @RequirePermissions('execution.read') projectTraceability(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.projectTraceability(u.organizationId, id); }
  @Post('projects/:id/objective-links') @RequirePermissions('execution.manage') linkObjective(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: CreateObjectiveLinkDto) { return this.service.linkObjective(u.organizationId, id, u.sub, d); }
  @Delete('projects/:id/objective-links/:objectiveId') @RequirePermissions('execution.manage') unlinkObjective(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Param('objectiveId') objectiveId: string) { return this.service.unlinkObjective(u.organizationId, id, objectiveId, u.sub); }
  @Post('projects/:id/key-result-links') @RequirePermissions('execution.manage') linkKeyResult(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() d: CreateKeyResultLinkDto) { return this.service.linkKeyResult(u.organizationId, id, u.sub, d); }
  @Delete('projects/:id/key-result-links/:keyResultId') @RequirePermissions('execution.manage') unlinkKeyResult(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Param('keyResultId') keyResultId: string) { return this.service.unlinkKeyResult(u.organizationId, id, keyResultId, u.sub); }
  @Get('objectives/:id/traceability') @RequirePermissions('execution.read') objectiveTraceability(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.objectiveTraceability(u.organizationId, id); }
  @Get('key-results/:id/traceability') @RequirePermissions('execution.read') keyResultTraceability(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.keyResultTraceability(u.organizationId, id); }

}
