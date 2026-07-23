import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertNotificationRouteDto, UpsertNotificationTemplateDto } from './dto/notification-routing.dto';
@Injectable()
export class NotificationRoutingService {
 constructor(private readonly prisma:PrismaService){}
 listTemplates(organizationId:string){return this.prisma.notificationTemplate.findMany({where:{organizationId},orderBy:[{key:'asc'},{channel:'asc'}]})}
 upsertTemplate(organizationId:string,dto:UpsertNotificationTemplateDto){return this.prisma.notificationTemplate.upsert({where:{organizationId_key_channel:{organizationId,key:dto.key,channel:dto.channel}},create:{organizationId,...dto},update:dto})}
 listRoutes(organizationId:string){return this.prisma.notificationRoute.findMany({where:{organizationId},orderBy:{eventName:'asc'}})}
 upsertRoute(organizationId:string,dto:UpsertNotificationRouteDto){return this.prisma.notificationRoute.upsert({where:{organizationId_eventName:{organizationId,eventName:dto.eventName}},create:{organizationId,...dto},update:dto})}
}
