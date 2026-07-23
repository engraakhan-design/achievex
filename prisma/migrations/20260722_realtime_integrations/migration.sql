CREATE TYPE "ApiKeyStatus" AS ENUM ('ACTIVE', 'REVOKED');
CREATE TYPE "WebhookStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DISABLED');
CREATE TYPE "WebhookDeliveryStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'DEAD_LETTER');

CREATE TABLE "ApiKey" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "prefix" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "scopes" TEXT[] NOT NULL,
  "status" "ApiKeyStatus" NOT NULL DEFAULT 'ACTIVE',
  "lastUsedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");
CREATE INDEX "ApiKey_organizationId_status_idx" ON "ApiKey"("organizationId", "status");
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "WebhookSubscription" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "secretHash" TEXT NOT NULL,
  "secretEncrypted" TEXT NOT NULL,
  "events" TEXT[] NOT NULL,
  "status" "WebhookStatus" NOT NULL DEFAULT 'ACTIVE',
  "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
  "lastDeliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebhookSubscription_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "WebhookSubscription_organizationId_status_idx" ON "WebhookSubscription"("organizationId", "status");
ALTER TABLE "WebhookSubscription" ADD CONSTRAINT "WebhookSubscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebhookSubscription" ADD CONSTRAINT "WebhookSubscription_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "WebhookDelivery" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "domainEventId" TEXT NOT NULL,
  "eventName" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "WebhookDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "responseStatus" INTEGER,
  "responseBody" TEXT,
  "lastError" TEXT,
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WebhookDelivery_subscriptionId_domainEventId_key" ON "WebhookDelivery"("subscriptionId", "domainEventId");
CREATE INDEX "WebhookDelivery_status_nextAttemptAt_idx" ON "WebhookDelivery"("status", "nextAttemptAt");
CREATE INDEX "WebhookDelivery_organizationId_createdAt_idx" ON "WebhookDelivery"("organizationId", "createdAt");
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "WebhookSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
