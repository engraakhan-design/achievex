CREATE TYPE "GovernanceFrameworkType" AS ENUM ('ISO_27001','SOC_2','NIST_CSF','CUSTOM');
CREATE TYPE "GovernancePolicyStatus" AS ENUM ('DRAFT','IN_REVIEW','APPROVED','RETIRED');
CREATE TYPE "GovernanceControlStatus" AS ENUM ('PLANNED','IMPLEMENTED','PARTIAL','NOT_IMPLEMENTED');
CREATE TYPE "ComplianceAssessmentStatus" AS ENUM ('PLANNED','IN_PROGRESS','COMPLETED','CANCELLED');
-- Table, index, and foreign-key DDL must be generated and reviewed with Prisma against the target PostgreSQL database.
