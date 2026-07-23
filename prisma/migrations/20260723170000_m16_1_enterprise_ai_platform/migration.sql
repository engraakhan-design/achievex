CREATE TYPE "AIProviderType" AS ENUM ('OPENAI','AZURE_OPENAI','ANTHROPIC','GOOGLE_GEMINI','OLLAMA','OPENAI_COMPATIBLE');
CREATE TYPE "AIProviderStatus" AS ENUM ('DRAFT','ACTIVE','DISABLED','DEPRECATED');
CREATE TYPE "AIModelStatus" AS ENUM ('DRAFT','ACTIVE','DISABLED','DEPRECATED');
CREATE TYPE "PromptLifecycleStatus" AS ENUM ('DRAFT','IN_REVIEW','PUBLISHED','ARCHIVED');
CREATE TYPE "AIExecutionStatus" AS ENUM ('COMPLETED','FAILED','BLOCKED','TIMEOUT');

CREATE TABLE "AIProvider" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "type" "AIProviderType" NOT NULL, "status" "AIProviderStatus" NOT NULL DEFAULT 'DRAFT',
  "endpoint" TEXT, "credentialRef" TEXT, "configuration" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AIProvider_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AIModel" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "providerId" TEXT NOT NULL,
  "name" TEXT NOT NULL, "externalId" TEXT NOT NULL, "capabilities" TEXT[],
  "contextWindow" INTEGER, "maxOutputTokens" INTEGER, "inputCostPerMillion" DOUBLE PRECISION,
  "outputCostPerMillion" DOUBLE PRECISION, "status" "AIModelStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AIModel_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PromptTemplate" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "key" TEXT NOT NULL, "name" TEXT NOT NULL,
  "domain" TEXT NOT NULL, "status" "PromptLifecycleStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PromptTemplateVersion" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "templateId" TEXT NOT NULL, "version" INTEGER NOT NULL,
  "content" TEXT NOT NULL, "variables" TEXT[], "status" "PromptLifecycleStatus" NOT NULL DEFAULT 'DRAFT',
  "createdByUserId" TEXT NOT NULL, "approvedByUserId" TEXT, "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromptTemplateVersion_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AITokenUsage" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "userId" TEXT NOT NULL, "module" TEXT NOT NULL,
  "providerId" TEXT NOT NULL, "modelId" TEXT NOT NULL, "promptVersionId" TEXT, "correlationId" TEXT NOT NULL,
  "promptTokens" INTEGER NOT NULL DEFAULT 0, "completionTokens" INTEGER NOT NULL DEFAULT 0,
  "totalTokens" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AITokenUsage_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AICostRecord" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "providerId" TEXT NOT NULL, "modelId" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL, "currency" TEXT NOT NULL DEFAULT 'USD', "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AICostRecord_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AIExecutionAudit" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "userId" TEXT NOT NULL, "module" TEXT NOT NULL,
  "providerId" TEXT NOT NULL, "modelId" TEXT NOT NULL, "promptVersionId" TEXT, "correlationId" TEXT NOT NULL,
  "status" "AIExecutionStatus" NOT NULL, "durationMs" INTEGER NOT NULL, "safetyOutcome" TEXT NOT NULL,
  "promptSnapshot" JSONB, "responseSnapshot" JSONB, "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AIExecutionAudit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AIProvider_organizationId_name_key" ON "AIProvider"("organizationId","name");
CREATE INDEX "AIProvider_organizationId_status_idx" ON "AIProvider"("organizationId","status");
CREATE UNIQUE INDEX "AIModel_providerId_externalId_key" ON "AIModel"("providerId","externalId");
CREATE INDEX "AIModel_organizationId_status_idx" ON "AIModel"("organizationId","status");
CREATE UNIQUE INDEX "PromptTemplate_organizationId_key_key" ON "PromptTemplate"("organizationId","key");
CREATE INDEX "PromptTemplate_organizationId_domain_status_idx" ON "PromptTemplate"("organizationId","domain","status");
CREATE UNIQUE INDEX "PromptTemplateVersion_templateId_version_key" ON "PromptTemplateVersion"("templateId","version");
CREATE INDEX "PromptTemplateVersion_organizationId_status_idx" ON "PromptTemplateVersion"("organizationId","status");
CREATE INDEX "AITokenUsage_organizationId_createdAt_idx" ON "AITokenUsage"("organizationId","createdAt");
CREATE INDEX "AITokenUsage_correlationId_idx" ON "AITokenUsage"("correlationId");
CREATE INDEX "AICostRecord_organizationId_createdAt_idx" ON "AICostRecord"("organizationId","createdAt");
CREATE INDEX "AICostRecord_correlationId_idx" ON "AICostRecord"("correlationId");
CREATE UNIQUE INDEX "AIExecutionAudit_correlationId_key" ON "AIExecutionAudit"("correlationId");
CREATE INDEX "AIExecutionAudit_organizationId_createdAt_idx" ON "AIExecutionAudit"("organizationId","createdAt");
CREATE INDEX "AIExecutionAudit_organizationId_status_idx" ON "AIExecutionAudit"("organizationId","status");

ALTER TABLE "AIModel" ADD CONSTRAINT "AIModel_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "AIProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PromptTemplateVersion" ADD CONSTRAINT "PromptTemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PromptTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AITokenUsage" ADD CONSTRAINT "AITokenUsage_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AITokenUsage" ADD CONSTRAINT "AITokenUsage_promptVersionId_fkey" FOREIGN KEY ("promptVersionId") REFERENCES "PromptTemplateVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AICostRecord" ADD CONSTRAINT "AICostRecord_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIExecutionAudit" ADD CONSTRAINT "AIExecutionAudit_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIExecutionAudit" ADD CONSTRAINT "AIExecutionAudit_promptVersionId_fkey" FOREIGN KEY ("promptVersionId") REFERENCES "PromptTemplateVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
