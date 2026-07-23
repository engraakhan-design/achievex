import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { EventsService } from './events.service';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  @RequirePermissions('okrs.read')
  list(@CurrentUser() user: AuthenticatedUser, @Query('take') take?: string) {
    return this.events.list(user.organizationId, Number(take || 50));
  }
}
