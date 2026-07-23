CREATE TYPE "ExecutiveDashboardAudience" AS ENUM ('CEO','COO','CFO','CHRO','PMO','DEPARTMENT_HEAD','CUSTOM');
ALTER TABLE "DashboardDefinition" ADD COLUMN "audience" "ExecutiveDashboardAudience" NOT NULL DEFAULT 'CUSTOM';
ALTER TABLE "DashboardDefinition" ADD COLUMN "isTemplate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "DashboardDefinition" ADD COLUMN "layout" JSONB NOT NULL DEFAULT '{}';
CREATE TABLE "DashboardSavedView" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "dashboardId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "filters" JSONB NOT NULL DEFAULT '{}',
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DashboardSavedView_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DashboardSavedView_dashboardId_name_createdById_key" ON "DashboardSavedView"("dashboardId","name","createdById");
CREATE INDEX "DashboardSavedView_organizationId_dashboardId_idx" ON "DashboardSavedView"("organizationId","dashboardId");
ALTER TABLE "DashboardSavedView" ADD CONSTRAINT "DashboardSavedView_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DashboardSavedView" ADD CONSTRAINT "DashboardSavedView_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "DashboardDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
