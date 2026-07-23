import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { ListNotificationsQuery, UpdateNotificationPreferencesDto } from './dto/notifications.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: ListNotificationsQuery) {
    return this.notifications.list(user.organizationId, user.sub, query.unreadOnly);
  }
  @Patch(':id/read')
  markRead(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) { return this.notifications.markRead(user.organizationId, user.sub, id); }
  @Post('read-all')
  readAll(@CurrentUser() user: AuthenticatedUser) { return this.notifications.markAllRead(user.organizationId, user.sub); }
  @Delete(':id')
  archive(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) { return this.notifications.archive(user.organizationId, user.sub, id); }
  @Get('preferences/me')
  preferences(@CurrentUser() user: AuthenticatedUser) { return this.notifications.preferences(user.organizationId, user.sub); }
  @Patch('preferences/me')
  updatePreferences(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateNotificationPreferencesDto) { return this.notifications.updatePreferences(user.organizationId, user.sub, dto); }
}
