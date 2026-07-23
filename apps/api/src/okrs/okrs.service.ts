import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { KeyResultStatus, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { AddCommentDto, AlignObjectiveDto, CheckInDto, CreateCycleDto, CreateInitiativeDto, CreateKeyResultDto, CreateObjectiveDto, ListObjectivesQuery, UpdateCycleDto, UpdateInitiativeDto, UpdateKeyResultDto, UpdateObjectiveDto } from './dto/okrs.dto';

@Injectable()
export class OkrsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService, private readonly events: EventsService) {}
  private date(v?: string) { return v ? new Date(v) : undefined; }
  private progress(start: number, target: number, current: number, type?: string) {
    if (type === 'BOOLEAN' || type === 'MILESTONE') return current >= target ? 100 : 0;
    if (target === start) return current >= target ? 100 : 0;
    return Math.max(0, Math.min(100, ((current - start) / (target - start)) * 100));
  }
  private status(progress: number): KeyResultStatus {
    if (progress >= 100) return 'COMPLETED';
    if (progress <= 0) return 'NOT_STARTED';
    if (progress < 40) return 'OFF_TRACK';
    if (progress < 70) return 'AT_RISK';
    return 'ON_TRACK';
  }
  private async ensureUser(org: string, id: string) { if (!(await this.prisma.user.findFirst({ where: { id, organizationId: org } }))) throw new BadRequestException('Invalid user'); }
  private async ensureObjective(org: string, id: string) { const x = await this.prisma.objective.findFirst({ where: { id, organizationId: org } }); if (!x) throw new NotFoundException('Objective not found'); return x; }
  private async activity(org: string, actor: string, action: string, objectiveId?: string, keyResultId?: string, metadata?: Prisma.InputJsonValue) { await this.prisma.okrActivity.create({ data: { organizationId: org, actorId: actor, action, objectiveId, keyResultId, metadata } }); await this.events.publish({ organizationId: org, eventName: action, aggregateType: keyResultId ? 'KeyResult' : 'Objective', aggregateId: keyResultId ?? objectiveId ?? org, actorUserId: actor, payload: metadata }); }
  private async recalculateObjective(objectiveId: string) {
    const objective = await this.prisma.objective.findUnique({ where: { id: objectiveId }, include: { keyResults: true } });
    if (!objective) return;
    const totalWeight = objective.keyResults.reduce((s, x) => s + x.weight, 0);
    const progress = totalWeight ? objective.keyResults.reduce((s, x) => s + x.progress * x.weight, 0) / totalWeight : 0;
    const score = Math.round(progress) / 100;
    const status = progress >= 100 ? 'COMPLETED' : progress < 40 && progress > 0 ? 'OFF_TRACK' : progress < 70 && progress > 0 ? 'AT_RISK' : objective.status === 'DRAFT' ? 'DRAFT' : 'ACTIVE';
    await this.prisma.objective.update({ where: { id: objectiveId }, data: { progress, score, status } });
  }

  listCycles(org: string) { return this.prisma.okrCycle.findMany({ where: { organizationId: org }, orderBy: { startDate: 'desc' }, include: { _count: { select: { objectives: true } } } }); }
  async createCycle(org: string, actor: string, dto: CreateCycleDto) {
    if (new Date(dto.endDate) <= new Date(dto.startDate)) throw new BadRequestException('End date must be after start date');
    if (dto.isDefault) await this.prisma.okrCycle.updateMany({ where: { organizationId: org, isDefault: true }, data: { isDefault: false } });
    const cycle = await this.prisma.okrCycle.create({ data: { organizationId: org, ...dto, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate) } });
    await this.audit.record({ organizationId: org, actorUserId: actor, action: 'okr.cycle_created', entityType: 'OkrCycle', entityId: cycle.id }); return cycle;
  }
  async updateCycle(org: string, id: string, actor: string, dto: UpdateCycleDto) {
    const cycle = await this.prisma.okrCycle.findFirstOrThrow({ where: { id, organizationId: org } });
    if (dto.isDefault) await this.prisma.okrCycle.updateMany({ where: { organizationId: org, isDefault: true, id: { not: id } }, data: { isDefault: false } });
    const startDate = this.date(dto.startDate) ?? cycle.startDate; const endDate = this.date(dto.endDate) ?? cycle.endDate;
    if (endDate <= startDate) throw new BadRequestException('End date must be after start date');
    const updated = await this.prisma.okrCycle.update({ where: { id }, data: { ...dto, startDate, endDate } });
    await this.audit.record({ organizationId: org, actorUserId: actor, action: 'okr.cycle_updated', entityType: 'OkrCycle', entityId: id }); return updated;
  }

  listObjectives(org: string, q: ListObjectivesQuery) { return this.prisma.objective.findMany({ where: { organizationId: org, cycleId: q.cycleId, scope: q.scope, status: q.status, ownerId: q.ownerId, OR: q.search ? [{ title: { contains: q.search, mode: 'insensitive' } }, { description: { contains: q.search, mode: 'insensitive' } }] : undefined }, orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }], include: { cycle: true, owner: { select: { id: true, firstName: true, lastName: true } }, department: { select: { id: true, name: true } }, team: { select: { id: true, name: true } }, parent: { select: { id: true, title: true } }, keyResults: { orderBy: { createdAt: 'asc' }, include: { owner: { select: { id: true, firstName: true, lastName: true } }, _count: { select: { checkIns: true, initiatives: true } } } } } }); }
  async getObjective(org: string, id: string) { await this.ensureObjective(org, id); return this.prisma.objective.findUniqueOrThrow({ where: { id }, include: { cycle: true, owner: { select: { id: true, firstName: true, lastName: true, email: true } }, department: true, team: true, parent: { select: { id: true, title: true } }, children: { select: { id: true, title: true, progress: true, status: true } }, keyResults: { orderBy: { createdAt: 'asc' }, include: { owner: { select: { id: true, firstName: true, lastName: true } }, checkIns: { orderBy: { createdAt: 'desc' }, take: 5, include: { author: { select: { id: true, firstName: true, lastName: true } } } }, initiatives: { orderBy: { createdAt: 'desc' }, include: { owner: { select: { id: true, firstName: true, lastName: true } } } } } }, comments: { orderBy: { createdAt: 'desc' }, include: { author: { select: { id: true, firstName: true, lastName: true } } } }, activities: { orderBy: { createdAt: 'desc' }, take: 30, include: { actor: { select: { firstName: true, lastName: true } } } } } }); }
  async createObjective(org: string, actor: string, dto: CreateObjectiveDto) {
    await this.ensureUser(org, dto.ownerId); if (!(await this.prisma.okrCycle.findFirst({ where: { id: dto.cycleId, organizationId: org } }))) throw new BadRequestException('Invalid cycle');
    if (dto.parentId) { const parent = await this.ensureObjective(org, dto.parentId); if (parent.cycleId !== dto.cycleId) throw new BadRequestException('Aligned objectives must belong to the same cycle'); }
    if (dto.scope === 'DEPARTMENT' && !dto.departmentId) throw new BadRequestException('Department scope requires a department');
    if (dto.scope === 'TEAM' && !dto.teamId) throw new BadRequestException('Team scope requires a team');
    const objective = await this.prisma.objective.create({ data: { organizationId: org, ...dto, dueDate: this.date(dto.dueDate) } }); await this.activity(org, actor, 'objective.created', objective.id); return objective;
  }
  async updateObjective(org: string, id: string, actor: string, dto: UpdateObjectiveDto) { const current = await this.ensureObjective(org, id); if (dto.ownerId) await this.ensureUser(org, dto.ownerId); if (dto.parentId === id) throw new BadRequestException('Objective cannot align to itself'); if (dto.parentId) { const parent = await this.ensureObjective(org, dto.parentId); if (parent.cycleId !== current.cycleId) throw new BadRequestException('Aligned objectives must belong to the same cycle'); } const updated = await this.prisma.objective.update({ where: { id }, data: { ...dto, dueDate: this.date(dto.dueDate) } }); await this.activity(org, actor, 'objective.updated', id, undefined, { fields: Object.keys(dto) }); return updated; }
  async alignObjective(org: string, id: string, actor: string, dto: AlignObjectiveDto) { const current = await this.ensureObjective(org, id); if (dto.parentId === id) throw new BadRequestException('Objective cannot align to itself'); if (dto.parentId) { const parent = await this.ensureObjective(org, dto.parentId); if (parent.cycleId !== current.cycleId) throw new BadRequestException('Aligned objectives must belong to the same cycle'); } const result = await this.prisma.objective.update({ where: { id }, data: { parentId: dto.parentId ?? null } }); await this.activity(org, actor, 'objective.aligned', id, undefined, { parentId: dto.parentId ?? null }); return result; }
  async deleteObjective(org: string, id: string, actor: string) { await this.ensureObjective(org, id); await this.audit.record({ organizationId: org, actorUserId: actor, action: 'okr.objective_deleted', entityType: 'Objective', entityId: id }); await this.prisma.objective.delete({ where: { id } }); return { success: true }; }

  async createKeyResult(org: string, objectiveId: string, actor: string, dto: CreateKeyResultDto) { await this.ensureObjective(org, objectiveId); await this.ensureUser(org, dto.ownerId); const current = dto.currentValue ?? dto.startValue ?? 0; const start = dto.startValue ?? 0; const progress = this.progress(start, dto.targetValue, current, dto.type); const kr = await this.prisma.keyResult.create({ data: { organizationId: org, objectiveId, ...dto, currentValue: current, startValue: start, progress, status: this.status(progress), dueDate: this.date(dto.dueDate) } }); await this.recalculateObjective(objectiveId); await this.activity(org, actor, 'key_result.created', objectiveId, kr.id); return kr; }
  async updateKeyResult(org: string, id: string, actor: string, dto: UpdateKeyResultDto) { const current = await this.prisma.keyResult.findFirst({ where: { id, organizationId: org } }); if (!current) throw new NotFoundException('Key result not found'); if (dto.ownerId) await this.ensureUser(org, dto.ownerId); const start = dto.startValue ?? current.startValue; const target = dto.targetValue ?? current.targetValue; const value = dto.currentValue ?? current.currentValue; const progress = this.progress(start, target, value, dto.type ?? current.type); const updated = await this.prisma.keyResult.update({ where: { id }, data: { ...dto, progress, status: dto.status ?? this.status(progress), dueDate: this.date(dto.dueDate) } }); await this.recalculateObjective(current.objectiveId); await this.activity(org, actor, 'key_result.updated', current.objectiveId, id, { fields: Object.keys(dto) }); return updated; }
  async checkIn(org: string, id: string, actor: string, dto: CheckInDto) { const kr = await this.prisma.keyResult.findFirst({ where: { id, organizationId: org } }); if (!kr) throw new NotFoundException('Key result not found'); const progress = this.progress(kr.startValue, kr.targetValue, dto.newValue, kr.type); const status = dto.status ?? this.status(progress); const [checkIn] = await this.prisma.$transaction([this.prisma.checkIn.create({ data: { organizationId: org, keyResultId: id, authorId: actor, previousValue: kr.currentValue, newValue: dto.newValue, progress, confidence: dto.confidence, status, note: dto.note } }), this.prisma.keyResult.update({ where: { id }, data: { currentValue: dto.newValue, progress, confidence: dto.confidence, status } })]); await this.recalculateObjective(kr.objectiveId); await this.activity(org, actor, 'key_result.checked_in', kr.objectiveId, id, { previousValue: kr.currentValue, newValue: dto.newValue, progress }); return checkIn; }
  async deleteKeyResult(org: string, id: string, actor: string) { const kr = await this.prisma.keyResult.findFirst({ where: { id, organizationId: org } }); if (!kr) throw new NotFoundException('Key result not found'); await this.prisma.keyResult.delete({ where: { id } }); await this.recalculateObjective(kr.objectiveId); await this.activity(org, actor, 'key_result.deleted', kr.objectiveId, undefined, { keyResultId: id }); return { success: true }; }

  async createInitiative(org: string, keyResultId: string, actor: string, dto: CreateInitiativeDto) { const kr = await this.prisma.keyResult.findFirst({ where: { id: keyResultId, organizationId: org } }); if (!kr) throw new NotFoundException('Key result not found'); await this.ensureUser(org, dto.ownerId); const item = await this.prisma.initiative.create({ data: { organizationId: org, keyResultId, ...dto, startDate: this.date(dto.startDate), dueDate: this.date(dto.dueDate) } }); await this.activity(org, actor, 'initiative.created', kr.objectiveId, keyResultId, { initiativeId: item.id }); return item; }
  async updateInitiative(org: string, id: string, actor: string, dto: UpdateInitiativeDto) { const item = await this.prisma.initiative.findFirst({ where: { id, organizationId: org }, include: { keyResult: true } }); if (!item) throw new NotFoundException('Initiative not found'); if (dto.ownerId) await this.ensureUser(org, dto.ownerId); const updated = await this.prisma.initiative.update({ where: { id }, data: { ...dto, startDate: this.date(dto.startDate), dueDate: this.date(dto.dueDate) } }); await this.activity(org, actor, 'initiative.updated', item.keyResult.objectiveId, item.keyResultId, { initiativeId: id }); return updated; }
  async addComment(org: string, objectiveId: string, actor: string, dto: AddCommentDto) { await this.ensureObjective(org, objectiveId); const comment = await this.prisma.objectiveComment.create({ data: { objectiveId, authorId: actor, body: dto.body } }); await this.activity(org, actor, 'objective.commented', objectiveId, undefined, { commentId: comment.id }); return comment; }
  async dashboard(org: string, cycleId?: string) {
    const cycle = cycleId ? await this.prisma.okrCycle.findFirst({ where: { id: cycleId, organizationId: org } }) : await this.prisma.okrCycle.findFirst({ where: { organizationId: org, OR: [{ isDefault: true }, { status: 'ACTIVE' }] }, orderBy: { isDefault: 'desc' } });
    if (!cycle) return { cycle: null, metrics: { objectives: 0, averageProgress: 0, atRisk: 0, checkInsLast7Days: 0 }, objectives: [] };
    const objectives = await this.prisma.objective.findMany({ where: { organizationId: org, cycleId: cycle.id }, include: { owner: { select: { firstName: true, lastName: true } }, keyResults: true } });
    const checkInsLast7Days = await this.prisma.checkIn.count({ where: { organizationId: org, createdAt: { gte: new Date(Date.now() - 7 * 86400000) }, keyResult: { objective: { cycleId: cycle.id } } } });
    return { cycle, metrics: { objectives: objectives.length, averageProgress: objectives.length ? objectives.reduce((s, x) => s + x.progress, 0) / objectives.length : 0, atRisk: objectives.filter(x => ['AT_RISK','OFF_TRACK'].includes(x.status)).length, checkInsLast7Days }, objectives: objectives.sort((a,b) => b.progress-a.progress).slice(0,8) };
  }
}
