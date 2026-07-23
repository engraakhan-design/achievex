-- Sprint 14.5 migration boundary. Generate the final PostgreSQL DDL with Prisma after schema validation.
CREATE TYPE "ApiApplicationStatus" AS ENUM ('DRAFT','ACTIVE','SUSPENDED','REVOKED');
CREATE TYPE "ApiCredentialStatus" AS ENUM ('ACTIVE','REVOKED','EXPIRED');
CREATE TYPE "ApiProductStatus" AS ENUM ('DRAFT','PUBLISHED','DEPRECATED','RETIRED');
CREATE TYPE "ApiAudience" AS ENUM ('PRIVATE','PARTNER','PUBLIC');
CREATE TYPE "ApiVersionLifecycle" AS ENUM ('DRAFT','BETA','STABLE','DEPRECATED','RETIRED');
-- Tables, indexes, and foreign keys are generated from prisma/schema.prisma in the target environment.
