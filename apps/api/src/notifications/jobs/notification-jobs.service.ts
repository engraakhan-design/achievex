import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class NotificationJobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationJobsService.name);
  private timer?: NodeJS.Timeout;
  constructor(private readonly prisma: PrismaService, private readonly notifications: NotificationsService) {}

  onModuleInit() {
    if (process.env.NOTIFICATION_JOBS_ENABLED === 'false') return;
    this.timer = setInterval(() => void this.run(), 15 * 60 * 1000);
    setTimeout(() => void this.run(), 5000);
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }

  async run() {
    try { await this.processDomainEvents(); await this.sendStaleCheckInReminders(); await this.sendRiskAlerts(); }
    catch (error) { this.logger.error(error instanceof Error ? error.message : error); }
  }

  private async processDomainEvents() {
    const events = await this.prisma.domainEvent.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' }, take: 100 });
    for (const event of events) {
      try {
        if (event.eventName === 'objective.created') {
          const objective = await this.prisma.objective.findUnique({ where: { id: event.aggregateId } });
          if (objective && objective.ownerId !== event.actorUserId) await this.notifications.create({ organizationId: event.organizationId, userId: objective.ownerId, type: 'INFO', eventName: 'objective.assigned', title: 'Objective assigned to you', body: `You are responsible for “${objective.title}”.`, actionUrl: `/okrs/${objective.id}`, metadata: { objectiveId: objective.id } });
        }
        if (event.eventName === 'key_result.created') {
          const kr = await this.prisma.keyResult.findUnique({ where: { id: event.aggregateId } });
          if (kr && kr.ownerId !== event.actorUserId) await this.notifications.create({ organizationId: event.organizationId, userId: kr.ownerId, type: 'INFO', eventName: 'key_result.assigned', title: 'Key result assigned to you', body: `You are responsible for “${kr.title}”.`, actionUrl: `/okrs/${kr.objectiveId}`, metadata: { keyResultId: kr.id } });
        }
        if (event.eventName === 'objective.commented') {
          const objective = await this.prisma.objective.findUnique({ where: { id: event.aggregateId } });
          if (objective && objective.ownerId !== event.actorUserId) await this.notifications.create({ organizationId: event.organizationId, userId: objective.ownerId, type: 'INFO', eventName: 'objective.commented', title: 'New objective comment', body: `A new comment was added to “${objective.title}”.`, actionUrl: `/okrs/${objective.id}`, metadata: { objectiveId: objective.id } });
        }
        await this.prisma.domainEvent.update({ where: { id: event.id }, data: { status: 'PROCESSED', processedAt: new Date(), attempts: { increment: 1 }, error: null } });
      } catch (error) {
        await this.prisma.domainEvent.update({ where: { id: event.id }, data: { status: 'FAILED', attempts: { increment: 1 }, error: error instanceof Error ? error.message : 'Unknown event-processing error' } });
      }
    }
  }

  private async sendStaleCheckInReminders() {
    const staleBefore = new Date(Date.now() - 7 * 86400000);
    const keyResults = await this.prisma.keyResult.findMany({
      where: { status: { not: 'COMPLETED' }, owner: { status: 'ACTIVE' }, OR: [{ checkIns: { none: {} } }, { checkIns: { none: { createdAt: { gte: staleBefore } } } }] },
      include: { objective: { select: { title: true } }, owner: { include: { notificationPreference: true } } }, take: 200,
    });
    for (const kr of keyResults) {
      if (kr.owner.notificationPreference?.checkInReminders === false) continue;
      const recent = await this.prisma.notification.findFirst({ where: { userId: kr.ownerId, eventName: 'check_in.reminder', metadata: { path: ['keyResultId'], equals: kr.id }, createdAt: { gte: staleBefore } } });
      if (!recent) await this.notifications.create({ organizationId: kr.organizationId, userId: kr.ownerId, type: 'ACTION_REQUIRED', eventName: 'check_in.reminder', title: 'OKR check-in is due', body: `Update “${kr.title}” under ${kr.objective.title}.`, actionUrl: `/okrs/${kr.objectiveId}`, metadata: { keyResultId: kr.id } });
    }
  }

  private async sendRiskAlerts() {
    const objectives = await this.prisma.objective.findMany({
      where: { status: { in: ['AT_RISK', 'OFF_TRACK'] }, owner: { status: 'ACTIVE' } }, include: { owner: { include: { notificationPreference: true } } }, take: 200,
    });
    const since = new Date(Date.now() - 24 * 86400000);
    for (const objective of objectives) {
      if (objective.owner.notificationPreference?.riskAlerts === false) continue;
      const recent = await this.prisma.notification.findFirst({ where: { userId: objective.ownerId, eventName: 'objective.risk_alert', metadata: { path: ['objectiveId'], equals: objective.id }, createdAt: { gte: since } } });
      if (!recent) await this.notifications.create({ organizationId: objective.organizationId, userId: objective.ownerId, type: 'WARNING', eventName: 'objective.risk_alert', title: 'Objective needs attention', body: `“${objective.title}” is ${objective.status.toLowerCase().replace('_', ' ')} at ${Math.round(objective.progress)}%.`, actionUrl: `/okrs/${objective.id}`, metadata: { objectiveId: objective.id } });
    }
  }
}
