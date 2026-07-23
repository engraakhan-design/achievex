CREATE TYPE "DirectoryProviderType" AS ENUM ('MICROSOFT_ENTRA','OKTA','GOOGLE_WORKSPACE','GENERIC_SCIM');
CREATE TYPE "DirectoryConnectionStatus" AS ENUM ('DRAFT','ACTIVE','PAUSED','ERROR','DISABLED');
CREATE TYPE "DirectorySyncMode" AS ENUM ('MANUAL','SCHEDULED','WEBHOOK');
CREATE TYPE "DirectorySyncStatus" AS ENUM ('PENDING','RUNNING','SUCCEEDED','PARTIAL','FAILED','CANCELLED');
CREATE TYPE "ProvisioningAction" AS ENUM ('CREATE','UPDATE','ACTIVATE','SUSPEND','DEPROVISION','GROUP_ASSIGN','GROUP_REMOVE');
CREATE TYPE "ProvisioningEventStatus" AS ENUM ('PENDING','SUCCEEDED','FAILED','SKIPPED');
-- Tables, indexes, and foreign keys correspond to DirectoryConnection, DirectoryAttributeMapping, DirectorySyncRun, and ProvisioningEvent in schema.prisma.
-- Generate provider-specific DDL with Prisma migrate diff and review before production deployment.
