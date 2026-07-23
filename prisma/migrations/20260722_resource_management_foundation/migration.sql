CREATE TYPE "ResourceStatus" AS ENUM ('ACTIVE','INACTIVE','CONTRACTOR','ON_LEAVE');
CREATE TYPE "ResourceAllocationType" AS ENUM ('PROJECT','PROGRAM','OPERATIONAL','LEAVE');
CREATE TYPE "ResourceAllocationStatus" AS ENUM ('PLANNED','ACTIVE','COMPLETED','CANCELLED');
CREATE TYPE "SkillProficiency" AS ENUM ('BEGINNER','INTERMEDIATE','ADVANCED','EXPERT');
-- Tables and constraints are represented in prisma/schema.prisma; generate the deployment migration after Prisma Client installation.
