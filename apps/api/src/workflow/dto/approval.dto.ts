import { IsArray, IsDateString, IsEnum, IsIn, IsInt, IsObject, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

enum ApprovalStrategyDto { SINGLE='SINGLE', SEQUENTIAL='SEQUENTIAL', PARALLEL='PARALLEL', MAJORITY='MAJORITY', CONSENSUS='CONSENSUS', FIRST_RESPONSE='FIRST_RESPONSE' }
enum ApprovalDecisionDto { APPROVE='APPROVE', REJECT='REJECT', REQUEST_CHANGES='REQUEST_CHANGES' }
enum DelegationTypeDto { TEMPORARY='TEMPORARY', PERMANENT='PERMANENT', OUT_OF_OFFICE='OUT_OF_OFFICE', MANAGER='MANAGER' }

export class ApprovalStageInputDto {
  @IsString() @MinLength(2) name!: string;
  @IsInt() @Min(1) stageOrder!: number;
  @IsEnum(ApprovalStrategyDto) strategy!: ApprovalStrategyDto;
  @IsArray() @IsString({each:true}) approverIds!: string[];
  @IsOptional() @IsInt() @Min(1) minApprovals?: number;
  @IsOptional() @IsDateString() dueAt?: string;
}
export class CreateApprovalRequestDto {
  @IsString() @MinLength(2) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() workflowInstanceId?: string;
  @IsOptional() @IsString() entityType?: string;
  @IsOptional() @IsString() entityId?: string;
  @IsOptional() @IsString() businessKey?: string;
  @IsEnum(ApprovalStrategyDto) strategy!: ApprovalStrategyDto;
  @IsArray() @ValidateNested({each:true}) @Type(()=>ApprovalStageInputDto) stages!: ApprovalStageInputDto[];
  @IsOptional() @IsDateString() dueAt?: string;
  @IsOptional() @IsObject() metadata?: Record<string,unknown>;
}
export class DecideApprovalDto {
  @IsEnum(ApprovalDecisionDto) decision!: ApprovalDecisionDto;
  @IsOptional() @IsString() comment?: string;
  @IsOptional() @IsObject() metadata?: Record<string,unknown>;
}
export class CreateDelegationDto {
  @IsString() delegatorId!: string;
  @IsString() delegateId!: string;
  @IsEnum(DelegationTypeDto) type!: DelegationTypeDto;
  @IsDateString() startsAt!: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @IsString() reason?: string;
}
export class CreateEscalationDto {
  @IsString() stageId!: string;
  @IsIn(['REMINDER','MANAGER','ROLE','USER']) type!: 'REMINDER'|'MANAGER'|'ROLE'|'USER';
  @IsOptional() @IsString() targetUserId?: string;
  @IsOptional() @IsString() targetRole?: string;
  @IsString() reason!: string;
}
