import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationChannel } from '@prisma/client';
export class UpsertNotificationTemplateDto { @IsString() key!:string; @IsString() name!:string; @IsEnum(NotificationChannel) channel!:NotificationChannel; @IsOptional() @IsString() subjectTemplate?:string; @IsString() bodyTemplate!:string; @IsOptional() @IsBoolean() isActive?:boolean }
export class UpsertNotificationRouteDto { @IsString() eventName!:string; @IsArray() @IsEnum(NotificationChannel,{each:true}) channels!:NotificationChannel[]; @IsOptional() @IsString() recipientExpression?:string; @IsOptional() @IsBoolean() isActive?:boolean }
