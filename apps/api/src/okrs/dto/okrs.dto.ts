import { ConfidenceLevel, InitiativeStatus, KeyResultStatus, KeyResultType, ObjectiveStatus, OkrCycleStatus, OkrScope } from '@prisma/client';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateCycleDto {
  @IsString() @MinLength(2) name!: string;
  @IsOptional() @IsString() description?: string;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
  @IsOptional() @IsEnum(OkrCycleStatus) status?: OkrCycleStatus;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
export class UpdateCycleDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsEnum(OkrCycleStatus) status?: OkrCycleStatus;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
export class ListObjectivesQuery {
  @IsOptional() @IsString() cycleId?: string;
  @IsOptional() @IsEnum(OkrScope) scope?: OkrScope;
  @IsOptional() @IsEnum(ObjectiveStatus) status?: ObjectiveStatus;
  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsString() search?: string;
}
export class CreateObjectiveDto {
  @IsString() cycleId!: string;
  @IsString() @MinLength(3) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(OkrScope) scope!: OkrScope;
  @IsOptional() @IsEnum(ObjectiveStatus) status?: ObjectiveStatus;
  @IsString() ownerId!: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() teamId?: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsNumber() @Min(0) weight?: number;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsBoolean() isPrivate?: boolean;
}
export class UpdateObjectiveDto {
  @IsOptional() @IsString() @MinLength(3) title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(OkrScope) scope?: OkrScope;
  @IsOptional() @IsEnum(ObjectiveStatus) status?: ObjectiveStatus;
  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() teamId?: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsNumber() @Min(0) weight?: number;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsBoolean() isPrivate?: boolean;
}
export class CreateKeyResultDto {
  @IsString() @MinLength(3) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(KeyResultType) type!: KeyResultType;
  @IsString() ownerId!: string;
  @IsOptional() @IsNumber() startValue?: number;
  @IsNumber() targetValue!: number;
  @IsOptional() @IsNumber() currentValue?: number;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsNumber() @Min(0) weight?: number;
  @IsOptional() @IsEnum(ConfidenceLevel) confidence?: ConfidenceLevel;
  @IsOptional() @IsDateString() dueDate?: string;
}
export class UpdateKeyResultDto {
  @IsOptional() @IsString() @MinLength(3) title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(KeyResultType) type?: KeyResultType;
  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsNumber() startValue?: number;
  @IsOptional() @IsNumber() targetValue?: number;
  @IsOptional() @IsNumber() currentValue?: number;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsNumber() @Min(0) weight?: number;
  @IsOptional() @IsEnum(ConfidenceLevel) confidence?: ConfidenceLevel;
  @IsOptional() @IsEnum(KeyResultStatus) status?: KeyResultStatus;
  @IsOptional() @IsDateString() dueDate?: string;
}
export class CheckInDto {
  @IsNumber() newValue!: number;
  @IsEnum(ConfidenceLevel) confidence!: ConfidenceLevel;
  @IsOptional() @IsEnum(KeyResultStatus) status?: KeyResultStatus;
  @IsOptional() @IsString() note?: string;
}
export class CreateInitiativeDto {
  @IsString() @MinLength(3) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsString() ownerId!: string;
  @IsOptional() @IsEnum(InitiativeStatus) status?: InitiativeStatus;
  @IsOptional() @IsNumber() @Min(0) @Max(100) progress?: number;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() dueDate?: string;
}
export class UpdateInitiativeDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsEnum(InitiativeStatus) status?: InitiativeStatus;
  @IsOptional() @IsNumber() @Min(0) @Max(100) progress?: number;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() dueDate?: string;
}
export class AddCommentDto { @IsString() @MinLength(1) body!: string; }
export class AlignObjectiveDto { @IsOptional() @IsString() parentId?: string; }
