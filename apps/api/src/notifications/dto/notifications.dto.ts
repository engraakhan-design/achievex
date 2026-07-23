import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListNotificationsQuery {
  @IsOptional() @Transform(({ value }) => value === true || value === 'true') @IsBoolean() unreadOnly?: boolean;
}

export class UpdateNotificationPreferencesDto {
  @IsOptional() @IsBoolean() inAppEnabled?: boolean;
  @IsOptional() @IsBoolean() emailEnabled?: boolean;
  @IsOptional() @IsBoolean() checkInReminders?: boolean;
  @IsOptional() @IsBoolean() riskAlerts?: boolean;
  @IsOptional() @IsBoolean() assignmentAlerts?: boolean;
  @IsOptional() @IsBoolean() commentAlerts?: boolean;
  @IsOptional() @IsBoolean() weeklyDigest?: boolean;
  @IsOptional() @IsInt() @Min(0) @Max(6) reminderDayOfWeek?: number;
  @IsOptional() @IsInt() @Min(0) @Max(23) reminderHour?: number;
  @IsOptional() @IsInt() @Min(0) @Max(6) digestDayOfWeek?: number;
  @IsOptional() @IsInt() @Min(0) @Max(23) digestHour?: number;
}
