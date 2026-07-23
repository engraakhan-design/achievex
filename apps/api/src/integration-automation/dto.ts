import { IsArray, IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
export enum AutomationTriggerDto { MANUAL='MANUAL', SCHEDULED='SCHEDULED', EVENT='EVENT', WEBHOOK='WEBHOOK', DATA_SYNC='DATA_SYNC' }
export enum AutomationNodeTypeDto { TRIGGER='TRIGGER', CONDITION='CONDITION', ACTION='ACTION', DELAY='DELAY', APPROVAL='APPROVAL', CONNECTOR='CONNECTOR', WEBHOOK='WEBHOOK' }
export class CreateAutomationDto { @IsString() name!:string; @IsOptional() @IsString() description?:string; @IsEnum(AutomationTriggerDto) triggerType!:AutomationTriggerDto; @IsOptional() @IsObject() triggerConfig?:Record<string,unknown>; @IsOptional() @IsArray() tags?:string[]; }
export class UpdateAutomationDto { @IsOptional() @IsString() name?:string; @IsOptional() @IsString() description?:string; @IsOptional() @IsEnum(AutomationTriggerDto) triggerType?:AutomationTriggerDto; @IsOptional() @IsObject() triggerConfig?:Record<string,unknown>; @IsOptional() @IsBoolean() enabled?:boolean; @IsOptional() @IsArray() tags?:string[]; }
export class AddNodeDto { @IsString() key!:string; @IsString() name!:string; @IsEnum(AutomationNodeTypeDto) type!:AutomationNodeTypeDto; @IsOptional() @IsObject() config?:Record<string,unknown>; @IsOptional() @IsInt() @Min(0) @Max(20) maxAttempts?:number; @IsOptional() @IsInt() @Min(1) timeoutSeconds?:number; }
export class AddEdgeDto { @IsString() fromNodeKey!:string; @IsString() toNodeKey!:string; @IsOptional() @IsString() outcome?:string; @IsOptional() @IsObject() condition?:Record<string,unknown>; }
export class StartAutomationDto { @IsOptional() @IsObject() input?:Record<string,unknown>; @IsOptional() @IsString() idempotencyKey?:string; }
export class CompleteStepDto { @IsOptional() @IsObject() output?:Record<string,unknown>; @IsOptional() @IsString() errorMessage?:string; @IsOptional() @IsString() outcome?:string; }
export class ApprovalDecisionDto { @IsString() decision!:string; @IsOptional() @IsString() notes?:string; }
