import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
import { SlaTargetType } from '@prisma/client';
export class CreateSlaPolicyDto {
  @IsString() key!: string; @IsString() name!: string; @IsOptional() @IsString() description?: string;
  @IsEnum(SlaTargetType) targetType!: SlaTargetType;
  @IsInt() @Min(1) @Max(525600) targetMinutes!: number;
  @IsOptional() @IsInt() @Min(0) warningMinutes?: number;
  @IsOptional() @IsInt() @Min(0) escalationAfterMinutes?: number;
  @IsOptional() @IsBoolean() businessHoursOnly?: boolean;
  @IsOptional() @IsString() appliesToEntityType?: string;
}
export class StartSlaClockDto {
  @IsString() policyId!: string; @IsString() entityType!: string; @IsString() entityId!: string;
  @IsOptional() @IsString() ownerUserId?: string; @IsOptional() @IsObject() metadata?: Record<string, unknown>;
}
export class CompleteSlaClockDto { @IsOptional() @IsObject() metadata?: Record<string, unknown> }
export class CreateSlaEscalationDto {
  @IsInt() @Min(1) level!: number; @IsString() targetType!: string; @IsString() targetValue!: string;
  @IsOptional() @IsInt() @Min(0) afterMinutes?: number;
}
