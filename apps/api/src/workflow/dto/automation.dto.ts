import { IsArray, IsBoolean, IsIn, IsObject, IsOptional, IsString } from 'class-validator';
const TRIGGERS=['DOMAIN_EVENT','SCHEDULE','MANUAL','WEBHOOK','SLA_BREACH','APPROVAL_DECISION','RULE_MATCH'] as const;
export class CreateAutomationDto { @IsString() key!:string; @IsString() name!:string; @IsOptional() @IsString() description?:string }
export class CreateAutomationVersionDto { @IsIn(TRIGGERS) triggerType!:typeof TRIGGERS[number]; @IsOptional() @IsObject() triggerConfig?:Record<string,unknown>; @IsOptional() @IsObject() conditions?:Record<string,unknown>; @IsArray() actions!:Array<{type:string;config:Record<string,unknown>}> }
export class ExecuteAutomationDto { @IsOptional() @IsObject() triggerPayload?:Record<string,unknown>; @IsOptional() @IsObject() context?:Record<string,unknown>; @IsOptional() @IsBoolean() dryRun?:boolean }
