import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationChannel, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailProvider } from './providers/email.provider';
import { UpdateNotificationPreferencesDto } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService, private readonly email: EmailProvider) {}

  async list(organizationId: string, userId: string, unreadOnly = false) {
    const [items, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { organizationId, userId, archivedAt: null, readAt: unreadOnly ? null : undefined },
        orderBy: { createdAt: 'desc' }, take: 100,
      }),
      this.prisma.notification.count({ where: { organizationId, userId, archivedAt: null, readAt: null } }),
    ]);
    return { items, unreadCount };
  }

  async markRead(organizationId: string, userId: string, id: string) {
    const item = await this.prisma.notification.findFirst({ where: { id, organizationId, userId } });
    if (!item) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }

  markAllRead(organizationId: string, userId: string) {
    return this.prisma.notification.updateMany({ where: { organizationId, userId, readAt: null }, data: { readAt: new Date() } });
  }

  async archive(organizationId: string, userId: string, id: string) {
    const item = await this.prisma.notification.findFirst({ where: { id, organizationId, userId } });
    if (!item) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id }, data: { archivedAt: new Date() } });
  }

  preferences(organizationId: string, userId: string) {
    return this.prisma.notificationPreference.upsert({
      where: { userId }, create: { organizationId, userId }, update: {},
    });
  }

  updatePreferences(organizationId: string, userId: string, dto: UpdateNotificationPreferencesDto) {
    return this.prisma.notificationPreference.upsert({
      where: { userId }, create: { organizationId, userId, ...dto }, update: dto,
    });
  }

  async create(input: {
    organizationId: string; userId: string; type?: NotificationType; eventName?: string;
    title: string; body: string; actionUrl?: string; metadata?: Prisma.InputJsonValue;
  }) {
    const preference = await this.preferences(input.organizationId, input.userId);
    const user = await this.prisma.user.findFirstOrThrow({ where: { id: input.userId, organizationId: input.organizationId } });
    const notification = await this.prisma.notification.create({ data: input });
    const deliveries: Array<{ channel: NotificationChannel; enabled: boolean }> = [
      { channel: 'IN_APP', enabled: preference.inAppEnabled },
      { channel: 'EMAIL', enabled: preference.emailEnabled },
    ];
    for (const delivery of deliveries) {
      const row = await this.prisma.notificationDelivery.create({
        data: { organizationId: input.organizationId, notificationId: notification.id, userId: input.userId, channel: delivery.channel, status: delivery.enabled ? 'PENDING' : 'SKIPPED' },
      });
      if (delivery.channel === 'EMAIL' && delivery.enabled) {
        try {
          const sent = await this.email.send({ to: user.email, subject: input.title, html: `<p>${input.body}</p>` });
          await this.prisma.notificationDelivery.update({ where: { id: row.id }, data: { status: 'SENT', provider: sent.provider, providerMessageId: sent.messageId, sentAt: new Date() } });
        } catch (error) {
          await this.prisma.notificationDelivery.update({ where: { id: row.id }, data: { status: 'FAILED', error: error instanceof Error ? error.message : 'Unknown email error' } });
        }
      } else if (delivery.channel === 'IN_APP' && delivery.enabled) {
        await this.prisma.notificationDelivery.update({ where: { id: row.id }, data: { status: 'SENT', provider: 'database', sentAt: new Date() } });
      }
    }
    return notification;
  }
}
