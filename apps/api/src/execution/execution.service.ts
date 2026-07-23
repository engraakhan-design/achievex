import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ExecutionHealth, ExecutionStatus, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { EventsService } from '../events/events.service';
import { PrismaService } from '../prisma/prisma.service';
import { portfolioRollup, projectVariance, riskScore } from './execution-analytics';
import { CreateChecklistItemDto, CreateDependencyDto, CreateKeyResultLinkDto, CreateObjectiveLinkDto, CreateExecutionLabelDto, CreateIssueDto, CreateMilestoneDto, CreatePortfolioDto, CreateProgramDto, CreateProjectDto, CreateRiskDto, CreateTaskAttachmentDto, CreateTaskCommentDto, CreateTaskDependencyDto, CreateTaskDto, CreateWorkstreamDto, ListExecutionQuery, ListTasksQuery, PortfolioAnalyticsQuery, ReorderTaskDto, SetTaskLabelsDto, TransitionProjectDto, UpdateChecklistItemDto, UpdateIssueDto, UpdateMilestoneDto, UpdatePortfolioDto, UpdateProgramDto, UpdateProjectDto, UpdateRiskDto, UpdateTaskDto } from './dto/execution.dto';

@Injectable()
export class ExecutionService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService, private readonly events: EventsService) {}
  private date(value?: string) { return value ? new Date(value) : undefined; }
  private async user(org: string, id?: string) { if (id && !await this.prisma.user.findFirst({ where: { id, organizationId: org } })) throw new BadRequestException('Invalid user'); }
  private async project(org: string, id: string) { const project = await this.prisma.project.findFirst({ where: { id, organizationId: org } }); if (!project) throw new NotFoundException('Project not found'); return project; }
  private async placement(org: string, portfolioId?: string, programId?: string) {
    const portfolio = portfolioId ? await this.prisma.portfolio.findFirst({ where: { id: portfolioId, organizationId: org } }) : null;
    const program = programId ? await this.prisma.program.findFirst({ where: { id: programId, organizationId: org } }) : null;
    if (portfolioId && !portfolio) throw new BadRequestException('Invalid portfolio');
    if (programId && !program) throw new BadRequestException('Invalid program');
    if (portfolioId && program?.portfolioId && program.portfolioId !== portfolioId) throw new BadRequestException('Program does not belong to the selected portfolio');
  }
  private async activity(org: string, projectId: string, actor: string, action: string, entityType: string, entityId: string, metadata?: Prisma.InputJsonValue) {
    await this.prisma.executionActivity.create({ data: { organizationId: org, projectId, actorId: actor, action, entityType, entityId, metadata } });
    await this.events.publish({ organizationId: org, eventName: action, aggregateType: entityType, aggregateId: entityId, actorUserId: actor, payload: metadata });
  }
  private variance(project: { budget: unknown; actualCost: unknown; startDate: Date | null; targetDate: Date | null; progress: unknown }) {
    const budget = Number(project.budget ?? 0), actualCost = Number(project.actualCost ?? 0), progress = Number(project.progress ?? 0);
    const budgetVariance = budget ? actualCost - budget : 0;
    const budgetVariancePercent = budget ? (budgetVariance / budget) * 100 : 0;
    const now = Date.now(), start = project.startDate?.getTime(), target = project.targetDate?.getTime();
    const scheduleProgress = start && target && target > start ? Math.max(0, Math.min(100, ((now - start) / (target - start)) * 100)) : 0;
    return { budgetVariance, budgetVariancePercent, scheduleProgress, scheduleVariancePoints: progress - scheduleProgress, daysRemaining: target ? Math.ceil((target - now) / 86400000) : null };
  }
  private calculateHealth(input: { project: any; overdueTasks: number; overdueMilestones: number; criticalIssues: number; highRisks: number }) {
    const v = this.variance(input.project); let score = 0;
    if (input.overdueMilestones) score += 3;
    if (input.criticalIssues) score += 3;
    if (input.highRisks) score += 2;
    if (input.overdueTasks >= 3) score += 2; else if (input.overdueTasks) score += 1;
    if (v.scheduleVariancePoints < -20) score += 3; else if (v.scheduleVariancePoints < -10) score += 2;
    if (v.budgetVariancePercent > 20) score += 3; else if (v.budgetVariancePercent > 10) score += 2;
    if (input.project.targetDate && input.project.targetDate < new Date() && Number(input.project.progress) < 100) score += 3;
    const health: ExecutionHealth = score >= 6 ? 'OFF_TRACK' : score >= 3 ? 'AT_RISK' : 'ON_TRACK';
    return { health, score, ...v, signals: { overdueTasks: input.overdueTasks, overdueMilestones: input.overdueMilestones, criticalIssues: input.criticalIssues, highRisks: input.highRisks } };
  }
  private async healthSnapshot(org: string, projectId: string) {
    const project = await this.project(org, projectId); const now = new Date();
    const [overdueTasks, overdueMilestones, criticalIssues, highRisks] = await Promise.all([
      this.prisma.projectTask.count({ where: { organizationId: org, projectId, dueDate: { lt: now }, status: { notIn: ['DONE', 'CANCELLED'] } } }),
      this.prisma.projectMilestone.count({ where: { organizationId: org, projectId, plannedDate: { lt: now }, status: { notIn: ['DONE', 'CANCELLED'] } } }),
      this.prisma.projectIssue.count({ where: { organizationId: org, projectId, severity: 'CRITICAL', status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      this.prisma.projectRisk.count({ where: { organizationId: org, projectId, probability: { in: ['HIGH', 'VERY_HIGH'] }, impact: { in: ['HIGH', 'CRITICAL'] }, status: { in: ['OPEN', 'MITIGATING'] } } }),
    ]);
    return this.calculateHealth({ project, overdueTasks, overdueMilestones, criticalIssues, highRisks });
  }
  private async refreshHealth(org: string, projectId: string) { const snapshot = await this.healthSnapshot(org, projectId); await this.prisma.project.update({ where: { id: projectId }, data: { health: snapshot.health } }); return snapshot; }

  async overview(org: string) {
    const [portfolios, programs, projects, openRisks, openIssues] = await Promise.all([
      this.prisma.portfolio.count({ where: { organizationId: org } }), this.prisma.program.count({ where: { organizationId: org } }),
      this.prisma.project.findMany({ where: { organizationId: org }, select: { status: true, health: true, progress: true, budget: true, actualCost: true, targetDate: true } }),
      this.prisma.projectRisk.count({ where: { organizationId: org, status: { in: ['OPEN', 'MITIGATING'] } } }), this.prisma.projectIssue.count({ where: { organizationId: org, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    ]);
    return { portfolios, programs, projects: projects.length, activeProjects: projects.filter(x => x.status === 'ACTIVE').length, atRiskProjects: projects.filter(x => ['AT_RISK', 'OFF_TRACK'].includes(x.health)).length, averageProgress: projects.length ? projects.reduce((s, x) => s + Number(x.progress), 0) / projects.length : 0, openRisks, openIssues, budget: projects.reduce((s, x) => s + Number(x.budget ?? 0), 0), actualCost: projects.reduce((s, x) => s + Number(x.actualCost), 0), overdueProjects: projects.filter(x => x.targetDate && x.targetDate < new Date() && Number(x.progress) < 100).length };
  }
  listPortfolios(org: string, q: ListExecutionQuery) { return this.prisma.portfolio.findMany({ where: { organizationId: org, status: q.status, health: q.health, OR: q.search ? [{ name: { contains: q.search, mode: 'insensitive' } }, { description: { contains: q.search, mode: 'insensitive' } }] : undefined }, include: { owner: { select: { id: true, firstName: true, lastName: true } }, projects: { select: { progress: true, health: true, budget: true, actualCost: true } }, _count: { select: { programs: true, projects: true } } }, orderBy: { updatedAt: 'desc' } }); }
  async getPortfolio(org: string, id: string) { const item = await this.prisma.portfolio.findFirst({ where: { id, organizationId: org }, include: { owner: { select: { id: true, firstName: true, lastName: true } }, programs: true, projects: { include: { owner: { select: { id: true, firstName: true, lastName: true } } } } } }); if (!item) throw new NotFoundException('Portfolio not found'); return item; }
  async createPortfolio(org: string, actor: string, d: CreatePortfolioDto) { await this.user(org, d.ownerId); const x = await this.prisma.portfolio.create({ data: { organizationId: org, ...d, startDate: this.date(d.startDate), endDate: this.date(d.endDate) } }); await this.audit.record({ organizationId: org, actorUserId: actor, action: 'execution.portfolio_created', entityType: 'Portfolio', entityId: x.id }); return x; }
  async updatePortfolio(org: string, id: string, actor: string, d: UpdatePortfolioDto) { if (!await this.prisma.portfolio.findFirst({ where: { id, organizationId: org } })) throw new NotFoundException('Portfolio not found'); await this.user(org, d.ownerId); const x = await this.prisma.portfolio.update({ where: { id }, data: { ...d, startDate: this.date(d.startDate), endDate: this.date(d.endDate) } }); await this.audit.record({ organizationId: org, actorUserId: actor, action: 'execution.portfolio_updated', entityType: 'Portfolio', entityId: id, metadata: { fields: Object.keys(d) } }); return x; }
  listPrograms(org: string, q: ListExecutionQuery) { return this.prisma.program.findMany({ where: { organizationId: org, status: q.status, health: q.health, OR: q.search ? [{ name: { contains: q.search, mode: 'insensitive' } }, { description: { contains: q.search, mode: 'insensitive' } }] : undefined }, include: { portfolio: { select: { id: true, name: true } }, owner: { select: { id: true, firstName: true, lastName: true } }, projects: { select: { progress: true, health: true } }, _count: { select: { projects: true } } }, orderBy: { updatedAt: 'desc' } }); }
  async getProgram(org: string, id: string) { const item = await this.prisma.program.findFirst({ where: { id, organizationId: org }, include: { portfolio: true, owner: { select: { id: true, firstName: true, lastName: true } }, projects: { include: { owner: { select: { id: true, firstName: true, lastName: true } } } } } }); if (!item) throw new NotFoundException('Program not found'); return item; }
  async createProgram(org: string, actor: string, d: CreateProgramDto) { await this.user(org, d.ownerId); await this.placement(org, d.portfolioId); const x = await this.prisma.program.create({ data: { organizationId: org, ...d, startDate: this.date(d.startDate), endDate: this.date(d.endDate) } }); await this.audit.record({ organizationId: org, actorUserId: actor, action: 'execution.program_created', entityType: 'Program', entityId: x.id }); return x; }
  async updateProgram(org: string, id: string, actor: string, d: UpdateProgramDto) { if (!await this.prisma.program.findFirst({ where: { id, organizationId: org } })) throw new NotFoundException('Program not found'); await this.user(org, d.ownerId); await this.placement(org, d.portfolioId); const x = await this.prisma.program.update({ where: { id }, data: { ...d, startDate: this.date(d.startDate), endDate: this.date(d.endDate) } }); await this.audit.record({ organizationId: org, actorUserId: actor, action: 'execution.program_updated', entityType: 'Program', entityId: id, metadata: { fields: Object.keys(d) } }); return x; }
  async listProjects(org: string, q: ListExecutionQuery) { const items = await this.prisma.project.findMany({ where: { organizationId: org, status: q.status, health: q.health, OR: q.search ? [{ key: { contains: q.search, mode: 'insensitive' } }, { name: { contains: q.search, mode: 'insensitive' } }, { description: { contains: q.search, mode: 'insensitive' } }] : undefined }, include: { owner: { select: { id: true, firstName: true, lastName: true } }, program: { select: { id: true, name: true } }, portfolio: { select: { id: true, name: true } }, _count: { select: { workstreams: true, milestones: true, tasks: true, risks: true, issues: true } } }, orderBy: [{ updatedAt: 'desc' }] }); return items.map(x => ({ ...x, variance: this.variance(x) })); }
  async getProject(org: string, id: string) { await this.project(org, id); const item = await this.prisma.project.findUniqueOrThrow({ where: { id }, include: { owner: { select: { id: true, firstName: true, lastName: true, email: true } }, sponsor: { select: { id: true, firstName: true, lastName: true } }, portfolio: true, program: true, workstreams: { include: { owner: { select: { id: true, firstName: true, lastName: true } } } }, milestones: { orderBy: { plannedDate: 'asc' } }, tasks: { orderBy: [{ status: 'asc' }, { dueDate: 'asc' }] }, risks: { orderBy: { createdAt: 'desc' } }, issues: { orderBy: { createdAt: 'desc' } }, predecessorDependencies: { include: { successorProject: { select: { id: true, key: true, name: true } } } }, successorDependencies: { include: { predecessorProject: { select: { id: true, key: true, name: true } } } }, activities: { take: 50, orderBy: { createdAt: 'desc' }, include: { actor: { select: { firstName: true, lastName: true } } } } } }); return { ...item, healthDetails: await this.healthSnapshot(org, id), variance: this.variance(item) }; }
  async createProject(org: string, actor: string, d: CreateProjectDto) { await this.user(org, d.ownerId); await this.user(org, d.sponsorId); await this.placement(org, d.portfolioId, d.programId); if (await this.prisma.project.findFirst({ where: { organizationId: org, key: d.key.toUpperCase() } })) throw new ConflictException('Project key already exists'); const x = await this.prisma.project.create({ data: { organizationId: org, ...d, key: d.key.toUpperCase(), startDate: this.date(d.startDate), targetDate: this.date(d.targetDate) } }); await this.activity(org, x.id, actor, 'project.created', 'Project', x.id, { key: x.key }); await this.refreshHealth(org, x.id); return this.getProject(org, x.id); }
  async updateProject(org: string, id: string, actor: string, d: UpdateProjectDto) { await this.project(org, id); await this.user(org, d.ownerId); await this.user(org, d.sponsorId); await this.placement(org, d.portfolioId, d.programId); await this.prisma.project.update({ where: { id }, data: { ...d, startDate: this.date(d.startDate), targetDate: this.date(d.targetDate) } }); await this.activity(org, id, actor, 'project.updated', 'Project', id, { fields: Object.keys(d) }); await this.refreshHealth(org, id); return this.getProject(org, id); }
  async transitionProject(org: string, id: string, actor: string, d: TransitionProjectDto) { const current = await this.project(org, id); const allowed: Record<ExecutionStatus, ExecutionStatus[]> = { DRAFT: ['PLANNED', 'CANCELLED'], PLANNED: ['ACTIVE', 'ON_HOLD', 'CANCELLED'], ACTIVE: ['ON_HOLD', 'COMPLETED', 'CANCELLED'], ON_HOLD: ['ACTIVE', 'CANCELLED'], COMPLETED: [], CANCELLED: [] }; if (!allowed[current.status].includes(d.status)) throw new BadRequestException(`Invalid transition from ${current.status} to ${d.status}`); await this.prisma.project.update({ where: { id }, data: { status: d.status, completedAt: d.status === 'COMPLETED' ? new Date() : undefined, progress: d.status === 'COMPLETED' ? 100 : undefined } }); await this.activity(org, id, actor, 'project.status_changed', 'Project', id, { from: current.status, to: d.status, reason: d.reason }); return this.getProject(org, id); }
  async recalculateProject(org: string, id: string, actor: string) { const before = await this.project(org, id); const snapshot = await this.refreshHealth(org, id); await this.activity(org, id, actor, 'project.health_recalculated', 'Project', id, { from: before.health, to: snapshot.health, score: snapshot.score }); return this.getProject(org, id); }
  async createWorkstream(org: string, projectId: string, actor: string, d: CreateWorkstreamDto) { await this.project(org, projectId); await this.user(org, d.ownerId); const x = await this.prisma.workstream.create({ data: { organizationId: org, projectId, ...d, startDate: this.date(d.startDate), targetDate: this.date(d.targetDate) } }); await this.activity(org, projectId, actor, 'workstream.created', 'Workstream', x.id); return x; }
  async createMilestone(org: string, projectId: string, actor: string, d: CreateMilestoneDto) { await this.project(org, projectId); await this.user(org, d.ownerId); if (d.workstreamId && !await this.prisma.workstream.findFirst({ where: { id: d.workstreamId, projectId, organizationId: org } })) throw new BadRequestException('Invalid workstream'); const x = await this.prisma.projectMilestone.create({ data: { organizationId: org, projectId, ...d, plannedDate: new Date(d.plannedDate) } }); await this.activity(org, projectId, actor, 'milestone.created', 'ProjectMilestone', x.id); await this.refreshHealth(org, projectId); return x; }
  async updateMilestone(org: string, id: string, actor: string, d: UpdateMilestoneDto) { const item = await this.prisma.projectMilestone.findFirst({ where: { id, organizationId: org } }); if (!item) throw new NotFoundException('Milestone not found'); const x = await this.prisma.projectMilestone.update({ where: { id }, data: { ...d, plannedDate: this.date(d.plannedDate), actualDate: d.status === 'DONE' ? this.date(d.actualDate) ?? new Date() : this.date(d.actualDate) } }); await this.activity(org, item.projectId, actor, 'milestone.updated', 'ProjectMilestone', id, { fields: Object.keys(d) }); await this.refreshHealth(org, item.projectId); return x; }
  async createTask(org: string, projectId: string, actor: string, d: CreateTaskDto) { await this.project(org, projectId); await this.user(org, d.assigneeId); if (d.workstreamId && !await this.prisma.workstream.findFirst({ where: { id: d.workstreamId, projectId, organizationId: org } })) throw new BadRequestException('Invalid workstream'); if (d.parentId && !await this.prisma.projectTask.findFirst({ where: { id: d.parentId, projectId, organizationId: org } })) throw new BadRequestException('Invalid parent task'); const x = await this.prisma.projectTask.create({ data: { organizationId: org, projectId, ...d, startDate: this.date(d.startDate), dueDate: this.date(d.dueDate) } }); await this.activity(org, projectId, actor, 'task.created', 'ProjectTask', x.id); await this.refreshHealth(org, projectId); return x; }
  async updateTask(org: string, id: string, actor: string, d: UpdateTaskDto) { const t = await this.prisma.projectTask.findFirst({ where: { id, organizationId: org } }); if (!t) throw new NotFoundException('Task not found'); await this.user(org, d.assigneeId); const x = await this.prisma.projectTask.update({ where: { id }, data: { ...d, dueDate: this.date(d.dueDate), completedAt: d.status === 'DONE' ? new Date() : d.status ? null : undefined } }); await this.activity(org, t.projectId, actor, 'task.updated', 'ProjectTask', id, { fields: Object.keys(d) }); await this.refreshHealth(org, t.projectId); return x; }
  private async hasPath(org: string, from: string, to: string): Promise<boolean> { const edges = await this.prisma.projectDependency.findMany({ where: { organizationId: org }, select: { predecessorProjectId: true, successorProjectId: true } }); const graph = new Map<string, string[]>(); for (const e of edges) graph.set(e.predecessorProjectId, [...(graph.get(e.predecessorProjectId) || []), e.successorProjectId]); const seen = new Set<string>(), stack = [from]; while (stack.length) { const n = stack.pop()!; if (n === to) return true; if (seen.has(n)) continue; seen.add(n); stack.push(...(graph.get(n) || [])); } return false; }
  async createDependency(org: string, actor: string, d: CreateDependencyDto) { if (d.predecessorProjectId === d.successorProjectId) throw new BadRequestException('Project cannot depend on itself'); await this.project(org, d.predecessorProjectId); await this.project(org, d.successorProjectId); if (await this.hasPath(org, d.successorProjectId, d.predecessorProjectId)) throw new BadRequestException('Dependency would create a cycle'); const x = await this.prisma.projectDependency.create({ data: { organizationId: org, ...d } }); await this.activity(org, d.successorProjectId, actor, 'dependency.created', 'ProjectDependency', x.id, { predecessorProjectId: d.predecessorProjectId }); return x; }
  async createRisk(org: string, projectId: string, actor: string, d: CreateRiskDto) { await this.project(org, projectId); await this.user(org, d.ownerId); const x = await this.prisma.projectRisk.create({ data: { organizationId: org, projectId, reportedById: actor, ...d, dueDate: this.date(d.dueDate) } }); await this.activity(org, projectId, actor, 'risk.created', 'ProjectRisk', x.id); await this.refreshHealth(org, projectId); return x; }
  async updateRisk(org: string, id: string, actor: string, d: UpdateRiskDto) { const r = await this.prisma.projectRisk.findFirst({ where: { id, organizationId: org } }); if (!r) throw new NotFoundException('Risk not found'); await this.user(org, d.ownerId); const x = await this.prisma.projectRisk.update({ where: { id }, data: d }); await this.activity(org, r.projectId, actor, 'risk.updated', 'ProjectRisk', id, { fields: Object.keys(d) }); await this.refreshHealth(org, r.projectId); return x; }
  async createIssue(org: string, projectId: string, actor: string, d: CreateIssueDto) { await this.project(org, projectId); await this.user(org, d.ownerId); const x = await this.prisma.projectIssue.create({ data: { organizationId: org, projectId, reportedById: actor, ...d, dueDate: this.date(d.dueDate) } }); await this.activity(org, projectId, actor, 'issue.created', 'ProjectIssue', x.id); await this.refreshHealth(org, projectId); return x; }
  async updateIssue(org: string, id: string, actor: string, d: UpdateIssueDto) { const i = await this.prisma.projectIssue.findFirst({ where: { id, organizationId: org } }); if (!i) throw new NotFoundException('Issue not found'); await this.user(org, d.ownerId); const x = await this.prisma.projectIssue.update({ where: { id }, data: { ...d, resolvedAt: ['RESOLVED', 'CLOSED'].includes(d.status ?? '') ? new Date() : undefined } }); await this.activity(org, i.projectId, actor, 'issue.updated', 'ProjectIssue', id, { fields: Object.keys(d) }); await this.refreshHealth(org, i.projectId); return x; }
  async projectBoard(org: string, projectId: string) {
    await this.project(org, projectId);
    const tasks = await this.prisma.projectTask.findMany({
      where: { organizationId: org, projectId },
      orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        parent: { select: { id: true, title: true } },
        children: { select: { id: true, title: true, status: true } },
        labels: { include: { label: true } },
        checklist: { orderBy: { position: 'asc' } },
        _count: { select: { comments: true, attachments: true, predecessorDependencies: true, successorDependencies: true } },
      },
    });
    const columns = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED'].map(status => ({ status, tasks: tasks.filter(t => t.status === status) }));
    return { projectId, columns, total: tasks.length };
  }

  async listTasks(org: string, query: ListTasksQuery) {
    return this.prisma.projectTask.findMany({
      where: { organizationId: org, projectId: query.projectId, assigneeId: query.assigneeId, status: query.status, ...(query.search ? { OR: [{ title: { contains: query.search, mode: 'insensitive' } }, { description: { contains: query.search, mode: 'insensitive' } }] } : {}) },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
      include: { project: { select: { id: true, key: true, name: true } }, assignee: { select: { id: true, firstName: true, lastName: true } }, labels: { include: { label: true } }, _count: { select: { checklist: true, comments: true, attachments: true } } },
    });
  }

  async getTask(org: string, id: string) {
    const task = await this.prisma.projectTask.findFirst({
      where: { id, organizationId: org },
      include: {
        project: { select: { id: true, key: true, name: true } }, workstream: true,
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } }, parent: { select: { id: true, title: true } },
        children: { orderBy: { position: 'asc' } }, comments: { orderBy: { createdAt: 'asc' }, include: { author: { select: { id: true, firstName: true, lastName: true } } } },
        checklist: { orderBy: { position: 'asc' } }, labels: { include: { label: true } }, attachments: { orderBy: { createdAt: 'desc' }, include: { uploadedBy: { select: { firstName: true, lastName: true } } } },
        predecessorDependencies: { include: { successorTask: { select: { id: true, title: true, status: true } } } }, successorDependencies: { include: { predecessorTask: { select: { id: true, title: true, status: true } } } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async reorderTask(org: string, id: string, actor: string, dto: ReorderTaskDto) {
    const task = await this.prisma.projectTask.findFirst({ where: { id, organizationId: org } });
    if (!task) throw new NotFoundException('Task not found');
    const completedAt = dto.status === 'DONE' ? new Date() : task.status === 'DONE' ? null : undefined;
    const updated = await this.prisma.projectTask.update({ where: { id }, data: { status: dto.status, position: dto.position, completedAt } });
    await this.activity(org, task.projectId, actor, 'task.moved', 'ProjectTask', id, { from: task.status, to: dto.status, position: dto.position });
    await this.refreshHealth(org, task.projectId);
    return updated;
  }

  async addTaskComment(org: string, taskId: string, actor: string, dto: CreateTaskCommentDto) {
    const task = await this.prisma.projectTask.findFirst({ where: { id: taskId, organizationId: org } });
    if (!task) throw new NotFoundException('Task not found');
    const comment = await this.prisma.projectTaskComment.create({ data: { organizationId: org, taskId, authorId: actor, body: dto.body } });
    await this.activity(org, task.projectId, actor, 'task.comment_added', 'ProjectTaskComment', comment.id, { taskId });
    return comment;
  }

  async addChecklistItem(org: string, taskId: string, actor: string, dto: CreateChecklistItemDto) {
    const task = await this.prisma.projectTask.findFirst({ where: { id: taskId, organizationId: org } });
    if (!task) throw new NotFoundException('Task not found');
    const item = await this.prisma.projectTaskChecklistItem.create({ data: { organizationId: org, taskId, title: dto.title, position: dto.position ?? 0 } });
    await this.activity(org, task.projectId, actor, 'task.checklist_item_added', 'ProjectTaskChecklistItem', item.id, { taskId });
    return item;
  }

  async updateChecklistItem(org: string, id: string, actor: string, dto: UpdateChecklistItemDto) {
    const item = await this.prisma.projectTaskChecklistItem.findFirst({ where: { id, organizationId: org }, include: { task: true } });
    if (!item) throw new NotFoundException('Checklist item not found');
    const updated = await this.prisma.projectTaskChecklistItem.update({ where: { id }, data: { ...dto, completedAt: dto.completed === true ? new Date() : dto.completed === false ? null : undefined } });
    await this.activity(org, item.task.projectId, actor, 'task.checklist_item_updated', 'ProjectTaskChecklistItem', id, { completed: dto.completed });
    return updated;
  }

  async listLabels(org: string) { return this.prisma.executionLabel.findMany({ where: { organizationId: org }, orderBy: { name: 'asc' } }); }
  async createLabel(org: string, actor: string, dto: CreateExecutionLabelDto) {
    const label = await this.prisma.executionLabel.create({ data: { organizationId: org, name: dto.name, color: dto.color ?? '#64748b' } });
    await this.events.publish({ organizationId: org, eventName: 'execution.label_created', aggregateType: 'ExecutionLabel', aggregateId: label.id, actorUserId: actor, payload: { name: label.name } });
    return label;
  }
  async setTaskLabels(org: string, taskId: string, actor: string, dto: SetTaskLabelsDto) {
    const task = await this.prisma.projectTask.findFirst({ where: { id: taskId, organizationId: org } });
    if (!task) throw new NotFoundException('Task not found');
    const count = await this.prisma.executionLabel.count({ where: { organizationId: org, id: { in: dto.labelIds } } });
    if (count !== dto.labelIds.length) throw new BadRequestException('One or more labels are invalid');
    await this.prisma.$transaction([this.prisma.projectTaskLabel.deleteMany({ where: { taskId } }), ...dto.labelIds.map(labelId => this.prisma.projectTaskLabel.create({ data: { organizationId: org, taskId, labelId } }))]);
    await this.activity(org, task.projectId, actor, 'task.labels_updated', 'ProjectTask', taskId, { labelIds: dto.labelIds });
    return this.getTask(org, taskId);
  }

  async addTaskAttachment(org: string, taskId: string, actor: string, dto: CreateTaskAttachmentDto) {
    const task = await this.prisma.projectTask.findFirst({ where: { id: taskId, organizationId: org } });
    if (!task) throw new NotFoundException('Task not found');
    const attachment = await this.prisma.projectTaskAttachment.create({ data: { organizationId: org, taskId, uploadedById: actor, ...dto } });
    await this.activity(org, task.projectId, actor, 'task.attachment_added', 'ProjectTaskAttachment', attachment.id, { fileName: dto.fileName, sizeBytes: dto.sizeBytes });
    return attachment;
  }

  private async hasTaskPath(org: string, from: string, to: string): Promise<boolean> {
    const edges = await this.prisma.projectTaskDependency.findMany({ where: { organizationId: org }, select: { predecessorTaskId: true, successorTaskId: true } });
    const graph = new Map<string, string[]>();
    for (const edge of edges) graph.set(edge.predecessorTaskId, [...(graph.get(edge.predecessorTaskId) || []), edge.successorTaskId]);
    const seen = new Set<string>(), stack = [from];
    while (stack.length) { const node = stack.pop()!; if (node === to) return true; if (seen.has(node)) continue; seen.add(node); stack.push(...(graph.get(node) || [])); }
    return false;
  }
  async createTaskDependency(org: string, actor: string, dto: CreateTaskDependencyDto) {
    if (dto.predecessorTaskId === dto.successorTaskId) throw new BadRequestException('Task cannot depend on itself');
    const [predecessor, successor] = await Promise.all([this.prisma.projectTask.findFirst({ where: { id: dto.predecessorTaskId, organizationId: org } }), this.prisma.projectTask.findFirst({ where: { id: dto.successorTaskId, organizationId: org } })]);
    if (!predecessor || !successor) throw new BadRequestException('Invalid task dependency');
    if (predecessor.projectId !== successor.projectId) throw new BadRequestException('Task dependencies must remain within one project');
    if (await this.hasTaskPath(org, dto.successorTaskId, dto.predecessorTaskId)) throw new BadRequestException('Dependency would create a cycle');
    const dependency = await this.prisma.projectTaskDependency.create({ data: { organizationId: org, ...dto } });
    await this.activity(org, successor.projectId, actor, 'task.dependency_created', 'ProjectTaskDependency', dependency.id, { predecessorTaskId: predecessor.id, successorTaskId: successor.id });
    return dependency;
  }

  async strategyCatalog(org: string) {
    const objectives = await this.prisma.objective.findMany({
      where: { organizationId: org, status: { notIn: ['CANCELLED'] } },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true, title: true, progress: true, status: true,
        cycle: { select: { id: true, name: true, status: true } },
        keyResults: { select: { id: true, title: true, progress: true, status: true } },
      },
    });
    return objectives;
  }

  private contribution(progress: unknown, weight: unknown) {
    return Math.max(0, Math.min(100, Number(progress ?? 0))) * Math.max(0, Math.min(100, Number(weight ?? 0))) / 100;
  }

  async projectTraceability(org: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: org },
      include: {
        objectiveLinks: { include: { objective: { include: { cycle: { select: { id: true, name: true } } } } }, orderBy: { createdAt: 'asc' } },
        keyResultLinks: { include: { keyResult: { include: { objective: { select: { id: true, title: true } } } } }, orderBy: { createdAt: 'asc' } },
        predecessorDependencies: { include: { predecessorProject: { select: { id: true, key: true, name: true, health: true, status: true, progress: true } } } },
        successorDependencies: { include: { successorProject: { select: { id: true, key: true, name: true, health: true, status: true, progress: true } } } },
        tasks: { select: { id: true, status: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    const progress = Number(project.progress);
    const objectiveLinks = project.objectiveLinks.map(link => ({ ...link, effectiveContribution: this.contribution(progress, link.weight) }));
    const keyResultLinks = project.keyResultLinks.map(link => ({ ...link, effectiveContribution: this.contribution(progress, link.weight) }));
    const blockedBy = project.predecessorDependencies
      .filter(x => !['COMPLETED', 'CANCELLED'].includes(x.predecessorProject.status) || ['AT_RISK', 'OFF_TRACK'].includes(x.predecessorProject.health))
      .map(x => x.predecessorProject);
    return {
      project: { id: project.id, key: project.key, name: project.name, progress, status: project.status, health: project.health },
      objectiveLinks,
      keyResultLinks,
      rollup: {
        objectiveContribution: Math.min(100, objectiveLinks.reduce((sum, x) => sum + x.effectiveContribution, 0)),
        keyResultContribution: Math.min(100, keyResultLinks.reduce((sum, x) => sum + x.effectiveContribution, 0)),
        linkedObjectives: objectiveLinks.length,
        linkedKeyResults: keyResultLinks.length,
        completedTasks: project.tasks.filter(x => x.status === 'DONE').length,
        totalTasks: project.tasks.length,
      },
      dependencyExposure: { blockedBy, downstreamProjects: project.successorDependencies.map(x => x.successorProject) },
    };
  }

  async linkObjective(org: string, projectId: string, actor: string, dto: CreateObjectiveLinkDto) {
    await this.project(org, projectId);
    const objective = await this.prisma.objective.findFirst({ where: { id: dto.objectiveId, organizationId: org } });
    if (!objective) throw new BadRequestException('Invalid objective');
    const link = await this.prisma.projectObjectiveLink.upsert({
      where: { projectId_objectiveId: { projectId, objectiveId: dto.objectiveId } },
      create: { organizationId: org, projectId, objectiveId: dto.objectiveId, contributionType: dto.contributionType, weight: dto.weight ?? 100, rationale: dto.rationale },
      update: { contributionType: dto.contributionType, weight: dto.weight, rationale: dto.rationale },
      include: { objective: { select: { id: true, title: true } } },
    });
    await this.activity(org, projectId, actor, 'strategy.objective_linked', 'ProjectObjectiveLink', link.id, { objectiveId: dto.objectiveId, weight: dto.weight ?? 100 });
    return link;
  }

  async unlinkObjective(org: string, projectId: string, objectiveId: string, actor: string) {
    await this.project(org, projectId);
    const link = await this.prisma.projectObjectiveLink.findFirst({ where: { organizationId: org, projectId, objectiveId } });
    if (!link) throw new NotFoundException('Objective link not found');
    await this.prisma.projectObjectiveLink.delete({ where: { id: link.id } });
    await this.activity(org, projectId, actor, 'strategy.objective_unlinked', 'ProjectObjectiveLink', link.id, { objectiveId });
    return { deleted: true };
  }

  async linkKeyResult(org: string, projectId: string, actor: string, dto: CreateKeyResultLinkDto) {
    await this.project(org, projectId);
    const keyResult = await this.prisma.keyResult.findFirst({ where: { id: dto.keyResultId, organizationId: org }, include: { objective: true } });
    if (!keyResult) throw new BadRequestException('Invalid key result');
    const link = await this.prisma.projectKeyResultLink.upsert({
      where: { projectId_keyResultId: { projectId, keyResultId: dto.keyResultId } },
      create: { organizationId: org, projectId, keyResultId: dto.keyResultId, contributionType: dto.contributionType, weight: dto.weight ?? 100, rationale: dto.rationale },
      update: { contributionType: dto.contributionType, weight: dto.weight, rationale: dto.rationale },
      include: { keyResult: { select: { id: true, title: true, objectiveId: true } } },
    });
    await this.activity(org, projectId, actor, 'strategy.key_result_linked', 'ProjectKeyResultLink', link.id, { keyResultId: dto.keyResultId, objectiveId: keyResult.objectiveId, weight: dto.weight ?? 100 });
    return link;
  }

  async unlinkKeyResult(org: string, projectId: string, keyResultId: string, actor: string) {
    await this.project(org, projectId);
    const link = await this.prisma.projectKeyResultLink.findFirst({ where: { organizationId: org, projectId, keyResultId } });
    if (!link) throw new NotFoundException('Key result link not found');
    await this.prisma.projectKeyResultLink.delete({ where: { id: link.id } });
    await this.activity(org, projectId, actor, 'strategy.key_result_unlinked', 'ProjectKeyResultLink', link.id, { keyResultId });
    return { deleted: true };
  }

  async objectiveTraceability(org: string, objectiveId: string) {
    const objective = await this.prisma.objective.findFirst({
      where: { id: objectiveId, organizationId: org },
      include: {
        cycle: { select: { id: true, name: true } },
        projectLinks: { include: { project: { select: { id: true, key: true, name: true, progress: true, health: true, status: true, targetDate: true } } } },
        keyResults: { include: { projectLinks: { include: { project: { select: { id: true, key: true, name: true, progress: true, health: true, status: true } } } } } },
      },
    });
    if (!objective) throw new NotFoundException('Objective not found');
    const direct = objective.projectLinks.map(x => ({ ...x, effectiveContribution: this.contribution(x.project.progress, x.weight) }));
    const keyResults = objective.keyResults.map(kr => ({
      id: kr.id, title: kr.title, progress: kr.progress, status: kr.status,
      projects: kr.projectLinks.map(x => ({ ...x, effectiveContribution: this.contribution(x.project.progress, x.weight) })),
      deliveryContribution: Math.min(100, kr.projectLinks.reduce((sum, x) => sum + this.contribution(x.project.progress, x.weight), 0)),
    }));
    const allProjects = [...direct.map(x => x.project), ...keyResults.flatMap(x => x.projects.map(y => y.project))];
    return {
      objective: { id: objective.id, title: objective.title, progress: objective.progress, status: objective.status, cycle: objective.cycle },
      directProjects: direct,
      keyResults,
      rollup: {
        directContribution: Math.min(100, direct.reduce((sum, x) => sum + x.effectiveContribution, 0)),
        linkedProjects: new Set(allProjects.map(x => x.id)).size,
        exposedProjects: new Set(allProjects.filter(x => ['AT_RISK', 'OFF_TRACK'].includes(x.health)).map(x => x.id)).size,
      },
    };
  }

  async keyResultTraceability(org: string, keyResultId: string) {
    const kr = await this.prisma.keyResult.findFirst({
      where: { id: keyResultId, organizationId: org },
      include: { objective: { select: { id: true, title: true } }, projectLinks: { include: { project: { select: { id: true, key: true, name: true, progress: true, health: true, status: true, targetDate: true } } } } },
    });
    if (!kr) throw new NotFoundException('Key result not found');
    const projects = kr.projectLinks.map(x => ({ ...x, effectiveContribution: this.contribution(x.project.progress, x.weight) }));
    return { keyResult: { id: kr.id, title: kr.title, progress: kr.progress, status: kr.status, objective: kr.objective }, projects, deliveryContribution: Math.min(100, projects.reduce((sum, x) => sum + x.effectiveContribution, 0)) };
  }

  async analyticsDashboard(org: string, query: PortfolioAnalyticsQuery) {
    const dateFilter = query.from || query.to ? {
      OR: [
        { targetDate: { gte: query.from ? new Date(query.from) : undefined, lte: query.to ? new Date(query.to) : undefined } },
        { startDate: { gte: query.from ? new Date(query.from) : undefined, lte: query.to ? new Date(query.to) : undefined } },
      ],
    } : {};
    const where: Prisma.ProjectWhereInput = {
      organizationId: org,
      portfolioId: query.portfolioId,
      programId: query.programId,
      ...dateFilter,
    };
    const [projects, risks, issues, milestones, portfolios] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          portfolio: { select: { id: true, name: true } },
          program: { select: { id: true, name: true } },
          owner: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.projectRisk.findMany({
        where: { organizationId: org, status: { notIn: ['CLOSED'] }, project: where },
        include: { project: { select: { id: true, key: true, name: true, health: true } }, owner: { select: { id: true, firstName: true, lastName: true } } },
      }),
      this.prisma.projectIssue.findMany({
        where: { organizationId: org, status: { notIn: ['RESOLVED', 'CLOSED'] }, project: where },
        include: { project: { select: { id: true, key: true, name: true, health: true } } },
      }),
      this.prisma.projectMilestone.findMany({
        where: { organizationId: org, project: where },
        include: { project: { select: { id: true, key: true, name: true, health: true } } },
        orderBy: { plannedDate: 'asc' },
      }),
      this.prisma.portfolio.findMany({ where: { organizationId: org }, select: { id: true, name: true } }),
    ]);
    const now = new Date();
    const enriched = projects.map(project => ({ ...project, variance: projectVariance(project, now) }));
    const heatMap = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].flatMap(probability =>
      ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(impact => ({
        probability,
        impact,
        count: risks.filter(risk => risk.probability === probability && risk.impact === impact).length,
        score: riskScore(probability, impact),
      })),
    );
    const overdueMilestones = milestones.filter(item => item.status !== 'DONE' && item.plannedDate < now);
    const upcomingMilestones = milestones.filter(item => item.status !== 'DONE' && item.plannedDate >= now).slice(0, 12);
    const portfolioRows = portfolios.map(portfolio => {
      const items = projects.filter(project => project.portfolioId === portfolio.id);
      return { id: portfolio.id, name: portfolio.name, ...portfolioRollup(items, now) };
    }).filter(portfolio => portfolio.projects > 0);
    const deliveryTrend = Array.from({ length: 6 }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);
      const completed = projects.filter(project => project.completedAt && project.completedAt >= month && project.completedAt <= end).length;
      const due = projects.filter(project => project.targetDate && project.targetDate >= month && project.targetDate <= end).length;
      return { month: month.toISOString().slice(0, 7), completed, due };
    });
    return {
      generatedAt: now,
      filters: query,
      summary: { ...portfolioRollup(projects, now), openRisks: risks.length, openIssues: issues.length, overdueMilestones: overdueMilestones.length },
      projects: enriched,
      portfolioRows,
      riskHeatMap: heatMap,
      topRisks: risks.map(risk => ({ ...risk, score: riskScore(risk.probability, risk.impact) })).sort((a, b) => b.score - a.score).slice(0, 10),
      milestoneForecast: { overdue: overdueMilestones, upcoming: upcomingMilestones },
      deliveryTrend,
    };
  }

  async portfolioAnalytics(org: string, portfolioId: string) {
    const portfolio = await this.prisma.portfolio.findFirst({ where: { id: portfolioId, organizationId: org }, include: { owner: { select: { id: true, firstName: true, lastName: true } } } });
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    const dashboard = await this.analyticsDashboard(org, { portfolioId });
    return { portfolio, ...dashboard };
  }

  async executiveReport(org: string, query: PortfolioAnalyticsQuery) {
    const dashboard = await this.analyticsDashboard(org, query);
    const attention = dashboard.projects
      .filter(project => ['AT_RISK', 'OFF_TRACK'].includes(project.health) || project.variance.scheduleVariancePoints < -10 || project.variance.budgetVariancePercent > 10)
      .slice(0, 8)
      .map(project => ({ id: project.id, key: project.key, name: project.name, health: project.health, progress: Number(project.progress), scheduleVariancePoints: project.variance.scheduleVariancePoints, budgetVariancePercent: project.variance.budgetVariancePercent }));
    return {
      generatedAt: dashboard.generatedAt,
      headline: dashboard.summary.atRiskProjects > 0 ? `${dashboard.summary.atRiskProjects} projects require executive attention` : 'Portfolio delivery is broadly on track',
      summary: dashboard.summary,
      decisionsRequired: attention,
      topRisks: dashboard.topRisks.slice(0, 5),
      upcomingMilestones: dashboard.milestoneForecast.upcoming.slice(0, 8),
      portfolioPerformance: dashboard.portfolioRows,
      deliveryTrend: dashboard.deliveryTrend,
    };
  }

}
