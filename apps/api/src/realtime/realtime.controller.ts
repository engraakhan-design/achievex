import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { concatMap, interval, Observable, startWith } from 'rxjs';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
@Controller('realtime')
export class RealtimeController {
  constructor(private readonly prisma: PrismaService) {}
  @Sse('stream')
  stream(@CurrentUser() user: AuthenticatedUser): Observable<MessageEvent> {
    return interval(10000).pipe(startWith(0), concatMap(async () => ({ data: { type: 'heartbeat', unreadNotifications: await this.prisma.notification.count({ where: { organizationId: user.organizationId, userId: user.sub, readAt: null, archivedAt: null } }), at: new Date().toISOString() } })));
  }
}
