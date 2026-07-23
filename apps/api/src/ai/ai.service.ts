import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AiProvider } from './providers/ai.provider';
import { AnalyzeProjectDeliveryRiskDto, AnalyzeRisksDto, ExecutiveDeliveryUpdateDto, ExecutiveSummaryDto, GenerateObjectivesDto, GenerateProjectPlanDto, ProjectHealthSummaryDto, ResolveResourceConflictsDto, RewriteObjectiveDto, SkillGapAnalysisDto, StaffingRecommendationDto, WorkforceSummaryDto } from './dto/ai.dto';
import { projectRiskScore, riskBand, suggestedMitigations } from './project-ai';
import { detectSkillGaps, hiringSignal, rankStaffingCandidates, resourceUtilization } from './resource-ai';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService, private readonly provider: AiProvider, private readonly audit: AuditService) {}

  private async enabled(org: string) {
    const flag = await this.prisma.featureFlagOverride.findUnique({ where: { organizationId_key: { organizationId: org, key: 'ai_assistant' } } });
    return flag?.enabled ?? true;
  }

  private async record(org: string, userId: string, capability: string, promptVersion: string, completion: any, request: unknown, result: unknown, startedAt: number) {
    const estimatedCostUsd = completion.provider === 'mock' ? 0 : Number((((completion.inputTokens * 0.0000004) + (completion.outputTokens * 0.0000016))).toFixed(6));
    return this.prisma.aiGeneration.create({ data: { organizationId: org, userId, capability, provider: completion.provider, model: completion.model, promptVersion, inputTokens: completion.inputTokens, outputTokens: completion.outputTokens, estimatedCostUsd, latencyMs: Date.now() - startedAt, request: request as any, response: result as any, status: 'COMPLETED' } });
  }

  private parse(text: string) { try { return JSON.parse(text); } catch { return { text }; } }

  async generateObjectives(org: string, userId: string, dto: GenerateObjectivesDto) {
    if (!(await this.enabled(org))) throw new NotFoundException('AI Strategy Assistant is not enabled');
    const started = Date.now(); const count = dto.count ?? 3;
    const completion = await this.provider.complete([
      { role: 'system', content: 'You are an enterprise OKR coach. Return strict JSON with an objectives array. Each objective needs title, rationale, and 2-4 measurable keyResults containing title, type, startValue, targetValue, unit.' },
      { role: 'user', content: `Create ${count} outcome-oriented OKRs for ${dto.teamOrFunction}. Business context: ${dto.context}. Strategic themes: ${(dto.strategicThemes ?? []).join(', ') || 'not supplied'}. Avoid tasks and vanity metrics.` },
    ], { responseFormat: 'json', temperature: 0.3 });
    let result = this.parse(completion.text);
    if (completion.provider === 'mock') result = { objectives: Array.from({ length: count }, (_, i) => ({ title: `Improve ${dto.teamOrFunction} outcome ${i + 1}`, rationale: `Align execution with: ${dto.context}`, keyResults: [{ title: 'Increase primary outcome metric', type: 'PERCENTAGE', startValue: 0, targetValue: 20, unit: '%' }, { title: 'Achieve consistent execution cadence', type: 'PERCENTAGE', startValue: 0, targetValue: 90, unit: '%' }] })), developmentMode: true };
    const generation = await this.record(org, userId, 'okr.generate', 'okr-generate-v1', completion, dto, result, started);
    await this.audit.record({ organizationId: org, actorUserId: userId, action: 'ai.okrs_generated', entityType: 'AiGeneration', entityId: generation.id });
    return { generationId: generation.id, ...result };
  }

  async rewriteObjective(org: string, userId: string, dto: RewriteObjectiveDto) {
    const started = Date.now();
    const completion = await this.provider.complete([{ role: 'system', content: 'You are an OKR editor. Return JSON with title, description, keyResults, qualityChecks, and explanation. Preserve intent while making the objective outcome-oriented and measurable.' }, { role: 'user', content: JSON.stringify(dto) }], { responseFormat: 'json', temperature: 0.2 });
    let result = this.parse(completion.text);
    if (completion.provider === 'mock') result = { title: dto.title.replace(/^(work on|improve)/i, 'Achieve'), description: dto.description ?? 'A clear outcome tied to measurable business value.', keyResults: dto.keyResults ?? ['Increase the primary outcome metric by 20%', 'Reach 90% execution consistency'], qualityChecks: { outcomeOriented: true, measurable: true, concise: true }, developmentMode: true };
    const generation = await this.record(org, userId, 'okr.rewrite', 'okr-rewrite-v1', completion, dto, result, started);
    return { generationId: generation.id, ...result };
  }

  async analyzeRisks(org: string, userId: string, dto: AnalyzeRisksDto) {
    const cycle = dto.cycleId ? await this.prisma.okrCycle.findFirst({ where: { id: dto.cycleId, organizationId: org } }) : await this.prisma.okrCycle.findFirst({ where: { organizationId: org, status: 'ACTIVE' }, orderBy: { startDate: 'desc' } });
    if (!cycle) throw new NotFoundException('No active OKR cycle found');
    const objectives = await this.prisma.objective.findMany({ where: { organizationId: org, cycleId: cycle.id }, include: { owner: { select: { firstName: true, lastName: true } }, keyResults: { include: { checkIns: { orderBy: { createdAt: 'desc' }, take: 1 } } } } });
    const facts = objectives.map(o => ({ id: o.id, title: o.title, owner: `${o.owner.firstName} ${o.owner.lastName}`, status: o.status, progress: o.progress, dueDate: o.dueDate, keyResults: o.keyResults.map(k => ({ title: k.title, progress: k.progress, confidence: k.confidence, status: k.status, lastCheckIn: k.checkIns[0]?.createdAt })) }));
    const started = Date.now(); const completion = await this.provider.complete([{ role: 'system', content: 'Analyze OKR execution risk. Return JSON with overallRisk, risks ranked high-to-low, evidence, businessImpact, and recommendedAction. Never invent data.' }, { role: 'user', content: JSON.stringify({ cycle: cycle.name, objectives: facts }) }], { responseFormat: 'json', temperature: 0.1 });
    let result = this.parse(completion.text);
    if (completion.provider === 'mock') { const now = Date.now(); result = { overallRisk: 'MEDIUM', risks: facts.filter(o => ['AT_RISK','OFF_TRACK'].includes(o.status) || o.progress < 40).map(o => ({ objectiveId: o.id, title: o.title, severity: o.status === 'OFF_TRACK' ? 'HIGH' : 'MEDIUM', evidence: `${o.progress}% progress; status ${o.status}`, recommendedAction: 'Review blockers, owner support, and next measurable check-in.' })), analyzedAt: new Date(now).toISOString(), developmentMode: true }; }
    const generation = await this.record(org, userId, 'risk.analyze', 'risk-analysis-v1', completion, dto, result, started);
    return { generationId: generation.id, cycle: { id: cycle.id, name: cycle.name }, ...result };
  }

  async executiveSummary(org: string, userId: string, dto: ExecutiveSummaryDto) {
    const cycle = dto.cycleId ? await this.prisma.okrCycle.findFirst({ where: { id: dto.cycleId, organizationId: org } }) : await this.prisma.okrCycle.findFirst({ where: { organizationId: org, status: 'ACTIVE' }, orderBy: { startDate: 'desc' } });
    if (!cycle) throw new NotFoundException('No active OKR cycle found');
    const objectives = await this.prisma.objective.findMany({ where: { organizationId: org, cycleId: cycle.id }, select: { title: true, status: true, progress: true, score: true } });
    const facts = { cycle: cycle.name, objectiveCount: objectives.length, averageProgress: objectives.length ? Math.round(objectives.reduce((a, b) => a + b.progress, 0) / objectives.length) : 0, atRisk: objectives.filter(o => ['AT_RISK','OFF_TRACK'].includes(o.status)).length, completed: objectives.filter(o => o.status === 'COMPLETED').length, objectives };
    const started = Date.now(); const completion = await this.provider.complete([{ role: 'system', content: `Write a ${dto.detail ?? 'standard'} executive OKR briefing for ${dto.audience ?? 'executive leadership'}. Return JSON with headline, summary, wins, risks, decisionsNeeded, and nextWeek. Use only supplied facts.` }, { role: 'user', content: JSON.stringify(facts) }], { responseFormat: 'json', temperature: 0.2 });
    let result = this.parse(completion.text);
    if (completion.provider === 'mock') result = { headline: `${cycle.name}: ${facts.averageProgress}% average progress`, summary: `${facts.completed} objectives completed and ${facts.atRisk} require leadership attention.`, wins: objectives.filter(o => o.progress >= 70).slice(0, 3).map(o => o.title), risks: objectives.filter(o => ['AT_RISK','OFF_TRACK'].includes(o.status)).slice(0, 3).map(o => o.title), decisionsNeeded: facts.atRisk ? ['Confirm recovery owners and remove critical blockers.'] : [], nextWeek: ['Maintain check-in cadence and validate leading indicators.'], developmentMode: true };
    const generation = await this.record(org, userId, 'executive.summary', 'executive-summary-v1', completion, dto, result, started);
    return { generationId: generation.id, cycle: { id: cycle.id, name: cycle.name }, ...result };
  }


  private async projectFacts(org: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: org },
      include: {
        owner: { select: { firstName: true, lastName: true } }, sponsor: { select: { firstName: true, lastName: true } },
        portfolio: { select: { id: true, name: true } }, program: { select: { id: true, name: true } },
        workstreams: { select: { id: true, name: true, status: true, progress: true, targetDate: true } },
        milestones: { select: { id: true, name: true, status: true, plannedDate: true, actualDate: true } },
        tasks: { select: { id: true, title: true, status: true, priority: true, dueDate: true, assigneeId: true } },
        risks: { where: { status: { notIn: ['CLOSED'] } }, select: { id: true, title: true, probability: true, impact: true, status: true, mitigation: true } },
        issues: { where: { status: { notIn: ['RESOLVED','CLOSED'] } }, select: { id: true, title: true, severity: true, status: true, resolution: true } },
        predecessorDependencies: { include: { predecessorProject: { select: { id: true, key: true, name: true, status: true, health: true, progress: true, targetDate: true } } } },
        objectiveLinks: { include: { objective: { select: { id: true, title: true, progress: true, status: true } } } },
        keyResultLinks: { include: { keyResult: { select: { id: true, title: true, progress: true, status: true } } } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    const now = new Date();
    const start = project.startDate ? new Date(project.startDate).getTime() : null;
    const target = project.targetDate ? new Date(project.targetDate).getTime() : null;
    const expected = start && target && target > start ? Math.max(0, Math.min(100, ((now.getTime() - start) / (target - start)) * 100)) : Number(project.progress);
    const budget = Number(project.budget ?? 0), actual = Number(project.actualCost ?? 0);
    const facts = {
      progress: Number(project.progress), scheduleVariancePoints: Number(project.progress) - expected,
      budgetVariancePercent: budget > 0 ? ((actual - budget) / budget) * 100 : 0,
      overdueTasks: project.tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length,
      overdueMilestones: project.milestones.filter(m => new Date(m.plannedDate) < now && m.status !== 'DONE').length,
      highRisks: project.risks.filter(r => ['HIGH','CRITICAL'].includes(r.probability) && ['HIGH','CRITICAL'].includes(r.impact)).length,
      criticalIssues: project.issues.filter(i => i.severity === 'CRITICAL').length,
      blockedDependencies: project.predecessorDependencies.filter(d => !['COMPLETED','CANCELLED'].includes(d.predecessorProject.status) || ['AT_RISK','OFF_TRACK'].includes(d.predecessorProject.health)).length,
    };
    return { project, facts, score: projectRiskScore(facts), band: riskBand(projectRiskScore(facts)) };
  }

  async generateProjectPlan(org: string, userId: string, dto: GenerateProjectPlanDto) {
    if (!(await this.enabled(org))) throw new NotFoundException('AI Strategy Assistant is not enabled');
    const { project } = await this.projectFacts(org, dto.projectId);
    const started = Date.now();
    const completion = await this.provider.complete([
      { role: 'system', content: 'You are an enterprise delivery architect. Return strict JSON with assumptions, workstreams, milestones, tasks, dependencies, risks, and first30Days. Use realistic sequencing and do not claim unknown facts.' },
      { role: 'user', content: JSON.stringify({ project: { key: project.key, name: project.name, description: project.description, startDate: project.startDate, targetDate: project.targetDate, objectives: project.objectiveLinks.map(x => x.objective), keyResults: project.keyResultLinks.map(x => x.keyResult) }, planningContext: dto.planningContext, workstreamCount: dto.workstreamCount ?? 4, includeTasks: dto.includeTasks ?? true }) },
    ], { responseFormat: 'json', temperature: 0.25 });
    let result = this.parse(completion.text);
    if (completion.provider === 'mock') {
      const count = dto.workstreamCount ?? 4;
      result = { assumptions: ['Scope and resourcing require sponsor validation.'], workstreams: Array.from({ length: count }, (_, i) => ({ name: ['Discovery and design','Build and configuration','Readiness and adoption','Launch and stabilization'][i] ?? `Workstream ${i+1}`, outcome: `Deliver workstream ${i+1} outcome`, milestones: [{ name: `Workstream ${i+1} plan approved`, sequence: i*2+1 }, { name: `Workstream ${i+1} exit criteria met`, sequence: i*2+2 }], tasks: dto.includeTasks === false ? [] : [{ title: 'Confirm scope, owner, and acceptance criteria', priority: 'HIGH' }, { title: 'Track delivery evidence and blockers', priority: 'MEDIUM' }] })), dependencies: [{ predecessor: 'Discovery and design', successor: 'Build and configuration', type: 'FINISH_TO_START' }], risks: [{ title: 'Scope or decision latency', probability: 'MEDIUM', impact: 'HIGH', mitigation: 'Define dated decision rights and escalation path.' }], first30Days: ['Validate plan assumptions', 'Confirm owners and capacity', 'Baseline milestones and risks'], developmentMode: true };
    }
    const generation = await this.record(org, userId, 'project.plan.generate', 'project-plan-v1', completion, dto, result, started);
    await this.audit.record({ organizationId: org, actorUserId: userId, action: 'ai.project_plan_generated', entityType: 'Project', entityId: project.id });
    return { generationId: generation.id, project: { id: project.id, key: project.key, name: project.name }, ...result };
  }

  async analyzeProjectDeliveryRisk(org: string, userId: string, dto: AnalyzeProjectDeliveryRiskDto) {
    const { project, facts, score, band } = await this.projectFacts(org, dto.projectId);
    const started = Date.now();
    const evidence = { ...facts, status: project.status, health: project.health, progress: Number(project.progress), risks: project.risks, issues: project.issues, dependencies: project.predecessorDependencies.map(x => x.predecessorProject), milestones: project.milestones, tasks: project.tasks };
    const completion = await this.provider.complete([{ role: 'system', content: 'Analyze project delivery risk using only supplied evidence. Return strict JSON with riskLevel, confidence, drivers, likelyImpact, mitigations, decisionsNeeded, and nextReviewSignals.' }, { role: 'user', content: JSON.stringify(evidence) }], { responseFormat: 'json', temperature: 0.1 });
    let result = this.parse(completion.text);
    if (completion.provider === 'mock') result = { riskLevel: band, riskScore: score, confidence: 'HIGH', drivers: Object.entries(facts).filter(([,v]) => Number(v) > 0).map(([k,v]) => `${k}: ${Math.round(Number(v))}`), likelyImpact: band === 'LOW' ? 'No immediate material delivery impact detected.' : 'Target date, cost, or strategic contribution may be affected without intervention.', mitigations: dto.includeMitigations === false ? [] : suggestedMitigations(facts), decisionsNeeded: facts.criticalIssues ? ['Assign an executive decision owner for critical issues.'] : [], nextReviewSignals: ['Schedule variance', 'Overdue milestone count', 'High-exposure risk count'], developmentMode: true };
    const generation = await this.record(org, userId, 'project.risk.analyze', 'project-risk-v1', completion, dto, result, started);
    return { generationId: generation.id, project: { id: project.id, key: project.key, name: project.name }, evidence: facts, ...result };
  }

  async projectHealthSummary(org: string, userId: string, dto: ProjectHealthSummaryDto) {
    const { project, facts, score, band } = await this.projectFacts(org, dto.projectId);
    const started = Date.now();
    const context = { project: { key: project.key, name: project.name, status: project.status, health: project.health, progress: Number(project.progress), owner: project.owner, sponsor: project.sponsor, portfolio: project.portfolio, program: project.program }, facts, riskScore: score, riskBand: band, objectives: project.objectiveLinks.map(x => x.objective), keyResults: project.keyResultLinks.map(x => x.keyResult) };
    const completion = await this.provider.complete([{ role: 'system', content: `Write a ${dto.detail ?? 'standard'} project health summary for ${dto.audience ?? 'project governance'}. Return strict JSON with headline, summary, accomplishments, concerns, decisionsNeeded, and nextActions. Use only supplied facts.` }, { role: 'user', content: JSON.stringify(context) }], { responseFormat: 'json', temperature: 0.2 });
    let result = this.parse(completion.text);
    if (completion.provider === 'mock') result = { headline: `${project.key}: ${Math.round(Number(project.progress))}% complete · ${band} delivery risk`, summary: `${project.name} is ${project.status.toLowerCase().replaceAll('_',' ')} with ${Math.round(facts.scheduleVariancePoints)} points schedule variance and ${Math.round(facts.budgetVariancePercent)}% budget variance.`, accomplishments: project.milestones.filter(m => m.status === 'DONE').slice(0,3).map(m => m.name), concerns: suggestedMitigations(facts).slice(0,3), decisionsNeeded: facts.criticalIssues ? ['Resolve or accept critical issue exposure.'] : [], nextActions: ['Confirm recovery owners', 'Refresh milestones and risk evidence', 'Validate strategic contribution assumptions'], developmentMode: true };
    const generation = await this.record(org, userId, 'project.health.summary', 'project-health-summary-v1', completion, dto, result, started);
    return { generationId: generation.id, project: { id: project.id, key: project.key, name: project.name }, ...result };
  }

  async executiveDeliveryUpdate(org: string, userId: string, dto: ExecutiveDeliveryUpdateDto) {
    const projects = await this.prisma.project.findMany({ where: { organizationId: org, ...(dto.portfolioId ? { portfolioId: dto.portfolioId } : {}), ...(dto.programId ? { programId: dto.programId } : {}) }, include: { portfolio: { select: { name: true } }, program: { select: { name: true } }, risks: { where: { status: { notIn: ['CLOSED'] } }, select: { probability: true, impact: true } }, issues: { where: { status: { notIn: ['RESOLVED','CLOSED'] } }, select: { severity: true } }, milestones: { select: { status: true, plannedDate: true } }, tasks: { select: { status: true, dueDate: true } } } });
    const now = new Date();
    const facts = projects.map(p => ({ id: p.id, key: p.key, name: p.name, status: p.status, health: p.health, progress: Number(p.progress), portfolio: p.portfolio?.name, program: p.program?.name, targetDate: p.targetDate, budget: Number(p.budget ?? 0), actualCost: Number(p.actualCost), overdueMilestones: p.milestones.filter(m => new Date(m.plannedDate) < now && m.status !== 'DONE').length, overdueTasks: p.tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length, highRisks: p.risks.filter(r => ['HIGH','CRITICAL'].includes(r.probability) && ['HIGH','CRITICAL'].includes(r.impact)).length, criticalIssues: p.issues.filter(i => i.severity === 'CRITICAL').length }));
    const started = Date.now();
    const completion = await this.provider.complete([{ role: 'system', content: `Write a ${dto.detail ?? 'standard'} executive portfolio delivery update for ${dto.audience ?? 'executive leadership'}. Return strict JSON with headline, portfolioSummary, wins, attentionRequired, decisionsNeeded, and nextPeriodPriorities. Use only supplied facts.` }, { role: 'user', content: JSON.stringify(facts) }], { responseFormat: 'json', temperature: 0.15 });
    let result = this.parse(completion.text);
    if (completion.provider === 'mock') { const attention = facts.filter(p => ['AT_RISK','OFF_TRACK'].includes(p.health) || p.overdueMilestones || p.criticalIssues); result = { headline: attention.length ? `${attention.length} projects require leadership attention` : 'Portfolio delivery is broadly on track', portfolioSummary: `${projects.length} projects reviewed; ${facts.filter(p=>p.status==='COMPLETED').length} completed and ${attention.length} exposed.`, wins: facts.filter(p => p.progress >= 70 || p.status === 'COMPLETED').slice(0,4).map(p => `${p.key} · ${p.name}`), attentionRequired: attention.slice(0,5).map(p => ({ project: `${p.key} · ${p.name}`, reason: `${p.health}; ${p.overdueMilestones} overdue milestones; ${p.criticalIssues} critical issues` })), decisionsNeeded: attention.length ? ['Confirm recovery owners and escalation dates for exposed projects.'] : [], nextPeriodPriorities: ['Protect critical milestones', 'Close high-exposure risks', 'Validate portfolio capacity'], developmentMode: true }; }
    const generation = await this.record(org, userId, 'portfolio.delivery.update', 'portfolio-delivery-update-v1', completion, dto, result, started);
    return { generationId: generation.id, filters: { portfolioId: dto.portfolioId, programId: dto.programId }, ...result };
  }

  private async resourceCandidates(org: string, teamId?: string) {
    const now = new Date();
    const rows = await this.prisma.resource.findMany({
      where: { organizationId: org, status: { in: ['ACTIVE','CONTRACTOR'] }, ...(teamId ? { teamMemberships: { some: { teamId } } } : {}) },
      include: {
        skills: { include: { skill: { select: { id: true, name: true } } } },
        allocations: { where: { status: { in: ['PLANNED','ACTIVE'] }, startsAt: { lte: now }, endsAt: { gte: now } } },
        teamMemberships: { include: { team: { select: { id: true, name: true } } } },
      },
    });
    return rows.map(r => {
      const capacityHours = Number(r.capacityHoursPerWeek);
      const allocatedHours = r.allocations.reduce((sum, a) => sum + Number(a.hoursPerWeek ?? capacityHours * Number(a.allocationPercent) / 100), 0);
      return {
        id: r.id, displayName: r.displayName, jobTitle: r.jobTitle, capacityHours, allocatedHours,
        teams: r.teamMemberships.map(m => m.team),
        skills: r.skills.map(s => ({ skillId: s.skillId, skillName: s.skill.name, proficiency: s.proficiency, yearsExperience: s.yearsExperience ? Number(s.yearsExperience) : null, verified: s.verified })),
      };
    });
  }

  async staffingRecommendations(org: string, userId: string, dto: StaffingRecommendationDto) {
    if (!(await this.enabled(org))) throw new NotFoundException('AI Resource Planner is not enabled');
    if (dto.projectId && !await this.prisma.project.findFirst({ where: { id: dto.projectId, organizationId: org } })) throw new NotFoundException('Project not found');
    const candidates = await this.resourceCandidates(org);
    const ranked = rankStaffingCandidates(candidates, dto.skillIds).slice(0, dto.candidateCount ?? 5);
    const skills = await this.prisma.skill.findMany({ where: { organizationId: org, id: { in: dto.skillIds } }, select: { id: true, name: true } });
    const evidence = ranked.map(r => ({ resourceId:r.id, displayName:r.displayName, jobTitle:r.jobTitle, matchScore:r.matchScore, utilizationPercent:r.utilizationPercent, availableHours:Math.max(0,r.capacityHours-r.allocatedHours), matchedSkills:r.skills.filter(s=>dto.skillIds.includes(s.skillId)).map(s=>({name:s.skillName,proficiency:s.proficiency,verified:s.verified})), teams:r.teams }));
    const started = Date.now();
    const completion = await this.provider.complete([{ role:'system', content:'Recommend enterprise staffing using only supplied candidate evidence. Return strict JSON with recommendation, candidates, tradeoffs, staffingRisks, and nextActions. Explain every recommendation.' }, { role:'user', content:JSON.stringify({ projectId:dto.projectId, requiredSkills:skills, requiredHoursPerWeek:dto.requiredHoursPerWeek, context:dto.context, candidates:evidence }) }], { responseFormat:'json', temperature:0.1 });
    let result = this.parse(completion.text);
    if (completion.provider === 'mock') result = { recommendation: evidence.length ? `Prioritize ${evidence[0].displayName} based on skill coverage and available capacity.` : 'No eligible resource currently matches the request.', candidates:evidence, tradeoffs:evidence.map(c=>({resourceId:c.resourceId, explanation:`${c.matchScore}% match; ${Math.round(c.availableHours)} available hours; ${Math.round(c.utilizationPercent)}% utilized.`})), staffingRisks:evidence.length ? [] : ['Required skills or capacity are not currently available.'], nextActions:['Validate assignment dates with the resource manager','Confirm proficiency evidence before committing critical work'], developmentMode:true };
    const generation=await this.record(org,userId,'resource.staffing.recommend','resource-staffing-v1',completion,dto,result,started);
    return { generationId:generation.id, requiredSkills:skills, ...result };
  }

  async resolveResourceConflicts(org: string, userId: string, dto: ResolveResourceConflictsDto) {
    const candidates = await this.resourceCandidates(org, dto.teamId);
    const conflicts = candidates.filter(c => c.allocatedHours > c.capacityHours).map(c => ({ resourceId:c.id, displayName:c.displayName, capacityHours:c.capacityHours, allocatedHours:c.allocatedHours, overByHours:Math.round((c.allocatedHours-c.capacityHours)*100)/100, utilizationPercent:resourceUtilization(c.capacityHours,c.allocatedHours), skills:c.skills.map(s=>s.skillName) })).sort((a,b)=>b.overByHours-a.overByHours);
    const alternatives = candidates.filter(c=>c.allocatedHours<c.capacityHours).map(c=>({resourceId:c.id,displayName:c.displayName,availableHours:Math.round((c.capacityHours-c.allocatedHours)*100)/100,skills:c.skills.map(s=>s.skillName)})).sort((a,b)=>b.availableHours-a.availableHours);
    const started=Date.now();
    const completion=await this.provider.complete([{role:'system',content:'Resolve workforce allocation conflicts using only supplied facts. Return strict JSON with conflicts, rebalancingActions, sequencingOptions, escalationNeeds, and assumptions. Never auto-assign people.'},{role:'user',content:JSON.stringify({window:{from:dto.from,to:dto.to},conflicts,alternatives})}],{responseFormat:'json',temperature:0.1});
    let result=this.parse(completion.text);
    if(completion.provider==='mock') result={conflicts,rebalancingActions:conflicts.map((c,i)=>({resourceId:c.resourceId,action:alternatives[i]?`Review moving up to ${Math.min(c.overByHours,alternatives[i].availableHours)} hours to ${alternatives[i].displayName}.`:'Reduce scope, sequence work, or source temporary capacity.',evidence:`${c.overByHours} hours above weekly capacity.`})),sequencingOptions:['Move non-critical work outside the conflicted period','Protect milestone-critical assignments first'],escalationNeeds:conflicts.filter(c=>c.overByHours>=16).map(c=>`${c.displayName} requires management intervention.`),assumptions:['Current active allocation records represent committed weekly demand.'],developmentMode:true};
    const generation=await this.record(org,userId,'resource.conflict.resolve','resource-conflict-v1',completion,dto,result,started);
    return {generationId:generation.id,...result};
  }

  async skillGapAnalysis(org: string, userId: string, dto: SkillGapAnalysisDto) {
    const candidates=await this.resourceCandidates(org,dto.teamId);
    const skills=await this.prisma.skill.findMany({where:{organizationId:org,id:{in:dto.skillIds}},select:{id:true,name:true}});
    const gaps=detectSkillGaps(dto.skillIds,candidates).map(g=>({...g,skillName:skills.find(s=>s.id===g.skillId)?.name??g.skillId}));
    const availableHours=candidates.reduce((sum,c)=>sum+Math.max(0,c.capacityHours-c.allocatedHours),0);
    const signal=hiringSignal(gaps,dto.forecastDemandHours??0,availableHours);
    const started=Date.now();
    const completion=await this.provider.complete([{role:'system',content:'Analyze workforce skill gaps. Return strict JSON with gaps, developmentActions, sourcingOptions, hiringSignal, and rationale. Use only supplied facts.'},{role:'user',content:JSON.stringify({skills,gaps,availableHours,forecastDemandHours:dto.forecastDemandHours??0,signal})}],{responseFormat:'json',temperature:0.1});
    let result=this.parse(completion.text);
    if(completion.provider==='mock') result={gaps,developmentActions:gaps.filter(g=>g.qualifiedResources>0&&g.availableResources===0).map(g=>`Cross-train backup capacity for ${g.skillName}.`),sourcingOptions:gaps.filter(g=>g.gap).map(g=>`Consider contractor, partner, or hiring coverage for ${g.skillName}.`),hiringSignal:signal,rationale:`${signal.skillGapCount} critical skill gaps and ${signal.capacityGapHours} forecast capacity-gap hours detected.`,developmentMode:true};
    const generation=await this.record(org,userId,'resource.skill-gap.analyze','resource-skill-gap-v1',completion,dto,result,started);
    return {generationId:generation.id,...result};
  }

  async workforceSummary(org: string, userId: string, dto: WorkforceSummaryDto) {
    const candidates=await this.resourceCandidates(org,dto.teamId);
    const totalCapacity=candidates.reduce((s,c)=>s+c.capacityHours,0), allocated=candidates.reduce((s,c)=>s+c.allocatedHours,0);
    const facts={resources:candidates.length,totalCapacityHours:totalCapacity,allocatedHours:allocated,utilizationPercent:resourceUtilization(totalCapacity,allocated),overallocated:candidates.filter(c=>c.allocatedHours>c.capacityHours).length,underutilized:candidates.filter(c=>resourceUtilization(c.capacityHours,c.allocatedHours)<60).length,topSkills:Object.entries(candidates.flatMap(c=>c.skills.map(s=>s.skillName)).reduce((m:any,n)=>{m[n]=(m[n]??0)+1;return m},{})).sort((a:any,b:any)=>b[1]-a[1]).slice(0,8)};
    const started=Date.now();
    const completion=await this.provider.complete([{role:'system',content:`Write a ${dto.detail??'standard'} executive workforce summary. Return strict JSON with headline, capacitySummary, strengths, exposures, decisionsNeeded, and nextActions. Use only supplied facts.`},{role:'user',content:JSON.stringify(facts)}],{responseFormat:'json',temperature:0.15});
    let result=this.parse(completion.text);
    if(completion.provider==='mock') result={headline:facts.overallocated?`${facts.overallocated} resources require workload intervention`:'Workforce capacity is broadly balanced',capacitySummary:`${facts.resources} resources are ${Math.round(facts.utilizationPercent)}% utilized across ${Math.round(totalCapacity)} weekly hours.`,strengths:facts.topSkills.slice(0,4).map(([name,count]:any)=>`${name}: ${count} resources`),exposures:[...(facts.overallocated?[`${facts.overallocated} overallocated resources`]:[]),...(facts.underutilized?[`${facts.underutilized} underutilized resources`]:[])],decisionsNeeded:facts.overallocated?['Confirm workload rebalancing owners and dates.']:[],nextActions:['Validate critical-skill coverage','Review upcoming demand against available capacity'],developmentMode:true};
    const generation=await this.record(org,userId,'resource.workforce.summary','resource-workforce-summary-v1',completion,dto,result,started);
    return {generationId:generation.id,facts,...result};
  }

  history(org: string, userId: string) { return this.prisma.aiGeneration.findMany({ where: { organizationId: org, userId }, orderBy: { createdAt: 'desc' }, take: 50, select: { id: true, capability: true, provider: true, model: true, inputTokens: true, outputTokens: true, estimatedCostUsd: true, latencyMs: true, status: true, createdAt: true, feedback: true } }); }
  async usage(org: string) { const rows = await this.prisma.aiGeneration.findMany({ where: { organizationId: org, status: 'COMPLETED' }, select: { capability: true, inputTokens: true, outputTokens: true, estimatedCostUsd: true, createdAt: true } }); return { generations: rows.length, inputTokens: rows.reduce((s, r) => s + r.inputTokens, 0), outputTokens: rows.reduce((s, r) => s + r.outputTokens, 0), estimatedCostUsd: Number(rows.reduce((s, r) => s + Number(r.estimatedCostUsd), 0).toFixed(6)), byCapability: Object.values(rows.reduce((m: any, r) => { m[r.capability] ??= { capability: r.capability, generations: 0, tokens: 0 }; m[r.capability].generations++; m[r.capability].tokens += r.inputTokens + r.outputTokens; return m; }, {})) }; }
  async feedback(org: string, userId: string, id: string, helpful: boolean, comment?: string) { const generation = await this.prisma.aiGeneration.findFirst({ where: { id, organizationId: org, userId } }); if (!generation) throw new NotFoundException('AI generation not found'); return this.prisma.aiFeedback.upsert({ where: { generationId_userId: { generationId: id, userId } }, create: { organizationId: org, generationId: id, userId, helpful, comment }, update: { helpful, comment } }); }
}
