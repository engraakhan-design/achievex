-- Milestone 10 Sprint 10.1
CREATE TYPE "ExecutionStatus" AS ENUM ('DRAFT','PLANNED','ACTIVE','ON_HOLD','COMPLETED','CANCELLED');
CREATE TYPE "ExecutionHealth" AS ENUM ('NOT_SET','ON_TRACK','AT_RISK','OFF_TRACK');
CREATE TYPE "ExecutionPriority" AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');
CREATE TYPE "WorkItemStatus" AS ENUM ('TODO','IN_PROGRESS','BLOCKED','DONE','CANCELLED');
CREATE TYPE "DependencyType" AS ENUM ('FINISH_TO_START','START_TO_START','FINISH_TO_FINISH','START_TO_FINISH');
CREATE TYPE "RiskProbability" AS ENUM ('LOW','MEDIUM','HIGH','VERY_HIGH');
CREATE TYPE "RiskImpact" AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');
CREATE TYPE "RiskStatus" AS ENUM ('OPEN','MITIGATING','ACCEPTED','CLOSED');
CREATE TYPE "IssueSeverity" AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');
CREATE TYPE "IssueStatus" AS ENUM ('OPEN','IN_PROGRESS','RESOLVED','CLOSED');
-- The remaining tables, indexes, and foreign keys are represented by prisma/schema.prisma.
-- Run `npm run db:migrate` to have Prisma create the complete provider-specific migration in a development database.
