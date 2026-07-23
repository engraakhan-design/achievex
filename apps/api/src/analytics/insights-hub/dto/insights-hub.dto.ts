import { IsArray, IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
export enum InsightSeverityDto { INFO='INFO',LOW='LOW',MEDIUM='MEDIUM',HIGH='HIGH',CRITICAL='CRITICAL' }
export enum InsightStatusDto { NEW='NEW',ACKNOWLEDGED='ACKNOWLEDGED',IN_REVIEW='IN_REVIEW',RESOLVED='RESOLVED',DISMISSED='DISMISSED',EXPIRED='EXPIRED' }
export enum InsightDigestFrequencyDto { IMMEDIATE='IMMEDIATE',DAILY='DAILY',WEEKLY='WEEKLY' }
export class CreateManualInsightDto {
 @IsString() title!:string; @IsString() summary!:string; @IsEnum(InsightSeverityDto) severity!:InsightSeverityDto;
 @IsOptional() @IsString() entityType?:string; @IsOptional() @IsString() entityId?:string;
 @IsOptional() @IsNumber() @Min(0) @Max(100) score?:number; @IsOptional() @IsNumber() @Min(0) @Max(1) confidence?:number;
 @IsOptional() @IsObject() impact?:Record<string,unknown>; @IsOptional() @IsArray() evidence?:unknown[]; @IsOptional() @IsArray() tags?:string[];
}
export class AcknowledgeInsightDto { @IsEnum(InsightStatusDto) status!:InsightStatusDto; @IsOptional() @IsString() note?:string; }
export class CreateInsightSubscriptionDto { @IsString() name!:string; @IsOptional() @IsObject() filters?:Record<string,unknown>; @IsEnum(InsightDigestFrequencyDto) frequency!:InsightDigestFrequencyDto; @IsArray() channels!:string[]; @IsOptional() @IsBoolean() enabled?:boolean; }
