CREATE TYPE "BusinessConnectorProvider" AS ENUM ('JIRA','AZURE_DEVOPS','GITHUB','GITLAB','SERVICENOW','ASANA','MONDAY','TRELLO');
CREATE TYPE "ConnectorObjectType" AS ENUM ('PROJECT','ISSUE','TASK','EPIC','STORY','BUG','PULL_REQUEST','REPOSITORY','WORK_ITEM','INCIDENT','CHANGE_REQUEST','BOARD');
CREATE TYPE "ConnectorMappingDirection" AS ENUM ('INBOUND','OUTBOUND','BIDIRECTIONAL');
CREATE TYPE "ConnectorConflictStrategy" AS ENUM ('SOURCE_WINS','TARGET_WINS','LATEST_WINS','MANUAL');
CREATE TYPE "ConnectorSyncItemStatus" AS ENUM ('PENDING','SUCCEEDED','FAILED','SKIPPED','CONFLICT');
-- Table, index and foreign-key DDL should be generated and reviewed with Prisma against the target PostgreSQL database.
