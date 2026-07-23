-- Sprint 13.5 Enterprise Insights Hub
CREATE TYPE "InsightType" AS ENUM ('KPI_ANOMALY','PREDICTION','SIGNAL','RECOMMENDATION','RISK','OPPORTUNITY','DECISION_UPDATE');
CREATE TYPE "InsightSeverity" AS ENUM ('INFO','LOW','MEDIUM','HIGH','CRITICAL');
CREATE TYPE "InsightStatus" AS ENUM ('NEW','ACKNOWLEDGED','IN_REVIEW','RESOLVED','DISMISSED','EXPIRED');
CREATE TYPE "InsightSourceType" AS ENUM ('METRIC_SNAPSHOT','PREDICTION_RESULT','DECISION_RECOMMENDATION','MANUAL','SYSTEM');
CREATE TYPE "InsightDigestFrequency" AS ENUM ('IMMEDIATE','DAILY','WEEKLY');

CREATE TABLE "EnterpriseInsight" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "type" "InsightType" NOT NULL,
  "severity" "InsightSeverity" NOT NULL DEFAULT 'MEDIUM',
  "status" "InsightStatus" NOT NULL DEFAULT 'NEW',
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "sourceType" "InsightSourceType" NOT NULL,
  "sourceId" TEXT,
  "entityType" TEXT,
  "entityId" TEXT,
  "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "confidence" DOUBLE PRECISION,
  "impact" JSONB NOT NULL DEFAULT '{}',
  "evidence" JSONB NOT NULL DEFAULT '[]',
  "tags" TEXT[],
  "assignedToId" TEXT,
  "dueAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EnterpriseInsight_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InsightAcknowledgement" (
  "id" TEXT NOT NULL,
  "insightId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "note" TEXT,
  "status" "InsightStatus" NOT NULL DEFAULT 'ACKNOWLEDGED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InsightAcknowledgement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InsightSubscription" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "filters" JSONB NOT NULL DEFAULT '{}',
  "frequency" "InsightDigestFrequency" NOT NULL DEFAULT 'DAILY',
  "channels" TEXT[],
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InsightSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EnterpriseInsight_organizationId_sourceType_sourceId_key" ON "EnterpriseInsight"("organizationId","sourceType","sourceId");
CREATE INDEX "EnterpriseInsight_organizationId_status_severity_createdAt_idx" ON "EnterpriseInsight"("organizationId","status","severity","createdAt");
CREATE INDEX "EnterpriseInsight_organizationId_entityType_entityId_idx" ON "EnterpriseInsight"("organizationId","entityType","entityId");
CREATE INDEX "InsightAcknowledgement_insightId_createdAt_idx" ON "InsightAcknowledgement"("insightId","createdAt");
CREATE UNIQUE INDEX "InsightSubscription_organizationId_userId_name_key" ON "InsightSubscription"("organizationId","userId","name");
CREATE INDEX "InsightSubscription_organizationId_userId_enabled_idx" ON "InsightSubscription"("organizationId","userId","enabled");
ALTER TABLE "EnterpriseInsight" ADD CONSTRAINT "EnterpriseInsight_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InsightAcknowledgement" ADD CONSTRAINT "InsightAcknowledgement_insightId_fkey" FOREIGN KEY ("insightId") REFERENCES "EnterpriseInsight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InsightSubscription" ADD CONSTRAINT "InsightSubscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
