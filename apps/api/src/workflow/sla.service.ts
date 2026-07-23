import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSlaEscalationDto, CreateSlaPolicyDto, StartSlaClockDto } from './dto/sla.dto';

@Injectable()
export class SlaService {
  constructor(private readonly prisma: PrismaService) {}

  listPolicies(organizationId: string) { return this.prisma.slaPolicy.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } }); }
  createPolicy(organizationId: string, actorId: string, dto: CreateSlaPolicyDto) {
    if (dto.warningMinutes != null && dto.warningMinutes >= dto.targetMinutes) throw new BadRequestException('Warning must occur before target');
    return this.prisma.slaPolicy.create({ data: { organizationId, createdById: actorId, ...dto } });
  }
  async activatePolicy(organizationId: string, id: string) {
    const policy = await this.policy(organizationId, id);
    return this.prisma.slaPolicy.update({ where: { id: policy.id }, data: { status: 'ACTIVE' } });
  }
  async startClock(organizationId: string, dto: StartSlaClockDto) {
    const policy = await this.policy(organizationId, dto.policyId);
    if (policy.status !== 'ACTIVE') throw new BadRequestException('SLA policy is not active');
    const now = new Date(); const dueAt = new Date(now.getTime() + policy.targetMinutes * 60000);
    const warningAt = policy.warningMinutes == null ? null : new Date(dueAt.getTime() - policy.warningMinutes * 60000);
    return this.prisma.slaClock.create({ data: { organizationId, policyId: policy.id, entityType: dto.entityType, entityId: dto.entityId, ownerUserId: dto.ownerUserId, metadata: dto.metadata as Prisma.InputJsonValue | undefined, dueAt, warningAt } });
  }
  listClocks(organizationId: string, status?: string) { return this.prisma.slaClock.findMany({ where: { organizationId, ...(status ? { status: status as any } : {}) }, include: { policy: true, escalations: true }, orderBy: { dueAt: 'asc' }, take: 250 }); }
  async completeClock(organizationId: string, id: string, metadata?: Record<string, unknown>) {
    const clock = await this.clock(organizationId, id); if (!['RUNNING','PAUSED'].includes(clock.status)) throw new BadRequestException('SLA clock is already terminal');
    const now = new Date(); const status = now > clock.dueAt ? 'BREACHED' : 'MET';
    return this.prisma.slaClock.update({ where: { id }, data: { status, completedAt: now, breachedAt: status === 'BREACHED' ? now : null, metadata: metadata as Prisma.InputJsonValue | undefined } });
  }
  async addEscalation(organizationId: string, clockId: string, dto: CreateSlaEscalationDto) {
    const clock = await this.clock(organizationId, clockId); const scheduledAt = new Date(clock.dueAt.getTime() + (dto.afterMinutes ?? 0) * 60000);
    return this.prisma.slaEscalation.create({ data: { organizationId, clockId, level: dto.level, targetType: dto.targetType, targetValue: dto.targetValue, scheduledAt } });
  }
  async processDue(organizationId: string) {
    const now = new Date();
    const breached = await this.prisma.slaClock.updateMany({ where: { organizationId, status: 'RUNNING', dueAt: { lte: now } }, data: { status: 'BREACHED', breachedAt: now } });
    const escalations = await this.prisma.slaEscalation.updateMany({ where: { organizationId, status: 'PENDING', scheduledAt: { lte: now }, clock: { status: 'BREACHED' } }, data: { status: 'TRIGGERED', triggeredAt: now } });
    return { breached: breached.count, escalated: escalations.count, processedAt: now };
  }
  async dashboard(organizationId: string) {
    const [running, met, breached, total] = await this.prisma.$transaction([
      this.prisma.slaClock.count({ where: { organizationId, status: 'RUNNING' } }), this.prisma.slaClock.count({ where: { organizationId, status: 'MET' } }),
      this.prisma.slaClock.count({ where: { organizationId, status: 'BREACHED' } }), this.prisma.slaClock.count({ where: { organizationId } }),
    ]); return { running, met, breached, total, complianceRate: total ? Math.round((met / total) * 10000) / 100 : 100 };
  }
  private async policy(organizationId: string, id: string) { const row = await this.prisma.slaPolicy.findFirst({ where: { id, organizationId } }); if (!row) throw new NotFoundException('SLA policy not found'); return row; }
  private async clock(organizationId: string, id: string) { const row = await this.prisma.slaClock.findFirst({ where: { id, organizationId } }); if (!row) throw new NotFoundException('SLA clock not found'); return row; }
}
