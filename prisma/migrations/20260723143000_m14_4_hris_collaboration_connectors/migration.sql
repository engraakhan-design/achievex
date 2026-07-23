CREATE TYPE "EnterpriseConnectorProvider" AS ENUM ('WORKDAY','SAP_SUCCESSFACTORS','BAMBOOHR','HIBOB','SLACK','MICROSOFT_TEAMS','GOOGLE_WORKSPACE','MICROSOFT_365');
CREATE TYPE "EnterpriseConnectorDomain" AS ENUM ('HRIS','COLLABORATION','PRODUCTIVITY');
CREATE TYPE "EnterpriseConnectorObjectType" AS ENUM ('EMPLOYEE','ORGANIZATION_UNIT','POSITION','TEAM','CHANNEL','MESSAGE','CALENDAR_EVENT','DOCUMENT','DIRECTORY_GROUP');
CREATE TYPE "EnterpriseDeliveryStatus" AS ENUM ('PENDING','SUCCEEDED','FAILED','RETRYING','DEAD_LETTER','SKIPPED');
-- Generate and review table/index/foreign-key DDL with Prisma against the target PostgreSQL database before deployment.
