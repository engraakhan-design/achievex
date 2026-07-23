-- Sprint 14.1 provider-reviewed migration boundary.
CREATE TYPE "ConnectorLifecycleStatus" AS ENUM ('DRAFT','PUBLISHED','DEPRECATED');
CREATE TYPE "IntegrationInstanceStatus" AS ENUM ('DISCONNECTED','CONNECTING','ACTIVE','PAUSED','ERROR','DISABLED');
CREATE TYPE "IntegrationAuthType" AS ENUM ('NONE','API_KEY','BEARER_TOKEN','BASIC_AUTH','OAUTH2','CLIENT_CREDENTIALS');
CREATE TYPE "IntegrationExecutionType" AS ENUM ('TEST_CONNECTION','PULL','PUSH','SYNC','SUBSCRIBE','UNSUBSCRIBE','HEALTH_CHECK','WEBHOOK');
CREATE TYPE "IntegrationExecutionStatus" AS ENUM ('PENDING','RUNNING','SUCCEEDED','FAILED','RETRYING','DEAD_LETTER','CANCELLED');
CREATE TYPE "IntegrationHealthStatus" AS ENUM ('UNKNOWN','HEALTHY','DEGRADED','UNHEALTHY');
-- Generate and review table/index/foreign-key DDL with Prisma migrate against the target PostgreSQL environment.
