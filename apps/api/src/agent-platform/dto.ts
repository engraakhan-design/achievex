import { IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
export class CreateAgentDto { @IsString() name!:string; @IsString() key!:string; @IsString() purpose!:string; @IsOptional() @IsArray() allowedTools?:string[]; @IsOptional() @IsBoolean() approvalRequired?:boolean; @IsOptional() @IsInt() @Min(1) @Max(25) maxSteps?:number; }
export class UpdateAgentDto { @IsOptional() @IsString() purpose?:string; @IsOptional() @IsArray() allowedTools?:string[]; @IsOptional() @IsBoolean() approvalRequired?:boolean; @IsOptional() @IsInt() @Min(1) @Max(25) maxSteps?:number; @IsOptional() @IsString() status?:string; }
export class RunAgentDto { @IsString() objective!:string; @IsOptional() @IsObject() context?:Record<string,unknown>; @IsOptional() @IsString() modelId?:string; }
export class ToolDecisionDto { @IsOptional() @IsString() reason?:string; }
