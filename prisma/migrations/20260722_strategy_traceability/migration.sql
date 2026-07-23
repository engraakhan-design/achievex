CREATE TYPE "StrategyContributionType" AS ENUM ('DIRECT', 'ENABLING', 'SUPPORTING');

CREATE TABLE "ProjectObjectiveLink" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "objectiveId" TEXT NOT NULL,
  "contributionType" "StrategyContributionType" NOT NULL DEFAULT 'DIRECT',
  "weight" DECIMAL(5,2) NOT NULL DEFAULT 100,
  "rationale" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProjectObjectiveLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectKeyResultLink" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "keyResultId" TEXT NOT NULL,
  "contributionType" "StrategyContributionType" NOT NULL DEFAULT 'DIRECT',
  "weight" DECIMAL(5,2) NOT NULL DEFAULT 100,
  "rationale" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProjectKeyResultLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectObjectiveLink_projectId_objectiveId_key" ON "ProjectObjectiveLink"("projectId", "objectiveId");
CREATE INDEX "ProjectObjectiveLink_organizationId_objectiveId_idx" ON "ProjectObjectiveLink"("organizationId", "objectiveId");
CREATE UNIQUE INDEX "ProjectKeyResultLink_projectId_keyResultId_key" ON "ProjectKeyResultLink"("projectId", "keyResultId");
CREATE INDEX "ProjectKeyResultLink_organizationId_keyResultId_idx" ON "ProjectKeyResultLink"("organizationId", "keyResultId");

ALTER TABLE "ProjectObjectiveLink" ADD CONSTRAINT "ProjectObjectiveLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectObjectiveLink" ADD CONSTRAINT "ProjectObjectiveLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectObjectiveLink" ADD CONSTRAINT "ProjectObjectiveLink_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectKeyResultLink" ADD CONSTRAINT "ProjectKeyResultLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectKeyResultLink" ADD CONSTRAINT "ProjectKeyResultLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectKeyResultLink" ADD CONSTRAINT "ProjectKeyResultLink_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "KeyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectObjectiveLink" ADD CONSTRAINT "ProjectObjectiveLink_weight_check" CHECK ("weight" >= 0 AND "weight" <= 100);
ALTER TABLE "ProjectKeyResultLink" ADD CONSTRAINT "ProjectKeyResultLink_weight_check" CHECK ("weight" >= 0 AND "weight" <= 100);
