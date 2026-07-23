import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsHexColor, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { DependencyType, ExecutionHealth, ExecutionPriority, ExecutionStatus, IssueSeverity, IssueStatus, RiskImpact, RiskProbability, RiskStatus, StrategyContributionType, WorkItemStatus } from '@prisma/client';

export class ListExecutionQuery {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(ExecutionStatus) status?: ExecutionStatus;
  @IsOptional() @IsEnum(ExecutionHealth) health?: ExecutionHealth;
}

export class CreatePortfolioDto {
  @IsString() @MaxLength(160) name!: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsString() ownerId!: string;
  @IsOptional() @IsEnum(ExecutionStatus) status?: ExecutionStatus;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) budget?: number;
}
export class UpdatePortfolioDto {
  @IsOptional() @IsString() @MaxLength(160) name?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsEnum(ExecutionStatus) status?: ExecutionStatus;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) budget?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) actualCost?: number;
}
export class CreateProgramDto extends CreatePortfolioDto { @IsOptional() @IsString() portfolioId?: string; }
export class UpdateProgramDto extends UpdatePortfolioDto { @IsOptional() @IsString() portfolioId?: string; }

export class CreateProjectDto {
  @IsString() @MaxLength(30) key!: string;
  @IsString() @MaxLength(180) name!: string;
  @IsOptional() @IsString() @MaxLength(4000) description?: string;
  @IsString() ownerId!: string;
  @IsOptional() @IsString() sponsorId?: string;
  @IsOptional() @IsString() portfolioId?: string;
  @IsOptional() @IsString() programId?: string;
  @IsOptional() @IsEnum(ExecutionStatus) status?: ExecutionStatus;
  @IsOptional() @IsEnum(ExecutionPriority) priority?: ExecutionPriority;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() targetDate?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) budget?: number;
}
export class UpdateProjectDto {
  @IsOptional() @IsString() @MaxLength(180) name?: string;
  @IsOptional() @IsString() @MaxLength(4000) description?: string;
  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsString() sponsorId?: string;
  @IsOptional() @IsString() portfolioId?: string;
  @IsOptional() @IsString() programId?: string;
  @IsOptional() @IsEnum(ExecutionPriority) priority?: ExecutionPriority;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) progress?: number;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() targetDate?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) budget?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) actualCost?: number;
}
export class TransitionProjectDto { @IsEnum(ExecutionStatus) status!: ExecutionStatus; @IsOptional() @IsString() @MaxLength(500) reason?: string; }

export class CreateWorkstreamDto { @IsString() @MaxLength(180) name!: string; @IsOptional() @IsString() description?: string; @IsString() ownerId!: string; @IsOptional() @IsDateString() startDate?: string; @IsOptional() @IsDateString() targetDate?: string; }
export class CreateMilestoneDto { @IsString() @MaxLength(180) name!: string; @IsOptional() @IsString() description?: string; @IsString() ownerId!: string; @IsOptional() @IsString() workstreamId?: string; @IsDateString() plannedDate!: string; }
export class UpdateMilestoneDto { @IsOptional() @IsString() name?: string; @IsOptional() @IsEnum(WorkItemStatus) status?: WorkItemStatus; @IsOptional() @IsDateString() plannedDate?: string; @IsOptional() @IsDateString() actualDate?: string; }
export class CreateTaskDto { @IsString() @MaxLength(240) title!: string; @IsOptional() @IsString() description?: string; @IsOptional() @IsString() workstreamId?: string; @IsOptional() @IsString() parentId?: string; @IsOptional() @IsString() assigneeId?: string; @IsOptional() @IsEnum(ExecutionPriority) priority?: ExecutionPriority; @IsOptional() @IsDateString() startDate?: string; @IsOptional() @IsDateString() dueDate?: string; @IsOptional() @Type(() => Number) @IsNumber() @Min(0) estimateHours?: number; }
export class UpdateTaskDto { @IsOptional() @IsString() title?: string; @IsOptional() @IsString() description?: string; @IsOptional() @IsString() assigneeId?: string; @IsOptional() @IsEnum(WorkItemStatus) status?: WorkItemStatus; @IsOptional() @IsEnum(ExecutionPriority) priority?: ExecutionPriority; @IsOptional() @IsDateString() dueDate?: string; @IsOptional() @Type(() => Number) @IsNumber() @Min(0) actualHours?: number; }
export class CreateDependencyDto { @IsString() predecessorProjectId!: string; @IsString() successorProjectId!: string; @IsOptional() @IsEnum(DependencyType) type?: DependencyType; @IsOptional() @Type(() => Number) @IsInt() lagDays?: number; }
export class CreateRiskDto { @IsString() @MaxLength(240) title!: string; @IsOptional() @IsString() description?: string; @IsEnum(RiskProbability) probability!: RiskProbability; @IsEnum(RiskImpact) impact!: RiskImpact; @IsOptional() @IsString() mitigation?: string; @IsOptional() @IsString() ownerId?: string; @IsOptional() @IsDateString() dueDate?: string; }
export class UpdateRiskDto { @IsOptional() @IsEnum(RiskStatus) status?: RiskStatus; @IsOptional() @IsString() mitigation?: string; @IsOptional() @IsString() ownerId?: string; }
export class CreateIssueDto { @IsString() @MaxLength(240) title!: string; @IsOptional() @IsString() description?: string; @IsEnum(IssueSeverity) severity!: IssueSeverity; @IsOptional() @IsString() ownerId?: string; @IsOptional() @IsDateString() dueDate?: string; }
export class UpdateIssueDto { @IsOptional() @IsEnum(IssueStatus) status?: IssueStatus; @IsOptional() @IsString() resolution?: string; @IsOptional() @IsString() ownerId?: string; }

