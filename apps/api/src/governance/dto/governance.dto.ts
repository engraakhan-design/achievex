import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export enum FrameworkTypeDto { ISO_27001='ISO_27001', SOC_2='SOC_2', NIST_CSF='NIST_CSF', CUSTOM='CUSTOM' }
export enum PolicyStatusDto { DRAFT='DRAFT', IN_REVIEW='IN_REVIEW', APPROVED='APPROVED', RETIRED='RETIRED' }
export enum ControlStatusDto { PLANNED='PLANNED', IMPLEMENTED='IMPLEMENTED', PARTIAL='PARTIAL', NOT_IMPLEMENTED='NOT_IMPLEMENTED' }

export class CreateFrameworkDto {
  @IsString() name!: string;
  @IsEnum(FrameworkTypeDto) type!: FrameworkTypeDto;
  @IsOptional() @IsString() version?: string;
  @IsOptional() @IsString() description?: string;
}

export class CreatePolicyDto {
  @IsString() title!: string;
  @IsString() code!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(PolicyStatusDto) status?: PolicyStatusDto;
  @IsOptional() @IsArray() tags?: string[];
}

export class CreateControlDto {
  @IsString() frameworkId!: string;
  @IsString() code!: string;
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(ControlStatusDto) status?: ControlStatusDto;
  @IsOptional() @IsString() ownerUserId?: string;
  @IsOptional() @IsBoolean() automated?: boolean;
}

export class AddEvidenceDto {
  @IsString() controlId!: string;
  @IsString() name!: string;
  @IsString() sourceType!: string;
  @IsOptional() @IsString() sourceUrl?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() checksum?: string;
}

export class CreateAssessmentDto {
  @IsString() frameworkId!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() scope?: string;
  @IsOptional() @IsString() assessorUserId?: string;
}
