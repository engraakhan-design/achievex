import { IsArray, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
export class CreateWorkflowDefinitionDto { @IsString() @MinLength(2) key!:string; @IsString() @MinLength(2) name!:string; @IsOptional() @IsString() description?:string; }
export class UpdateWorkflowDefinitionDto { @IsOptional() @IsString() name?:string; @IsOptional() @IsString() description?:string; }
export class SaveWorkflowVersionDto { @IsString() name!:string; @IsOptional() @IsString() description?:string; @IsArray() steps!:Array<Record<string,unknown>>; @IsArray() transitions!:Array<Record<string,unknown>>; }
export class StartWorkflowDto { @IsString() definitionId!:string; @IsOptional() @IsString() businessKey?:string; @IsOptional() @IsString() entityType?:string; @IsOptional() @IsString() entityId?:string; @IsOptional() @IsObject() variables?:Record<string,unknown>; }
export class CompleteWorkflowTaskDto { @IsOptional() @IsString() outcome?:string; @IsOptional() @IsObject() variables?:Record<string,unknown>; @IsOptional() @IsObject() payload?:Record<string,unknown>; }
export class CancelWorkflowDto { @IsOptional() @IsString() reason?:string; }
