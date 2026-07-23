import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type DomainEventInput = {
  organizationId: string;
  eventName: string;
  aggregateType: string;
  aggregateId: string;
  actorUserId?: string;
  payload?: Prisma.InputJsonValue;
};

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  publish(event: DomainEventInput) {
    return this.prisma.domainEvent.create({ data: event });
  }

  list(organizationId: string, take = 50) {
    return this.prisma.domainEvent.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(take, 100),
    });
  }
}