export class ListTasksQuery { @IsOptional() @IsString() projectId?: string; @IsOptional() @IsString() assigneeId?: string; @IsOptional() @IsEnum(WorkItemStatus) status?: WorkItemStatus; @IsOptional() @IsString() search?: string; }
export class ReorderTaskDto { @Type(() => Number) @IsInt() @Min(0) position!: number; @IsEnum(WorkItemStatus) status!: WorkItemStatus; }
export class CreateTaskCommentDto { @IsString() @MaxLength(5000) body!: string; }
export class CreateChecklistItemDto { @IsString() @MaxLength(240) title!: string; @IsOptional() @Type(() => Number) @IsInt() @Min(0) position?: number; }
export class UpdateChecklistItemDto { @IsOptional() @IsString() @MaxLength(240) title?: string; @IsOptional() @IsBoolean() completed?: boolean; @IsOptional() @Type(() => Number) @IsInt() @Min(0) position?: number; }
export class CreateExecutionLabelDto { @IsString() @MaxLength(60) name!: string; @IsOptional() @IsHexColor() color?: string; }
export class SetTaskLabelsDto { @IsString({ each: true }) labelIds!: string[]; }
export class CreateTaskAttachmentDto { @IsString() @MaxLength(255) fileName!: string; @IsString() @MaxLength(160) mimeType!: string; @Type(() => Number) @IsInt() @Min(0) sizeBytes!: number; @IsString() @MaxLength(500) storageKey!: string; @IsOptional() @IsString() @MaxLength(2000) downloadUrl?: string; }
export class CreateTaskDependencyDto { @IsString() predecessorTaskId!: string; @IsString() successorTaskId!: string; @IsOptional() @IsEnum(DependencyType) type?: DependencyType; @IsOptional() @Type(() => Number) @IsInt() lagDays?: number; }

export class CreateObjectiveLinkDto {
  @IsString() objectiveId!: string;
  @IsOptional() @IsEnum(StrategyContributionType) contributionType?: StrategyContributionType;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) weight?: number;
  @IsOptional() @IsString() @MaxLength(1000) rationale?: string;
}
export class CreateKeyResultLinkDto {
  @IsString() keyResultId!: string;
  @IsOptional() @IsEnum(StrategyContributionType) contributionType?: StrategyContributionType;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) weight?: number;
  @IsOptional() @IsString() @MaxLength(1000) rationale?: string;
}

export class PortfolioAnalyticsQuery {
  @IsOptional() @IsString() portfolioId?: string;
  @IsOptional() @IsString() programId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}
