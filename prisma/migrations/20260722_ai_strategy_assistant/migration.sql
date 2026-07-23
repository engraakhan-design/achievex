CREATE TYPE "AiGenerationStatus" AS ENUM ('COMPLETED', 'FAILED', 'BLOCKED');

CREATE TABLE "AiGeneration" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "capability" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "promptVersion" TEXT NOT NULL,
  "inputTokens" INTEGER NOT NULL DEFAULT 0,
  "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "estimatedCostUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
  "latencyMs" INTEGER NOT NULL DEFAULT 0,
  "request" JSONB NOT NULL,
  "response" JSONB NOT NULL,
  "status" "AiGenerationStatus" NOT NULL DEFAULT 'COMPLETED',
  "errorCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiGeneration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiFeedback" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "generationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "helpful" BOOLEAN NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiFeedback_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AiGeneration_organizationId_createdAt_idx" ON "AiGeneration"("organizationId", "createdAt");
CREATE INDEX "AiGeneration_organizationId_capability_createdAt_idx" ON "AiGeneration"("organizationId", "capability", "createdAt");
CREATE INDEX "AiGeneration_userId_createdAt_idx" ON "AiGeneration"("userId", "createdAt");
CREATE UNIQUE INDEX "AiFeedback_generationId_userId_key" ON "AiFeedback"("generationId", "userId");
CREATE INDEX "AiFeedback_organizationId_createdAt_idx" ON "AiFeedback"("organizationId", "createdAt");
ALTER TABLE "AiGeneration" ADD CONSTRAINT "AiGeneration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiGeneration" ADD CONSTRAINT "AiGeneration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiFeedback" ADD CONSTRAINT "AiFeedback_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiFeedback" ADD CONSTRAINT "AiFeedback_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "AiGeneration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiFeedback" ADD CONSTRAINT "AiFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
