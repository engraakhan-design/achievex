import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailProvider } from './providers/email.provider';
import { NotificationJobsService } from './jobs/notification-jobs.service';
import { NotificationRoutingController } from './notification-routing.controller';
import { NotificationRoutingService } from './notification-routing.service';

@Module({ controllers: [NotificationsController, NotificationRoutingController], providers: [NotificationsService, EmailProvider, NotificationJobsService, NotificationRoutingService], exports: [NotificationsService, NotificationRoutingService] })
export class NotificationsModule {}
