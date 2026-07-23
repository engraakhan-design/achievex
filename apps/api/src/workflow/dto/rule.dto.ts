import { IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
export class CreateRuleDefinitionDto { @IsString() key!:string; @IsString() name!:string; @IsOptional() @IsString() description?:string }
export class CreateRuleVersionDto { @IsObject() conditions!:Record<string,unknown>; @IsArray() actions!:Array<{type:string;config:Record<string,unknown>}>; @IsOptional() @IsInt() @Min(0) @Max(10000) priority?:number; @IsOptional() @IsBoolean() stopOnMatch?:boolean }
export class EvaluateRuleDto { @IsObject() context!:Record<string,unknown>; @IsOptional() @IsString() entityType?:string; @IsOptional() @IsString() entityId?:string; @IsOptional() @IsString() triggerType?:string; @IsOptional() @IsBoolean() dryRun?:boolean }
