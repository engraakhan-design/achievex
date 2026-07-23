import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}
  record(input: { organizationId: string; actorUserId?: string; action: string; entityType: string; entityId?: string; metadata?: Prisma.InputJsonValue; ipAddress?: string; userAgent?: string }) {
    return this.prisma.auditLog.create({ data: input });
  }
}
