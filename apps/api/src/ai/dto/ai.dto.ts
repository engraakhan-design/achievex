import { IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class GenerateObjectivesDto {
  @IsString() @MinLength(3) context!: string;
  @IsString() @MinLength(2) teamOrFunction!: string;
  @IsOptional() @IsString() cycleId?: string;
  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsNumber() @Min(1) @Max(5) count?: number;
  @IsOptional() @IsArray() strategicThemes?: string[];
}

export class RewriteObjectiveDto {
  @IsString() @MinLength(3) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() keyResults?: string[];
  @IsOptional() @IsIn(['concise','inspiring','measurable','executive']) style?: string;
}

export class AnalyzeRisksDto {
  @IsOptional() @IsString() cycleId?: string;
  @IsOptional() @IsBoolean() includeRecommendations?: boolean;
}

export class ExecutiveSummaryDto {
  @IsOptional() @IsString() cycleId?: string;
  @IsOptional() @IsIn(['brief','standard','detailed']) detail?: string;
  @IsOptional() @IsString() audience?: string;
}

export class AiFeedbackDto {
  @IsBoolean() helpful!: boolean;
  @IsOptional() @IsString() comment?: string;
}


export class GenerateProjectPlanDto {
  @IsString() @MinLength(3) projectId!: string;
  @IsOptional() @IsString() planningContext?: string;
  @IsOptional() @IsNumber() @Min(1) @Max(8) workstreamCount?: number;
  @IsOptional() @IsBoolean() includeTasks?: boolean;
}

export class AnalyzeProjectDeliveryRiskDto {
  @IsString() @MinLength(3) projectId!: string;
  @IsOptional() @IsBoolean() includeMitigations?: boolean;
}

export class ProjectHealthSummaryDto {
  @IsString() @MinLength(3) projectId!: string;
  @IsOptional() @IsIn(['brief','standard','detailed']) detail?: string;
  @IsOptional() @IsString() audience?: string;
}

export class ExecutiveDeliveryUpdateDto {
  @IsOptional() @IsString() portfolioId?: string;
  @IsOptional() @IsString() programId?: string;
  @IsOptional() @IsIn(['brief','standard','detailed']) detail?: string;
  @IsOptional() @IsString() audience?: string;
}


export class StaffingRecommendationDto {
  @IsOptional() @IsString() projectId?: string;
  @IsArray() skillIds!: string[];
  @IsOptional() @IsNumber() @Min(1) requiredHoursPerWeek?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(20) candidateCount?: number;
  @IsOptional() @IsString() context?: string;
}

export class ResolveResourceConflictsDto {
  @IsString() from!: string;
  @IsString() to!: string;
  @IsOptional() @IsString() teamId?: string;
}

export class SkillGapAnalysisDto {
  @IsArray() skillIds!: string[];
  @IsOptional() @IsString() teamId?: string;
  @IsOptional() @IsNumber() @Min(0) forecastDemandHours?: number;
}

export class WorkforceSummaryDto {
  @IsOptional() @IsString() teamId?: string;
  @IsOptional() @IsIn(['brief','standard','detailed']) detail?: string;
}
