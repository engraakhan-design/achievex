import { Body, Controller, Get, Put } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator'; import { RequirePermissions } from '../auth/decorators/permissions.decorator'; import { AuthenticatedUser } from '../auth/auth.types';
import { UpsertNotificationRouteDto, UpsertNotificationTemplateDto } from './dto/notification-routing.dto'; import { NotificationRoutingService } from './notification-routing.service';
@Controller('notifications/routing') export class NotificationRoutingController { constructor(private readonly service:NotificationRoutingService){}
@Get('templates') @RequirePermissions('notification.route.manage') templates(@CurrentUser()u:AuthenticatedUser){return this.service.listTemplates(u.organizationId)}
@Put('templates') @RequirePermissions('notification.route.manage') template(@CurrentUser()u:AuthenticatedUser,@Body()d:UpsertNotificationTemplateDto){return this.service.upsertTemplate(u.organizationId,d)}
@Get('routes') @RequirePermissions('notification.route.manage') routes(@CurrentUser()u:AuthenticatedUser){return this.service.listRoutes(u.organizationId)}
@Put('routes') @RequirePermissions('notification.route.manage') route(@CurrentUser()u:AuthenticatedUser,@Body()d:UpsertNotificationRouteDto){return this.service.upsertRoute(u.organizationId,d)} }
