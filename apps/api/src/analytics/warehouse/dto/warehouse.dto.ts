import { IsArray, IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
export enum MetricValueType { NUMBER='NUMBER', PERCENTAGE='PERCENTAGE', RATIO='RATIO', SCORE='SCORE' }
export enum AggregationType { COUNT='COUNT', SUM='SUM', AVERAGE='AVERAGE', MIN='MIN', MAX='MAX', PERCENTAGE='PERCENTAGE', RATIO='RATIO', WEIGHTED_SCORE='WEIGHTED_SCORE', FORMULA='FORMULA' }
export class CreateMetricDto { @IsString() key!:string; @IsString() name!:string; @IsOptional() @IsString() description?:string; @IsEnum(MetricValueType) valueType!:MetricValueType; @IsOptional() @IsString() unit?:string; }
export class CreateMetricVersionDto { @IsEnum(AggregationType) aggregation!:AggregationType; @IsObject() formula!:Record<string,unknown>; @IsOptional() @IsArray() dimensions?:string[]; @IsOptional() @IsInt() @Min(0) precision?:number; }
export class CalculateMetricDto { @IsObject() context!:Record<string,unknown>; @IsOptional() @IsString() periodStart?:string; @IsOptional() @IsString() periodEnd?:string; @IsOptional() @IsObject() dimensions?:Record<string,string>; @IsOptional() @IsBoolean() persist?:boolean; }
export class CreateDashboardDto { @IsString() key!:string; @IsString() name!:string; @IsOptional() @IsString() description?:string; @IsOptional() @IsArray() widgets?:Array<Record<string,unknown>>; }
export class RunAggregationDto { @IsOptional() @IsString() metricDefinitionId?:string; @IsOptional() @IsString() grain?:string; @IsOptional() @IsString() periodStart?:string; @IsOptional() @IsString() periodEnd?:string; }
